import { useEffect, useState } from "react";

import type { MessageInitial, MessageUpdate } from "@/types/message.type";

import { inflate } from "@/lib/inflate";

import { env } from "@/env.mjs";

type Props = {
	handleInitial: (data: MessageInitial) => void;
	handleUpdate: (data: MessageUpdate) => void;
};

export const useSocket = ({ handleInitial, handleUpdate }: Props) => {
	const [connected, setConnected] = useState<boolean>(false);

	useEffect(() => {
		// Attempt to construct the SSE URL more robustly
		const liveSocketUrl = env.NEXT_PUBLIC_LIVE_SOCKET_URL;
		let sse: EventSource | undefined; // Define sse here to be accessible in cleanup

		if (!liveSocketUrl) {
			console.error("❌ ERROR: NEXT_PUBLIC_LIVE_SOCKET_URL is not defined in env!");
			return; // Stop execution if URL is missing
		}
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
			console.error("❌ ERROR: Failed to construct URL or EventSource:", e);
			console.error("Base URL used:", liveSocketUrl); // Log the problematic base URL
			return; // Stop execution on construction error
		}

		// Cleanup function
		return () => {
			console.log("Closing EventSource connection.");
			sse?.close(); // Use optional chaining as sse might not be initialized if try block failed
		};
	}, [handleInitial, handleUpdate]);

	return { connected };
};
