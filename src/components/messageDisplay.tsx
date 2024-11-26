import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "../../shared/interface/user";
import { Message } from "../../shared/interface/messages";
import { AlertTriangle } from "lucide-react";
import { Channel } from "../../shared/interface/channels";

interface MessageFeedProps {
	channelMessages: Message[];
	directMessages: Message[];
	users: User[];
	selectedChannel: Channel | null;
	selectedDMUser: User | null;
	currentUser: User | null;
	hasAccess: boolean;
}

export function MessageFeed({
	channelMessages,
	directMessages,
	users,
	selectedChannel,
	selectedDMUser,
	currentUser,
	hasAccess,
}: MessageFeedProps) {
	/**
	 * Determines which messages to display based on the selected channel and direct message user.
	 * If a channel is selected, channelMessages are displayed; otherwise, it filters directMessages
	 * to show only those exchanged between the current user and the selected direct message user.
	 *
	 * @param {Array} channelMessages - An array of messages for the selected channel.
	 * @param {Array} directMessages - An array of direct messages.
	 * @param {Object} selectedDMUser - The user currently selected for direct messaging.
	 * @param {Object} currentUser - The user currently logged in.
	 *
	 * If neither a channel nor a direct message user is selected, returns null.
	 */
	const displayMessages = selectedChannel
		? channelMessages
		: directMessages.filter(
				(msg) =>
					(msg.userId.toString() === selectedDMUser?._id.toString() &&
						msg.recipientId?.toString() ===
							currentUser?._id.toString()) ||
					(msg.userId.toString() === currentUser?._id.toString() &&
						msg.recipientId?.toString() ===
							selectedDMUser?._id.toString())
		  );

	if (!selectedChannel && !selectedDMUser) {
		return null;
	}

	if (!hasAccess && selectedChannel) {
		return (
			<div className='h-[calc(100vh-200px)] flex-col mt-4 items-center justify-center'>
				<AlertTriangle className='h-5 w-5 text-red-400 mb-4' />
				<p className='text-red-400 font-bold'>Access restricted.</p>
				<p className='text-red-400 font-bold'>
					Please contact administrator.
				</p>
			</div>
		);
	}

	if (displayMessages.length === 0) {
		return (
			<div className='h-[calc(100vh-200px)] flex-col mt-4 items-center justify-center'>
				<p className='text-slate-400 italic'>No messages.</p>
			</div>
		);
	}

	return (
		<ScrollArea className='flex-1 p-4 mb-16'>
			{displayMessages.map((message) => {
				const sender = users.find(
					(user) => user._id.toString() === message.userId.toString()
				);

				return (
					<div
						key={message._id.toString()}
						className='flex items-start gap-3'>
						<Avatar className='h-8 w-8'>
							<AvatarFallback>
								{sender?.userName
									.substring(0, 2)
									.toUpperCase() || "??"}
							</AvatarFallback>
						</Avatar>
						<div>
							<div className='flex items-center gap-2'>
								<span className='font-semibold'>
									{sender?.userName || "Unknown User"}
								</span>
								<span className='text-xs text-muted-foreground'>
									{new Date(
										message.createdAt
									).toLocaleString()}
								</span>
							</div>
							<p className='mt-1'>{message.content}</p>
						</div>
					</div>
				);
			})}
		</ScrollArea>
	);
}
