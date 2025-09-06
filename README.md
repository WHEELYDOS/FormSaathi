# Multilingual Government Form Translator

A full-stack web application that translates and simplifies government forms using AI. Users can upload form images/PDFs or paste text, select a target language, and receive a translated, structured version with simplified explanations.

## Features

- **Multi-input Support**: Upload images/PDFs, paste text, or select from a form library
- **Language Translation**: Support for 30+ languages including Indian regional languages
- **Form Structure Analysis**: AI-powered extraction of form fields, sections, and structure
- **Simplified Explanations**: Easy-to-understand breakdowns of complex government forms
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for better user experience

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Python FastAPI
- **AI Service**: Google Gemini AI
- **Icons**: Custom SVG icons
- **Styling**: Tailwind CSS with dark mode support

## Project Structure

```
├── backend.py             # Single Python FastAPI backend file
├── requirements.txt       # Python dependencies
├── env.example           # Environment variables template
├── components/           # React components
├── contexts/            # React contexts
├── data/                # Static data
├── localization/        # Internationalization
├── services/            # Frontend services
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js (for frontend)
- Python 3.8+ (for backend)
- Google Gemini API key

### Backend Setup

1. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Edit `.env` file and add your Google Gemini API key:
   ```
   API_KEY=your_gemini_api_key_here
   ```

5. Start the backend server:
   ```bash
   python backend.py
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` (or the port shown in terminal)

## Usage

1. Make sure both backend and frontend are running
2. Open the frontend application in your browser
3. Choose your input method (upload file, paste text, or select from library)
4. Select your target language
5. Click "Translate & Simplify"
6. View the translated form structure and simplified explanation
7. Copy results for your use

## API Endpoints

- `GET /` - Health check
- `GET /api/health` - Health check endpoint
- `POST /api/translate` - Translate and simplify forms

For detailed API documentation, visit `http://localhost:8000/docs` when the backend is running.

## Supported Languages

The application supports 30+ languages including English, Hindi, Bengali, Tamil, Telugu, Gujarati, Marathi, and many more regional and international languages.

## Development

### Backend Development

The backend is built with Python FastAPI and follows a simple structure without OOP classes as requested. All backend code is contained in a single file:

- `backend.py`: Complete FastAPI application with CORS middleware and AI service integration
- Environment-based configuration

### Frontend Development

The frontend remains unchanged in functionality but now communicates with the backend API instead of directly calling Google Gemini AI.

## Deployment

For production deployment:

1. Set up proper environment variables
2. Configure CORS origins in `backend.py`
3. Use a production WSGI server like Gunicorn for the backend
4. Build the frontend with `npm run build`
5. Serve the built files with a web server like Nginx
