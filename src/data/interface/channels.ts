import { ObjectId } from "mongodb";
export interface Channel {
	_id: ObjectId;
	channelName: string;
	desc: string;
	createdBy: ObjectId;
	isLocked: boolean;
	members: string[];
	createdAt: Date;
	updatedAt: Date;
}
