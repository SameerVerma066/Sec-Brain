import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

export const userMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
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
		const decoded = jwt.verify(token, JWT_PASSWORD);

		if (typeof decoded === "string") {
			return res.status(403).json({
				message: "You are not logged in",
			});
		}

		const payload = decoded as JwtPayload;
		if (!payload.id || typeof payload.id !== "string") {
			return res.status(403).json({
				message: "You are not logged in",
			});
		}

		req.userId = payload.id;
		return next();
	} catch {
		return res.status(403).json({
			message: "You are not logged in",
		});
	}
};
