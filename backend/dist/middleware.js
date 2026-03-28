"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const userMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({
            message: "You are not logged in",
        });
    }
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : authHeader;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_PASSWORD);
        if (typeof decoded === "string") {
            return res.status(403).json({
                message: "You are not logged in",
            });
        }
        const payload = decoded;
        if (!payload.id || typeof payload.id !== "string") {
            return res.status(403).json({
                message: "You are not logged in",
            });
        }
        req.userId = payload.id;
        return next();
    }
    catch {
        return res.status(403).json({
            message: "You are not logged in",
        });
    }
};
exports.userMiddleware = userMiddleware;
//# sourceMappingURL=middleware.js.map