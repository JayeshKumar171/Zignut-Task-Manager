'use client';

import React from "react"

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { addTask } from '@/store/slices/tasksSlice';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function AddTaskDialog({ open, onClose, projectId }: AddTaskDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create task');
        return;
      }

      dispatch(addTask(data.task));
      setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent className="pt-6 space-y-5">
        {error && (
          <Alert severity="error" sx={{ borderRadius: '8px' }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          label="Task Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={isLoading}
          variant="outlined"
          size="medium"
          placeholder="e.g. Design homepage"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '0.75rem',
              backgroundColor: '#f8fafc',
              '&:hover fieldset': { borderColor: '#3b82f6' },
              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
            },
          }}
        />
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
          placeholder="Describe the task"
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
        <FormControl fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select
            name="priority"
            value={formData.priority}
            onChange={handleSelectChange}
            label="Priority"
            disabled={isLoading}
            sx={{
              borderRadius: '0.75rem',
              backgroundColor: '#f8fafc',
              '&:hover fieldset': { borderColor: '#3b82f6' },
              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              marginTop: '12px',
            }}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Due Date"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          disabled={isLoading}
          variant="outlined"
          size="medium"
          InputLabelProps={{ shrink: true }}
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
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}
