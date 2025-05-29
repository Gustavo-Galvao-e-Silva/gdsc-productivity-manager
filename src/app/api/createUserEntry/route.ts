import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseadmin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, email, firstName, lastName } = body;

        if (!userId || !email || !firstName || !lastName) {
            return NextResponse.json({ error: 'Missing user information' }, {status: 401});
        }

        const userRef = adminDb.collection('users').doc(userId);
        const userSnapshot = await userRef.get();
        if (userSnapshot.exists) {
            return NextResponse.json({ success: false, message: `User already exists` });
        }

        const userData = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            tasks: [],
            teams: [],
        }
        await userRef.update(userData);

        return NextResponse.json({ success: true, message: "User created" }, { status: 200 });
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    } finally {

    }
}
