import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from apps.models import Lobby, LobbyParticipant, Question, Option, User
from apps.models.lobbies import LobbyAnswer

class LobbyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.join_code = self.scope['url_route']['kwargs']['join_code']
        self.lobby_group_name = f'lobby_{self.join_code}'
        self.user = self.scope['user']

        await self.channel_layer.group_add(
            self.lobby_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.lobby_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'join_lobby':
            await self.handle_join_lobby(data)
        elif action == 'start_game':
            await self.handle_start_game(data)
        elif action == 'next_question':
            await self.handle_next_question(data)
        elif action == 'submit_answer':
            await self.handle_submit_answer(data)
        elif action == 'end_game':
            await self.handle_end_game(data)

    async def handle_join_lobby(self, data):
        await self.channel_layer.group_send(
            self.lobby_group_name,
            {
                'type': 'lobby_message',
                'message': {'action': 'player_joined', 'user': self.user.username if self.user.is_authenticated else 'Guest'}
            }
        )

    async def handle_start_game(self, data):
        if await self.is_lobby_host():
            await self.set_lobby_status(Lobby.StatusChoices.PLAYING)
            await self.channel_layer.group_send(
                self.lobby_group_name,
                {
                    'type': 'lobby_message',
                    'message': {'action': 'game_started'}
                }
            )

    async def handle_next_question(self, data):
        if await self.is_lobby_host():
            new_index = await self.advance_question()
            await self.channel_layer.group_send(
                self.lobby_group_name,
                {
                    'type': 'lobby_message',
                    'message': {'action': 'next_question', 'question_index': new_index}
                }
            )

    async def handle_submit_answer(self, data):
        option_id = data.get('option_id')
        if option_id:
            points = await self.record_answer(option_id)
            await self.send(text_data=json.dumps({
                'action': 'answer_recorded',
                'points': points
            }))

    async def handle_end_game(self, data):
        if await self.is_lobby_host():
            await self.set_lobby_status(Lobby.StatusChoices.FINISHED)
            await self.channel_layer.group_send(
                self.lobby_group_name,
                {
                    'type': 'lobby_message',
                    'message': {'action': 'game_ended'}
                }
            )

    async def lobby_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    # --- Database Helpers ---
    @database_sync_to_async
    def is_lobby_host(self):
        try:
            lobby = Lobby.objects.get(join_code=self.join_code)
            return self.user.is_authenticated and lobby.host_id == self.user.id
        except Lobby.DoesNotExist:
            return False

    @database_sync_to_async
    def set_lobby_status(self, status):
        Lobby.objects.filter(join_code=self.join_code).update(status=status)

    @database_sync_to_async
    def advance_question(self):
        try:
            lobby = Lobby.objects.get(join_code=self.join_code)
            lobby.current_question_index += 1
            lobby.save(update_fields=['current_question_index'])
            return lobby.current_question_index
        except Lobby.DoesNotExist:
            return 0

    @database_sync_to_async
    def record_answer(self, option_id):
        if not self.user.is_authenticated:
            return 0
        try:
            lobby = Lobby.objects.get(join_code=self.join_code)
            option = Option.objects.get(id=option_id)
            is_correct = option.is_correct
            points = 100 if is_correct else 0
            
            LobbyAnswer.objects.create(
                lobby=lobby,
                user=self.user,
                question=option.question,
                option=option,
                is_correct=is_correct,
                points_earned=points
            )

            # Update Participant Score
            participant, _ = LobbyParticipant.objects.get_or_create(lobby=lobby, user=self.user)
            participant.score += points
            participant.save(update_fields=['score'])

            return points
        except Exception as e:
            return 0
