import { Router, Request, Response, RequestHandler } from "express";
import { Collection } from "mongodb";
import { db } from "../../src/data/dbConnection.js";

import { AuthRequest, verifyToken } from "../auth/auth.middleware.js";

import { User } from "../../src/data/interface/user.js";
import { login } from "../auth/auth.handler.js";
import { getAllUsers } from "../crud/user/getAllUsers.js";
import { getUser } from "../crud/user/getUser.js";
import { addUser } from "../crud/user/addUser.js";
import { deleteUser } from "../crud/user/deleteUser.js";
import { getUserProfile } from "../crud/user/getUserProfile.js";

const userRouter = Router();
let collection: Collection<User>;

// Initialize collection
userRouter.use((_req, _res, next) => {
	collection = db.collection<User>("user");
	next();
});

// -----------------
// Login
userRouter.post("/login", async (req: Request, res: Response) => {
	await login(req, res, collection);
});

// List all users
userRouter.get("/", async (req: Request, res: Response) => {
	await getAllUsers(req, res, collection);
});

// Get user profile
userRouter.get(
	"/profile",
	verifyToken as RequestHandler,
	async (req: AuthRequest, res: Response) => {
		await getUserProfile(req, res, collection);
	}
);

// Add a new user
userRouter.post("/add", async (req: Request, res: Response) => {
	await addUser(req, res, collection);
});

// Get user by id
userRouter.get("/:id", async (req: Request, res: Response) => {
	await getUser(req, res, collection);
});

// Change user - NOT IMPLEMENTED
userRouter.put("/:id", async (_req: Request, res: Response) => {
	// await updateUser(req, res, collection);
	res.status(501).send("Not implemented");
});

// Delete user
userRouter.delete("/:id", async (req: Request, res: Response) => {
	await deleteUser(req, res, collection);
});

// -----------------

// Search user request query - NOT IMPLEMENTED
userRouter.get("/search", async (_req: Request, res: Response) => {
	// await searchUsers(req, res, collection);
	res.status(501).send("Not implemented");
});

export { userRouter };
