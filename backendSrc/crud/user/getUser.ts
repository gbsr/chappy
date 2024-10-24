import { Request, Response } from "express";
import { Collection, ObjectId } from "mongodb";
import { User } from "../../../src/data/interface/user.js";
import { logWithLocation } from "../../../src/helpers.js";
import { idSchema } from "../../../src/data/schema.js";

/**
 * Retrieves user information from the specified collection based on the user ID
 * provided in the request parameters. Validates the ID format and handles potential
 * errors during the retrieval process.
 *
 * @param {Request} req - The request object containing parameters, including `id`.
 * @param {Response} res - The response object used to send back the desired HTTP response.
 * @param {Collection<User>} collection - The MongoDB collection from which to retrieve the user.
 *
 * This function includes error handling for both validation and retrieval errors.
 * If an error occurs, it logs the appropriate message and responds with a relevant JSON
 * object containing error details and an appropriate HTTP status code.
 */
export const getUser = async (
	req: Request,
	res: Response,
	collection: Collection<User>
) => {
	try {
		const { id } = req.params;
		logWithLocation(`Trying to get user with id: ${id}`, "info");

		const { error } = idSchema.validate({ _id: id });
		if (error) {
			logWithLocation(`JOI: Validation error: ${error.message}`, "error");
			res.status(400);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "Invalid user ID",
				error: error.message,
			});
		}

		const _id = new ObjectId(id);
		const user = await collection.findOne({ _id });

		if (!user) {
			logWithLocation(`User not found: ${id}`, "error");
			res.status(404);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "User not found",
				error: "User not found",
			});
		}

		logWithLocation(`User found: ${id}`, "success");
		res.status(200);
		logWithLocation(`${res.statusCode}`, "server");
		return res.json({
			message: "User found",
			data: user,
		});
		/**
		 * Handles errors that occur during the retrieval of user information.
		 * This function checks if the caught error is an instance of Error.
		 * If so, it logs the error message and the HTTP status code, then responds
		 * with a JSON object containing an error message and the error details.
		 *
		 * @param {unknown} error - The error caught by the try/catch block.
		 */
	} catch (error: unknown) {
		if (error instanceof Error) {
			logWithLocation(`Error retrieving user: ${error.message}`, "error");
			res.status(500);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "Error retrieving user",
				error: error.message,
			});
		} else {
			// Handle case where error is not an Error object
			logWithLocation("An unknown error occurred", "error");
			res.status(500);
			return res.json({
				message: "An unknown error occurred",
				error: "Unknown error",
			});
		}
	}
};
