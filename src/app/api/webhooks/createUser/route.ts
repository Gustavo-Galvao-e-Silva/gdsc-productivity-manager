import { Webhook } from 'svix';
import { adminDb } from '@/firebase/firebaseadmin';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Clerk webhook event types
interface ClerkWebhookEvent {
    type: 'user.created' | 'user.deleted' | 'user.updated';
    data: ClerkUser;
}

interface ClerkUser {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email_addresses: Array<{
        id: string;
        email_address: string;
    }>;
    primary_email_address_id?: string | null;
}

// Type guard to check if the event is user.created
function isUserCreatedEvent(event: ClerkWebhookEvent): event is ClerkWebhookEvent & { type: 'user.created' } {
    return event.type === 'user.created';
}

// Helper function to safely get primary email
function getPrimaryEmail(user: ClerkUser): string | null {
    if (!user.primary_email_address_id) {
        return user.email_addresses[0]?.email_address || null;
    }

    const primaryEmail = user.email_addresses.find(
        email => email.id === user.primary_email_address_id
    );

    return primaryEmail?.email_address || null;
}

// Validation function that returns email and validates required fields
function validateUserData(user: ClerkUser): { isValid: true; email: string } | { isValid: false; email: null } {
    const primaryEmail = getPrimaryEmail(user);

    if (primaryEmail && user.id && user.first_name && user.last_name) {
        return { isValid: true, email: primaryEmail };
    }

    return { isValid: false, email: null };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // Get the headers
        const headerPayload = await headers();
        const svix_id = headerPayload.get('svix-id');
        const svix_timestamp = headerPayload.get('svix-timestamp');
        const svix_signature = headerPayload.get('svix-signature');

        // If there are no headers, error out
        if (!svix_id || !svix_timestamp || !svix_signature) {
            return new NextResponse('Missing required webhook headers', { status: 400 });
        }

        // Get the body
        const payload: unknown = await req.json();
        const body = JSON.stringify(payload);

        const secret = process.env.CLERK_USER_CREATED_SECRET;

        if (!secret) {
            console.error('CLERK_USER_CREATED_SECRET environment variable is not set');
            return new NextResponse('Server configuration error', { status: 500 });
        }

        // Create a new Svix instance with your secret
        const wh = new Webhook(secret);

        // Verify the payload with the headers
        const evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as ClerkWebhookEvent;

        // Early return if not user creation event
        if (!isUserCreatedEvent(evt)) {
            return new NextResponse('Not user creation event', { status: 400 });
        }

        const user = evt.data;

        // Validate user data and get email in one step
        const validation = validateUserData(user);
        if (!validation.isValid) {
            return new NextResponse('User has insufficient data', { status: 400 });
        }

        // Insert user into Firestore
        const userDoc = {
            clerkId: user.id,
            email: validation.email,
            firstName: user.first_name!,
            lastName: user.last_name!,
            tasks: [],
            organizations: {}
        };

        await adminDb.collection('users').doc(user.id).set(userDoc);

        console.log('User created in database:', userDoc);

        return new NextResponse('User created successfully', { status: 200 });

    } catch (error) {
        console.error('Error in webhook handler:', error);
        return new NextResponse('Webhook verification failed', { status: 400 });
    }
}