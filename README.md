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
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

3. Install Razorpay package:
```bash
npm install razorpay
```

4. Run the server:
```bash
npm run dev    # development with nodemon
npm start      # production
```

## Features

- User authentication (JWT)
- Credit-based system with default 100 credits for new users
- Content generation (rewrite, expand, shorten, generate articles, SEO content) - 5 credits per operation
- Image generation with multiple resolutions - 10 credits per image
- Content and image history
- Razorpay payment integration for credit purchases
- Rate limiting
- Redis caching (optional)

## API Routes

- `/v1/auth` - Authentication (signup, login)
- `/v1/content` - Content operations
- `/v1/image` - Image operations
- `/v1/payment` - Payment operations
  - `GET /packages` - Get pricing packages
  - `GET /credits` - Get user credits (protected)
  - `POST /create-order` - Create Razorpay order (protected)
  - `POST /verify-payment` - Verify payment and add credits (protected)
