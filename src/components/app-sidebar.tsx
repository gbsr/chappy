// components/app-sidebar.tsx
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Hash, Lock } from "lucide-react";
import { Channel } from "shared/interface/channels";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { User } from "shared/interface/user";
import { authStore } from "../../src/authStore.js";
import { Message } from "shared/interface/messages.js";

interface AppSidebarProps {
	channels: Channel[];
	onChannelClick: (channel: Channel) => void;
	onDirectMessageClick: (user: User) => void;
	selectedChannel: Channel | null;
	directMessages: Message[];
	users: User[];
}

// Helper function to get channel avatar fallback
const getChannelFallback = (channelName: string): string => {
	return channelName
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
};

/**
 * Renders a sidebar component displaying a list of channels.
 * Each channel includes an avatar, channel name, member count, and
 * an optional lock icon indicating whether the channel is locked.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.channels - The array of channel objects to render.
 *                                 Each channel object must have the following properties:
 *                                 - _id: Unique identifier for the channel.
 *                                 - channelName: The display name of the channel.
 *                                 - isLocked: Boolean indicating if the channel is locked.
 *                                 - members: Array of members in the channel.
 * @param {Function} props.onChannelClick - Callback function to handle click events on a channel menu button.
 */
export function AppSidebar({
	channels,
	onChannelClick,
	selectedChannel,
	directMessages,
	users,
	onDirectMessageClick,
}: AppSidebarProps) {
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	useEffect(() => {
		const getCurrentUser = async () => {
			const user = await authStore.getCurrentUser();
			setCurrentUser(user);
		};
		getCurrentUser();
	}, []);

	return (
		<Sidebar>
			<SidebarContent className='h-screen flex flex-col>'>
				<SidebarGroup className='flex-1'>
					<SidebarGroupLabel className='text-lg text-black-500'>
						Channels
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<ScrollArea className='h-full'>
							<SidebarMenu>
								{/* 								
								Renders a list of sidebar menu items for different channels.
								Each channel item includes an avatar, channel name, member count, and
								an optional lock icon if the channel is locked.
								
								@param {Array} channels - The array of channel objects to render, where each channel
								                            object is expected to have properties:
								                            - _id: Unique identifier for the channel
								                            - channelName: The display name of the channel
								                            - isLocked: Boolean indicating if the channel is locked
								                            - members: Array of members in the channel
								@param {Function} onChannelClick - Function to handle click events on a channel menu button.
								 */}
								{channels.map((channel) => (
									<SidebarMenuItem
										key={channel._id.toString()}>
										<SidebarMenuButton
											onClick={() =>
												onChannelClick(channel)
											}
											className='w-full text-bg-slate-100 hover:bg-sidebar-accent data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-900 transition-colors'
											isActive={
												selectedChannel?._id.toString() ===
												channel._id.toString()
											}>
											<div className='flex items-center gap-2'>
												<div className='relative'>
													<Avatar className='h-7 w-7 bg-slate-100'>
														<AvatarFallback>
															{getChannelFallback(
																channel.channelName
															)}
														</AvatarFallback>
													</Avatar>
													{channel.isLocked && (
														<Lock className='h-4.5 w-4.5 absolute right-4 bottom-0.5 text-red-600 bg-red-100 border-2 border-black-200 rounded-full' />
													)}
												</div>
												<div className='flex items-center gap-1.5'>
													<Hash className='h-3 w-3 text-muted-foreground' />
													<span className='truncate max-w-[150px]'>
														{channel.channelName}
													</span>
													<span className='text-base text-muted-foreground ml-auto'>
														{channel.members.length}
													</span>
												</div>
											</div>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</ScrollArea>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* * Renders a sidebar group for direct messages. 
				It displays a scrollable list of sidebar menu items for each direct message where the channelId is null.
				 Each item shows the avatar and username of the other user in the direct message, and clicking on the item triggers the `onDirectMessageClick` function with the selected user as an argument.
				
				This component filters messages to include only those with no associated channel (i.e., direct messages).
				It also handles the case where the other user might not exist in the users list, returning null in such cases. 
                */}
				<SidebarGroup className='flex-1'>
					<SidebarGroupLabel className='text-lg text-black-500'>
						Direct Messages
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<ScrollArea className='h-full'>
							<SidebarMenu>
								{Array.from(
									new Set(
										directMessages
											.filter(
												(msg) => msg.channelId === null
											)
											.map((message) => {
												const otherUserId =
													message.userId ===
													currentUser?._id
														? message.recipientId
														: message.userId;
												return otherUserId?.toString();
											})
									)
								).map((userId) => {
									const otherUser = users.find(
										(u) => u._id.toString() === userId
									);
									if (!otherUser) return null;

									return (
										<SidebarMenuItem
											key={otherUser._id.toString()}>
											<SidebarMenuButton
												onClick={() =>
													onDirectMessageClick(
														otherUser
													)
												}
												className='w-full text-bg-slate-100 hover:bg-sidebar-accent data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-900 transition-colors'>
												<div className='flex items-center gap-2'>
													<Avatar className='h-7 w-7'>
														<AvatarFallback>
															{otherUser.userName
																.substring(0, 2)
																.toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<span className='truncate max-w-[150px]'>
														{otherUser.userName}
													</span>
												</div>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</ScrollArea>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
