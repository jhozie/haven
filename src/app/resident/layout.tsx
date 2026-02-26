"use client";

import { TopNav } from "@/components/TopNav";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ResidentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser } = useData();
    const router = useRouter();

    useEffect(() => {
        if (!currentUser) {
            router.push("/");
        } else if (currentUser.role !== 'resident') {
            router.push("/admin");
        }
    }, [currentUser, router]);

    if (!currentUser || currentUser.role !== 'resident') {
        return null; // Don't flash content while redirecting
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <TopNav />
            {/* Mobile-first bottom navigation simulation can go here later if needed */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900/50 pb-20 md:pb-0">
                <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
