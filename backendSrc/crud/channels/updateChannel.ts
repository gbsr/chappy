import { Request, Response } from "express";
import { Collection, ObjectId } from "mongodb";
import { logWithLocation } from "../../../src/helpers.js";
import { channelSchema } from "../../../shared/schema.js";
import { Channel } from "../../../shared/interface/channels.js";

export const updateChannel = async (
	req: Request,
	res: Response,
	collection: Collection<Channel>
) => {
	const channelId = req.params.id;
	const updateData = req.body;

	try {
		logWithLocation(
			`Trying to update Channel with id ${channelId}`,
			"info"
		);

		// First, check if the product exists
		const existingChannel = await collection.findOne({
			_id: new ObjectId(channelId),
		});

		if (!existingChannel) {
			logWithLocation(`Channel not found: ${channelId}`, "warning");
			res.status(404);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({ message: "Channel not found" });
		}

		// Validate the update data
		const { error } = channelSchema.validate(updateData, {
			// allowUnknown: true,
			stripUnknown: true,
		});

		if (error) {
			logWithLocation(`Validation error: ${error.message}`, "error");
			res.status(400);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "Invalid channel data",
				error: error.details.map((detail) => detail.message),
			});
		}

		// Explicitly remove _id from updateData to prevent MongoDB error wating to update _id, which it can't because no dice
		// can probably do this less convoluted, but hey, if it works it works.
		const { ...updateFields } = updateData;

		// Perform the update
		const updateResult = await collection.updateOne(
			{ _id: new ObjectId(channelId) },
			{ $set: updateFields }
		);

		if (updateResult.modifiedCount > 0) {
			logWithLocation(`Channel ${channelId} updated.`, "success");
			res.status(200);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "Channel updated successfully.",
			});
		} else {
			logWithLocation(`No changes made to channel ${channelId}`, "info");
			res.status(200);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "No changes were made.",
			});
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			logWithLocation(
				`Error updating channel: ${error.message}`,
				"error"
			);
			res.status(500);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "Error updating channel",
				error: error.message,
			});
		}
	}
};
