'use client'; // <-- Mark as Client Component

import { useState, useEffect } from 'react';
import { env } from "@/env.mjs"; // Keep env import
import { Round as RoundType } from "@/types/schedule.type"; // Keep type import
import Round from "@/components/schedule/Round"; // Keep Round component import

// --- Loading Component Placeholder ---
// Assume FullScheduleLoading is either imported from the page
// or defined elsewhere. Let's create a simple placeholder if needed:
const FullScheduleLoading = () => (
	<div className="mb-20 grid animate-pulse grid-cols-1 gap-8 md:grid-cols-2">
		{Array.from({ length: 6 }).map((_, i) => (
			<div key={`loading-round.${i}`} className="flex flex-col gap-1">
				<div className="h-12 w-full rounded-md bg-zinc-800" />
				<div className="grid grid-cols-3 gap-8 pt-1">
					{Array.from({ length: 3 }).map((_, j) => (
						<div key={`loading-day.${j}`} className="grid grid-rows-2 gap-2">
							<div className="h-12 w-full rounded-md bg-zinc-800" />
							<div className="h-12 w-full rounded-md bg-zinc-800" />
						</div>
					))}
				</div>
			</div>
		))}
	</div>
);

export default function FullSchedule() {
	const [schedule, setSchedule] = useState<RoundType[] | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const getSchedule = async () => {
			setIsLoading(true);
			setError(null); // Reset error on new fetch attempt
			try {
				// Fetch data client-side
				const scheduleReq = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/schedule`);

				// Check for HTTP errors
				if (!scheduleReq.ok) {
					throw new Error(`Failed to fetch schedule: ${scheduleReq.status} ${scheduleReq.statusText}`);
				}

				const scheduleData: RoundType[] = await scheduleReq.json();
				setSchedule(scheduleData);

			} catch (e: any) {
				console.error("Error fetching full schedule:", e);
				setError(e.message || "An unknown error occurred while fetching the schedule.");
			} finally {
				setIsLoading(false);
			}
		};

		getSchedule();
	}, []); // Empty dependency array means run once on mount

	// --- Conditional Rendering based on state ---

	if (isLoading) {
		return <FullScheduleLoading />; // Show loading skeleton
	}

	if (error) {
		return (
			<div className="flex h-44 flex-col items-center justify-center text-red-500">
				<p>Error loading schedule:</p>
				<p>{error}</p>
			</div>
		);
	}

	// Use the original "not found" message if fetch succeeded but returned null/empty
	if (!schedule || schedule.length === 0) {
		return (
			<div className="flex h-44 flex-col items-center justify-center">
				<p>Schedule not found</p>
			</div>
		);
	}

	// --- Render success state (logic moved inside component) ---
	// Find the next round based on the fetched data
    // Note: using .find() might be slightly more efficient if 'over' is reliable
	const next = schedule.find((round) => !round.over);

	return (
		<div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-2">
			{schedule.map((round, roundI) => (
				// Pass the name of the 'next' round found client-side
				<Round nextName={next?.name} round={round} key={`round.${roundI}`} />
			))}
		</div>
	);
}