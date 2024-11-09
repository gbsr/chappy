import { Collection, ObjectId } from "mongodb";
import { logWithLocation } from "../../../shared/helpers.js";
import { channelSchema } from "../../../shared/schema.js";
import { Channel } from "../../../shared/interface/channels.js";
import { Request, Response } from "express";

/**
 * Checks if a channel exists in the given collection by searching for
 * either the channel name or its description.
 *
 * @param {Collection<Channel>} collection - The collection to search within.
 * @param {string} channelName - The name of the channel to check.
 * @param {string} desc - The description of the channel to check.
 * @returns {Promise<{ exists: boolean; field?: string }>} An object indicating
 * whether the channel exists and the corresponding field if it does.
 *
 * The function performs two database queries: the first checks for an existing
 * channel by its name, and the second checks by its description. If an error
 * occurs in the queries, it will be caught and handled internally.
 */
async function checkChannelExists(
	collection: Collection<Channel>,
	channelName: string,
	desc: string
): Promise<{ exists: boolean; field?: string }> {
	const existingChannelName = await collection.findOne({ channelName });
	if (existingChannelName) {
		return { exists: true, field: "channelName" };
	}

	const existingDescription = await collection.findOne({ desc });
	if (existingDescription) {
		return { exists: true, field: "desc" };
	}
	return { exists: false };
}

/**
 * Adds a new channel to the specified collection.
 *
 * @param {Request} req - The HTTP request object containing the channel data in the body.
 * @param {Response} res - The HTTP response object to send the response.
 * @param {Collection<Channel>} collection - The MongoDB collection where the channel will be added.
 *
 * The function first validates the channel data using a JOI schema.
 * If validation fails, it returns a 400 response with an error message.
 * It then checks if a channel with the same name already exists, returning a 409 response if it does.
 * If the channel is valid and does not exist, it inserts the new channel into the collection and responds with a 201 status code.
 *
 * The function includes error handling, logging errors if they occur during the process and returning a 500 response with an error message.
 */
export const addChannel = async (
	req: Request,
	res: Response,
	collection: Collection<Channel>
) => {
	const {
		channelName,
		desc,
		createdBy,
		isLocked,
		members,
		createdAt,
		updatedAt,
	} = req.body;
	try {
		logWithLocation(`Trying to add channel: ${channelName}`, "info");
		const { error } = channelSchema.validate({
			channelName,
			desc,
			createdBy,
			isLocked,
			members,
			createdAt,
			updatedAt,
		});

		if (error) {
			logWithLocation(`JOI Validation error: ${error.message}`, "error");
			res.status(400);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "Invalid channel data",
				error: error.message,
			});
		}

		const channelExists = await checkChannelExists(
			collection,
			channelName,
			desc
		);
		if (channelExists.exists) {
			logWithLocation(`Duplicate ${channelExists.field} found`, "error");
			res.status(409);
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: `Channel with name ${channelExists.field} already exists`,
				field: channelExists.field,
			});
		}

		const channel: Channel = {
			_id: new ObjectId(),
			channelName,
			desc,
			createdBy,
			isLocked,
			members,
			createdAt,
			updatedAt,
		};

		await collection.insertOne(channel);
		logWithLocation(
			`Channel added successfully: ${channel.channelName} with id: ${channel._id}`,
			"success"
		);
		res.status(201);
		logWithLocation(`${res.statusCode}`, "server");
		res.json({
			channel,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			logWithLocation(`Error adding user!: ${error.message}`, "error");
			res.status(500);
			logWithLocation(`${res.statusCode}`, "server");
			res.json({
				message: "Error with channel data",
				error: error.message,
			});
		}
	}
};
