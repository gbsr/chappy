import { Collection, ObjectId } from "mongodb";
import { Message } from "../../../shared/interface/messages.js";
import { logWithLocation } from "../../../shared/helpers.js";
import { Request, Response } from "express";

/**
 * Retrieves messages for a specific user or channel.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {Collection<Message>} collection - The MongoDB collection containing messages.
 */

export const getMessages = async (
	req: Request,
	res: Response,
	collection: Collection<Message>
) => {
	const { channelId, userId } = req.params;

	try {
		const query = channelId
			? { channelId: new ObjectId(channelId) }
			: {
					$or: [
						{ senderId: new ObjectId(userId) },
						{ receiverId: new ObjectId(userId) },
					],
			  };

		const messages = await collection
			.find(query)
			.sort({ createdAt: 1 })
			.toArray();

		res.status(200);
		logWithLocation(`Retrieved messages successfully`, "success");
		res.json(messages);
	} catch (error: unknown) {
		if (error instanceof Error) {
			logWithLocation(
				`Error retrieving messages: ${error.message}`,
				"error"
			);
			res.status(500);
			res.json({
				message: "Error retrieving messages",
				error: error.message,
			});
		}
	}
};
