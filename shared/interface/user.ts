import { ObjectId } from "mongodb";
export interface User {
	_id: ObjectId;
	userName: string;
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
	isAdmin: boolean;
}