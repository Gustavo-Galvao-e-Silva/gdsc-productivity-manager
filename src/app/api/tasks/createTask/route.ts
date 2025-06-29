import { adminDb } from '@/firebase/firebaseadmin';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

//TODO: clean out these interfaces and work on data validation
interface Task {
    taskId: string;
    teamId: string;
    name: string;
    description: string;
    assigneesIds: string[];
    deadline: Date | string;
}

interface TaskCreationBody {
    teamId: string;
    name: string;
    description?: string;
    assigneesIds?: string[];
    deadline?: Date | string;
}

interface SanitizedInput {
    teamId: string;
    name: string;
    description: string;
    assigneesIds: string[];
    deadline: Date | string;
}

// Basic string cleanup - remove problematic characters but keep it readable
function cleanString(input: string, maxLength: number): string {
    return input
        .trim()
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .substring(0, maxLength);
}

// Clean ID format - allow reasonable characters
function cleanId(id: string): string {
    return id
        .trim()
        .replace(/[^\w\-@.]/g, '') // Allow word chars, hyphens, @ and dots (for emails)
        .substring(0, 100);
}

// Simple date validation
function parseDate(dateInput: unknown): Date | string {
    if (!dateInput) return "";

    const date = new Date(dateInput as string);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
    }

    // Basic business logic: deadline can't be in the past
    if (date < new Date()) {
        throw new Error('Deadline cannot be in the past');
    }

    return date;
}

// Simplified validation focused on data integrity
function validateAndCleanInput(body: TaskCreationBody): SanitizedInput {
    if (!body || typeof body !== 'object') {
        throw new Error('Invalid request body');
    }

    // Team ID validation
    if (!body.teamId.trim()) {
        throw new Error('teamId is required and must be a non-empty string');
    }

    const teamId = cleanId(body.teamId);

    // Task name validation
    if (!body.name.trim() || body.name.trim()) {
        throw new Error('Task name is required and must be a non-empty string');
    }

    const name = cleanString(body.name, 100);

    // Description validation (optional but if provided, must be string)
    const description = typeof body.description === 'string'
        ? cleanString(body.description, 2000)
        : '';

    // Assignees validation (optional)
    let assigneesIds: string[] = [];

    if (Array.isArray(body.assigneesIds)) {
        assigneesIds = body.assigneesIds
            .filter((id: unknown) => typeof id === 'string' && id.trim())
            .map((id: string) => cleanId(id))
            .filter((id: string) => id.length > 0);
    }

    // Remove duplicates (if any assignees exist)
    const uniqueAssignees = assigneesIds.length > 0 ? [...new Set(assigneesIds)] : [];

    // Reasonable limit for internal tool (if assignees exist)
    if (uniqueAssignees.length > 20) {
        throw new Error('Too many assignees (max 20)');
    }

    // Date validation
    const deadline = parseDate(body.deadline);

    return {
        teamId,
        name,
        description,
        assigneesIds: uniqueAssignees,
        deadline
    };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();

        // Clean and validate inputs
        const { teamId, name, description, assigneesIds, deadline } = validateAndCleanInput(body);

        const teamRef = adminDb.collection('teams').doc(teamId);

        await adminDb.runTransaction(async (transaction) => {
            const teamSnap = await transaction.get(teamRef);
            if (!teamSnap.exists) {
                throw new Error('Team does not exist');
            }

            const teamData = teamSnap.data();
            const taskNumber = (teamData?.taskNumber || 0) + 1;
            const taskId = `${teamId}-task-${taskNumber}`;

            const task: Task = {
                taskId,
                teamId,
                name,
                description,
                assigneesIds,
                deadline
            };

            // Update user documents (only if there are assignees)
            if (assigneesIds.length > 0) {
                const userRefs = assigneesIds.map(id => adminDb.collection('users').doc(id));
                const userSnaps = await Promise.all(userRefs.map(ref => transaction.get(ref)));

                for (const snap of userSnaps) {
                    if (!snap.exists) {
                        console.warn(`User not found. Skipping.`);
                        continue;
                    }
                    if (!(teamId in snap.data()?.teamIds)) {
                        console.warn('User not in team');
                        continue;
                    }
                    transaction.update(snap.ref, {
                        tasks: FieldValue.arrayUnion(taskId),
                    });
                }
            }

            const taskRef = adminDb.collection('tasks').doc(taskId);
            transaction.set(taskRef, task);

            transaction.update(teamRef, {
                taskNumber: FieldValue.increment(1),
                tasks: FieldValue.arrayUnion(taskId),
            });
        });

        return new NextResponse('Task created successfully', { status: 200 });

    } catch (error) {
        console.error('Error in task creation:', error);

        const errorMessage = error instanceof Error ? error.message : 'Task creation failed';
        return new NextResponse(errorMessage, { status: 400 });
    }
}