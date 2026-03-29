import bcrypt from "bcrypt";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";
import { prisma } from "./db";
import { userMiddleware } from "./middleware";
import {
	deleteContentEmbedding,
	deriveTagsForContent,
	upsertContentEmbedding,
} from "./semantic";
import { random } from "./utils";
import {
	contentSchema,
	deleteContentSchema,
	shareSchema,
	signinSchema,
	signupSchema,
} from "./validators";

const app = express();
const ALLOWED_CONTENT_TYPES = new Set(["twitter", "youtube", "document"]);

app.use(express.json());
app.use(cors({
	origin: ["http://localhost:3000", "http://localhost:4000", "http://127.0.0.1:3000", "http://127.0.0.1:4000"],
	credentials: true,
}));

app.post("/api/v1/signup", async (req, res) => {
	const parsed = signupSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			message: "Invalid input",
			errors: parsed.error.issues,
		});
	}

	const { username, password } = parsed.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { username } });
		if (existingUser) {
			return res.status(409).json({
				message: "User already exists",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.user.create({
			data: {
				username,
				password: hashedPassword,
			},
		});

		return res.json({
			message: "User signed up",
		});
	} catch {
		return res.status(500).json({
			message: "Failed to create user",
		});
	}
});

app.post("/api/v1/signin", async (req, res) => {
	const parsed = signinSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			message: "Invalid input",
			errors: parsed.error.issues,
		});
	}

	const { username, password } = parsed.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { username } });
		if (!existingUser) {
			return res.status(403).json({
				message: "Incorrect credentials",
			});
		}

		const passwordMatches = await bcrypt.compare(password, existingUser.password);
		if (!passwordMatches) {
			return res.status(403).json({
				message: "Incorrect credentials",
			});
		}

		const token = jwt.sign(
			{
				id: existingUser.id,
			},
			JWT_PASSWORD,
			{ expiresIn: "7d" }
		);

		return res.json({ token });
	} catch {
		return res.status(500).json({
			message: "Failed to sign in",
		});
	}
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
	const parsed = contentSchema.safeParse(req.body);
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
		const { tags, vector } = await deriveTagsForContent({
			userId: req.userId,
			title,
			link,
			type,
		});

		const createdContent = await prisma.content.create({
			data: {
				link,
				type,
				title,
				userId: req.userId,
				tags,
			},
		});

		if (vector) {
			void upsertContentEmbedding({
				contentId: createdContent.id,
				userId: req.userId,
				title,
				link,
				type,
				tags,
				vector,
			});
		}

		return res.json({
			message: "Content added",
			tags,
		});
	} catch {
		return res.status(500).json({
			message: "Failed to add content",
		});
	}
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
	if (!req.userId) {
		return res.status(403).json({
			message: "You are not logged in",
		});
	}

	const tagQuery =
		typeof req.query.tag === "string" && req.query.tag.trim().length > 0
			? req.query.tag.trim().toLowerCase()
			: undefined;
	const typeQuery =
		typeof req.query.type === "string" &&
		ALLOWED_CONTENT_TYPES.has(req.query.type)
			? (req.query.type as "twitter" | "youtube" | "document")
			: undefined;

	try {
		const content = await prisma.content.findMany({
			where: {
				userId: req.userId,
				...(tagQuery ? { tags: { has: tagQuery } } : {}),
				...(typeQuery ? { type: typeQuery } : {}),
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
	} catch {
		return res.status(500).json({
			message: "Failed to fetch content",
		});
	}
});

app.get("/api/v1/tags", userMiddleware, async (req, res) => {
	if (!req.userId) {
		return res.status(403).json({
			message: "You are not logged in",
		});
	}

	try {
		const contentWithTags = await prisma.content.findMany({
			where: {
				userId: req.userId,
			},
			select: {
				tags: true,
			},
		});

		const tagCounts = new Map<string, number>();

		for (const contentItem of contentWithTags) {
			for (const tag of contentItem.tags) {
				const normalizedTag = tag.trim().toLowerCase();
				if (!normalizedTag) {
					continue;
				}
				tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
			}
		}

		const tags = Array.from(tagCounts.entries())
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => {
				if (b.count === a.count) {
					return a.tag.localeCompare(b.tag);
				}
				return b.count - a.count;
			});

		return res.json({ tags });
	} catch {
		return res.status(500).json({
			message: "Failed to fetch tags",
		});
	}
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
	const parsed = deleteContentSchema.safeParse(req.body);
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
		const deleted = await prisma.content.deleteMany({
			where: {
				id: contentId,
				userId: req.userId,
			},
		});

		if (deleted.count > 0) {
			void deleteContentEmbedding(contentId);
		}

		return res.json({
			message: "Deleted",
		});
	} catch {
		return res.status(500).json({
			message: "Failed to delete content",
		});
	}
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
	const parsed = shareSchema.safeParse(req.body);
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
			const existingLink = await prisma.link.findUnique({
				where: {
					userId: req.userId,
				},
			});

			if (existingLink) {
				return res.json({
					hash: existingLink.hash,
				});
			}

			const hash = random(10);
			await prisma.link.create({
				data: {
					userId: req.userId,
					hash,
				},
			});

			return res.json({ hash });
		}

		await prisma.link.deleteMany({
			where: {
				userId: req.userId,
			},
		});

		return res.json({
			message: "Removed link",
		});
	} catch {
		return res.status(500).json({
			message: "Failed to update share link",
		});
	}
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
	const hash = req.params.shareLink;

	try {
		const link = await prisma.link.findUnique({
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
			prisma.content.findMany({
				where: {
					userId: link.userId,
				},
			}),
			prisma.user.findUnique({
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
	} catch {
		return res.status(500).json({
			message: "Failed to fetch shared brain",
		});
	}
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
	console.log(`Backend listening on port ${PORT}`);
});
