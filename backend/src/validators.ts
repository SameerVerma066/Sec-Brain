import { z } from "zod";

export const signupSchema = z.object({
	username: z.string().trim().min(3).max(50),
	password: z.string().min(8).max(128),
});

export const signinSchema = z.object({
	username: z.string().trim().min(3).max(50),
	password: z.string().min(8).max(128),
});

export const contentSchema = z.object({
	link: z.url(),
	title: z.string().trim().min(1).max(200),
	type: z.enum(["twitter", "youtube", "document"]),
});

export const deleteContentSchema = z.object({
	contentId: z.string().trim().min(1),
});

export const shareSchema = z.object({
	share: z.boolean(),
});