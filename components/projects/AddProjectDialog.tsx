'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { addProject, updateProject, clearCurrentProject } from '@/store/slices/projectsSlice';
import { validateProjectTitle, validateProjectDescription } from '@/lib/validation';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

interface AddProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddProjectDialog({ open, onClose }: AddProjectDialogProps) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentProject = useSelector((state: RootState) => state.projects.currentProject);

  // Populate form when editing
  useEffect(() => {
    if (currentProject) {
      setFormData({
        name: currentProject.name,
        description: currentProject.description,
      });
    } else {
      setFormData({ name: '', description: '' });
    }
    setError('');
  }, [currentProject, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Enforce character limits
    if (name === 'name' && value.length > 80) {
      return;
    }
    if (name === 'description' && value.length > 400) {
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validate project title
    const titleValidation = validateProjectTitle(formData.name);
    if (!titleValidation.valid) {
      setError(titleValidation.error || 'Invalid project name');
      return;
    }

    // Validate project description
    const descValidation = validateProjectDescription(formData.description);
    if (!descValidation.valid) {
      setError(descValidation.error || 'Invalid description');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (currentProject) {
        // Update existing project
        const response = await fetch(`/api/projects/${currentProject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to update project');
          return;
        }

        dispatch(updateProject(data.project));
      } else {
        // Create new project
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to create project');
          return;
        }

        dispatch(addProject(data.project));
      }

      setFormData({ name: '', description: '' });
      dispatch(clearCurrentProject());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setError('');
    dispatch(clearCurrentProject());
    onClose();
  };

  const isEditing = !!currentProject;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Edit Project' : 'Create New Project'}
      </DialogTitle>
      <DialogContent className="pt-6 space-y-5">
        {error && (
          <Alert severity="error" sx={{ borderRadius: '8px' }}>
            {error}
          </Alert>
        )}
        <div>
          <TextField
            fullWidth
            label="Project Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            variant="outlined"
            size="medium"
            placeholder="e.g. Website Redesign"
            inputProps={{ maxLength: 80 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '0.75rem',
                backgroundColor: '#f8fafc',
                '&:hover fieldset': { borderColor: '#3b82f6' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
            }}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.name.length}/80 characters
          </div>
        </div>
        <div>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            variant="outlined"
            size="medium"
            multiline
            rows={3}
            placeholder="Describe your project"
            inputProps={{ maxLength: 400 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '0.75rem',
                backgroundColor: '#f8fafc',
                '&:hover fieldset': { borderColor: '#3b82f6' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
              marginTop: '12px',
            }}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.description.length}/400 characters
          </div>
        </div>
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button onClick={handleClose} disabled={isLoading} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{
            backgroundColor: '#3b82f6',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#2563eb' },
          }}
        >
          {isEditing ? 'Update Project' : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
