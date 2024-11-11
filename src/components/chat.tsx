// App.tsx
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Channel } from "../../shared/interface/channels.js";
import { AppSidebar } from "../components/app-sidebar";
import { User } from "../../shared/interface/user.js";
import { Separator } from "../components/ui/separator";
import { Message } from "../../shared/interface/messages.js";
import { MessageFeed } from "../components/messageDisplay";
import { authStore } from "../authStore.js";
import { MessageBox } from "./messageBox.js";
import { MemberList } from "./memberList.js";

const apiUrl = import.meta.env.VITE_API_URL;

export function ChatLayout() {
	const [channels, setChannels] = useState<Channel[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<Channel | null>(
		null
	);
	const [users, setUsers] = useState<User[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);
	const [hasAccess, setHasAccess] = useState<boolean>(false);

	const fetchChannels = async () => {
		try {
			const response = await fetch(`${apiUrl}/api/channels`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setChannels(data);
			console.log("Fetched channels sucessfully.");
		} catch (error: unknown) {
			{
				if (error instanceof Error) {
					console.log(`Error fetching channels: ${error.message}`);
				}
			}
		}
	};

	const fetchUsers = async () => {
		try {
			const response = await fetch(`${apiUrl}/api/users`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			setUsers(data);
			console.log("Fetched users sucessfully.");
		} catch (error: unknown) {
			{
				if (error instanceof Error) {
					console.log(`Error fethcing users: ${error.message}`);
				}
			}
		}
	};

	const fetchMessages = async (channel: Channel) => {
		const channelIdString = channel._id.toString();
		const url = `${apiUrl}/api/messages/channels/${channelIdString}/messages`;
		try {
			const hasAccess = await hasChannelAccess(channel);
			if (!hasAccess) {
				setMessages([]); // Clear messages if no access
				console.log("Unauthorized access to channel");
				return;
			}
			const headers = {
				...authStore.getAuthHeaders(),
			} as Record<string, string>;

			const response = await fetch(url, { headers });
			console.log(`Fetching messages from ${url}`);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			setMessages(data);
			console.log("Messages fetched successfully");
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.log(
					`Error fethcing messages: ${error.message}`,
					"error"
				);
			}
		}
	};

	/**
	 * Checks if the current user has access to a specified channel.
	 *
	 * @param {Channel} channel - The channel to check access for. It includes properties like `isLocked`
	 *                             to determine if the channel is locked and `members` array to check
	 *                             user membership.
	 * @returns {boolean} - Returns true if the user has access to the channel, false otherwise.
	 *
	 * The function handles scenarios where:
	 * - No authentication token is found, logging a message and returning false.
	 * - If the channel is not locked, access is granted to everyone.
	 * - If no user is logged in, access to locked channels is denied.
	 * - Admin users are granted access unconditionally.
	 * - Finally, it checks if the current user is a member of the channel.
	 */
	const hasChannelAccess = async (channel: Channel): Promise<boolean> => {
		if (!channel.isLocked) return true;

		const token = authStore.getToken();
		if (!token) {
			console.log("No auth token found");
			return false;
		}

		// public
		const currentUser = (await authStore.getCurrentUser()) || null;

		// admin so full access
		if (currentUser?.isAdmin) return true;

		// are we member?
		if (currentUser) {
			return channel.members.includes(currentUser._id.toString());
		}
		return false;
	};

	// init ui
	useEffect(() => {
		fetchChannels();
		fetchUsers();
	}, []);

	// Fetch messages when selected channel
	/**
	 * Effect hook that fetches messages for the selected channel.
	 * If the channel is locked, it checks if the user has access prior to fetching messages.
	 *
	 * @param {Object} selectedChannel - The currently selected channel.
	 * @param {boolean} selectedChannel.isLocked - Indicates if the channel is locked.
	 *
	 * The effect runs whenever `selectedChannel` changes.
	 */
	useEffect(() => {
		if (selectedChannel) {
			// public channels
			if (!selectedChannel.isLocked) {
				setHasAccess(true);
				fetchMessages(selectedChannel);
			} else {
				/**
				 * Checks if the user has access to a selected channel.
				 * If the channel is locked, it determines access by calling
				 * the `hasChannelAccess` function. If the channel is not
				 * locked, it grants access by setting `hasAccess` to true.
				 *
				 * @returns {Promise<void>} A promise that resolves when
				 * the access check is complete.
				 */
				const checkAccess = async () => {
					if (selectedChannel) {
						if (selectedChannel.isLocked) {
							const access = await hasChannelAccess(
								selectedChannel
							);
							setHasAccess(access);
						} else {
							setHasAccess(true);
						}
					}
				};
				checkAccess();
			}
		}
	}, [selectedChannel]);

	const handleChannelClick = async (channel: Channel) => {
		if (channel.isLocked) {
			setMessages([]);
			const access = await hasChannelAccess(channel);
			if (!access) {
				console.log("User not authorized to view this channel");
				setHasAccess(access);
				console.log("Access set to", access);
				return;
			}
		}

		// Set selectedChannel only if access is granted or channel isn't locked
		setSelectedChannel(channel);
	};

	const handleSendMessage = async (userId: string, message: string) => {
		try {
			const currentUser = await authStore.getCurrentUser();

			const response = await fetch(`${apiUrl}/api/messages`, {
				method: "POST",
				headers: {
					...authStore.getAuthHeaders(),
				},
				body: JSON.stringify({
					content: message,
					userId: currentUser?._id,
					recipientId: userId,
					channelId: null,
					taggedUsers: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log("Message sent successfully:", data);
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	const handleMessageSubmit = async (message: string) => {
		try {
			const currentUser = await authStore.getCurrentUser();

			// Only send if we have a selected channel
			if (!selectedChannel) return;

			const response = await fetch(`${apiUrl}/api/messages`, {
				method: "POST",
				headers: {
					...authStore.getAuthHeaders(),
				},
				body: JSON.stringify({
					content: message,
					userId: currentUser?._id,
					recipientId: null, // null for channel messages
					channelId: selectedChannel._id,
					taggedUsers: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log("Channel message sent successfully:", data);

			// Optionally refresh messages
			if (selectedChannel) {
				fetchMessages(selectedChannel);
			}
		} catch (error) {
			console.error("Failed to send channel message:", error);
		}
	};

	return (
		<div className='flex-col'>
			<div className='flex bg-background'>
				{/* Left sidebar */}
				<SidebarProvider>
					<AppSidebar
						channels={channels}
						onChannelClick={handleChannelClick}
						selectedChannel={selectedChannel}
					/>

					<div className='relative flex-1 flex flex-col min-w-0'>
						<main className='flex-1 p-6'>
							<SidebarTrigger />
							{selectedChannel ? (
								<div>
									<h2 className='text-2xl font-bold'>
										{selectedChannel.channelName}
									</h2>
									<p className='text-muted-foreground mt-2'>
										{selectedChannel.desc}
									</p>
									<Separator />
								</div>
							) : (
								<div className='flex h-full items-center justify-center text-muted-foreground'>
									Select a channel to start chatting
								</div>
							)}
							<Separator />
							<MessageFeed
								messages={messages}
								users={users}
								selectedChannel={selectedChannel}
								hasAccess={hasAccess}
							/>
						</main>
						<div className='sticky bottom-0 left-0 right-0 z-50 bg-background border-t'>
							<div className='p-4'>
								<MessageBox
									onMessageSubmit={handleMessageSubmit}
								/>
							</div>
						</div>
					</div>
				</SidebarProvider>

				{/* Right sidebar */}
				{/* TODO: Refactor to component */}

				<MemberList
					selectedChannel={selectedChannel}
					users={users}
					onSendMessage={handleSendMessage}
				/>
			</div>
		</div>
	);
}

export default ChatLayout;
