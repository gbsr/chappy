// App.tsx
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Channel } from "./data/interface/channels";
import { AppSidebar } from "./components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "./data/interface/user";
import { Separator } from "./components/ui/separator";
import { Message } from "./data/interface/messages";
import { MessageFeed } from "./components/messageDisplay";

const apiUrl = import.meta.env.VITE_API_URL;

export default function Layout() {
	const [channels, setChannels] = useState<Channel[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<Channel | null>(
		null
	);
	const [users, setUsers] = useState<User[]>([]);
	// const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);

	const fetchChannels = async () => {
		try {
			const response = await fetch(`${apiUrl}/api/channels`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setChannels(data);
		} catch (error: unknown) {
			console.error("Error fetching channels:", error);
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
		} catch (error: unknown) {
			console.error("Error fetching users:", error);
		}
	};

	const fetchMessages = async (channel: Channel) => {
		const channelIdString = channel._id.toString();
		const url = `${apiUrl}/api/channels/${channelIdString}/messages`;
		try {
			const response = await fetch(url);
			console.log(`Fetching messages from ${url}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setMessages(data);
		} catch (error: unknown) {
			console.error("Error fetching messages:", error);
		}
	};

	// TODO: implement proper auth check.
	const hasChannelAccess = (channel: Channel): boolean => {
		if (!channel.isLocked) return true;

		return false;
	};

	// init ui
	useEffect(() => {
		fetchChannels();
		fetchUsers();
	}, []);

	// Fetch messages when selected channel
	useEffect(() => {
		if (selectedChannel && hasChannelAccess(selectedChannel)) {
			fetchMessages(selectedChannel);
		}
	}, [selectedChannel]);

	const handleChannelClick = (channel: Channel) => {
		setSelectedChannel(channel);

		if (!hasChannelAccess(channel)) {
		}
	};

	return (
		<div className='flex bg-background'>
			{/* Left sidebar */}
			<SidebarProvider>
				<AppSidebar
					channels={channels}
					onChannelClick={handleChannelClick}
					selectedChannel={selectedChannel}
				/>

				{/* Main chat content */}
				<main className='flex-1 p-6 min-w-0'>
					{/* Renders the sidebar and displays the selected channel's name and description.
					If no channel is selected, it prompts the user to select a channel to start chatting.
					The component consists of conditional rendering based on the 'selectedChannel' state. */}
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

					{/* Renders a MessageFeed component with the specified
					messages, users, and selectedChannel. he hasAccess prop
					is determined based on the selectedChannel's validity and
					the user's access rights to that channel. */}
					<MessageFeed
						messages={messages}
						users={users}
						selectedChannel={selectedChannel}
						hasAccess={
							selectedChannel
								? hasChannelAccess(selectedChannel)
								: true
						}
					/>
				</main>
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
	);
}
