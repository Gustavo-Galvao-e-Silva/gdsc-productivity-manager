"use client"
import { useAuth } from '@clerk/nextjs';
import { useRouter } from "next/navigation";
import { CircularProgress } from '@mui/material';
import { useEffect } from "react";
import KanbanBoard from '@/components/kanbanBoard';

export default function Board() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/');
        }
    }, [isSignedIn, isLoaded, router]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
                <CircularProgress color="secondary" />
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Redirecting to sign in...</div>
                <CircularProgress color="secondary" />
            </div>
        );
    }

    const handleTaskUpdate = (taskId: string, newStatus: string) => {
        console.log(`Task ${taskId} moved to ${newStatus}`);
    };

    const handleTaskClick = (taskId: string) => {
        console.log(`Task ${taskId} clicked`);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{
                padding: '20px'
            }}>
            <KanbanBoard
                onTaskUpdate={handleTaskUpdate}
                onTaskClick={handleTaskClick}
            />
        </div>
    );
}