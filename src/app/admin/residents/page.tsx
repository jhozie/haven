"use client";

import { useData } from "@/context/DataContext";
import { Plus, Search, Filter, Shield, Home } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AdminResidents() {
    const { users, addUser, charges, workOrders } = useData();
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Detailed View State
    const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);

    // Form State
    const [newName, setNewName] = useState("");
    const [newUnit, setNewUnit] = useState("");

    const filteredUsers = users.filter(u =>
        u.role === 'resident' &&
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.unit.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleCreateResident = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newUnit) return;

        addUser({
            name: newName,
            role: 'resident',
            unit: newUnit
        });

        setIsModalOpen(false);
        setNewName("");
        setNewUnit("");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Manage Residents</h1>
                    <p className="text-slate-400">View and add new residents to the estate portal.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-primary-gradient rounded-xl font-medium shadow-lg hover:shadow-amber-500/25 transition-all flex items-center text-white"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Resident
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or unit..."
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
                                <th className="px-6 py-4 font-medium">Resident Details</th>
                                <th className="px-6 py-4 font-medium">Unit</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-200">{user.name}</div>
                                                <div className="text-xs text-slate-500 truncate w-32 md:w-auto">ID: {user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-slate-300">
                                            <Home className="w-4 h-4 mr-2 text-amber-500" />
                                            {user.unit}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs px-2.5 py-1.5 rounded-full font-medium bg-blue-500/10 text-blue-400 flex items-center w-fit">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Resident
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-slate-400">No residents found matching your search.</div>
                    )}
                </div>
            </div>

            {/* Resident Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl scroller-hide"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/40 sticky top-0 z-10 backdrop-blur-md">
                            <h2 className="text-xl font-semibold">Resident Profile</h2>
                            <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Header Info */}
                            <div className="flex items-center gap-4">
                                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-16 h-16 rounded-full border-2 border-slate-700" />
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{selectedUser.name}</h3>
                                    <p className="text-slate-400">{selectedUser.unit} • ID: {selectedUser.id}</p>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5">
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Financial Overview</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-800/50 rounded-xl">
                                        <p className="text-slate-500 text-sm mb-1">Total Outstanding</p>
                                        <p className="text-2xl font-bold text-amber-500">
                                            ₦{charges.filter(c => c.residentId === selectedUser.id && c.status !== 'paid').reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-800/50 rounded-xl">
                                        <p className="text-slate-500 text-sm mb-1">Total Paid</p>
                                        <p className="text-2xl font-bold text-green-500">
                                            ₦{charges.filter(c => c.residentId === selectedUser.id && c.status === 'paid').reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Recent Charges List */}
                                <div className="mt-4 space-y-2">
                                    {charges.filter(c => c.residentId === selectedUser.id).map(charge => (
                                        <div key={charge.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 text-sm">
                                            <span className="text-slate-300">{charge.title}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold text-white">₦{charge.amount.toLocaleString()}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${charge.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                                                        charge.status === 'overdue' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-amber-500/10 text-amber-400'
                                                    }`}>
                                                    {charge.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {charges.filter(c => c.residentId === selectedUser.id).length === 0 && (
                                        <p className="text-sm text-slate-500 italic p-2">No charges recorded.</p>
                                    )}
                                </div>
                            </div>

                            {/* Work Orders Summary */}
                            <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5">
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Recent Maintenance</h4>
                                <div className="space-y-2">
                                    {workOrders.filter(w => w.residentId === selectedUser.id).map(order => (
                                        <div key={order.id} className="p-3 rounded-lg bg-white/5 text-sm space-y-2">
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium text-slate-200">{order.title}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${order.status === 'pending' ? 'bg-orange-500/10 text-orange-400' :
                                                        order.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400' :
                                                            'bg-green-500/10 text-green-400'
                                                    }`}>
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-xs line-clamp-1">{order.description}</p>
                                        </div>
                                    ))}
                                    {workOrders.filter(w => w.residentId === selectedUser.id).length === 0 && (
                                        <p className="text-sm text-slate-500 italic p-2">No maintenance requests.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Add Resident Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/40">
                            <h2 className="text-xl font-semibold">Add New Resident</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleCreateResident} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Full Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Adeola Okafor"
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Unit Number / Address</label>
                                <input
                                    type="text"
                                    value={newUnit}
                                    onChange={(e) => setNewUnit(e.target.value)}
                                    placeholder="e.g. Block B, Flat 12"
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors"
                                    required
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-primary-gradient rounded-xl font-medium text-white shadow-lg hover:shadow-amber-500/25 transition-all">
                                    Add Resident
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
