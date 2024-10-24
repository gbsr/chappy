import { Collection, ObjectId } from "mongodb";
import { logWithLocation } from "../../../src/helpers.js";
import { userSchema } from "../../../src/data/schema.js";
import { User } from "../../../src/data/interface/user";
import { Request, Response } from "express";

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
