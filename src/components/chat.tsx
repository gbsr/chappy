import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { MessageFeed } from "../components/messageDisplay";
import { MessageBox } from "./messageBox";
import { MemberList } from "./memberList";
import { AppSidebar } from "../components/app-sidebar";
import { useChannels } from "../hooks/useChannels";
import { useMessages } from "../hooks/useMessages";
import { useUsers } from "../hooks/useUsers";

export function ChatLayout() {
	const {
		channels,
		selectedChannel,
		hasAccess,
		handleChannelClick,
		setSelectedChannel,
	} = useChannels();

	const {
		users,
		currentUser,
		selectedDMUser,
		handleDirectMessageClick,
		setSelectedDMUser,
	} = useUsers();

	const { channelMessages, directMessages, handleSendMessage } = useMessages(
		selectedChannel,
		selectedDMUser,
		hasAccess
	);

	// Clear channel selection when switching to DMs
	useEffect(() => {
		if (selectedChannel) {
			setSelectedDMUser(null);
		}
	}, [selectedChannel, setSelectedDMUser]);

	// Clear DM selection when switching to channels
	useEffect(() => {
		if (selectedDMUser) {
			setSelectedChannel(null);
		}
	}, [selectedDMUser, setSelectedChannel]);

	return (
		<div className='flex-col'>
			<div className='flex bg-background'>
				<SidebarProvider>
					<AppSidebar
						channels={channels}
						onChannelClick={handleChannelClick}
						onDirectMessageClick={handleDirectMessageClick}
						selectedChannel={selectedChannel}
						directMessages={directMessages}
						users={users}
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
							) : selectedDMUser ? (
								<div>
									<h2 className='text-2xl font-bold'>
										{selectedDMUser.userName}
									</h2>
									<p className='text-muted-foreground mt-2'>Direct Message</p>
									<Separator />
								</div>
							) : (
								<div className='flex h-full items-center justify-center text-muted-foreground'>
									Select a channel or user to start chatting
								</div>
							)}
							<MessageFeed
								channelMessages={channelMessages}
								directMessages={directMessages}
								users={users}
								selectedChannel={selectedChannel}
								selectedDMUser={selectedDMUser}
								currentUser={currentUser}
								hasAccess={hasAccess}
							/>
						</main>
						<div className='sticky bottom-0 left-0 right-0 z-50 bg-background border-t'>
							<div className='p-4'>
								<MessageBox
									onMessageSubmit={handleSendMessage}
									selectedChannel={selectedChannel}
									selectedDMUser={selectedDMUser}
								/>
							</div>
						</div>
					</div>
				</SidebarProvider>

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
