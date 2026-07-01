import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from django.conf import settings

# Ensure the token is set
if not settings.TELEGRAM_BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN is not set in settings.py or .env")

# Initialize bot with token from settings
bot = telebot.TeleBot(settings.TELEGRAM_BOT_TOKEN)

@bot.message_handler(commands=['start'])
def send_welcome(message):
    welcome_text = (
        "🎓 QuizPilotga xush kelibsiz!\n\n"
        "📚 PDF -> AI test 1 daqiqada\n"
        "✅ Javoblar avtomatik tekshiriladi\n"
        "🏆 Do'stlar bilan musobaqa qiling\n\n"
        "💬 Gruppamizga qo'shiling: @quizpilot_community\n\n"
        "👇 30 soniyada bepul demo test yarating:"
    )
    
    markup = InlineKeyboardMarkup()
    
    # URL for the Web App (Telegram requires HTTPS)
    # Using localhost placeholder for now. Replace with your actual frontend URL.
    web_app_url = "https://quizpilot-test.loca.lt/" 
    
    btn_webapp = InlineKeyboardButton(text="Bepul sinab ko'rish", web_app=WebAppInfo(url=web_app_url))
    btn_lang = InlineKeyboardButton(text="🌐 Tilni o'zgartirish", callback_data="change_language")
    
    markup.add(btn_webapp)
    markup.add(btn_lang)
    
    bot.send_message(message.chat.id, welcome_text, reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data == "change_language")
def callback_query(call):
    bot.answer_callback_query(call.id, "Tilni o'zgartirish funksiyasi tez orada qo'shiladi!")
