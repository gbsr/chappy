import { Response } from "express";
import { Collection, ObjectId } from "mongodb";
import { User } from "../../../src/data/interface/user.js";
import { logWithLocation } from "../../../src/helpers.js";
import { AuthRequest } from "../../auth/auth.middleware.js";

/**
 * Retrieves the user profile based on the provided authentication request.
 *
 * This function extracts the user ID from the request. If the user ID is not found or the user profile
 * cannot be retrieved from the specified collection, appropriate error responses are sent back.
 * If successful, a safe user profile (without sensitive information) is returned in the response.
 *
 * The function also logs various events such as attempts to retrieve the user profile, errors,
 * and successful retrievals.
 *
 * @param {AuthRequest} req - The request object containing the user's authentication information.
 * @param {Response} res - The response object used to send back the required HTTP responses.
 * @param {Collection<User>} collection - The MongoDB collection from which to find the user profile.
 *
 * @throws {Error} - Caught errors during the retrieval process are logged and a server error response is sent.
 */

// A type definition that creates a SafeUser type by omitting the 'password' property from the User type.
type SafeUser = Omit<User, "password">;

export const getUserProfile = async (
	req: AuthRequest,
	res: Response,
	collection: Collection<User>
) => {
	try {
		logWithLocation(`Attempting to get user profile`, "info");

		// Retrieves the user ID from the request object. If the user ID is not found, logs an error message,
		// sets the response status to 401 (Unauthorized), logs the status code, and sends a JSON response
		// indicating that the user is not authenticated.
		const userId = req.user?.userId;
		if (!userId) {
			logWithLocation("User ID not found in token", "error");
			res.status(401);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({ message: "User not authenticated" });
		}

		// Fetches a single user from the collection by their unique identifier (userId).
		// The userId is converted into an ObjectId format before the query is executed.
		const user = await collection.findOne({ _id: new ObjectId(userId) });

		if (!user) {
			logWithLocation(`User profile not found: ${userId}`, "error");
			res.status(404);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({ message: "User profile not found" });
		}

		// Constructs a SafeUser object by extracting and retaining specific properties from the provided user object.
		const safeUser: SafeUser = {
			_id: user._id,
			userName: user.userName,
			email: user.email,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			isAdmin: user.isAdmin,
		};

		logWithLocation(`User profile retrieved: ${userId}`, "success");
		res.status(200);
		logWithLocation(`${res.statusCode}`, "server");
		res.json({
			message: "Profile retrieved successfully",
			profile: safeUser,
		});
	} catch (error) {
		if (error instanceof Error) {
			logWithLocation(
				`Error retrieving user profile: ${error.message}`,
				"error"
			);
			res.status(500);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "Error retrieving user profile",
				error: error.message,
			});
		}
	}
};
