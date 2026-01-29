'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setCurrentProject, setProjects } from '@/store/slices/projectsSlice';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TaskList } from '@/components/tasks/TaskList';
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const projectId = params.id as string;
  const projects = useSelector((state: RootState) => state.projects.projects);
  const token = useSelector((state: RootState) => state.auth.token);
  const currentProject = useSelector((state: RootState) => state.projects.currentProject);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects from API on mount to ensure fresh data
  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) {
        router.push('/signin');
        return;
      }

      try {
        const response = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          dispatch(setProjects(data.projects));
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    fetchProjects();
  }, [token, dispatch, router]);

  // Set current project from projects list
  useEffect(() => {
    if (projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        dispatch(setCurrentProject(project));
        setIsLoading(false);
      } else {
        // Project not found
        setIsLoading(false);
      }
    } else if (!isLoading) {
      // Already tried to fetch, still not found
      setIsLoading(false);
    }
  }, [projectId, projects, dispatch, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex flex-col items-center justify-center py-24">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Project not found</h2>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
            Return to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowBackIcon fontSize="small" />
            Back to Projects
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{currentProject.name}</h1>
              <p className="text-gray-600 mt-2">{currentProject.description}</p>
            </div>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              New Task
            </Button>
          </div>
        </div>

        <TaskList projectId={projectId} />

        <AddTaskDialog open={dialogOpen} onClose={() => setDialogOpen(false)} projectId={projectId} />
      </main>
    </div>
  );
}
