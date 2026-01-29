'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setProjects, deleteProject, setCurrentProject } from '@/store/slices/projectsSlice';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Link from 'next/link';
import { format } from 'date-fns';

export function ProjectList() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const projects = useSelector((state: RootState) => state.projects.projects);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      if (!token) return;

      try {
        const response = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          dispatch(setProjects(data.projects));
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [token, dispatch]);

  const handleDeleteClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProjectId || !token) {
      setDeleteError('Invalid project or missing authentication');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch(`/api/projects/${selectedProjectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.error || 'Failed to delete project');
        return;
      }

      dispatch(deleteProject(selectedProjectId));
      setDeleteDialogOpen(false);
      setSelectedProjectId(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'An error occurred while deleting');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p className="text-slate-600 text-lg font-medium mb-2">No projects yet</p>
        <p className="text-slate-500 text-base">Create your first project to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200"
          sx={{
            borderRadius: '12px',
            '&:hover': {
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          {/* Card Header with gradient */}
          <div className="h-3 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          
          <CardContent className="flex-grow pt-6">
            <Link href={`/dashboard/projects/${project.id}`} className="block group">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2 leading-tight">
                {project.name}
              </h3>
            </Link>
            <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">{project.description}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(new Date(project.createdAt), 'MMM dd, yyyy')}
            </div>
          </CardContent>

          <CardActions className="flex flex-col gap-2 pt-0">
            <Link href={`/dashboard/projects/${project.id}`} className="w-full">
              <Button 
                variant="contained" 
                size="medium" 
                fullWidth
                sx={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  },
                }}
              >
                View Tasks
              </Button>
            </Link>
            
            <div className="flex gap-2 w-full">
              <IconButton
                size="small"
                onClick={() => {
                  dispatch(setCurrentProject(project));
                }}
                sx={{
                  flex: 1,
                  color: '#3b82f6',
                  borderRadius: '8px',
                  border: '1px solid #dbeafe',
                  '&:hover': {
                    backgroundColor: '#eff6ff',
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(project.id)}
                sx={{
                  flex: 1,
                  color: '#ef4444',
                  borderRadius: '8px',
                  border: '1px solid #fee2e2',
                  '&:hover': {
                    backgroundColor: '#fef2f2',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
          </CardActions>
        </Card>
      ))}

      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          Delete Project
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
              {deleteError}
            </Alert>
          )}
          <p className="text-slate-600 leading-relaxed">
            Are you sure you want to delete this project? This action cannot be undone and all associated tasks will also be deleted.
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteError('');
            }}
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            disabled={isDeleting}
            sx={{
              backgroundColor: '#ef4444',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#dc2626' },
              '&:disabled': { backgroundColor: '#fca5a5' },
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
