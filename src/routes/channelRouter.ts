import { Router, Request, Response } from "express";
import { Collection } from "mongodb";
import { db } from "../data/dbConnection.js";
import { Channel } from "../data/interface/channels.js";
import { getAllChannels } from "../crud/channels/getAllChannels.js";

const channelRouter = Router();
let collection: Collection<Channel>;

// Initialize collection
channelRouter.use((_req, _res, next) => {
	collection = db.collection<Channel>("channel");
	next();
});

// List all channels
channelRouter.get("/", async (req: Request, res: Response) => {
	await getAllChannels(req, res, collection);
});

export { channelRouter };
