"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareSchema = exports.deleteContentSchema = exports.contentSchema = exports.signinSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    username: zod_1.z.string().trim().min(3).max(50),
    password: zod_1.z.string().min(8).max(128),
});
exports.signinSchema = zod_1.z.object({
    username: zod_1.z.string().trim().min(3).max(50),
    password: zod_1.z.string().min(8).max(128),
});
exports.contentSchema = zod_1.z.object({
    link: zod_1.z.url(),
    title: zod_1.z.string().trim().min(1).max(200),
    type: zod_1.z.enum(["twitter", "youtube", "document"]),
});
exports.deleteContentSchema = zod_1.z.object({
    contentId: zod_1.z.string().trim().min(1),
});
exports.shareSchema = zod_1.z.object({
    share: zod_1.z.boolean(),
});
//# sourceMappingURL=validators.js.map