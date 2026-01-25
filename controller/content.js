const mongoose = require("mongoose");
require("dotenv").config();
const Content = require("../models/content");
const { ACTIONS, HTTP_STATUS } = require("../constant");
const { generateContentWithGemini } = require("../services/generateContent");
const {
  sendError,
  sendSuccess,
  asyncHandler,
} = require("../services/response");
const logger = require("../services/logger");

exports.generateContent = asyncHandler(async (req, res) => {
  logger.info(
    `Started processing of content generation request for user id ${req.user.id} and action is ${req.params.action}`,
  );
  const { content } = req.body;
  const action = req.params.action;

  if (!content) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, "Content is required");
  }

  const actionObj = ACTIONS[action];

  if (!actionObj) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, "Invalid action");
  }

  const prompt = ` 
      ${actionObj.prompt}
      Content: ${content}
    `;

  const updated_content = await generateContentWithGemini(prompt);

  await Content.create({
    user_id: req.user.id,
    input_prompt: content,
    output_content: updated_content,
    type: action,
  });

  return sendSuccess(res, HTTP_STATUS.OK, actionObj.message, {
    content: updated_content,
  });
});

exports.history = asyncHandler(async (req, res) => {
  logger.info(
    `Started processing content history request for user ${req.user.id}`,
  );
  const id = req.user.id;
  const content = await Content.aggregate([
    {
      $match: { user_id: new mongoose.Types.ObjectId(id) },
    },
    {
      $project: {
        _id: 1,
        type: 1,
        createdAt: 1,
        prompt: "$input_prompt",
        content: "$output_content",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return sendSuccess(res, HTTP_STATUS.OK, "Content fetched successfully", {
    content,
  });
});

exports.contentWithId = asyncHandler(async (req, res) => {
  logger.info(
    `Started processing content with id request for user ${req.user.id} and content id ${req.params.id}`,
  );
  const { id: contentId } = req.params;

  if (!contentId) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, "Content id is required");
  }

  const content = await Content.findById(contentId);

  if (!content) {
    return sendError(res, HTTP_STATUS.NOT_FOUND, "No content found");
  }

  if (content.user_id.toString() !== req.user.id) {
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized access");
  }

  return sendSuccess(res, HTTP_STATUS.OK, "Content fetched successfully", {
    content: {
      output: content.output_content,
      createdAt: content.createdAt,
      type: content.type,
      input: content.input_prompt,
    },
  });
});

exports.searchContent = asyncHandler(async (req, res) => {
  logger.info(
    `Started processing search content request for user ${req.user.id}`,
  );

  const { query } = req.query;
  const id = req.user.id;

  if (!query || query.trim() === "") {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, "Search query is required");
  }

  const searchQuery = query.trim();
  const userId = new mongoose.Types.ObjectId(id);

  const content = await Content.aggregate([
    {
      $match: {
        user_id: userId,
        $or: [
          { input_prompt: { $regex: searchQuery, $options: "i" } },
          { output_content: { $regex: searchQuery, $options: "i" } },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        type: 1,
        createdAt: 1,
        prompt: "$input_prompt",
        content: "$output_content",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return sendSuccess(res, HTTP_STATUS.OK, "Content searched successfully", {
    content,
  });
});
