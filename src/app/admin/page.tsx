"use client";

import { useData } from "@/context/DataContext";
import { Wallet, AlertCircle, Users, Activity, Mail, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function AdminDashboard() {
    const { charges, workOrders, users } = useData();

    const totalOutstanding = charges
        .filter(c => c.status !== 'paid')
        .reduce((sum, charge) => sum + charge.amount, 0);

    const pendingWorkOrdersCount = workOrders.filter(w => w.status === 'pending').length;
    const totalResidents = users.filter(u => u.role === 'resident').length;

    // Email Simulation State
    const [isSendingEmails, setIsSendingEmails] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);

    const handleSendEmails = () => {
        setIsSendingEmails(true);
        // Simulate network delay for sending batch emails
        setTimeout(() => {
            setIsSendingEmails(false);
            setEmailSuccess(true);

            // Hide success message after 3 seconds
            setTimeout(() => {
                setEmailSuccess(false);
            }, 3000);
        }, 2000);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
                    <p className="text-slate-400">Welcome back. Here's what's happening at HavenProp today.</p>
                </div>

                <button
                    onClick={handleSendEmails}
                    disabled={isSendingEmails || emailSuccess}
                    className={`px-5 py-2.5 rounded-xl font-medium shadow-lg transition-all flex items-center border ${emailSuccess
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border-white/5 hover:border-white/10'
                        } disabled:opacity-75`}
                >
                    {emailSuccess ? (
                        <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Emails Sent Successfully!
                        </>
                    ) : (
                        <>
                            <Mail className="w-5 h-5 mr-2 text-amber-500" />
                            {isSendingEmails ? 'Sending Reminders...' : 'Send Payment Reminders'}
                        </>
                    )}
                </button>

                {/* Optional Floating Success Toast */}
                <AnimatePresence>
                    {emailSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-14 right-0 mt-2 p-4 bg-slate-800 border border-green-500/30 rounded-xl shadow-2xl flex items-center gap-3 z-50"
                        >
                            <div className="p-2 bg-green-500/20 rounded-full">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Reminders Dispatched</p>
                                <p className="text-xs text-slate-400">Emails sent to residents with outstanding balances.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Total Outstanding</p>
                            <h2 className="text-3xl font-bold text-white">₦{totalOutstanding.toLocaleString()}</h2>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-xl relative">
                            <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-xl"></div>
                            <Wallet className="w-6 h-6 text-amber-500 relative z-10" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-400">
                        <Activity className="w-4 h-4 mr-1" />
                        <span>+2.4% from last month</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Pending Requests</p>
                            <h2 className="text-3xl font-bold text-white">{pendingWorkOrdersCount}</h2>
                        </div>
                        <div className="p-3 bg-orange-500/10 rounded-xl relative">
                            <div className="absolute inset-0 bg-orange-500/20 blur-md rounded-xl"></div>
                            <AlertCircle className="w-6 h-6 text-orange-500 relative z-10" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-400">
                        Requires immediate attention
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Total Residents</p>
                            <h2 className="text-3xl font-bold text-white">{totalResidents}</h2>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-xl"></div>
                            <Users className="w-6 h-6 text-blue-400 relative z-10" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-400">
                        Across all properties
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Work Orders snippet */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/20">
                        <h3 className="font-semibold text-lg">Recent Work Orders</h3>
                        <button className="text-sm text-amber-500 hover:text-amber-400 transition-colors">View All</button>
                    </div>
                    <div className="p-0 divide-y divide-white/5">
                        {workOrders.slice(0, 3).map((order) => {
                            const resident = users.find(u => u.id === order.residentId);
                            return (
                                <div key={order.id} className="p-6 hover:bg-white/5 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-slate-100 group-hover:text-amber-400 transition-colors">{order.title}</h4>
                                        <span className={`text-xs px-2.5 py-1 rounded-full border ${order.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                            order.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-green-500/10 text-green-400 border-green-500/20'
                                            }`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-1 mb-3">{order.description}</p>
                                    <div className="flex items-center text-xs text-slate-500">
                                        <span>{resident?.name} (Unit {resident?.unit})</span>
                                        <span className="mx-2">•</span>
                                        <span>{new Date(order.dateSubmitted).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {workOrders.length === 0 && (
                            <div className="p-8 text-center text-slate-400">No active work orders.</div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Charges snippet */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/20">
                        <h3 className="font-semibold text-lg">Recent Charges</h3>
                        <button className="text-sm text-amber-500 hover:text-amber-400 transition-colors">Manage</button>
                    </div>
                    <div className="p-0 divide-y divide-white/5">
                        {charges.slice(0, 4).map((charge) => {
                            const resident = users.find(u => u.id === charge.residentId);
                            return (
                                <div key={charge.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                    <div>
                                        <h4 className="font-medium text-slate-100 group-hover:text-amber-400 transition-colors">{charge.title}</h4>
                                        <div className="flex items-center text-xs text-slate-500 mt-1">
                                            <span>{resident?.name}</span>
                                            <span className="mx-2">•</span>
                                            <span>Due: {new Date(charge.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-slate-200">₦{charge.amount.toLocaleString()}</div>
                                        <span className={`text-[10px] uppercase tracking-wider font-semibold mt-1 inline-block ${charge.status === 'paid' ? 'text-green-500' :
                                            charge.status === 'overdue' ? 'text-red-400' : 'text-orange-400'
                                            }`}>
                                            {charge.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
