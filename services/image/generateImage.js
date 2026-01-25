const client = require("../../config/huggingface");

async function generateImageBlob(prompt, dimension) {
  return await client.textToImage({
    provider: "auto",
    model: "black-forest-labs/FLUX.1-schnell",
    inputs: prompt,
    parameters: {
      num_inference_steps: 5,
      width: dimension.width,
      height: dimension.height,
    },
  });
}

module.exports = {
  generateImageBlob,
};
