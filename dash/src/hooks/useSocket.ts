import { useEffect, useState } from "react";

import type { MessageInitial, MessageUpdate } from "@/types/message.type";

import { inflate } from "@/lib/inflate";

// import { env } from "@/env.mjs"; // Comment out env import for testing

type Props = {
	handleInitial: (data: MessageInitial) => void;
	handleUpdate: (data: MessageUpdate) => void;
};

export const useSocket = ({ handleInitial, handleUpdate }: Props) => {
	const [connected, setConnected] = useState<boolean>(false);

	useEffect(() => {
		// Hardcode the Live Socket URL for testing
		const liveSocketUrl = "http://192.168.0.247:4000"; // HARDCODED FOR TESTING
		let sse: EventSource | undefined; // Define sse here to be accessible in cleanup

		console.log(`Using hardcoded liveSocketUrl: ${liveSocketUrl}`); // Log the hardcoded value

		try {
			const sseUrl = new URL('/api/sse', liveSocketUrl).toString();
			console.log("Attempting to connect EventSource to:", sseUrl); // Log the URL being used
			sse = new EventSource(sseUrl);

			sse.onerror = () => {
				console.error("EventSource connection error occurred.");
				setConnected(false);
				sse?.close(); // Close on error
			};
			sse.onopen = () => {
				console.log("EventSource connection opened.");
				setConnected(true);
			};

			sse.addEventListener("initial", (message) => {
				console.log("Received initial message.");
				const decompressed = inflate<MessageInitial>(message.data);
				handleInitial(decompressed);
			});

			sse.addEventListener("update", (message) => {
				// console.log("Received update message."); // Can be noisy, uncomment if needed
				const decompressed = inflate<MessageUpdate>(message.data);
				handleUpdate(decompressed);
			});

		} catch (e) {
			console.error("❌ ERROR: Failed to construct URL or EventSource with hardcoded URL:", e);
			// console.error("Base URL used:", liveSocketUrl); // No longer needed as it's hardcoded
			return; // Stop execution on construction error
		}

		// Cleanup function
		return () => {
			console.log("Closing EventSource connection.");
			sse?.close(); // Use optional chaining as sse might not be initialized if try block failed
		};
	}, [handleInitial, handleUpdate]); // Add dependencies to useEffect

	return { connected };
};
