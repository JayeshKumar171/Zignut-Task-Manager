'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { restoreAuth } from '@/store/slices/authSlice';
import { verifyToken } from '@/lib/auth';

export function useAuth() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (!isAuthenticated && storedToken) {
        try {
          const decoded = verifyToken(storedToken);
          if (decoded) {
            dispatch(restoreAuth({ user: decoded, token: storedToken }));
          } else {
            localStorage.removeItem('token');
            router.push('/signin');
          }
        } catch (error) {
          localStorage.removeItem('token');
          router.push('/signin');
        }
      }
    };

    checkAuth();
  }, [dispatch, router, isAuthenticated]);

  return { user, token, isAuthenticated };
}

export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  return { isAuthenticated };
}
