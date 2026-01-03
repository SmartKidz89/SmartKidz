
"use client";

import { useEffect } from "react";
import { CandyButton } from "@/components/ui/CandyButton";

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
            <div className="text-6xl">🙈</div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800">Oops! Something went wrong</h2>
                <p className="font-bold text-slate-500 max-w-md mx-auto">
                    Don't worry, even superheroes have bad days. Let's try that again.
                </p>
            </div>
            <div className="flex gap-4">
                <CandyButton variant="primary" onClick={() => reset()}>
                    Try Again
                </CandyButton>
                <CandyButton variant="neutral" onClick={() => window.location.href = '/app'}>
                    Go Home
                </CandyButton>
            </div>
        </div>
    );
}
