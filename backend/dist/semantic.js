"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbedding = generateEmbedding;
exports.deriveTagsForContent = deriveTagsForContent;
exports.upsertContentEmbedding = upsertContentEmbedding;
exports.deleteContentEmbedding = deleteContentEmbedding;
const config_1 = require("./config");
const { GoogleGenAI } = require("@google/genai");
const { QdrantClient } = require("@qdrant/js-client-rest");
const STOP_WORDS = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "for",
    "with",
    "from",
    "your",
    "this",
    "that",
    "about",
    "into",
    "over",
    "under",
    "https",
    "http",
    "www",
    "com",
]);
const TAG_HINTS = {
    productivity: [
        "productivity",
        "focus",
        "deep work",
        "time management",
        "workflow",
        "efficiency",
        "habit",
    ],
    ideas: ["idea", "ideas", "brainstorm", "build", "project", "startup"],
    learning: ["learn", "learning", "course", "tutorial", "guide", "how to"],
    coding: [
        "code",
        "coding",
        "programming",
        "javascript",
        "typescript",
        "python",
        "react",
        "nextjs",
    ],
    ai: ["ai", "llm", "embedding", "vector", "gpt", "machine learning"],
    design: ["design", "ui", "ux", "typography", "color", "layout"],
    business: ["business", "marketing", "sales", "startup", "revenue"],
};
const hasQdrantConfig = Boolean(config_1.QDRANT_URL);
const hasEmbeddingConfig = Boolean(config_1.GEMINI_API_KEY);
const geminiClient = hasEmbeddingConfig
    ? new GoogleGenAI({ apiKey: config_1.GEMINI_API_KEY })
    : null;
const qdrantClient = hasQdrantConfig
    ? new QdrantClient({
        url: config_1.QDRANT_URL,
        ...(config_1.QDRANT_API_KEY ? { apiKey: config_1.QDRANT_API_KEY } : {}),
    })
    : null;
let collectionReady = false;
function normalizeTag(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/^#+/, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}
function titleWordTags(title) {
    const words = title
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((word) => word.trim())
        .filter((word) => word.length >= 4 && !STOP_WORDS.has(word));
    return Array.from(new Set(words)).slice(0, 2).map(normalizeTag).filter(Boolean);
}
function deriveKeywordTags(input, type) {
    const text = input.toLowerCase();
    const tags = new Set();
    for (const [tag, hints] of Object.entries(TAG_HINTS)) {
        if (hints.some((hint) => text.includes(hint))) {
            tags.add(tag);
        }
    }
    if (type === "youtube") {
        tags.add("video");
    }
    if (type === "twitter") {
        tags.add("social");
    }
    if (type === "document") {
        tags.add("reference");
    }
    return Array.from(tags).slice(0, 4);
}
async function ensureQdrantCollection() {
    if (!hasQdrantConfig) {
        return false;
    }
    if (collectionReady) {
        return true;
    }
    try {
        await qdrantClient.createCollection(config_1.QDRANT_COLLECTION, {
            vectors: {
                size: config_1.GEMINI_EMBEDDING_DIMENSIONS,
                distance: "Cosine",
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.toLowerCase().includes("already exists")) {
            console.error("Failed to ensure Qdrant collection", message);
            return false;
        }
    }
    collectionReady = true;
    return true;
}
async function generateEmbedding(input) {
    if (!hasEmbeddingConfig) {
        return null;
    }
    try {
        const geminiResponse = await geminiClient.models.embedContent({
            model: config_1.GEMINI_EMBEDDING_MODEL,
            contents: input,
            config: {
                outputDimensionality: config_1.GEMINI_EMBEDDING_DIMENSIONS,
            },
        });
        const clientEmbedding = geminiResponse?.embeddings?.[0]?.values ||
            geminiResponse?.embedding?.values ||
            geminiResponse?.embeddings?.[0]?.embedding;
        if (Array.isArray(clientEmbedding) && clientEmbedding.length > 0) {
            return clientEmbedding;
        }
    }
    catch (error) {
        console.error("Gemini SDK embedding failed, trying REST fallback", error);
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config_1.GEMINI_EMBEDDING_MODEL}:embedContent?key=${config_1.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: {
                parts: [{ text: input }],
            },
            outputDimensionality: config_1.GEMINI_EMBEDDING_DIMENSIONS,
        }),
    });
    if (!response.ok) {
        console.error("Failed to generate Gemini embedding", await response.text());
        return null;
    }
    const body = (await response.json());
    const embedding = body.embedding?.values;
    if (!embedding || !Array.isArray(embedding)) {
        return null;
    }
    return embedding;
}
function readTagsFromPayload(payload) {
    if (!payload || typeof payload !== "object") {
        return [];
    }
    const tags = payload.tags;
    if (!Array.isArray(tags)) {
        return [];
    }
    return tags
        .filter((tag) => typeof tag === "string")
        .map(normalizeTag)
        .filter(Boolean);
}
async function searchSimilarTags(userId, vector) {
    const ready = await ensureQdrantCollection();
    if (!ready) {
        return [];
    }
    let points = [];
    try {
        const result = await qdrantClient.search(config_1.QDRANT_COLLECTION, {
            vector,
            with_payload: true,
            limit: 12,
            filter: {
                must: [{ key: "userId", match: { value: userId } }],
            },
        });
        points = (result || []);
    }
    catch (error) {
        console.error("Failed to search Qdrant", error);
        return [];
    }
    const scoreByTag = new Map();
    for (const point of points) {
        if (point.score < 0.72) {
            continue;
        }
        const pointTags = readTagsFromPayload(point.payload);
        for (const tag of pointTags) {
            scoreByTag.set(tag, (scoreByTag.get(tag) || 0) + point.score);
        }
    }
    return Array.from(scoreByTag.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag)
        .slice(0, 4);
}
async function deriveTagsForContent(params) {
    const summary = `${params.title}\n${params.link}\n${params.type}`;
    const keywordTags = deriveKeywordTags(summary, params.type);
    const embedding = await generateEmbedding(summary);
    const similarTags = embedding
        ? await searchSimilarTags(params.userId, embedding)
        : [];
    const fallbackTags = titleWordTags(params.title);
    const tags = Array.from(new Set([...similarTags, ...keywordTags, ...fallbackTags].map(normalizeTag)))
        .filter(Boolean)
        .slice(0, 5);
    return {
        tags,
        vector: embedding,
    };
}
async function upsertContentEmbedding(params) {
    const ready = await ensureQdrantCollection();
    if (!ready) {
        return;
    }
    try {
        await qdrantClient.upsert(config_1.QDRANT_COLLECTION, {
            wait: true,
            points: [
                {
                    id: params.contentId,
                    vector: params.vector,
                    payload: {
                        userId: params.userId,
                        title: params.title,
                        link: params.link,
                        type: params.type,
                        tags: params.tags,
                    },
                },
            ],
        });
    }
    catch (error) {
        console.error("Failed to upsert embedding in Qdrant", error);
    }
}
async function deleteContentEmbedding(contentId) {
    const ready = await ensureQdrantCollection();
    if (!ready) {
        return;
    }
    try {
        await qdrantClient.delete(config_1.QDRANT_COLLECTION, {
            wait: true,
            points: [contentId],
        });
    }
    catch (error) {
        console.error("Failed to delete embedding from Qdrant", error);
    }
}
//# sourceMappingURL=semantic.js.map