'use client';

import React from "react"

import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { signOut } from '@/store/slices/authSlice';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import { useState } from 'react';

export function DashboardHeader() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    dispatch(signOut());
    localStorage.removeItem('token');
    handleMenuClose();
    router.push('/signin');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-5">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200">
            <span className="text-white font-bold text-lg">TM</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900">Task Manager</h1>
            <p className="text-xs text-slate-500">Organize & Track</p>
          </div>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-5">
          {/* User Info - Hidden on mobile */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate max-w-xs">{user?.email}</p>
          </div>

          {/* Avatar & Menu */}
          <button 
            onClick={handleMenuOpen}
            className="relative transition-transform duration-200 hover:scale-110"
          >
            <Avatar
              sx={{ 
                bgcolor: '#3b82f6',
                cursor: 'pointer',
                width: 40,
                height: 40,
                fontSize: '0.875rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
              }}
            >
              {user?.name ? getInitials(user.name) : 'U'}
            </Avatar>
          </button>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                marginTop: '8px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                minWidth: '250px',
              },
            }}
          >
            {/* User Info in Menu */}
            <MenuItem disabled sx={{ opacity: 1, py: 2, px: 3 }}>
              <div>
                <p className="font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
              </div>
            </MenuItem>
            <hr className="my-1" />
            
            {/* Sign Out Option */}
            <MenuItem 
              onClick={handleSignOut}
              sx={{
                color: '#dc2626',
                py: 1.5,
                px: 3,
                '&:hover': {
                  backgroundColor: '#fee2e2',
                },
              }}
            >
              <span className="font-medium">Sign Out</span>
            </MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
}
