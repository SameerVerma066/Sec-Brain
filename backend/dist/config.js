"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QDRANT_COLLECTION = exports.QDRANT_API_KEY = exports.QDRANT_URL = exports.GEMINI_EMBEDDING_DIMENSIONS = exports.GEMINI_EMBEDDING_MODEL = exports.GEMINI_API_KEY = exports.JWT_PASSWORD = void 0;
exports.JWT_PASSWORD = process.env.JWT_PASSWORD || "dev-jwt-password";
exports.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
exports.GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
exports.GEMINI_EMBEDDING_DIMENSIONS = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS || 768);
exports.QDRANT_URL = process.env.QDRANT_URL || "";
exports.QDRANT_API_KEY = process.env.QDRANT_API_KEY || "";
exports.QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || "second_brain_content";
//# sourceMappingURL=config.js.map