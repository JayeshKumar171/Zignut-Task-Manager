'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { restoreAuth } from '@/store/slices/authSlice';
import { verifyToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { clearCurrentProject } from '@/store/slices/projectsSlice';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProjectList } from '@/components/projects/ProjectList';
import { AddProjectDialog } from '@/components/projects/AddProjectDialog';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const token = useSelector((state: RootState) => state.auth.token);
  const currentProject = useSelector((state: RootState) => state.projects.currentProject);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!isAuthenticated && storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          // Restore auth state from localStorage
          dispatch(restoreAuth({ user, token: storedToken }));
        } catch (error) {
          console.error('Failed to restore auth:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/signin');
        }
      } else if (!isAuthenticated && !storedToken) {
        router.push('/signin');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [dispatch, router, isAuthenticated]);

  // Open dialog when currentProject is set
  useEffect(() => {
    if (currentProject) {
      setDialogOpen(true);
    }
  }, [currentProject]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    dispatch(clearCurrentProject());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
              My Projects
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
              Create, organize, and manage all your projects and tasks in one place
            </p>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
          >
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="space-y-8">
          <ProjectList />
        </div>

        <AddProjectDialog open={dialogOpen} onClose={handleDialogClose} />
      </main>
    </div>
  );
}
