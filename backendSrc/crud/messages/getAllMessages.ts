import { Request, Response } from "express";
import { Collection, ObjectId } from "mongodb";
import { Message } from "../../../src/data/interface/messages.js";
import { Channel } from "../../../src/data/interface/channels.js";
import { logWithLocation } from "../../../src/helpers.js";

/**
 * Retrieves messages from a specified channel.
 *
 * @param {Request} req - The request object containing the channelId in the URL parameters.
 * @param {Response} res - The response object used to send responses back to the client.
 * @param {Collection<Message>} messageCollection - The MongoDB collection from which messages are retrieved.
 * @param {Collection<Channel>} channelCollection - The MongoDB collection from which channel information is retrieved.
 *
 * The function checks if the provided channelId is valid. If the channelId is invalid
 * or the channel is not found, it sends a 400 or 404 response respectively.
 * It also logs the outcome at various stages, including errors if they occur during
 * the message fetching process, which is handled in a try/catch block.
 */
export const getChannelMessages = async (
	req: Request,
	res: Response,
	messageCollection: Collection<Message>,
	channelCollection: Collection<Channel>
) => {
	const channelId = req.params.channelId;

	try {
		if (!ObjectId.isValid(channelId)) {
			logWithLocation(`Invalid channel ID: ${channelId}`, "error");
			res.status(400);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({ message: "Invalid channel ID" });
		}

		// get channel name
		const channel = await channelCollection.findOne({
			_id: new ObjectId(channelId),
		});

		if (!channel) {
			logWithLocation(`Channel not found: ${channelId}`, "error");
			res.status(404);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({ message: "Channel not found" });
		}

		logWithLocation(
			`Trying to get messages for channel: ${channel.channelName}`,
			"info"
		);

		// find messages
		const messages = await messageCollection
			.find({ channelId: new ObjectId(channelId) })
			.sort({ createdAt: 1 })
			.toArray();

		logWithLocation(
			`Retrieved ${messages.length} messages from channel: ${channel.channelName}`,
			"success"
		);

		res.status(200);
		logWithLocation(`${res.statusCode}`, "server");
		res.status(200).json(messages);
	} catch (error: unknown) {
		if (error instanceof Error) {
			logWithLocation(
				`Error fetching messages: ${error.message}`,
				"error"
			);
			res.status(500);
			logWithLocation(`${res.statusCode}`, "server");
			res.status(500).json({
				message: "Error fetching messages",
				error: error.message,
			});
		}
	}
};
