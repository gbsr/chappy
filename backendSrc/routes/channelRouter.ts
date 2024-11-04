import { Router, Request, Response } from "express";
import { Collection } from "mongodb";
import { db } from "../../src/data/dbConnection.js";
import { Channel } from "../../src/data/interface/channels.js";
import { getAllChannels } from "../crud/channels/getAllChannels.js";
import { addChannel } from "../crud/channels/addChannel.js";
import { deleteChannel } from "../crud/channels/deleteChannel.js";

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

// add a channel
channelRouter.post("/add", async (req: Request, res: Response) => {
	await addChannel(req, res, collection);
});

// delete channel
channelRouter.delete("/:id", async (req: Request, res: Response) => {
	await deleteChannel(req, res, collection);
});

// update channel
// channelRouter.post("/update/:id", async (req: Request, res: Response) => {
// 	const id = req.params.id;
// 	await updateChannel(req, res, collection, id);
// });

export { channelRouter };
