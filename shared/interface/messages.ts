import { ObjectId } from "mongodb";

export interface Message {
	_id: ObjectId;
	channelId: ObjectId | null;
	userId: ObjectId;
	recipientId: ObjectId | null;
	content: string;
	taggedUsers: Array<string>;
	createdAt: Date;
	updatedAt: Date;
}
