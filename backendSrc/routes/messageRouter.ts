import { Router, Request, Response } from "express";
import { getChannelMessages } from "../crud/messages/getAllMessages.js";
import { Collection } from "mongodb";
import { Message } from "../../shared/interface/messages.js";
import { Channel } from "../../shared/interface/channels.js";
import { db } from "../data/dbConnection.js";

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
messageRouter.get(
	"/channels/:channelId/messages",
	async (req: Request, res: Response) => {
		await getChannelMessages(
			req,
			res,
			messageCollection,
			channelCollection
		);
	}
);

export { messageRouter };
