"use client";

import { useData } from "@/context/DataContext";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Clock,
    AlertCircle,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign
} from "lucide-react";
import { motion } from "framer-motion";

export default function ReportsPage() {
    const { charges, workOrders, users } = useData();

    // Financial Analytics
    const totalRevenue = charges
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0);

    const totalOutstanding = charges
        .filter(c => c.status !== 'paid')
        .reduce((sum, c) => sum + c.amount, 0);

    const collectionRate = charges.length > 0
        ? Math.round((charges.filter(c => c.status === 'paid').length / charges.length) * 100)
        : 0;

    // Maintenance Analytics
    const maintenanceByCategory = {
        plumbing: workOrders.filter(w => w.category === 'plumbing').length,
        electrical: workOrders.filter(w => w.category === 'electrical').length,
        hvac: workOrders.filter(w => w.category === 'hvac').length,
        general: workOrders.filter(w => w.category === 'general').length,
    };

    const resolutionRate = workOrders.length > 0
        ? Math.round((workOrders.filter(w => w.status === 'resolved').length / workOrders.length) * 100)
        : 0;

    // Resident Analytics
    const topDebtors = users
        .filter(u => u.role === 'resident')
        .map(u => {
            const debt = charges
                .filter(c => c.residentId === u.id && c.status !== 'paid')
                .reduce((sum, c) => sum + c.amount, 0);
            return { ...u, debt };
        })
        .filter(u => u.debt > 0)
        .sort((a, b) => b.debt - a.debt)
        .slice(0, 5);

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-amber-500" />
                    Financial & Maintenance Analytics
                </h1>
                <p className="text-slate-400 mt-2">Comprehensive overview of HavenProp performance metrics.</p>
            </div>

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-400" />
                        </div>
                        <span className="text-xs font-medium text-green-400 flex items-center bg-green-500/10 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            +12%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Total Revenue (Paid)</p>
                    <h2 className="text-3xl font-bold text-white">₦{totalRevenue.toLocaleString()}</h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-amber-500" />
                        </div>
                        <span className="text-xs font-medium text-amber-400 flex items-center bg-amber-500/10 px-2 py-1 rounded-full">
                            {collectionRate}%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Collection Rate</p>
                    <h2 className="text-3xl font-bold text-white">Efficiency</h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <CheckCircle2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-blue-400 flex items-center bg-blue-500/10 px-2 py-1 rounded-full">
                            {resolutionRate}%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Work Order Success</p>
                    <h2 className="text-3xl font-bold text-white">Reliability</h2>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Maintenance Breakdown */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card overflow-hidden"
                >
                    <div className="p-6 border-b border-white/5 bg-slate-800/20">
                        <h3 className="font-semibold text-lg">Work Orders by Category</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {Object.entries(maintenanceByCategory).map(([cat, count]) => {
                            const percentage = workOrders.length > 0 ? (count / workOrders.length) * 100 : 0;
                            return (
                                <div key={cat} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="capitalize text-slate-300 font-medium">{cat}</span>
                                        <span className="text-slate-400">{count} issues ({Math.round(percentage)}%)</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            className={`h-full ${cat === 'plumbing' ? 'bg-blue-500' :
                                                    cat === 'electrical' ? 'bg-amber-500' :
                                                        cat === 'hvac' ? 'bg-orange-500' : 'bg-slate-500'
                                                }`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Top Debtors */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card overflow-hidden"
                >
                    <div className="p-6 border-b border-white/5 bg-slate-800/20 flex justify-between items-center">
                        <h3 className="font-semibold text-lg">Top Outstanding Balances</h3>
                        <span className="text-xs text-red-400 font-medium animate-pulse flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Action Required
                        </span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {topDebtors.map((debtor) => (
                            <div key={debtor.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <img src={debtor.avatar} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                                    <div>
                                        <p className="font-medium text-slate-100">{debtor.name}</p>
                                        <p className="text-xs text-slate-500">Unit {debtor.unit}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-400">₦{debtor.debt.toLocaleString()}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter font-semibold">Overdue</p>
                                </div>
                            </div>
                        ))}
                        {topDebtors.length === 0 && (
                            <div className="p-12 text-center text-slate-500 italic">No outstanding balances found.</div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Financial Overview Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden"
            >
                <div className="p-6 border-b border-white/5 bg-slate-800/20">
                    <h3 className="font-semibold text-lg">Consolidated Financial Summary</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                <th className="p-4 border-b border-white/5">Category</th>
                                <th className="p-4 border-b border-white/5">Amount</th>
                                <th className="p-4 border-b border-white/5">Status</th>
                                <th className="p-4 border-b border-white/5">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-sm text-slate-200 font-medium">Verified Collections</td>
                                <td className="p-4 text-sm font-bold text-green-400">₦{totalRevenue.toLocaleString()}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-md">PAID</span>
                                </td>
                                <td className="p-4 text-sm text-slate-400">{collectionRate}%</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-sm text-slate-200 font-medium">Outstanding Balances</td>
                                <td className="p-4 text-sm font-bold text-amber-400">₦{totalOutstanding.toLocaleString()}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-md">PENDING</span>
                                </td>
                                <td className="p-4 text-sm text-slate-400">{100 - collectionRate}%</td>
                            </tr>
                            <tr className="bg-white/5 font-bold">
                                <td className="p-4 text-white">Total Expected</td>
                                <td className="p-4 text-white font-black text-lg">₦{(totalRevenue + totalOutstanding).toLocaleString()}</td>
                                <td className="p-4" colSpan={2}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
