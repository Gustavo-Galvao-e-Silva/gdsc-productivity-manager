import { adminDb } from '@/firebase/firebaseadmin';
import { NextRequest, NextResponse } from 'next/server';

interface Team {
    name: string;
    tasksIds: string[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();

        // Clean and validate inputs
        const { organizationId, teamName } = body;

        const teamId = `${organizationId}-team-${teamName}`;

        const teamRef = adminDb.collection('teams').doc(teamId);

        const teamSnap = await teamRef.get();

        if (teamSnap.exists) {
            return new NextResponse('Team already has this name', { status: 200 });
        }


        return new NextResponse('Task created successfully', { status: 200 });

    } catch (error) {
        console.error('Error in task creation:', error);

        const errorMessage = error instanceof Error ? error.message : 'Task creation failed';
        return new NextResponse(errorMessage, { status: 400 });
    }
}