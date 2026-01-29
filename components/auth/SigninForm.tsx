'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { signInSuccess, setError, setLoading } from '@/store/slices/authSlice';
import { validateEmail } from '@/lib/validation';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Link from 'next/link';

export function SigninForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
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

    if (!formData.email || !formData.password) {
      setLocalError('Email and password are required');
      return;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setLocalError(emailValidation.error || 'Invalid email');
      return;
    }

    setIsLoading(true);
    dispatch(setLoading(true));

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setLocalError(data.error || 'Sign in failed');
        dispatch(setError(data.error || 'Sign in failed'));
        return;
      }

      dispatch(signInSuccess({ user: data.user, token: data.token }));
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
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Welcome Back</h1>
            <p className="text-slate-600 text-base leading-relaxed">Sign in to continue to your task dashboard</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" className="mb-6 rounded-lg" sx={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span className="text-slate-600">Remember me</span>
              </label>
              <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
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
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-500 text-sm">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-slate-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
              Create one
            </Link>
          </p>
        </div>

        {/* Footer Text */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Secure login with encryption
        </p>
      </div>
    </div>
  );
}
