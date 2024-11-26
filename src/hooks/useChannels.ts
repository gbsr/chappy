import { useState, useEffect } from "react";
import { Channel } from "../../shared/interface/channels";
import { authStore } from "../authStore";

const apiUrl = import.meta.env.VITE_API_URL;

export const useChannels = () => {
	const [channels, setChannels] = useState<Channel[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
	const [hasAccess, setHasAccess] = useState<boolean>(false);

	const fetchChannels = async () => {
		try {
			const response = await fetch(`${apiUrl}/api/channels`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setChannels(data);
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.log(`Error fetching channels: ${error.message}`);
			}
		}
	};

	const hasChannelAccess = async (channel: Channel): Promise<boolean> => {
		if (!channel.isLocked) return true;

		const token = authStore.getToken();
		if (!token) {
			console.log("No auth token found");
			return false;
		}

		const currentUser = await authStore.getCurrentUser();
		if (currentUser?.isAdmin) return true;

		if (currentUser) {
			return channel.members.includes(currentUser._id.toString());
		}
		return false;
	};

	const handleChannelClick = async (channel: Channel) => {
		if (channel.isLocked) {
			const access = await hasChannelAccess(channel);
			if (!access) {
				setHasAccess(access);
				return;
			}
		}
		setSelectedChannel(channel);
	};

	useEffect(() => {
		fetchChannels();
	}, []);

	useEffect(() => {
		if (selectedChannel) {
			const checkAccess = async () => {
				if (selectedChannel.isLocked) {
					const access = await hasChannelAccess(selectedChannel);
					setHasAccess(access);
				} else {
					setHasAccess(true);
				}
			};
			checkAccess();
		}
	}, [selectedChannel]);

	return {
		channels,
		selectedChannel,
		hasAccess,
		handleChannelClick,
		setSelectedChannel,
	};
};
