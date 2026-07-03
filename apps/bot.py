import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from django.conf import settings

# Ensure the token is set
if not settings.TELEGRAM_BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN is not set in settings.py or .env")

# Initialize bot with token from settings
bot = telebot.TeleBot(settings.TELEGRAM_BOT_TOKEN)

# Welcome text translations
TEXTS = {
    'uz': {
        'welcome': (
            "🎓 QuizJet'ga xush kelibsiz!\n\n"
            "📚 PDF -> AI test 1 daqiqada\n"
            "✅ Javoblar avtomatik tekshiriladi\n"
            "🏆 Do'stlar bilan musobaqa qiling\n\n"
            "💬 Gruppamizga qo'shiling: https://t.me/quizjet_community\n\n"
            "👇 30 soniyada bepul demo test yarating:"
        ),
        'btn_start': "Bepul sinab ko'rish",
        'btn_lang': "🌐 Tilni o'zgartirish"
    },
    'ru': {
        'welcome': (
            "🎓 Добро пожаловать в QuizJet!\n\n"
            "📚 PDF -> AI тест за 1 минуту\n"
            "✅ Автоматическая проверка ответов\n"
            "🏆 Соревнуйтесь с друзьями\n\n"
            "💬 Присоединяйтесь к группе: https://t.me/quizjet_community\n\n"
            "👇 Создайте бесплатный демо-тест за 30 секунд:"
        ),
        'btn_start': "Попробовать бесплатно",
        'btn_lang': "🌐 Изменить язык"
    },
    'en': {
        'welcome': (
            "🎓 Welcome to QuizJet!\n\n"
            "📚 PDF -> AI quiz in 1 minute\n"
            "✅ Automatic answer checking\n"
            "🏆 Compete with friends\n\n"
            "💬 Join our community: https://t.me/quizjet_community\n\n"
            "👇 Create a free demo quiz in 30 seconds:"
        ),
        'btn_start': "Try for free",
        'btn_lang': "🌐 Change Language"
    }
}

def get_main_menu(lang='uz'):
    markup = InlineKeyboardMarkup()
    web_app_url = getattr(settings, 'FRONTEND_URL', 'https://your-frontend-url.com')
    btn_webapp = InlineKeyboardButton(text=TEXTS[lang]['btn_start'], web_app=WebAppInfo(url=web_app_url))
    btn_lang = InlineKeyboardButton(text=TEXTS[lang]['btn_lang'], callback_data=f"change_language_{lang}")
    markup.add(btn_webapp)
    markup.add(btn_lang)
    return markup

def get_language_menu(current_lang='uz'):
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton(text="🇺🇿 O'zbekcha" + (" ✅" if current_lang == 'uz' else ""), callback_data="lang_uz"))
    markup.add(InlineKeyboardButton(text="🇷🇺 Русский" + (" ✅" if current_lang == 'ru' else ""), callback_data="lang_ru"))
    markup.add(InlineKeyboardButton(text="🇬🇧 English" + (" ✅" if current_lang == 'en' else ""), callback_data="lang_en"))
    
    # Back button text based on current language
    back_text = "◀️ Orqaga" if current_lang == 'uz' else ("◀️ Назад" if current_lang == 'ru' else "◀️ Back")
    markup.add(InlineKeyboardButton(text=back_text, callback_data=f"back_{current_lang}"))
    return markup

@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.send_message(message.chat.id, TEXTS['uz']['welcome'], reply_markup=get_main_menu('uz'), disable_web_page_preview=True)

@bot.callback_query_handler(func=lambda call: call.data.startswith("change_language_"))
def callback_change_language(call):
    current_lang = call.data.split("_")[-1]
    bot.edit_message_reply_markup(call.message.chat.id, call.message.message_id, reply_markup=get_language_menu(current_lang))

@bot.callback_query_handler(func=lambda call: call.data.startswith("lang_"))
def callback_set_language(call):
    new_lang = call.data.split("_")[-1]
    bot.edit_message_text(
        text=TEXTS[new_lang]['welcome'],
        chat_id=call.message.chat.id,
        message_id=call.message.message_id,
        reply_markup=get_main_menu(new_lang),
        disable_web_page_preview=True
    )

@bot.callback_query_handler(func=lambda call: call.data.startswith("back_"))
def callback_back(call):
    lang = call.data.split("_")[-1]
    bot.edit_message_reply_markup(call.message.chat.id, call.message.message_id, reply_markup=get_main_menu(lang))
