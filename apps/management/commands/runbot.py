from django.core.management.base import BaseCommand
from apps.bot import bot

class Command(BaseCommand):
    help = 'Starts the Telegram bot using polling'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting Telegram bot... Press Ctrl+C to stop.'))
        try:
            bot.polling(none_stop=True, interval=0)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Bot stopped due to error: {e}'))
