import { adminDb } from '@/firebase/firebaseadmin';
import { NextRequest, NextResponse } from 'next/server';

interface Organization {
    name: string;
    membersRoles: object;
    teamsIds: string[];
}

//TODO: add data validation for organizationName (up to 100 characters, no special characters or tags)

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();

        // Clean and validate inputs
        const { organizationName, userId } = body;

        const organizationId = `${userId}-organization-${organizationName}`;

        const orgRef = adminDb.collection('organizations').doc(organizationId);

        const orgSnap = await orgRef.get();

        if (orgSnap.exists) {
            return new NextResponse('This organization already exists', { status: 400 });
        }

        const data: Organization = {
            name: organizationName,
            teamsIds: [],
            membersRoles: {
                [userId]: "owner"
            },
        }

        await orgRef.set(data);

        return new NextResponse('Organization created successfully', { status: 200 });

    } catch (error) {
        console.error('Error in task creation:', error);

        const errorMessage = error instanceof Error ? error.message : 'Task creation failed';
        return new NextResponse(errorMessage, { status: 400 });
    }
}