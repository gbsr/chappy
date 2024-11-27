import react, { useEffect, useCallback } from "react";
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

	const fetchMessages = useCallback(
		async (channel: Channel) => {
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
		},
		[hasAccess, setChannelMessages]
	);

	const fetchAllDirectMessages = useCallback(async () => {
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
	}, [setDirectMessages]);

	/**
	 * Handles sending a message to a specified user or channel.
	 * This function constructs a message payload and sends it to the server via a POST request.
	 *
	 * @param {string} message - The content of the message to be sent.
	 * @param {string} targetId - The ID of the recipient or channel where the message will be sent.
	 * @param {boolean} isDM - A flag indicating whether the message is a direct message (DM) or not.
	 *
	 * If the request to send the message fails, an error is logged to the console.
	 * After sending the message, it refreshes messages either by fetching all direct messages
	 * if it's a DM or by fetching messages for the selected channel if applicable.
	 */
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

	useEffect(() => {
		fetchAllDirectMessages();
	}, [fetchAllDirectMessages]);

	// Poll for new messages
	useEffect(() => {
		const messageUpdateInterval = setInterval(() => {
			if (selectedChannel && hasAccess) {
				fetchMessages(selectedChannel);
			}
		}, 250);

		fetchAllDirectMessages();

		// Cleanup
		return () => clearInterval(messageUpdateInterval);
	}, [fetchMessages, fetchAllDirectMessages, selectedChannel, hasAccess]);

	return {
		channelMessages,
		directMessages,
		handleSendMessage,
		fetchMessages,
		fetchAllDirectMessages,
	};
};
