"use client";

import dynamic from "next/dynamic";

const ResidentClient = dynamic(() => import("@/components/ResidentClient"), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
    )
});

export default function ResidentDashboard() {
    return <ResidentClient />;
}
