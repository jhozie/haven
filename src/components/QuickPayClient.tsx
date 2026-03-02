"use client";

import { useData } from "@/context/DataContext";
import { Building2, CreditCard, Lock, ArrowRight, XCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { usePaystackPayment } from 'react-paystack';
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuickPayClient() {
    const { users, charges, payCharge } = useData();
    const router = useRouter();

    // Search State
    const [unit, setUnit] = useState("");
    const [pin, setPin] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [foundUser, setFoundUser] = useState<any>(null);

    // Payment State
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const residentCharges = foundUser
        ? charges.filter(c => c.residentId === foundUser.id && c.status !== 'paid')
        : [];

    const totalDue = residentCharges.reduce((sum, c) => sum + c.amount, 0);

    // Paystack Configuration
    const paystackConfig = {
        reference: (new Date()).getTime().toString(),
        email: foundUser ? `${foundUser.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@havenprop.com` : "",
        amount: totalDue * 100,
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
    };

    const initializePayment = usePaystackPayment(paystackConfig);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsSearching(true);

        // Simulate search
        setTimeout(() => {
            const searchUnit = unit.trim().toLowerCase();
            const searchPin = pin.trim();

            const user = users.find(u =>
                u.unit.trim().toLowerCase() === searchUnit &&
                u.pin.trim() === searchPin
            );

            if (user) {
                setFoundUser(user);
            } else {
                setErrorMsg("No account found matching those details. Please check your Unit and PIN.");
            }
            setIsSearching(false);
        }, 1000);
    };

    const handlePayment = () => {
        if (totalDue <= 0) return;

        setIsProcessing(true);
        initializePayment({
            config: paystackConfig,
            onSuccess: (reference: any) => {
                // Mark all charges as paid
                residentCharges.forEach(c => payCharge(c.id));
                setShowSuccess(true);
                setIsProcessing(false);

                // Reset after 5 seconds to prevent leaving data on screen
                setTimeout(() => {
                    setFoundUser(null);
                    setUnit("");
                    setPin("");
                    setShowSuccess(false);
                    router.push("/");
                }, 5000);
            },
            onClose: () => {
                setIsProcessing(false);
            }
        } as any);
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center text-slate-500 hover:text-amber-500 transition-colors text-sm mb-6 group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Portal
                    </Link>
                    <div className="w-16 h-16 mx-auto rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                        <CreditCard className="w-8 h-8 text-amber-500" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Quick Pay</h1>
                    <p className="text-slate-400 mt-2">Pay your bills securely without logging in.</p>
                </div>

                <AnimatePresence mode="wait">
                    {!foundUser ? (
                        <motion.div
                            key="lookup"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card p-8 border border-white/5"
                        >
                            <form onSubmit={handleSearch} className="space-y-6">
                                {errorMsg && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                                        <XCircle className="w-4 h-4" />
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Your Unit Number</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            placeholder="e.g. Block A, Flat 1"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500/50 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">4-Digit PIN</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="password"
                                            maxLength={4}
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value)}
                                            placeholder="••••"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500/50 transition-colors tracking-widest text-lg"
                                            required
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center mt-2">
                                        Ask your admin if you don't know your PIN
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                    {isSearching ? "Searching..." : (
                                        <>Find My Bill <ArrowRight className="w-5 h-5 ml-2" /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="pay"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-8 border border-white/5 relative overflow-hidden"
                        >
                            {showSuccess && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 text-center"
                                >
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Payment Success!</h2>
                                    <p className="text-slate-400 mt-2">Thank you, {foundUser.name}. Your account has been updated.</p>
                                    <p className="text-xs text-slate-500 mt-8">Resetting portal in 5 seconds...</p>
                                </motion.div>
                            )}

                            <div className="flex items-center gap-4 mb-8">
                                <img src={foundUser.avatar} alt="" className="w-14 h-14 rounded-full border border-amber-500/20" />
                                <div>
                                    <h2 className="text-xl font-bold">{foundUser.name}</h2>
                                    <p className="text-sm text-slate-400">Unit: {foundUser.unit}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-6 mb-8 text-center italic">
                                <p className="text-slate-400 text-sm mb-1 uppercase tracking-widest font-semibold">Total Balance Due</p>
                                <div className="text-4xl font-black text-white">₦{totalDue.toLocaleString()}</div>
                            </div>

                            {totalDue > 0 ? (
                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-green-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                    {isProcessing ? "Lauching Paystack..." : (
                                        <>Pay Now With Paystack <ArrowRight className="w-5 h-5 ml-2" /></>
                                    )}
                                </button>
                            ) : (
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Your account is fully paid!
                                </div>
                            )}

                            <button
                                onClick={() => setFoundUser(null)}
                                className="w-full mt-4 py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                            >
                                Not you? Exit session
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-12 text-center text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium">
                    Secure Utility Payment Service • Powered by HavenProp
                </div>
            </motion.div>
        </main>
    );
}
