import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logWithLocation } from "../../src/helpers.js";

/**
 * Represents an object that extends the standard Request interface
 * to include additional user authentication information.
 *
 * @interface AuthRequest
 * @extends Request
 * @property {Object} [user] - Optional user information.
 * @property {string} user.userId - The unique identifier for the user.
 * @property {string} user.email - The email address of the user.
 */
export interface AuthRequest extends Request {
	user?: {
		userId: string;
		email: string;
	};
}

/**
 * Middleware function to verify the JWT token from the request headers.
 * If the token is not provided or is invalid, the response will be set
 * with the appropriate status and an error message will be returned.
 *
 * @param {Request} req - The HTTP request object containing the headers.
 * @param {Response} res - The HTTP response object used to send a response.
 * @param {NextFunction} next - The function to call to pass control to the next middleware.
 *
 * @throws Will log errors and send a response with status 401 if no token is provided,
 *         or status 403 if the token is invalid.
 */
export const verifyToken = (
	req: Request,
	res: Response,
	next: NextFunction
): Response | void => {
	try {
		/* 
        Extracts the token from the authorization header of the request, if present. 
        The token is expected to follow the format "Bearer <token>". 
        If the authorization header is absent, the token will be undefined. */
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			logWithLocation("No token provided", "error");
			res.status(401);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({ message: "Authentication required" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "");
		(req as AuthRequest).user = decoded as {
			userId: string;
			email: string;
		};

		next();
	} catch (error: unknown) {
		if (error instanceof Error) {
			logWithLocation(
				`Token verification failed: ${error.message}`,
				"error"
			);
			res.status(403);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({ message: "Invalid token" });
		}
	}
};
