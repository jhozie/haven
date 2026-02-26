"use client";

import { TopNav } from "@/components/TopNav";
import { useData } from "@/context/DataContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Receipt, Wrench, Users } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser } = useData();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!currentUser) {
            router.push("/");
        } else if (currentUser.role !== 'admin') {
            router.push("/resident");
        }
    }, [currentUser, router]);

    if (!currentUser || currentUser.role !== 'admin') {
        return null; // Don't flash content while redirecting
    }

    const navLinks = [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/residents", label: "Residents", icon: Users },
        { href: "/admin/charges", label: "Charges", icon: Receipt },
        { href: "/admin/work-orders", label: "Work Orders", icon: Wrench },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <TopNav />

            {/* Admin Subnav */}
            <div className="bg-slate-900 border-b border-white/5 sticky top-16 z-40">
                <div className="container mx-auto px-4 max-w-6xl flex items-center space-x-1 overflow-x-auto scroller-hide">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center space-x-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive
                                    ? "border-amber-500 text-amber-500"
                                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-white/10"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900/50">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
