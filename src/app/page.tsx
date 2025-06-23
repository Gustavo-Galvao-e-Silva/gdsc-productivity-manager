"use client"
import { useAuth } from '@clerk/nextjs';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CircularProgress } from '@mui/material';

//TODO: make things not look shit with MUI or ShadCN
export default function Home() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.push("/board");
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

    if (isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Redirecting...</div>
                <CircularProgress color="secondary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Welcome to GDScheduler
                </h1>
                <p className="text-gray-600 mb-8">
                    The official productivity manager for the
                    greatest club of all time!
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => router.push('/sign-up')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                    >
                        Sign Up
                    </button>

                    <button
                        onClick={() => router.push('/sign-in')}
                        className="w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-4 rounded-lg border border-blue-600 transition duration-200"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}