import { Request, Response } from "express";
import { Collection, ObjectId } from "mongodb";
import { logWithLocation } from "../../../src/helpers.js";
import { userSchema } from "../../../src/data/schema.js";
import { User } from "../../../src/data/interface/user.js";

export const updateUser = async (
	req: Request,
	res: Response,
	collection: Collection<User>
) => {
	const userId = req.params.id;
	const updateData = req.body;

	try {
		logWithLocation(`Trying to update User with id ${userId}`, "info");

		// First, check if the product exists
		const existingProduct = await collection.findOne({
			_id: new ObjectId(userId),
		});

		if (!existingProduct) {
			logWithLocation(`User not found: ${userId}`, "warning");
			res.status(404);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({ message: "User not found" });
		}

		// Validate the update data
		const { error } = userSchema.validate(updateData, {
			// allowUnknown: true,
			stripUnknown: true,
		});

		if (error) {
			logWithLocation(`Validation error: ${error.message}`, "error");
			res.status(400);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "Invalid user data",
				error: error.details.map((detail) => detail.message),
			});
		}

		// Explicitly remove _id from updateData to prevent MongoDB error wating to update _id, which it can't because no dice
		// can probably do this less convoluted, but hey, if it works it works.
		const { ...updateFields } = updateData;

		// Perform the update
		const updateResult = await collection.updateOne(
			{ _id: new ObjectId(userId) },
			{ $set: updateFields }
		);

		if (updateResult.modifiedCount > 0) {
			logWithLocation(`User ${userId} updated.`, "success");
			res.status(200);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "User updated successfully.",
			});
		} else {
			logWithLocation(`No changes made to user ${userId}`, "info");
			res.status(200);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "No changes were made to the product.",
			});
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			logWithLocation(`Error updating user: ${error.message}`, "error");
			res.status(500);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "Error updating user",
				error: error.message,
			});
		}
	}
};
