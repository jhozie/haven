"use client";

import { useData } from "@/context/DataContext";
import { CreditCard, Wrench, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { usePaystackPayment } from 'react-paystack';

export default function ResidentClient() {
    const { currentUser, charges, workOrders, payCharge, addWorkOrder } = useData();
    const [payingCharge, setPayingCharge] = useState<string | null>(null);
    const [isPayingAll, setIsPayingAll] = useState(false);
    const [paymentSuccessPopup, setPaymentSuccessPopup] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<typeof workOrders[0] | null>(null);

    // Form State
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newCategory, setNewCategory] = useState<'plumbing' | 'electrical' | 'general' | 'hvac'>('general');

    if (!currentUser) return null;

    const myCharges = charges.filter(c => c.residentId === currentUser.id);
    const myWorkOrders = workOrders.filter(w => w.residentId === currentUser.id);

    const totalDue = myCharges
        .filter(c => c.status !== 'paid')
        .reduce((sum, charge) => sum + charge.amount, 0);

    // Paystack Hook Setup
    const paystackConfig = {
        reference: (new Date()).getTime().toString(),
        email: `${currentUser.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@havenprop.com`,
        amount: totalDue * 100, // Default to total due
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
    };

    const initializePayment = usePaystackPayment(paystackConfig);

    const showSuccessPopup = () => {
        setPaymentSuccessPopup(true);
        setTimeout(() => setPaymentSuccessPopup(false), 4000);
    };

    // Single Charge Payment Handlers
    const handlePay = (chargeId: string, amount: number) => {
        setPayingCharge(chargeId);

        // Override the default config for single payments
        initializePayment({
            config: {
                ...paystackConfig,
                amount: amount * 100, // Override amount
                reference: (new Date()).getTime().toString(), // Force new reference
            },
            onSuccess: () => {
                payCharge(chargeId);
                setPayingCharge(null);
                showSuccessPopup();
            },
            onClose: () => {
                setPayingCharge(null);
            }
        } as any);
    };

    const handlePayAll = () => {
        if (totalDue <= 0) return;
        setIsPayingAll(true);
        initializePayment({
            config: {
                ...paystackConfig,
                reference: (new Date()).getTime().toString(),
            },
            onSuccess: (reference: any) => {
                const unpaidCharges = myCharges.filter(c => c.status !== 'paid');
                unpaidCharges.forEach(charge => payCharge(charge.id));
                setIsPayingAll(false);
                showSuccessPopup();
            },
            onClose: () => {
                setIsPayingAll(false);
            }
        } as any);
    };

    const handleCreateRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !newDescription || !newCategory) return;

        addWorkOrder({
            title: newTitle,
            description: newDescription,
            category: newCategory,
            residentId: currentUser.id
        });

        setIsModalOpen(false);
        setNewTitle("");
        setNewDescription("");
        setNewCategory("general");
    };

    return (
        <div className="space-y-8 relative">

            {/* Payment Success Toast */}
            <AnimatePresence>
                {paymentSuccessPopup && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 p-4 bg-slate-800 border border-green-500/30 rounded-xl shadow-2xl flex items-center gap-3"
                    >
                        <div className="p-2 bg-green-500/20 rounded-full">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Payment Successful</p>
                            <p className="text-xs text-slate-400">Your account balance has been updated.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Hello, {currentUser.name.split(' ')[0]}</h1>
                <p className="text-slate-400">Unit {currentUser.unit}</p>
            </div>

            {/* Billing Section */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Current Balance</h2>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-2xl p-6 shadow-2xl"
                >
                    {/* Premium Background for Balance Card */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 z-0"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 z-0"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <p className="text-slate-400 font-medium mb-1">Total Due</p>
                            <div className="text-4xl font-bold text-white tracking-tight">₦{totalDue.toLocaleString()}</div>
                        </div>

                        {totalDue > 0 ? (
                            <button
                                onClick={handlePayAll}
                                disabled={isPayingAll}
                                className="w-full md:w-auto px-8 py-3 bg-primary-gradient rounded-xl font-medium shadow-lg hover:shadow-amber-500/25 transition-all text-white flex items-center justify-center disabled:opacity-50"
                            >
                                <CreditCard className="w-5 h-5 mr-2" />
                                {isPayingAll ? 'Processing...' : 'Pay Full Balance'}
                            </button>
                        ) : (
                            <div className="flex items-center text-green-400 font-medium bg-green-500/10 px-6 py-3 rounded-xl">
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                All accounts current
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="mt-6 space-y-3">
                    {myCharges.map(charge => (
                        <motion.div
                            key={charge.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${charge.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                                    charge.status === 'overdue' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                    {charge.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-100">{charge.title}</p>
                                    <p className="text-sm text-slate-400">Due {new Date(charge.dueDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                                <span className="font-semibold text-lg">₦{charge.amount.toLocaleString()}</span>
                                {charge.status !== 'paid' && (
                                    <button
                                        onClick={() => handlePay(charge.id, charge.amount)}
                                        disabled={payingCharge === charge.id}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {payingCharge === charge.id ? 'Processing...' : 'Pay'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Maintenance Section */}
            <section className="pt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Maintenance Requests</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center transition-colors"
                    >
                        <Wrench className="w-4 h-4 mr-2" />
                        New Request
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myWorkOrders.map(order => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setSelectedOrder(order)}
                            className="glass-card p-5 group hover:border-amber-500/30 cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-medium text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1">{order.title}</h3>
                                <span className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ml-2 ${order.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                    order.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        'bg-green-500/10 text-green-400 border-green-500/20'
                                    }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-2 mb-4">{order.description}</p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Submitted: {new Date(order.dateSubmitted).toLocaleDateString()}</span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
                            </div>
                        </motion.div>
                    ))}
                    {myWorkOrders.length === 0 && (
                        <div className="col-span-full p-8 text-center border border-dashed border-white/10 rounded-xl text-slate-500">
                            No recent maintenance requests.
                        </div>
                    )}
                </div>
            </section>

            {/* Create Work Order Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/40">
                            <h2 className="text-xl font-semibold">New Maintenance Request</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Request Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g., Leaky faucet in master bath"
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Category</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value as any)}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                                >
                                    <option value="general">General Maintenance</option>
                                    <option value="plumbing">Plumbing</option>
                                    <option value="electrical">Electrical</option>
                                    <option value="hvac">HVAC / Air Conditioning</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Description</label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Please provide details about the issue..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                                    required
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-primary-gradient rounded-xl font-medium text-white shadow-lg hover:shadow-amber-500/25 transition-all">
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Work Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/40">
                            <h2 className="text-xl font-semibold">Request Details</h2>
                            <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-white mb-2">{selectedOrder.title}</h3>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ${selectedOrder.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                        selectedOrder.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-green-500/10 text-green-400 border-green-500/20'
                                        }`}>
                                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                    </span>
                                    <span className="text-sm text-slate-400 capitalize">{selectedOrder.category} Issue</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Description</h4>
                                <p className="text-slate-200 text-sm leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                    {selectedOrder.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div>
                                    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Submitted On</h4>
                                    <p className="text-sm text-slate-200">{new Date(selectedOrder.dateSubmitted).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Reference ID</h4>
                                    <p className="text-sm text-slate-200 uppercase">{selectedOrder.id}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 pt-0 flex justify-end">
                            <button onClick={() => setSelectedOrder(null)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium text-white transition-colors">
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
