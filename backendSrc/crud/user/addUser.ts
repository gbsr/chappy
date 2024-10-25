import { Collection, ObjectId } from "mongodb";
import { logWithLocation } from "../../../src/helpers.js";
import { userSchema } from "../../../src/data/schema.js";
import { User } from "../../../src/data/interface/user";
import { Request, Response } from "express";

/**
 * Checks if a user exists in the provided collection by their username or email.
 *
 * @param {Collection<User>} collection - The collection to search in for existing users.
 * @param {string} userName - The username to check for.
 * @param {string} email - The email to check for.
 * @returns {Promise<{ exists: boolean; field?: string }>}
 * An object indicating whether the user exists and the field that was found (if any).
 *
 * The function queries the collection twice: first for the username, and then for the email,
 * returning a response object that indicates the result.
 */
async function checkUserExists(
	collection: Collection<User>,
	userName: string,
	email: string
): Promise<{ exists: boolean; field?: string }> {
	const existingUserName = await collection.findOne({ userName });
	if (existingUserName) {
		return { exists: true, field: "userName" };
	}

	const existingEmail = await collection.findOne({ email });
	if (existingEmail) {
		return { exists: true, field: "email" };
	}

	return { exists: false };
}

/****
 * Adds a new user to the specified collection.
 *
 * This function extracts user details from the request body and validates them against a schema.
 * It checks if a user with the same username or email already exists in the collection. If the
 * provided data is invalid or a duplicate user is found, appropriate error responses are sent.
 *
 * @param {Request} req - The request object containing user details in the body.
 * @param {Response} res - The response object used to send responses back to the client.
 * @param {Collection<User>} collection - The MongoDB collection where the user data will be stored.
 *
 * The function includes a try/catch block to handle potential errors during user addition
 * and responds with a 500 status code and an error message if any error occurs.
 */
export const addUser = async (
	req: Request,
	res: Response,
	collection: Collection<User>
) => {
	const { userName, email, password, createdAt, updatedAt, isAdmin } =
		req.body;
	try {
		logWithLocation(`Trying to add user: ${userName}`, "info");
		const { error } = userSchema.validate({
			userName,
			email,
			password,
			createdAt,
			updatedAt,
			isAdmin,
		});

		if (error) {
			logWithLocation(`JOI Validation error: ${error.message}`, "error");
			res.status(400);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "Invalid user data",
				error: error.message,
			});
		}

		const userExists = await checkUserExists(collection, userName, email);
		if (userExists.exists) {
			logWithLocation(`Duplicate ${userExists.field} found`, "error");
			res.status(409);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: `User with this ${userExists.field} already exists`,
				field: userExists.field,
			});
		}

		const user: User = {
			_id: new ObjectId(),
			userName,
			email,
			password,
			createdAt,
			updatedAt,
			isAdmin,
		};

		await collection.insertOne(user);
		logWithLocation(
			`User added successfully: ${user.userName} with id: ${user._id}`,
			"success"
		);
		res.status(201);
		logWithLocation(`${res.statusCode}`, "server");
		res.json({
			user,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			logWithLocation(`Error adding user!: ${error.message}`, "error");
			res.status(500);
			logWithLocation(`${res.statusCode}`, "server");
			res.json({
				message: "Error user product",
				error: error.message,
			});
		}
	}
};
