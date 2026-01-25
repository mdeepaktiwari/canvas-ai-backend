# CanvasAI - Backend

Express API for a content and image generation CMS. Uses Gemini for content generation and Hugging Face for images.

**Live API:** https://generator-cms-backend.onrender.com/

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with these variables:
```
PORT=8000
MONGO_URL=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
HUGGING_FACE_API_KEY=your_huggingface_key
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
GEMINI_API_KEY=your_gemini_key
REDIS_URL=your_redis_url (optional)
```

3. Run the server:
```bash
npm run dev    # development with nodemon
npm start      # production
```

## Features

- User authentication (JWT)
- Content generation (rewrite, expand, shorten, generate articles, SEO content)
- Image generation with multiple resolutions
- Content and image history
- Rate limiting
- Redis caching (optional)

## API Routes

- `/v1/auth` - Authentication (signup, login)
- `/v1/content` - Content operations
- `/v1/image` - Image operations
