require("dotenv").config();
const mongoose = require("mongoose");
const { RESOLUTION_MAP, HTTP_STATUS } = require("../constant");
const Image = require("../models/image");
const { generateImageBlob } = require("../services/image/generateImage");
const { uploadImage } = require("../services/image/upload");
const { redisClient } = require("../config/redis");
const {
  sendError,
  sendSuccess,
  asyncHandler,
} = require("../services/response");
const logger = require("../services/logger");

exports.generateImage = asyncHandler(async (req, res) => {
  logger.info(
    `Started processing of image generation request for user id ${req.user.id}`,
  );
  const { prompt, resolution } = req.body;
  const cacheKey = `${resolution}:${prompt}`;

  if (!prompt) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, "Prompt is required");
  }

  logger.info(`Prompt: ${prompt} and Resolution: ${resolution}`);

  const cachedUrl = await redisClient.get(cacheKey);

  if (cachedUrl) {
    logger.info("Data is fetched from the cache");
    return sendSuccess(res, HTTP_STATUS.OK, "Image generated successfully", {
      image: cachedUrl,
    });
  }

  const dimension = RESOLUTION_MAP[resolution] || RESOLUTION_MAP["1024x1024"];

  const image = await generateImageBlob(prompt, dimension);

  const buffer = Buffer.from(await image.arrayBuffer());

  // fs.writeFileSync("output.png", buffer);

  const uploadedImage = await uploadImage(buffer);

  await redisClient.set(cacheKey, uploadedImage?.url);

  await Image.create({
    prompt,
    image_url: uploadedImage?.url,
    user_id: req.user.id,
  });

  return sendSuccess(res, HTTP_STATUS.OK, "Image generated successfully", {
    image: uploadedImage?.url,
  });
});

exports.history = asyncHandler(async (req, res) => {
  logger.info(
    `Started processing image history request for user ${req.user.id}`,
  );
  const id = req.user.id;
  const images = await Image.aggregate([
    {
      $match: { user_id: new mongoose.Types.ObjectId(id) },
    },
    {
      $project: {
        _id: 1,
        url: "$image_url",
        createdAt: 1,
        prompt: 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return sendSuccess(res, HTTP_STATUS.OK, "Image fetched successfully", {
    images,
  });
});
