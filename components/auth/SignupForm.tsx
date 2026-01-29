'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { signUpSuccess, setError, setLoading } from '@/store/slices/authSlice';
import { validateEmail, validatePassword } from '@/lib/validation';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Link from 'next/link';

export function SignupForm() {
  const [formData, setFormData] = useState({ email: '', name: '', password: '', confirmPassword: '' });
  const [error, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.name || !formData.password) {
      setLocalError('All fields are required');
      return;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setLocalError(emailValidation.error || 'Invalid email');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setLocalError(passwordValidation.error || 'Invalid password');
      return;
    }

    setIsLoading(true);
    dispatch(setLoading(true));

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: formData.name, password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLocalError(data.error || 'Signup failed');
        dispatch(setError(data.error || 'Signup failed'));
        return;
      }

      dispatch(signUpSuccess({ user: data.user, token: data.token }));
      // Save token and user data to localStorage for persistence
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Small delay to ensure Redux state is updated
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      setLocalError(error);
      dispatch(setError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Create Account</h1>
            <p className="text-slate-600 text-base leading-relaxed">Join Task Manager to organize your work and boost productivity</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" className="mb-6 rounded-lg" sx={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                variant="outlined"
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.75rem',
                    backgroundColor: '#f8fafc',
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  },
                }}
              />
            </div>

            {/* Email Field */}
            <div>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                variant="outlined"
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.75rem',
                    backgroundColor: '#f8fafc',
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  },
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                variant="outlined"
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.75rem',
                    backgroundColor: '#f8fafc',
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  },
                }}
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                variant="outlined"
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.75rem',
                    backgroundColor: '#f8fafc',
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  },
                }}
              />
            </div>

            {/* Sign Up Button */}
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={isLoading}
              sx={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '0.75rem',
                textTransform: 'none',
                marginTop: '1.5rem',
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
                '&:disabled': {
                  backgroundColor: '#cbd5e1',
                },
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-500 text-sm">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-slate-600">
            Already have an account?{' '}
            <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer Text */}
        <p className="text-center text-slate-400 text-sm mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
