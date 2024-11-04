// App.tsx
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Channel } from "./data/interface/channels";
import { AppSidebar } from "./components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "./data/interface/user";
import { Separator } from "./components/ui/separator";

const apiUrl = import.meta.env.VITE_API_URL;

export default function Layout() {
	const [channels, setChannels] = useState<Channel[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<Channel | null>(
		null
	);
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
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
				console.log(data);
			} catch (error: unknown) {
				console.error("Error fetching users:", error);
			}
		};
		// TODO: fetchMessages

		fetchChannels();
		fetchUsers();
	}, []);

	const handleChannelClick = (channel: Channel) => {
		setSelectedChannel(channel);
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
				</main>
			</SidebarProvider>

			{/* Right sidebar */}

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
