import React, { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { Channel } from "shared/interface/channels.js";
import { User } from "shared/interface/user.js";
import { ObjectId } from "mongodb";
import { MessageBox } from "./messageBox.js";

interface MemberListProps {
	selectedChannel: Channel | null;
	users: User[];
	onSendMessage: (userId: string, message: string) => Promise<void>;
}

export const MemberList: React.FC<MemberListProps> = ({
	selectedChannel,
	users,
	onSendMessage,
}) => {
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

	const handleUserClick = (user: User | undefined) => {
		if (user) {
			setSelectedUser(user);
			setIsDialogOpen(true);
		}
	};

	const handleMessageBoxSubmit = useCallback(
		(message: string) => {
			if (selectedUser && message) {
				onSendMessage(selectedUser._id.toString(), message);
				setIsDialogOpen(false);
			}
		},
		[selectedUser, onSendMessage]
	);

	return (
		<div className='w-64 border-l border-sidebar-border bg-sidebar p-4'>
			<div className='duration-200 flex h-8 shrink-0 items-center rounded-md px-2 font-medium'>
				Members ({selectedChannel?.members?.length || 0})
			</div>
			<ScrollArea className='h-[300px]'>
				<div className='space-y-2 text-bg-slate-100'>
					{selectedChannel?.members?.map(
						(userId: string | undefined) => {
							const user = users.find(
								(user: { _id: ObjectId }) =>
									user._id.toString() === userId
							);
							return (
								<div
									key={userId}
									onClick={() => handleUserClick(user)}
									className='flex items-center p-2 text-base text-bg-slate-100 hover:bg-sidebar-accent data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-900 transition-colors rounded-md cursor-pointer'>
									<Avatar className='h-7 w-7'>
										<AvatarFallback className='p-2 bg-indigo-900 text-white'>
											{(user?.userName || "")
												.substring(0, 2)
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<span className='truncate text-sm ml-2'>
										{user?.userName || "Unknown User"}
									</span>
									<MessageSquare className='ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity' />
								</div>
							);
						}
					)}
				</div>
			</ScrollArea>
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>
							Send Message to {selectedUser?.userName}
						</DialogTitle>
					</DialogHeader>
					<div className='flex flex-col space-y-4'>
						<MessageBox onMessageSubmit={handleMessageBoxSubmit} />
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default MemberList;
