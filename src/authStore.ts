import { logWithLocation } from "./helpers.js";
import { User } from "../shared/interface/user.js";
const apiUrl = import.meta.env.VITE_API_URL;
// import "dotenv/config";
// const apiUrl = process.env.API_URL;

// const port = process.env.PORT || 1338;

// Defines the shape of authentication headers to be used in requests, including optional Authorization and mandatory Content-Type fields.
// Also specifies the response structure for fetching a user profile, containing a message and the user's profile information.
type AuthHeaders = {
	Authorization?: string;
	"Content-Type": string;
};

interface ProfileResponse {
	message: string;
	profile: User;
}

/**
 * The `authStore` object provides methods for managing authentication tokens
 * in local storage, including storing, retrieving, and clearing tokens, as well as
 * fetching authentication headers and the current user's profile information.
 *
 * Methods:
 *
 * - `storeToken(token: string)`: Stores the provided token in local storage,
 *   logging success or failure based on the operation outcome.
 *
 * - `getToken()`: Retrieves the token from local storage. If successful, logs
 *   the retrieval; if not, logs an error and returns null.
 *
 * - `clearToken()`: Removes the token from local storage, logging the outcome
 *   of the operation and returning a boolean indicating success.
 *
 * - `getAuthHeaders()`: Constructs and returns the headers for authentication.
 *   If a token is present, it adds an Authorization header; otherwise, it returns
 *   only the Content-Type.
 *
 * - `getCurrentUser()`: Fetches the current user's profile from a specified API.
 *   It logs success or failure of the operation and returns the user's profile or
 *   null if the fetch fails.
 *
 * Note: The methods include try/catch blocks to handle potential errors arising
 * from local storage operations and network requests.
 */
export const authStore = {
	storeToken: (token: string) => {
		try {
			localStorage.setItem("token", token);
			logWithLocation("Token stored successfully", "success");
		} catch (error) {
			logWithLocation("Failed to store token", "error");
		}
	},

	getToken: () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				return null;
			}
			logWithLocation("Token retrieved", "success");
			return token;
		} catch (error) {
			logWithLocation("Error retrieving token", "error");
			return null;
		}
	},

	clearToken: () => {
		try {
			localStorage.removeItem("token");
			logWithLocation("Token cleared successfully", "success");
			return true;
		} catch (error) {
			logWithLocation("Failed to clear token", "error");
			return false;
		}
	},

	getAuthHeaders: (): AuthHeaders => {
		const token = localStorage.getItem("token");
		if (!token) {
			return {
				"Content-Type": "application/json",
			};
		}
		return {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		};
	},

	getCurrentUser: async (): Promise<User | null> => {
		try {
			const response = await fetch(`${apiUrl}/api/users/profile`, {
				headers: authStore.getAuthHeaders(),
			});

			if (!response.ok) {
				return null;
			}

			const data = (await response.json()) as ProfileResponse;
			return data.profile;
		} catch (error) {
			logWithLocation("Failed to get user profile", "error");
			return null;
		}
	},
};
