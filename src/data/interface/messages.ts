import { ObjectId } from "mongodb";

export interface Message {
	_id: ObjectId;
	channelId: ObjectId;
	userId: ObjectId;
	recipientId: ObjectId;
	content: string;
	taggedUsers: Array<string>;
	createdAt: Date;
	updatedAt: Date;
}
