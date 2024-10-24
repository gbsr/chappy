import { Router, Request, Response } from "express";
import { Collection } from "mongodb";
import { User } from "../../src/data/interface/user.js";
import { db } from "../../src/data/dbConnection.js";
import { getAllUsers } from "../crud/user/getAllUsers.js";
import { getUser } from "../crud/user/getUser.js";
import { addUser } from "../crud/user/addUser.js";

const userRouter = Router();
let collection: Collection<User>;

// Initialize collection
userRouter.use((_req, _res, next) => {
	collection = db.collection<User>("user");
	next();
});

// Search user request query - NOT IMPLEMENTED
userRouter.get("/search", async (_req: Request, res: Response) => {
	// await searchUsers(req, res, collection);
	res.status(501).send("Not implemented");
});

// List all users
userRouter.get("/", async (req: Request, res: Response) => {
	await getAllUsers(req, res, collection);
});

// Get user by id
userRouter.get("/:id", async (req: Request, res: Response) => {
	await getUser(req, res, collection);
});

// Add a new user
userRouter.post("/add", async (_req: Request, res: Response) => {
	await addUser(_req, res, collection);
});

// Change user - NOT IMPLEMENTED
userRouter.put("/:id", async (_req: Request, res: Response) => {
	// await updateUser(req, res, collection);
	res.status(501).send("Not implemented");
});

// Delete user - NOT IMPLEMENTED
userRouter.delete("/:id", async (_req: Request, res: Response) => {
	// await deleteUser(req, res, collection);
	res.status(501).send("Not implemented");
});

export { userRouter };
