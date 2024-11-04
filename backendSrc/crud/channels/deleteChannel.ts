import { Request, Response } from "express";
import { Collection, ObjectId } from "mongodb";
import { logWithLocation } from "../../../src/helpers.js";
import { Channel } from "../../../src/data/interface/channels";

// TODO: update with log constants

/**
 * Deletes a channel from the database based on the provided channel ID in the request parameters.
 *
 * If the channel ID is invalid, a 400 status response is sent with an error message.
 * If the deletion is successful, a 200 status response is returned with a success message.
 * If no channel is found for the given ID, a 404 status response is sent.
 * In case of an error during the deletion process, a 500 status response is returned with an error message.
 *
 * @param {Request} req - The request object containing the parameters, including the channel ID.
 * @param {Response} res - The response object used to send back the desired HTTP response.
 * @param {Collection<Channel>} collection - The MongoDB collection instance used to interact with the channel records.
 */
export const deleteChannel = async (
	req: Request,
	res: Response,
	collection: Collection<Channel>
) => {
	const channelId = req.params.id;

	if (!ObjectId.isValid(channelId)) {
		logWithLocation(`Invalid channel ID: ${channelId}`, "error");
		res.status(400);
		logWithLocation(`${res.statusCode}`, "server");

		res.status(400).json({ message: "Invalid channel ID" });
		return;
	}
	try {
		logWithLocation(`"Trying to delete channel ${channelId}`, "info");
		const objectId = new ObjectId(channelId);
		const result = await collection.deleteOne({ _id: objectId });

		if (result.deletedCount === 0) {
			logWithLocation(`"Channel not found`, "error");
			res.status(494);
			logWithLocation(`${res.statusCode}`, "server");

			res.status(404).json({ message: "Channel not found" });
			return;
		}
		logWithLocation(`channel deleted sucessfully!`, "success");
		res.status(200);
		logWithLocation(`${res.statusCode}`, "server");

		res.status(200).json({ message: "Channel deleted successfully" });
	} catch (error: unknown) {
		if (error instanceof Error) {
			logWithLocation(
				`Error deleting channel: ${error.message}`,
				"error"
			);
			res.status(500);
			logWithLocation(`${res.statusCode}`, "server");

			res.status(500).json({
				message: "Error deleting channel",
				error: error.message,
			});
		}
	}
};
