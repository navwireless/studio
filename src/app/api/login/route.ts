
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the schema for the login request body
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Retrieve authorized users from environment variables
// Example format in .env.local:
// AUTHORIZED_EMAILS=admin@example.com,user@lifi.com
// AUTHORIZED_PASSWORDS=password123,securepassword
const authorizedEmails = (process.env.AUTHORIZED_EMAILS || '').split(',');
const authorizedPasswords = (process.env.AUTHORIZED_PASSWORDS || '').split(',');


export async function POST(request: Request) {
  // Basic validation to ensure environment variables are set up
  if (authorizedEmails.length === 0 || authorizedEmails[0] === '' || authorizedPasswords.length === 0 || authorizedPasswords[0] === '') {
    console.error('AUTH_CONFIG_ERROR: No authorized users are configured in environment variables. Please set AUTHORIZED_EMAILS and AUTHORIZED_PASSWORDS.');
    return NextResponse.json({ success: false, error: 'Authentication service is not configured.' }, { status: 500 });
  }
  if (authorizedEmails.length !== authorizedPasswords.length) {
    console.error('AUTH_CONFIG_ERROR: The number of authorized emails does not match the number of passwords. Please check your environment variables.');
    return NextResponse.json({ success: false, error: 'Authentication service has a configuration mismatch.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input format.' }, { status: 400 });
    }

    const { email, password } = validation.data;

    // Find the index of the submitted email
    const userIndex = authorizedEmails.indexOf(email);

    // Check if the user exists and if the password at the same index matches
    if (userIndex !== -1 && authorizedPasswords[userIndex] === password) {
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
