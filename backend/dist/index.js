"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const db_1 = require("./db");
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
const validators_1 = require("./validators");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/api/v1/signup", async (req, res) => {
    const parsed = validators_1.signupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.issues,
        });
    }
    const { username, password } = parsed.data;
    try {
        const existingUser = await db_1.prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await db_1.prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        });
        return res.json({
            message: "User signed up",
        });
    }
    catch {
        return res.status(500).json({
            message: "Failed to create user",
        });
    }
});
app.post("/api/v1/signin", async (req, res) => {
    const parsed = validators_1.signinSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.issues,
        });
    }
    const { username, password } = parsed.data;
    try {
        const existingUser = await db_1.prisma.user.findUnique({ where: { username } });
        if (!existingUser) {
            return res.status(403).json({
                message: "Incorrect credentials",
            });
        }
        const passwordMatches = await bcrypt_1.default.compare(password, existingUser.password);
        if (!passwordMatches) {
            return res.status(403).json({
                message: "Incorrect credentials",
            });
        }
        const token = jsonwebtoken_1.default.sign({
            id: existingUser.id,
        }, config_1.JWT_PASSWORD, { expiresIn: "7d" });
        return res.json({ token });
    }
    catch {
        return res.status(500).json({
            message: "Failed to sign in",
        });
    }
});
app.post("/api/v1/content", middleware_1.userMiddleware, async (req, res) => {
    const parsed = validators_1.contentSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.issues,
        });
    }
    if (!req.userId) {
        return res.status(403).json({
            message: "You are not logged in",
        });
    }
    const { link, title, type } = parsed.data;
    try {
        await db_1.prisma.content.create({
            data: {
                link,
                type,
                title,
                userId: req.userId,
                tags: [],
            },
        });
        return res.json({
            message: "Content added",
        });
    }
    catch {
        return res.status(500).json({
            message: "Failed to add content",
        });
    }
});
app.get("/api/v1/content", middleware_1.userMiddleware, async (req, res) => {
    if (!req.userId) {
        return res.status(403).json({
            message: "You are not logged in",
        });
    }
    try {
        const content = await db_1.prisma.content.findMany({
            where: {
                userId: req.userId,
            },
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        });
        return res.json({ content });
    }
    catch {
        return res.status(500).json({
            message: "Failed to fetch content",
        });
    }
});
app.delete("/api/v1/content", middleware_1.userMiddleware, async (req, res) => {
    const parsed = validators_1.deleteContentSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.issues,
        });
    }
    if (!req.userId) {
        return res.status(403).json({
            message: "You are not logged in",
        });
    }
    const { contentId } = parsed.data;
    try {
        await db_1.prisma.content.deleteMany({
            where: {
                id: contentId,
                userId: req.userId,
            },
        });
        return res.json({
            message: "Deleted",
        });
    }
    catch {
        return res.status(500).json({
            message: "Failed to delete content",
        });
    }
});
app.post("/api/v1/brain/share", middleware_1.userMiddleware, async (req, res) => {
    const parsed = validators_1.shareSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.issues,
        });
    }
    if (!req.userId) {
        return res.status(403).json({
            message: "You are not logged in",
        });
    }
    const { share } = parsed.data;
    try {
        if (share) {
            const existingLink = await db_1.prisma.link.findUnique({
                where: {
                    userId: req.userId,
                },
            });
            if (existingLink) {
                return res.json({
                    hash: existingLink.hash,
                });
            }
            const hash = (0, utils_1.random)(10);
            await db_1.prisma.link.create({
                data: {
                    userId: req.userId,
                    hash,
                },
            });
            return res.json({ hash });
        }
        await db_1.prisma.link.deleteMany({
            where: {
                userId: req.userId,
            },
        });
        return res.json({
            message: "Removed link",
        });
    }
    catch {
        return res.status(500).json({
            message: "Failed to update share link",
        });
    }
});
app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;
    try {
        const link = await db_1.prisma.link.findUnique({
            where: {
                hash,
            },
        });
        if (!link) {
            return res.status(404).json({
                message: "Share link not found",
            });
        }
        const [content, user] = await Promise.all([
            db_1.prisma.content.findMany({
                where: {
                    userId: link.userId,
                },
            }),
            db_1.prisma.user.findUnique({
                where: {
                    id: link.userId,
                },
            }),
        ]);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        return res.json({
            username: user.username,
            content,
        });
    }
    catch {
        return res.status(500).json({
            message: "Failed to fetch shared brain",
        });
    }
});
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});
//# sourceMappingURL=index.js.map