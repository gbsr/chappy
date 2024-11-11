import { useState } from "react";

interface MessageBoxProps {
	onMessageSubmit: (message: string) => void;
}

export const MessageBox: React.FC<MessageBoxProps> = ({ onMessageSubmit }) => {
	const [message, setMessage] = useState("");
	const [file, setFile] = useState(null);

	const handleMessageChange = (event: any) => {
		setMessage(event.target.value);
	};

	const handleSubmit = () => {
		if (message.trim() || file) {
			onMessageSubmit(message);
			// Reset form
			setMessage("");
			setFile(null);
		}
	};

	return (
		<div className='w-full max-w-2xl mx-auto p-4'>
			<div className='flex items-center gap-2 p-3 bg-white rounded-lg shadow-md border border-gray-200'>
				<div className='relative group'>
					<label
						htmlFor='file'
						className='cursor-pointer block'></label>
				</div>
				<input
					required
					placeholder='Message...'
					type='text'
					value={message}
					onChange={handleMessageChange}
					className='flex-1 p-2 border-none outline-none bg-transparent text-gray-800 placeholder-gray-400 truncate w-full'
				/>
				<button
					onClick={handleSubmit}
					className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 664 663'
						className='w-6 h-6 text-gray-500 hover:text-gray-700'>
						<path
							strokeLinejoin='round'
							strokeLinecap='round'
							strokeWidth='33.67'
							stroke='currentColor'
							d='M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888'
						/>
					</svg>
				</button>
			</div>
		</div>
	);
};

export default MessageBox;
