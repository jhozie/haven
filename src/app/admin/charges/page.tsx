"use client";

import { useData } from "@/context/DataContext";
import { Plus, Search, Filter, UsersRound } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AdminCharges() {
    const { charges, users, addCharge } = useData();
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    // Form State (Single Charge)
    const [newTitle, setNewTitle] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [newResidentId, setNewResidentId] = useState("");
    const [newDueDate, setNewDueDate] = useState("");

    // Form State (Bulk Charge)
    const [bulkTitle, setBulkTitle] = useState("");
    const [bulkAmount, setBulkAmount] = useState("");
    const [bulkDueDate, setBulkDueDate] = useState("");

    const filteredCharges = charges.filter(c => {
        const resident = users.find(u => u.id === c.residentId);
        return c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resident?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleCreateCharge = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !newAmount || !newResidentId || !newDueDate) return;

        addCharge({
            title: newTitle,
            amount: parseFloat(newAmount),
            residentId: newResidentId,
            dueDate: newDueDate,
            status: 'pending'
        });

        setIsModalOpen(false);
        setNewTitle("");
        setNewAmount("");
        setNewResidentId("");
        setNewDueDate("");
    };

    const residents = users.filter(u => u.role === 'resident');

    const handleCreateBulkCharge = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bulkTitle || !bulkAmount || !bulkDueDate) return;

        // Loop through all residents and assign the charge
        residents.forEach(resident => {
            addCharge({
                title: bulkTitle,
                amount: parseFloat(bulkAmount),
                residentId: resident.id,
                dueDate: bulkDueDate,
                status: 'pending'
            });
        });

        setIsBulkModalOpen(false);
        setBulkTitle("");
        setBulkAmount("");
        setBulkDueDate("");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Manage Charges</h1>
                    <p className="text-slate-400">View and create assessments for residents.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-all flex items-center text-white border border-white/5"
                    >
                        <UsersRound className="w-5 h-5 mr-2 text-amber-500" />
                        Bulk Invoice
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-primary-gradient rounded-xl font-medium shadow-lg hover:shadow-amber-500/25 transition-all flex items-center text-white"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Single Charge
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by resident or charge title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 text-sm transition-colors"
                        />
                    </div>
                    <button className="flex items-center px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-lg text-sm transition-colors">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/40 text-slate-400 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-medium">Charge Details</th>
                                <th className="px-6 py-4 font-medium">Resident</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Due Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCharges.map((charge) => {
                                const resident = users.find(u => u.id === charge.residentId);
                                return (
                                    <tr key={charge.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200">{charge.title}</td>
                                        <td className="px-6 py-4 text-slate-400">
                                            <div>{resident?.name}</div>
                                            <div className="text-xs">Unit: {resident?.unit}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-200">₦{charge.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-slate-400">{new Date(charge.dueDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2.5 py-1.5 rounded-full font-medium ${charge.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                                                charge.status === 'overdue' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
                                                }`}>
                                                {charge.status.charAt(0).toUpperCase() + charge.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredCharges.length === 0 && (
                        <div className="p-8 text-center text-slate-400">No charges found matching your search.</div>
                    )}
                </div>
            </div>

            {/* Create Charge Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/40">
                            <h2 className="text-xl font-semibold">New Assessment Charge</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleCreateCharge} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Charge Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g. Broken Window Repair"
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Amount (₦)</label>
                                    <input
                                        type="number"
                                        value={newAmount}
                                        onChange={(e) => setNewAmount(e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Due Date</label>
                                    <input
                                        type="date"
                                        value={newDueDate}
                                        onChange={(e) => setNewDueDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Assign To Resident</label>
                                <select
                                    value={newResidentId}
                                    onChange={(e) => setNewResidentId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                                    required
                                >
                                    <option value="" disabled>Select a resident...</option>
                                    {residents.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} (Unit {r.unit})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-primary-gradient rounded-xl font-medium text-white shadow-lg hover:shadow-amber-500/25 transition-all">
                                    Create Charge
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Create Bulk Charge Modal */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/40">
                            <h2 className="text-xl font-semibold">Generate Monthly Invoices</h2>
                            <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleCreateBulkCharge} className="p-6 space-y-4">

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                                <p className="text-sm text-amber-200/80">
                                    <strong className="text-amber-400">Note:</strong> This will instantly create an outstanding charge for <strong>all {residents.length} residents</strong> currently mapped in the system.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Charge Title (e.g. March Service Charge)</label>
                                <input
                                    type="text"
                                    value={bulkTitle}
                                    onChange={(e) => setBulkTitle(e.target.value)}
                                    placeholder="e.g. March 2026 Service Charge"
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Amount Per Resident (₦)</label>
                                    <input
                                        type="number"
                                        value={bulkAmount}
                                        onChange={(e) => setBulkAmount(e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Due Date</label>
                                    <input
                                        type="date"
                                        value={bulkDueDate}
                                        onChange={(e) => setBulkDueDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-primary-gradient rounded-xl font-medium text-white shadow-lg hover:shadow-amber-500/25 transition-all">
                                    Generate Bills
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
