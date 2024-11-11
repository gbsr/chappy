import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { authStore } from "../authStore.js";

export function LoginPage() {
	const [isRegistering, setIsRegistering] = useState(false);
	const [userEmail, setUserEmail] = useState("");
	const [userName, setUserName] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	/**
	 * Handles the form submission for user registration and login.
	 *
	 * @param {React.FormEvent} e - The event object from the form submission.
	 *
	 * This function determines the appropriate API endpoint to call based on
	 * whether the user is registering or logging in. It sends a POST request
	 * with the user's details and processes the server's response. Upon a
	 * successful registration, it switches the mode to login. In case of a
	 * successful login, it stores the authentication token and navigates to the chat.
	 *
	 * A try/catch block is used to handle any errors that occur during the API
	 * request, logging the error to the console if it occurs.
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const apiUrl = import.meta.env.VITE_API_URL;

		try {
			const endpoint = isRegistering
				? "/api/users/add"
				: "/api/users/login";
			console.log("Sending request to:", `${apiUrl}${endpoint}`);
			console.log(
				"Request body:",
				JSON.stringify(
					{
						email: userEmail,
						userName: userName,
						password: password,
						createdAt: new Date(),
						updatedAt: new Date(),
						isAdmin: false,
					},
					null,
					2
				)
			);

			const response = await fetch(`${apiUrl}${endpoint}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(
					isRegistering
						? {
								email: userEmail,
								userName: userName,
								password: password,
								createdAt: new Date(),
								updatedAt: new Date(),
								isAdmin: false,
						  }
						: {
								email: userEmail,
								password: password,
						  }
				),
			});

			const data = await response.json();
			console.log("Server response:", data);

			if (response.ok) {
				if (isRegistering) {
					setIsRegistering(false);
					setPassword("");
				} else {
					authStore.storeToken(data.token);
					navigate("/chat");
				}
			} else {
				console.error(
					// TODO: update frontend to tell user that the registration failed because user already exists

					isRegistering ? "Registration failed" : "Login failed"
				);
			}
		} catch (error) {
			console.error("Error:", error);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-background'>
			<Card className='w-[400px]'>
				<CardHeader>
					<CardTitle>
						{isRegistering ? "Create Account" : "Welcome back"}
					</CardTitle>
					<CardDescription>
						{isRegistering
							? "Register for a new account"
							: "Enter your credentials to access your account"}
					</CardDescription>
				</CardHeader>

				<form onSubmit={handleSubmit}>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Input
								placeholder='Email'
								type='email'
								value={userEmail}
								onChange={(e) => setUserEmail(e.target.value)}
								required
							/>
						</div>
						{isRegistering && (
							<div className='space-y-2'>
								<Input
									placeholder='Username'
									type='text'
									value={userName}
									onChange={(e) =>
										setUserName(e.target.value)
									}
									required
								/>
							</div>
						)}
						<div className='space-y-2'>
							<Input
								placeholder='Password'
								type='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
					</CardContent>
					<CardFooter className='flex flex-col space-y-2'>
						<Button type='submit' className='w-full'>
							{isRegistering ? "Register" : "Sign In"}
						</Button>
						<Button
							type='button'
							variant='outline'
							className='w-full'
							onClick={() => setIsRegistering(!isRegistering)}>
							{isRegistering
								? "Already have an account? Sign in"
								: "Need an account? Register"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
