"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Type Definitions
export type Role = 'admin' | 'resident';

export interface User {
    id: string;
    name: string;
    role: Role;
    unit: string;
    avatar: string;
    pin: string;
}

export interface Charge {
    id: string;
    title: string;
    amount: number;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    residentId: string;
}

export interface WorkOrder {
    id: string;
    title: string;
    description: string;
    category: 'plumbing' | 'electrical' | 'general' | 'hvac';
    status: 'pending' | 'in-progress' | 'resolved';
    residentId: string;
    dateSubmitted: string;
}

// Mock Data
const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Yewande Balogun', role: 'admin', unit: 'Estate Office', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Yewande', pin: '0000' },
    { id: 'u2', name: 'Chinedu Eze', role: 'resident', unit: 'Block A, Flat 1', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Chinedu', pin: '1234' },
    { id: 'u3', name: 'Amina Bello', role: 'resident', unit: 'Block C, Flat 4', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Amina', pin: '4321' },
    { id: 'u4', name: 'Fatima Johnson', role: 'resident', unit: 'Block B, Flat 2', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Fatima', pin: '8888' },
    { id: 'u5', name: 'Oluwaseun Adebayo', role: 'resident', unit: 'Block D, Flat 5', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Oluwaseun', pin: '5566' },
    { id: 'u6', name: 'Ngozi Okorie', role: 'resident', unit: 'Block A, Flat 3', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ngozi', pin: '9999' },
    { id: 'u7', name: 'Emeka Nwosu', role: 'resident', unit: 'Block C, Flat 1', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Emeka', pin: '1111' },
];

const MOCK_CHARGES: Charge[] = [
    { id: 'c1', title: 'Monthly Maintenance Fee', amount: 85000, dueDate: '2026-03-01', status: 'pending', residentId: 'u2' },
    { id: 'c2', title: 'Common Area Assessment', amount: 25000, dueDate: '2026-02-15', status: 'overdue', residentId: 'u2' },
    { id: 'c3', title: 'Monthly Maintenance Fee', amount: 60000, dueDate: '2026-03-01', status: 'paid', residentId: 'u3' }, // Amina already paid
    { id: 'c4', title: 'Monthly Maintenance Fee', amount: 85000, dueDate: '2026-03-01', status: 'pending', residentId: 'u4' },
    { id: 'c5', title: 'Gym Access Renewal', amount: 15000, dueDate: '2026-02-28', status: 'pending', residentId: 'u5' },
    { id: 'c6', title: 'Waste Management Fine', amount: 5000, dueDate: '2026-02-10', status: 'overdue', residentId: 'u6' },
];

const MOCK_WORK_ORDERS: WorkOrder[] = [
    { id: 'w1', title: 'HVAC Filter Replacement', description: 'Air conditioning not cooling effectively.', category: 'hvac', status: 'pending', residentId: 'u2', dateSubmitted: '2026-02-24T10:30:00Z' },
    { id: 'w2', title: 'Leaky Faucet', description: 'Master bathroom sink is dripping continuously.', category: 'plumbing', status: 'in-progress', residentId: 'u3', dateSubmitted: '2026-02-22T14:15:00Z' },
    { id: 'w3', title: 'Flickering Lights', description: 'Hallway lights keep flickering on and off.', category: 'electrical', status: 'pending', residentId: 'u5', dateSubmitted: '2026-02-25T08:00:00Z' },
    { id: 'w4', title: 'Door Hinge Repair', description: 'Front door is squeaking loudly.', category: 'general', status: 'resolved', residentId: 'u7', dateSubmitted: '2026-02-20T11:20:00Z' },
];

// Context Setup
interface DataContextType {
    currentUser: User | null;
    login: (userId: string) => void;
    logout: () => void;
    users: User[];
    charges: Charge[];
    workOrders: WorkOrder[];
    addCharge: (charge: Omit<Charge, 'id'>) => void;
    payCharge: (chargeId: string) => void;
    addWorkOrder: (order: Omit<WorkOrder, 'id' | 'dateSubmitted' | 'status'>) => void;
    updateWorkOrderStatus: (orderId: string, status: WorkOrder['status']) => void;
    addUser: (user: Omit<User, 'id' | 'avatar' | 'pin'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [charges, setCharges] = useState<Charge[]>(MOCK_CHARGES);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial load from local storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('havenprop_currentUser');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));

        const storedUsers = localStorage.getItem('havenprop_users');
        if (storedUsers) {
            const parsedUsers: User[] = JSON.parse(storedUsers);
            // Migration: Ensure all stored users have the new PIN field
            const migratedUsers = parsedUsers.map(u => {
                if (!u.pin) {
                    const mock = MOCK_USERS.find(m => m.id === u.id);
                    return { ...u, pin: mock?.pin || '1234' };
                }
                return u;
            });
            setUsers(migratedUsers);
        }

        const storedCharges = localStorage.getItem('havenprop_charges');
        if (storedCharges) setCharges(JSON.parse(storedCharges));

        const storedWorkOrders = localStorage.getItem('havenprop_workOrders');
        if (storedWorkOrders) setWorkOrders(JSON.parse(storedWorkOrders));

        setIsLoaded(true);
    }, []);

    // Save state changes to local storage
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem('havenprop_currentUser', JSON.stringify(currentUser));
        localStorage.setItem('havenprop_users', JSON.stringify(users));
        localStorage.setItem('havenprop_charges', JSON.stringify(charges));
        localStorage.setItem('havenprop_workOrders', JSON.stringify(workOrders));
    }, [currentUser, users, charges, workOrders, isLoaded]);

    const login = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) setCurrentUser(user);
    };

    const logout = () => setCurrentUser(null);

    const addCharge = (chargeData: Omit<Charge, 'id'>) => {
        const newCharge: Charge = { ...chargeData, id: `c${Date.now()}` };
        setCharges(prev => [newCharge, ...prev]);
    };

    const payCharge = (chargeId: string) => {
        setCharges(prev => prev.map(c => c.id === chargeId ? { ...c, status: 'paid' } : c));
    };

    const addWorkOrder = (orderData: Omit<WorkOrder, 'id' | 'dateSubmitted' | 'status'>) => {
        const newOrder: WorkOrder = {
            ...orderData,
            id: `w${Date.now()}`,
            dateSubmitted: new Date().toISOString(),
            status: 'pending'
        };
        setWorkOrders(prev => [newOrder, ...prev]);
    };

    const updateWorkOrderStatus = (orderId: string, status: WorkOrder['status']) => {
        setWorkOrders(prev => prev.map(w => w.id === orderId ? { ...w, status } : w));
    };

    const addUser = (userData: Omit<User, 'id' | 'avatar' | 'pin'>) => {
        const newUser: User = {
            ...userData,
            id: `u${Date.now()}`,
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${userData.name.replace(/\s+/g, '')}`,
            pin: Math.floor(1000 + Math.random() * 9000).toString() // Generate random 4 digit PIN
        };
        setUsers(prev => [...prev, newUser]);
    };

    return (
        <DataContext.Provider value={{
            currentUser, login, logout, users, charges, workOrders,
            addCharge, payCharge, addWorkOrder, updateWorkOrderStatus, addUser
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
