// App.tsx
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Channel } from "../../shared/interface/channels.js";
import { AppSidebar } from "../components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "../../shared/interface/user.js";
import { Separator } from "../components/ui/separator";
import { Message } from "../../shared/interface/messages.js";
import { MessageFeed } from "../components/messageDisplay";
import { authStore } from "../authStore.js";
import { MessageBox } from "./messageBox.js";

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
		const url = `${apiUrl}/api/channels/${channelIdString}/messages`;
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
						{" "}
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
								<MessageBox />
							</div>
						</div>
					</div>
				</SidebarProvider>

				{/* Right sidebar */}
				{/* TODO: Refactor to component */}

				<div className='w-64 border-l border-sidebar-border bg-sidebar p-4'>
					<div className='duration-200 flex h-8 shrink-0 items-center rounded-md px-2 font-medium'>
						Members ({selectedChannel?.members.length || 0})
					</div>
					<ScrollArea className='h-[300px]'>
						<div className='space-y-2 text-bg-slate-100'>
							{selectedChannel?.members.map((userId) => {
								const user = users.find(
									(user) => user._id.toString() === userId
								);
								return (
									<div
										key={userId}
										className='flex items-center text-base text-bg-slate-100 hover:bg-sidebar-accent data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-900 transition-colors'>
										<Avatar className='h-7 w-7 indigo-900'>
											<AvatarFallback className='p-2 indigo-900'>
												{(user?.userName || "")
													.substring(0, 2)
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<span className='truncate text-sm ml-2'>
											{user?.userName || "Unknown User"}
										</span>
									</div>
								);
							})}
						</div>
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}

export default ChatLayout;
