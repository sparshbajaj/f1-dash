'use client'; // <-- Mark as Client Component

import { useState, useEffect } from 'react';
import moment, { utc } from "moment"; // Keep moment import (ensure it's installed)

import { env } from "@/env.mjs"; // Keep env import
import { Round as RoundType, Session } from "@/types/schedule.type"; // Keep type imports (assuming Session is also exported or defined in schedule.type)
import Countdown from "@/components/schedule/Countdown"; // Keep Countdown import
import Round from "@/components/schedule/Round"; // Keep Round import

// --- Loading Component Placeholder ---
// Assuming NextRoundLoading is available (imported from page or defined elsewhere)
const NextRoundLoading = () => (
	<div className="grid h-44 animate-pulse grid-cols-1 gap-8 sm:grid-cols-2">
		<div className="flex flex-col gap-4">
			<div className="h-1/2 w-3/4 rounded-md bg-zinc-800" />
			<div className="h-1/2 w-3/4 rounded-md bg-zinc-800" />
		</div>
		<div className="flex flex-col gap-1"> {/* Placeholder for Round loading */}
			<div className="h-12 w-full rounded-md bg-zinc-800" />
			<div className="grid grid-cols-3 gap-8 pt-1">
				{[1, 2, 3].map(i => (
					<div key={i} className="grid grid-rows-2 gap-2">
						<div className="h-12 w-full rounded-md bg-zinc-800" />
						<div className="h-12 w-full rounded-md bg-zinc-800" />
					</div>
				))}
			</div>
		</div>
	</div>
);


export default function NextRound() {
	const [next, setNext] = useState<RoundType | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// State specifically for calculated sessions to simplify render logic
	const [nextSession, setNextSession] = useState<Session | null>(null);
	const [nextRace, setNextRace] = useState<Session | null>(null);

	useEffect(() => {
		const getNext = async () => {
			setIsLoading(true);
			setError(null);
			setNextSession(null); // Reset derived state
			setNextRace(null);    // Reset derived state

			try {
				// Fetch data client-side
				const nextReq = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/schedule/next`);

				if (!nextReq.ok) {
					throw new Error(`Failed to fetch next round: ${nextReq.status} ${nextReq.statusText}`);
				}

				const nextData: RoundType = await nextReq.json();
				setNext(nextData);

				// --- Calculate derived state after data is fetched ---
				if (nextData && nextData.sessions) {
                    // Using find is slightly cleaner than filter()[0]
					const session = nextData.sessions.find((s) => utc(s.start) > utc() && s.kind.toLowerCase() !== "race");
					const race = nextData.sessions.find((s) => s.kind.toLowerCase() === "race");
					setNextSession(session || null); // Set to null if find returns undefined
					setNextRace(race || null);     // Set to null if find returns undefined
				}
				// --- End calculation ---

			} catch (e: any) {
				console.error("Error fetching next round:", e);
				setError(e.message || "An unknown error occurred while fetching the next round.");
			} finally {
				setIsLoading(false);
			}
		};

		getNext();
	}, []); // Empty dependency array means run once on mount

	// --- Conditional Rendering based on state ---

	if (isLoading) {
		return <NextRoundLoading />;
	}

	if (error) {
		return (
			<div className="flex h-44 flex-col items-center justify-center text-red-500">
				<p>Error loading next round:</p>
				<p>{error}</p>
			</div>
		);
	}

	// Use original message if fetch succeeded but returned no data
	if (!next) {
		return (
			<div className="flex h-44 flex-col items-center justify-center">
				<p>No upcoming weekend found</p>
			</div>
		);
	}

	// --- Render success state using calculated session state ---
	return (
		<div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
			{/* Countdown Section */}
			{(nextSession || nextRace) ? ( // Check if *either* calculated session exists
				<div className="flex flex-col gap-4">
					{nextSession && <Countdown next={nextSession} type="other" />}
					{nextRace && <Countdown next={nextRace} type="race" />}
				</div>
			) : (
				<div className="flex h-full flex-col items-center justify-center"> {/* Added h-full */}
					<p>No upcoming sessions found for this weekend.</p>
				</div>
			)}

			{/* Round Details Section (always show if 'next' data exists) */}
			<Round round={next} />
		</div>
	);
}