import json

data_en = {
    "premium_page": {
        "title": "Premium",
        "get_premium": "Get Premium",
        "subtitle": "Unlimited quizzes & features",
        "free": "Free",
        "premium": "Premium",
        "loading": "Loading plans...",
        "no_plans": "No plans available right now.",
        "most_popular": "Most Popular",
        "best_value": "Best Value",
        "per_day": "som/day",
        "try_features": "Try premium features",
        "bought_today": "bought today",
        "buy_now": "Buy Now",
        "one_time": "One-time purchase. No auto-renewal.",
        "currency": "som",
        "features": {
            "pdf": "Unlimited PDF quizzes",
            "images": "Images from documents in quizzes",
            "flashcards": "Create Flashcards",
            "slides": "Create Slides",
            "ai_images": "AI slide images",
            "ai_explanations": "AI explanations",
            "superfocus": "SuperFocus",
            "upload": "Upload up to 25 MB"
        },
        "limits": {
            "pdf_free": "1 / 3 days",
            "flashcards_free": "1 / 3 days",
            "ai_images_premium": "1/day",
            "upload_free": "10 MB",
            "upload_premium": "30 MB"
        }
    }
}

data_ru = {
    "premium_page": {
        "title": "Премиум",
        "get_premium": "Получить Премиум",
        "subtitle": "Безлимитные викторины и функции",
        "free": "Бесплатно",
        "premium": "Премиум",
        "loading": "Загрузка тарифов...",
        "no_plans": "Нет доступных тарифов.",
        "most_popular": "Самый популярный",
        "best_value": "Лучшая цена",
        "per_day": "сум/день",
        "try_features": "Попробуйте премиум-функции",
        "bought_today": "купили сегодня",
        "buy_now": "Купить сейчас",
        "one_time": "Единоразовый платеж. Без автопродления.",
        "currency": "сум",
        "features": {
            "pdf": "Безлимитные PDF викторины",
            "images": "Картинки из документов в викторинах",
            "flashcards": "Создание флешкарточек",
            "slides": "Создание слайдов",
            "ai_images": "AI картинки для слайдов",
            "ai_explanations": "AI объяснения",
            "superfocus": "СуперФокус",
            "upload": "Загрузка до 25 МБ"
        },
        "limits": {
            "pdf_free": "1 в 3 дня",
            "flashcards_free": "1 в 3 дня",
            "ai_images_premium": "1/день",
            "upload_free": "10 МБ",
            "upload_premium": "30 МБ"
        }
    }
}

data_uz = {
    "premium_page": {
        "title": "Premium",
        "get_premium": "Premium Olish",
        "subtitle": "Cheksiz viktorinalar",
        "free": "Tekin",
        "premium": "Premium",
        "loading": "Ta'riflar yuklanmoqda...",
        "no_plans": "Hozircha ta'riflar mavjud emas.",
        "most_popular": "Mashhur",
        "best_value": "Eng arzon",
        "per_day": "so'm/kun",
        "try_features": "Premium imkoniyatlar",
        "bought_today": "xarid qilindi",
        "buy_now": "Xarid qilish",
        "one_time": "Bir martalik to'lov. Avto-yangilanmaydi.",
        "currency": "so'm",
        "features": {
            "pdf": "Cheksiz PDF viktorinalar",
            "images": "Viktorinalarda hujjatlardan rasmlar",
            "flashcards": "Fleshkartalar yaratish",
            "slides": "Slaydlar yaratish",
            "ai_images": "AI slayd rasmlari",
            "ai_explanations": "AI tushuntirishlar",
            "superfocus": "SuperFokus",
            "upload": "25 MB gacha yuklash"
        },
        "limits": {
            "pdf_free": "3 kunda 1 marta",
            "flashcards_free": "3 kunda 1",
            "ai_images_premium": "kuniga 1",
            "upload_free": "10 MB",
            "upload_premium": "30 MB"
        }
    }
}

files = [
    ('frontend/src/dictionaries/en.json', data_en),
    ('frontend/src/dictionaries/ru.json', data_ru),
    ('frontend/src/dictionaries/uz.json', data_uz),
]

for filepath, new_data in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read().replace('}\n  }\n}', '}\n}') # fix my previous broken json in en.json
            d = json.loads(content)
        d.update(new_data)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(d, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error updating {filepath}: {e}")
