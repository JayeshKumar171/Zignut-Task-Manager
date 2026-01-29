import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateToken } from '@/lib/auth';
import { getFromLocalStorage, setToLocalStorage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    // Validation
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get existing users from localStorage
    const users = getFromLocalStorage('users', []);

    // Check if user already exists
    if (users.some((u: any) => u.email === email)) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      passwordHash,
    };

    // Save user to localStorage
    users.push(newUser);
    setToLocalStorage('users', users);

    // Generate token
    const token = generateToken({ id: newUser.id, email: newUser.email, name: newUser.name });

    // Return response with token
    const response = NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token,
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
