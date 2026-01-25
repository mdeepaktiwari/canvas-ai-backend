const RESOLUTION_MAP = {
  "1024x1024": { width: 1024, height: 1024 },
  "512x512": { width: 512, height: 512 },
  "768x768": { width: 768, height: 768 },
  "1024x768": { width: 1024, height: 768 },
  "768x1024": { width: 768, height: 1024 },
};

const CONTENT_ACTIONS = {
  REWRITE: "rewrite",
  EXPAND: "expand",
  SHORTEN: "shorten",
  GENERATE_ARTICLE: "article",
  SEO_CONTENT: "seo-content",
};

const ACTIONS = {
  [CONTENT_ACTIONS.REWRITE]: {
    prompt: `
      You are a professional content editor.
      Rewrite the user-provided content to improve clarity, grammar, and tone.
      Keep the original meaning intact.
      Return plain text only.
      Do not include explanations, headings, or extra content.
    `,
    message: "Content rewritten successfully",
  },
  [CONTENT_ACTIONS.EXPAND]: {
    prompt: `
      You are a professional content editor.
      Expand the user-provided content with relevant details.
      Maintain a professional and natural tone.
      Return plain text only.
    `,
    message: "Content expanded successfully",
  },
  [CONTENT_ACTIONS.SHORTEN]: {
    prompt: `
      You are a professional content editor.
      Shorten the user-provided content while preserving the core meaning.
      Remove redundant and unnecessary words.
      Return plain text only.
    `,
    message: "Content shorted successfully",
  },
  [CONTENT_ACTIONS.GENERATE_ARTICLE]: {
    prompt: `
      You are a professional content writer and article creator.
      Generate a well-structured, informative, and engaging article on the given topic.
      Include a clear introduction, body, and conclusion.
      Use subheadings if necessary and provide examples to explain points.
      Maintain a professional tone.
      Return plain text only, do not include explanations about your writing process or extra commentary.
    `,
    message: "Article generated successfully",
  },
  [CONTENT_ACTIONS.SEO_CONTENT]: {
    prompt: `
    You are an SEO content specialist.
    Analyze the user provided article and generate the following:

    1. An SEO optimized title (max 50 characters)
    2. List of relevant SEO keyword (comma-separated)
    3. A meta description (max 150 character)

    Return the output strictly in the following format:

    SEO Title:
    SEO Keywords:
    Meta description:

    Return plain text only. Do not include explanation or extra content. 
    `,
    message: "SEO content generated successfully",
  },
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERVAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

const JWT_EXPIRATION = "7d";

module.exports = {
  RESOLUTION_MAP,
  ACTIONS,
  CONTENT_ACTIONS,
  HTTP_STATUS,
  JWT_EXPIRATION,
};
