const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HUGGING_FACE_API_KEY);

module.exports = client;
