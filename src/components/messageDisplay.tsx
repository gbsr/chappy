import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "../../shared/interface/user";
import { Message } from "../../shared/interface/messages";
import { AlertTriangle } from "lucide-react";
import { Channel } from "../../shared/interface/channels";

interface MessageFeedProps {
	messages: Message[];
	users: User[];
	selectedChannel: Channel | null;
	hasAccess: boolean;
}

export function MessageFeed({
	messages,
	users,
	selectedChannel,
	hasAccess,
}: MessageFeedProps) {
	if (!selectedChannel) {
		return null;
	}

	if (!hasAccess) {
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

	if (messages.length === 0) {
		return (
			<div className='h-[calc(100vh-200px)] flex-col mt-4 items-center justify-center'>
				<p className='text-slate-400 italic'>No messages.</p>
			</div>
		);
	}

	return (
		<ScrollArea className='flex-1 p-4 mb-16'>
			{messages.map((message) => {
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
