import {
	Router,
	Request,
	Response,
	RequestHandler as ExpressRequestHandler,
} from "express";
import { getChannelMessages } from "../crud/messages/getAllMessages.js";
import { Collection, ObjectId } from "mongodb";
import { Message } from "../../shared/interface/messages.js";
import { Channel } from "../../shared/interface/channels.js";
import { db } from "../data/dbConnection.js";
import { sendMessage } from "../crud/messages/addMessage.js";
import { verifyToken, AuthRequest } from "../auth/auth.middleware.js";

const messageRouter = Router();
let messageCollection: Collection<Message>;
let channelCollection: Collection<Channel>;

// init collections
messageRouter.use((_req, _res, next) => {
	messageCollection = db.collection<Message>("message");
	channelCollection = db.collection<Channel>("channel");
	next();
});

// get messages from channels
messageRouter.get("/channels/:channelId/messages", (async (
	req: Request,
	res: Response
) => {
	await getChannelMessages(req, res, messageCollection, channelCollection);
}) as ExpressRequestHandler);

/**
 * Handles incoming POST requests to the message router.
 *
 * Validates the request using the `verifyToken` middleware and processes the request body.
 *
 * @param {AuthRequest} req - The request object, containing the message details in the body.
 * @param {Response} res - The response object used to send back the results of the request.
 *
 * It logs the received message request body for debugging purposes, then calls
 * the `sendMessage` function with the request, response, and message collection.
 */
messageRouter.post(
	"/",
	verifyToken as ExpressRequestHandler,
	(async (req: AuthRequest, res: Response) => {
		console.log("Received message request body:", req.body);
		await sendMessage(req, res, messageCollection);
	}) as ExpressRequestHandler
);

messageRouter.get(
	"/direct/:id",
	verifyToken as ExpressRequestHandler,
	(async (req: AuthRequest, res: Response) => {
		if (!req.user) {
			return res.status(401).json({ message: "Not authenticated" });
		}
		try {
			const messages = await messageCollection
				.find({
					channelId: null,
					$or: [
						{ userId: new ObjectId(req.user.userId) },
						{ recipientId: new ObjectId(req.user.userId) },
					],
				})
				.toArray();
			res.setHeader("Content-Type", "application/json");
			res.json(messages);
		} catch (error) {
			res.status(500).json({ error: "Failed to fetch direct messages" });
		}
	}) as ExpressRequestHandler
);

messageRouter.get(
	"/direct/all",
	verifyToken as ExpressRequestHandler,
	(async (req: AuthRequest, res: Response) => {
		if (!req.user) {
			return res.status(401).json({ message: "Not authenticated" });
		}
		try {
			const messages = await messageCollection
				.find({
					channelId: null,
					$or: [
						{ userId: new ObjectId(req.user.userId) },
						{ recipientId: new ObjectId(req.user.userId) },
					],
				})
				.toArray();
			res.setHeader("Content-Type", "application/json");
			res.json(messages);
		} catch (error) {
			res.status(500).json({ error: "Failed to fetch direct messages" });
		}
	}) as ExpressRequestHandler
);

export { messageRouter };
