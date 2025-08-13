
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the schema for the login request body
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// IMPORTANT: This is a temporary, insecure way to store credentials.
// In a real application, use a secure database and hashed passwords.
const authorizedUsers = [
  { email: 'admin@example.com', password: 'password123' },
  { email: 'user@lifi.com', password: 'securepassword' },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input format.' }, { status: 400 });
    }

    const { email, password } = validation.data;

    // Find the user in our hardcoded list
    const user = authorizedUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // In a real app, you would generate a JWT or session token here.
      // For this simple case, we just confirm success.
      return NextResponse.json({ success: true, message: 'Login successful.' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, error: 'An internal server error occurred.' }, { status: 500 });
  }
}

    