import { Request, Response } from "express";
import { Collection } from "mongodb";
import { logWithLocation } from "../../../src/helpers.js";
import { Channel } from "../../../shared/interface/channels.js";

/**
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object used to send back data.
 * @param {Collection<Channel>} collection - The MongoDB collection from which to fetch users.
 * Retrieves all channels from the specified collection and sends the response to the client.
 *
 * This function logs an informational message when attempting to fetch channels, and logs success or
 * error messages based on the outcome. In case of success, it responds with a status code of 200
 * and the array of channels. If an error occurs, it logs the error message and responds with a status
 * code of 500 along with an error message.
 */
export const getAllChannels = async (
	_req: Request,
	res: Response,
	collection: Collection<Channel>
) => {
	try {
		logWithLocation(`Trying to get all channels`, "info");
		const users = await collection.find().toArray();
		res.status(200);
		logWithLocation(`Got all channels`, "success");
		logWithLocation(`${res.statusCode}`, "server");

		res.status(200).json(users);
	} catch (error: unknown) {
		if (error instanceof Error) {
			logWithLocation(
				`Error fetching channels: ${error.message}`,
				"error"
			);
			res.status(500);
			logWithLocation(`${res.statusCode}`, "server");

			res.status(500).json({
				message: "Error fetching channels",
				error: error.message,
			});
		}
	}
};
