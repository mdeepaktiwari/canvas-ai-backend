const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    user_id: {
      required: [true, "User ID is required"],
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    prompt: {
      required: [true, "Prompt is required"],
      type: String,
    },
    image_url: {
      required: [true, "Image URL is required"],
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

imageSchema.index({ user_id: 1, createdAt: -1 });

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
