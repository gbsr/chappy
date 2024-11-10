import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { channelRouter } from "./routes/channelRouter.js";
import { userRouter } from "./routes/userRouter.js";
import { messageRouter } from "./routes/messageRouter.js";
import { logWithLocation } from "../src/helpers.js";
import { connect, client } from "./data/dbConnection.js";
import cors from "cors";

// This Express.js application sets up a server with middleware for JSON parsing and CORS support.
// It serves static files from the "frontend" directory and defines routes for products, users, and cart functionality.
// The main route serves an index.html file and returns server status.
// The `startServer` function connects to the database and starts the server on a specified port,
// logging success or failure of this operation, and handles errors by closing the client and exiting the process.
const app = express();
const port = process.env.PORT || 1338;

// Middleware
app.use(express.json());

// Enables Cross-Origin Resource Sharing (CORS) for the application, allowing it to accept requests from different origins.
app.use(cors());

// Serve static files from the "frontend" directory using Express.
app.use(express.static("./frontend"));

// Sets up a route handler for GET requests to the root URL ("/")
// that sends the "index.html" file from the "./frontend" directory.
// currently unused
/*
app.get("/", (req, res) => {
	res.sendFile("index.html", { root: "./frontend" });
});
*/

// Routes
// maybe this works with render because I don't even know but it god damn refuses to run and I want to nuke the entire site
app.get("/", (_req, res) => {
	res.status(200).send("Server is running");
});

app.get("/api", (_req, res) => {
	res.status(200);
	res.status(200).send("Server is running");
	logWithLocation(`Server status: ${res.statusCode}`, "success");
});

app.use("/api/channels", channelRouter);
app.use("/api/users", userRouter);
app.use("/api", messageRouter);

/**
 * Initializes and starts the server by establishing a connection.
 *
 * This function attempts to connect to a required service and, upon success, starts the server
 * listening on the specified port. If the connection fails, it logs an error message, closes
 * the client, and exits the process with a failure status.
 */
async function startServer() {
	try {
		logWithLocation(`Attempting to connect to the database...`, "info");
		await connect();
		logWithLocation(
			"Database connection successful. Starting server...",
			"success"
		);
		app.listen(port, () => {
			logWithLocation(`Server is running on port ${port}`, "success");
		});
	} catch (error) {
		console.error("Detailed error in startServer:", error);
		logWithLocation(`Failed to start server: ${error}`, "error");
		await client.close();
		process.exit(1);
	}
}

startServer();

// Handles the SIGINT signal (e.g., when the process is interrupted)
// to gracefully shut down the application. It logs a message,
// closes the MongoDB connection, logs confirmation of the closure,
// and then exits the process with a status code of 0.
process.on("SIGINT", async () => {
	console.log(" Shutting down gracefully...");
	await client.close();
	console.log("MongoDB connection closed.");
	process.exit(0);
});
