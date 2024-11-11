import { Collection, ObjectId } from "mongodb";
import { logWithLocation } from "../../../shared/helpers.js";
import { messageSchema } from "../../../shared/schema.js";
import { Message } from "../../../shared/interface/messages.js";
import { Request, Response } from "express";

/**
 * Sends a new message and stores it in the specified collection.
 *
 * @param {Request} req - The HTTP request object containing the message data in the body.
 * @param {Response} res - The HTTP response object to send the response.
 * @param {Collection<Message>} collection - The MongoDB collection where the message will be stored.
 *
 * The function validates the message data using a JOI schema before storing it.
 * If validation passes, it creates a new message with the current timestamp
 * and stores it in the database.
 */

export const sendMessage = async (
	req: Request,
	res: Response,
	collection: Collection<Message>
) => {
	const {
		content,
		userId,
		recipientId,
		channelId,
		taggedUsers = [],
		createdAt,
		updatedAt,
	} = req.body;

	try {
		logWithLocation(
			`Attempting to send message from user: ${userId}`,
			"info"
		);

		const { error } = messageSchema.validate({
			content,
			userId,
			recipientId,
			channelId,
			taggedUsers,
			createdAt,
			updatedAt,
		});

		if (error) {
			logWithLocation(`Validation error: ${error.message}`, "error");
			res.status(400);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "Invalid message data",
				error: error.message,
			});
		}

		const message = {
			_id: new ObjectId(),
			content: req.body.content,
			userId: new ObjectId(req.body.userId),
			recipientId: req.body.recipientId
				? new ObjectId(req.body.recipientId)
				: null,
			channelId: req.body.channelId
				? new ObjectId(req.body.channelId)
				: null,
			taggedUsers: req.body.taggedUsers,
			createdAt: new Date(req.body.createdAt),
			updatedAt: new Date(req.body.updatedAt),
		};

		await collection.insertOne(message);

		logWithLocation(
			`Message sent successfully from ${userId} with id: ${message._id}`,
			"success"
		);

		res.status(201);
		logWithLocation(`${res.statusCode}`, "server");
		res.json({
			message: "Message sent successfully",
			data: message,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			logWithLocation(`Error sending message: ${error.message}`, "error");
			res.status(500);
			logWithLocation(`${res.statusCode}`, "server");
			res.json({
				message: "Error sending message",
				error: error.message,
			});
		}
	}
};
