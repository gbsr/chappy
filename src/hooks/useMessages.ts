import react from "react";
import { Message } from "../../shared/interface/messages";
import { Channel } from "../../shared/interface/channels";
import { User } from "../../shared/interface/user";
import { authStore } from "../authStore";

const apiUrl = import.meta.env.VITE_API_URL;

export const useMessages = (
	selectedChannel: Channel | null,
	selectedDMUser: User | null,
	hasAccess: boolean
) => {
	const [channelMessages, setChannelMessages] = react.useState<Message[]>([]);
	const [directMessages, setDirectMessages] = react.useState<Message[]>([]);

	const fetchMessages = async (channel: Channel) => {
		if (!hasAccess) {
			setChannelMessages([]);
			return;
		}

		const channelIdString = channel._id.toString();
		const url = `${apiUrl}/api/messages/channels/${channelIdString}/messages`;

		try {
			const headers = {
				...authStore.getAuthHeaders(),
			} as Record<string, string>;

			const response = await fetch(url, { headers });
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			setChannelMessages(data);
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.log(`Error fetching messages: ${error.message}`);
			}
		}
	};

	const fetchAllDirectMessages = async () => {
		try {
			const response = await fetch(`${apiUrl}/api/messages/direct/all`, {
				headers: {
					...authStore.getAuthHeaders(),
				},
			});
			if (response.ok) {
				const data = await response.json();
				setDirectMessages(data);
			}
		} catch (error) {
			console.error("Error fetching direct messages:", error);
		}
	};

	const handleSendMessage = async (
		message: string,
		targetId: string,
		isDM: boolean
	) => {
		try {
			const currentUser = await authStore.getCurrentUser();

			const bodyData = {
				content: message,
				userId: currentUser?._id,
				recipientId: isDM ? targetId : null,
				channelId: isDM ? null : targetId,
				taggedUsers: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const response = await fetch(`${apiUrl}/api/messages`, {
				method: "POST",
				headers: {
					...authStore.getAuthHeaders(),
				},
				body: JSON.stringify(bodyData),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Refresh messages after sending
			if (isDM) {
				await fetchAllDirectMessages();
			} else if (selectedChannel) {
				await fetchMessages(selectedChannel);
			}
		} catch (error) {
			console.error(`Failed to send message:`, error);
		}
	};

	// Poll for new messages
	react.useEffect(() => {
		const messageUpdateInterval = setInterval(() => {
			if (selectedChannel && hasAccess) {
				fetchMessages(selectedChannel);
			} else if (selectedDMUser) {
				fetchAllDirectMessages();
			}
		}, 250);

		return () => clearInterval(messageUpdateInterval);
	}, [selectedChannel, selectedDMUser, hasAccess, fetchMessages]);

	return {
		channelMessages,
		directMessages,
		handleSendMessage,
		fetchMessages,
		fetchAllDirectMessages,
	};
};
