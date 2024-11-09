import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { logWithLocation } from "../../shared/helpers.js";
import { User } from "../../shared/interface/user.js";
import { ObjectId } from "mongodb";
import { db } from "../data/dbConnection.js";
import { userSchema } from "../../shared/schema.js";

const jwtSecret = process.env.JWT_SECRET || "";
const collection = db.collection("users");

export async function hashPassword(password: string): Promise<string> {
	const saltRounds = 10;
	return bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(
	password: string,
	hash: string
): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export function generateToken(userId: ObjectId): string {
	return jwt.sign({ userId: userId.toString() }, jwtSecret, {
		expiresIn: "24h",
	});
}

export function verifyToken(token: string): { userId: string } | null {
	try {
		return jwt.verify(token, jwtSecret) as { userId: string };
	} catch (error) {
		logWithLocation("Invalid token", "error");
		return null;
	}
}

export async function authenticateUser(
	userName: string,
	password: string
): Promise<{ token: string; user: User } | null> {
	try {
		const user = (await collection.findOne({ userName })) as User | null;

		if (!user) {
			logWithLocation("User not found", "error");
			return null;
		}

		const isValid = await comparePasswords(password, user.password);
		if (!isValid) {
			logWithLocation("Invalid password", "error");
			return null;
		}

		const token = generateToken(user._id);
		return { token, user };
	} catch (error) {
		logWithLocation(`Authentication error: ${error}`, "error");
		return null;
	}
}

export async function validateToken(token: string): Promise<User | null> {
	const payload = verifyToken(token);
	if (!payload) return null;

	try {
		const user = (await collection.findOne({
			_id: new ObjectId(payload.userId),
		})) as User | null;

		return user;
	} catch (error) {
		logWithLocation(`Token validation error: ${error}`, "error");
		return null;
	}
}

// Validation helper using your existing schema
export function validateUserInput(userData: Partial<User>): { error?: string } {
	const { error } = userSchema.validate(userData);
	return { error: error?.details[0]?.message };
}
