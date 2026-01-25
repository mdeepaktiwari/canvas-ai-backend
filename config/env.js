const validateEnvVariables = () => {
  const required = [
    PORT,
    MONGO_URL,
    SECRET_KEY,
    HUGGING_FACE_API_KEY,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
    GEMINI_API_KEY,
  ];

  const missingKeys = required.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Missing environment variable: ${missingKeys.join(" , ")}`);
  }
};
