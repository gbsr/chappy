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
import { Channel } from "@/data/interface/channels";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppSidebarProps {
	channels: Channel[];
	onChannelClick: (channel: Channel) => void;
	selectedChannel: Channel | null;
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
}: AppSidebarProps) {
	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className='text-lg text-black-500'>
						Channels
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<ScrollArea className='h-[300px]'>
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
			</SidebarContent>
		</Sidebar>
	);
}
