import { useState, useEffect } from "react";
import { User } from "../../shared/interface/user";
import { authStore } from "../authStore";

const apiUrl = import.meta.env.VITE_API_URL;

export const useUsers = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [selectedDMUser, setSelectedDMUser] = useState<User | null>(null);
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	const fetchUsers = async () => {
		try {
			const response = await fetch(`${apiUrl}/api/users`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setUsers(data);
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.log(`Error fetching users: ${error.message}`);
			}
		}
	};

	const handleDirectMessageClick = async (user: User | null) => {
		if (user) {
			// Convert User to SimpleUser when setting
			setSelectedDMUser(user);
		}
	};

	useEffect(() => {
		fetchUsers();
		const getCurrentUser = async () => {
			const user = await authStore.getCurrentUser();
			setCurrentUser(user);
		};
		getCurrentUser();
	}, []);

	return {
		users,
		currentUser,
		selectedDMUser,
		handleDirectMessageClick,
		setSelectedDMUser,
	};
};
