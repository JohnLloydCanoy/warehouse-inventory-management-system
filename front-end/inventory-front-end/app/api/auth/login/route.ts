import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        // Call backend API to validate credentials
        const response = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return NextResponse.json({
                success: true,
                user: data.user,
            });
        } else {
            return NextResponse.json(
                { success: false, error: data.error || 'Invalid credentials' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
