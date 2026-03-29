export const JWT_PASSWORD = process.env.JWT_PASSWORD || "dev-jwt-password";

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const GEMINI_EMBEDDING_MODEL =
	process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
export const GEMINI_EMBEDDING_DIMENSIONS = Number(
	process.env.GEMINI_EMBEDDING_DIMENSIONS || 768
);

export const QDRANT_URL = process.env.QDRANT_URL || "";
export const QDRANT_API_KEY = process.env.QDRANT_API_KEY || "";
export const QDRANT_COLLECTION =
	process.env.QDRANT_COLLECTION || "second_brain_content";
