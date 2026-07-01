# QuizPilot

QuizPilot is a modern, full-stack web application designed for creating, managing, and playing interactive quizzes and flashcards. Built with an elegant, Apple-inspired "Bento Box" UI, it offers a seamless experience for both educators and students.

## 🌟 Key Features

*   **Interactive Quizzes & Flashcards**: Create varied question types and flashcards for comprehensive learning. Includes a custom study mode with "Learning" and "Mastered" queue systems.
*   **AI-Powered Generation**: Instantly generate both standard quizzes and flashcard decks from PDFs or text prompts using Gemini AI in the background.
*   **Multiplayer Lobbies (Jonli O'yinlar)**: Host live games where participants can join via a 6-digit code, wait in a synced waiting room, and play in real-time.
*   **Premium Subscriptions**: Advanced features including AI-powered quiz generation from PDFs, increased limits, and more.
*   **Multi-language Support**: Fully localized interface supporting English, Russian, and Uzbek, built with a custom lightweight React Context system.
*   **Apple-style Bento Redesign**: A premium, bouncy, and highly visual frontend experience powered by Next.js and Tailwind CSS.
*   **RESTful API**: A robust Django backend securely handling all business logic, payments, and data persistence.


## 💻 Tech Stack

### Backend
*   **Framework**: Django 6.0+ & Django REST Framework (DRF)
*   **Database**: PostgreSQL
*   **Authentication**: JWT (JSON Web Tokens) via `djangorestframework-simplejwt`
*   **Background Tasks**: Celery & Redis (for AI document processing)
*   **AI Integration**: Google Gemini API
*   **Package Manager**: `uv` (Fast Python package installer and resolver)
*   **Language**: Python 3.13+

### Frontend
*   **Framework**: Next.js 16 (App Router) & React 19
*   **Styling**: Tailwind CSS 4.0
*   **Icons**: Lucide React
*   **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
*   Python 3.13 or higher
*   Node.js 20 or higher
*   PostgreSQL running locally
*   [uv](https://github.com/astral-sh/uv) (recommended for Python dependency management)

### 1. Backend Setup (Django)

1. Navigate to the project root:
   ```bash
   cd QuizPilot
   ```
2. Set up the virtual environment and install dependencies using `uv`:
   ```bash
   uv venv
   source .venv/bin/activate
   uv pip install -r pyproject.toml
   ```
3. Configure your environment variables:
   *   Copy `.env.example` to `.env` and fill in your PostgreSQL credentials and Secret Key.
4. Run database migrations:
   ```bash
   python manage.py migrate
   ```
5. Create a superuser (for admin panel access):
   ```bash
   python manage.py createsuperuser
   ```
6. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
   *The backend will be running at `http://127.0.0.1:8000/`*

### 2. Frontend Setup (Next.js)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd QuizPilot/frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running at `http://localhost:3000/`*

## 📁 Project Structure

```text
QuizPilot/
├── apps/               # Django specific apps (models, views, serializers)
│   ├── models/         # Database schemas (Users, Quizzes, Lobbies, Subscriptions)
│   ├── views.py        # DRF ViewSets containing business logic
│   ├── serializers.py  # Data validation and JSON serialization
│   └── admin.py        # Django Admin configuration
├── frontend/           # Next.js Application
│   ├── src/
│   │   ├── app/        # Next.js App Router pages
│   │   ├── components/ # Reusable React components (Bento UI, BottomNav)
│   │   ├── contexts/   # React Contexts (e.g., LanguageContext)
│   │   ├── dictionaries/# Localization JSON files (ru.json, uz.json, etc.)
│   │   └── lib/        # API utility functions (Axios/Fetch configurations)
│   └── tailwind.config.ts
├── root/               # Core Django configuration (settings, main urls)
├── pyproject.toml      # Python dependencies (managed by uv)
└── manage.py           # Django command-line utility
```

## 🔐 API Endpoints Overview
The backend provides a comprehensive REST API. Core routes include:
*   `/api/users/` - User management and profile info.
*   `/api/quizzes/` - Create and manage quizzes.
*   `/api/lobbies/` - Manage live multiplayer games.
*   `/api/flashcards/` - Flashcard creation and fetching.
*   `/api/subscriptions/` - Subscription plans and analytics.
*   `/api/payments/` - User active memberships.

*(To view the full Interactive API documentation, run the server and visit the Swagger/OpenAPI endpoint if configured).*
