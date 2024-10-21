import { Router, Request, Response } from "express";
import { Collection } from "mongodb";
import { User } from "../data/interface/user.js";
import { db } from "../data/dbConnection.js";
import { getAllUsers } from "../crud/user/getAllUsers.js";
// import { getUser } from "../crud/users/getUser.js";
// import { addUser } from "../crud/users/addUser.js";
// import { updateUser } from "../crud/users/updateUser.js";
// import { deleteUser } from "../crud/users/deleteUser.js";
// import { searchUsers } from "../crud/search/searchUser.js";

const userRouter = Router();
let collection: Collection<User>;

// Initialize collection
userRouter.use((_req, _res, next) => {
	collection = db.collection<User>("user");
	next();
});

// Search user request query
userRouter.get("/search", async (_req: Request, res: Response) => {
	// await searchUsers(req, res, collection);
	res.status(501).send("Not implemented");
});

// List all users
userRouter.get("/", async (res: Response) => {
	await getAllUsers(res, collection);
});

// Get user by id
userRouter.get("/:id", async (_req: Request, res: Response) => {
	// const id = new ObjectId();
	// await getUser(req, res, collection);
	res.status(501).send("Not implemented");
});

// Add a new user
userRouter.post("/", async (_req: Request, res: Response) => {
	// await addUser(req, res, collection);
	res.status(501).send("Not implemented");
});

// Change user
userRouter.put("/:id", async (_req: Request, res: Response) => {
	// await updateUser(req, res, collection);
	res.status(501).send("Not implemented");
});

// Delete user
userRouter.delete("/:id", async (_req: Request, res: Response) => {
	// await deleteUser(req, res, collection);
	res.status(501).send("Not implemented");
});

export { userRouter };
