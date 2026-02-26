"use client";

import { useData } from "@/context/DataContext";
import { LogOut, Building2, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function TopNav() {
    const { currentUser, logout } = useData();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    if (!currentUser) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
            <div className="flex h-16 items-center px-4 md:px-6">
                <motion.div
                    className="flex items-center gap-2 font-semibold text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span>HavenProp</span>
                </motion.div>

                <div className="ml-auto flex items-center space-x-4">
                    <button className="p-2 rounded-full hover:bg-white/5 transition-colors relative">
                        <Bell className="w-5 h-5 text-slate-400" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
                    </button>

                    <div className="h-8 w-px bg-white/10 mx-2" />

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-medium leading-none">{currentUser.name}</span>
                            <span className="text-xs text-slate-400">Unit: {currentUser.unit}</span>
                        </div>

                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                        </div>

                        <button
                            onClick={handleLogout}
                            className="ml-2 p-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-slate-400"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
