"use client";

import { useData } from "@/context/DataContext";
import { Search, Filter, Wrench } from "lucide-react";
import { useState } from "react";

export default function AdminWorkOrders() {
    const { workOrders, users, updateWorkOrderStatus, addCharge } = useData();
    const [searchTerm, setSearchTerm] = useState("");

    // Billing Modal State
    const [selectedOrderForBill, setSelectedOrderForBill] = useState<typeof workOrders[0] | null>(null);
    const [billAmount, setBillAmount] = useState("");
    const [billDueDate, setBillDueDate] = useState("");

    const filteredOrders = workOrders.filter(w => {
        const resident = users.find(u => u.id === w.residentId);
        return w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resident?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.category.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Work Orders</h1>
                    <p className="text-slate-400">Manage and update resident maintenance requests.</p>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search requests..."
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

                <div className="p-0 divide-y divide-white/5">
                    {filteredOrders.map(order => {
                        const resident = users.find(u => u.id === order.residentId);
                        return (
                            <div key={order.id} className="p-6 hover:bg-white/5 transition-colors">
                                <div className="flex flex-col lg:flex-row gap-6 justify-between">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-slate-800 rounded-xl mt-1">
                                                <Wrench className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-medium text-slate-100">{order.title}</h3>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                                                        {order.category.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-400 text-sm">{order.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm text-slate-500 ml-16">
                                            <div>
                                                <span className="font-medium text-slate-300">{resident?.name}</span> (Unit {resident?.unit})
                                            </div>
                                            <div>
                                                Submitted: {new Date(order.dateSubmitted).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex sm:flex-col justify-end items-end gap-3 min-w-[200px] border-t border-white/5 lg:border-t-0 pt-4 lg:pt-0">
                                        <div className="text-sm font-medium text-slate-400 mb-1 hidden sm:block">Update Status</div>
                                        <select
                                            value={order.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value as any;
                                                updateWorkOrderStatus(order.id, newStatus);
                                                if (newStatus === 'resolved') {
                                                    setSelectedOrderForBill(order);
                                                }
                                            }}
                                            className={`w-full px-4 py-2.5 rounded-lg border font-medium text-sm appearance-none cursor-pointer transition-colors ${order.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20' :
                                                order.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' :
                                                    'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                                }`}
                                        >
                                            <option value="pending" className="bg-slate-900 text-white font-normal text-base">Pending</option>
                                            <option value="in-progress" className="bg-slate-900 text-white font-normal text-base">In Progress</option>
                                            <option value="resolved" className="bg-slate-900 text-white font-normal text-base">Resolved</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredOrders.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            <Wrench className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No work orders found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Bill for Resolved Work Order Modal */}
            {selectedOrderForBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md overflow-hidden border border-white/10 shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/40">
                            <h2 className="text-xl font-semibold">Generate Invoice</h2>
                            {/* We don't want a close button here to enforce they create a bill, or we can let them skip */}
                            <button onClick={() => setSelectedOrderForBill(null)} className="text-slate-400 hover:text-white transition-colors">Skip</button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!billAmount || !billDueDate) return;

                            addCharge({
                                title: `Maintenance: ${selectedOrderForBill.title}`,
                                amount: parseFloat(billAmount),
                                dueDate: billDueDate,
                                status: 'pending',
                                residentId: selectedOrderForBill.residentId
                            });

                            setSelectedOrderForBill(null);
                            setBillAmount("");
                            setBillDueDate("");
                        }} className="p-6 space-y-4">

                            <p className="text-sm text-slate-400 mb-4">
                                Work order marked as resolved. Enter details below to create an assessment charge for resident: <span className="text-white font-medium">{users.find(u => u.id === selectedOrderForBill.residentId)?.name}</span>
                            </p>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Amount (₦)</label>
                                <input
                                    type="number"
                                    value={billAmount}
                                    onChange={(e) => setBillAmount(e.target.value)}
                                    placeholder="e.g. 15000"
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
                                    value={billDueDate}
                                    onChange={(e) => setBillDueDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                    required
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setSelectedOrderForBill(null)} className="px-5 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-colors">
                                    Skip Billing
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-primary-gradient rounded-xl font-medium text-white shadow-lg hover:shadow-amber-500/25 transition-all">
                                    Create Invoice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
