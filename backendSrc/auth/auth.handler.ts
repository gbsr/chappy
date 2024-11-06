import { Request, Response } from "express";
import { Collection } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../../src/data/interface/user.js";
import { logWithLocation } from "../../src/helpers.js";

// TODO: Use gen JWT in frontend (somehow, localstorage? cookie?)

/**
 * Handles user login by verifying credentials and generating a JWT token.
 *
 * @param {Request} req - The request object containing user credentials in the body.
 * @param {Response} res - The response object used to send back the results.
 * @param {Collection<User>} collection - The MongoDB collection where user data is stored.
 *
 * The function attempts to find the user by email, validates the provided password, and responds
 * with a success message and a token if the login is successful. In case of failure, it logs
 * appropriate error messages and responds with a 401 status for invalid credentials or a 500
 * status for unexpected errors. The function includes a try/catch block to handle possible
 * exceptions during the login process.
 */
export const login = async (
	req: Request,
	res: Response,
	collection: Collection<User>
) => {
	try {
		const { email, password } = req.body;

		logWithLocation(`Attempting login for user: ${email}`, "info");

		const user = await collection.findOne({ email });

		if (!user) {
			logWithLocation(`Login failed: User not found - ${email}`, "error");
			res.status(401);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({ message: "Invalid credentials" });
		}

		// Compares a provided password with a stored hashed password using bcrypt to determine validity.
		const isValidPassword = await bcrypt.compare(password, user.password);

		if (!isValidPassword) {
			logWithLocation(
				`Login failed: Invalid password - ${email}`,
				"error"
			);
			res.status(401);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({ message: "Invalid credentials" });
		}

		// gen JWT token
		// Generates a JSON Web Token (JWT) for the specified user with a validity of 24 hours.
		// The token includes the user's ID and email, and is signed using the secret specified in the environment variables.
		const token = jwt.sign(
			{ userId: user._id.toString(), email: user.email },
			process.env.JWT_SECRET || "",
			{ expiresIn: "24h" }
		);

		logWithLocation(`Login successful: ${email}`, "success");
		res.status(200);
		logWithLocation(`${res.statusCode}`, "server");
		res.json({
			message: "Login successful",
			token,
			user: {
				id: user._id,
				email: user.email,
				userName: user.userName,
				isAdmin: user.isAdmin,
			},
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			logWithLocation(`Login error: ${error.message}`, "error");
			res.status(500);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "Error during login",
				error: error.message,
			});
		}
	}
};
