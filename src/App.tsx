import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./components/loginCard.js";
import { ChatLayout } from "./components/chat.js";
const apiUrl = import.meta.env.VITE_API_URL;

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<LoginPage />} />
				<Route path='/chat' element={<ChatLayout />} />
			</Routes>
		</BrowserRouter>
	);
}
