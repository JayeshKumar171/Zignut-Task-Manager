'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setTasks, deleteTask, updateTask } from '@/store/slices/tasksSlice';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Task } from '@/store/slices/tasksSlice';
import { format } from 'date-fns';
import EditTaskDialog from './EditTaskDialog';

interface TaskListProps {
  projectId: string;
}

const statusConfig = {
  todo: {
    title: 'To Do',
    color: '#e5e7eb',
    borderColor: '#9ca3af',
    icon: '○',
  },
  'in-progress': {
    title: 'In Progress',
    color: '#fef3c7',
    borderColor: '#f59e0b',
    icon: '→',
  },
  done: {
    title: 'Done',
    color: '#d1fae5',
    borderColor: '#10b981',
    icon: '✓',
  },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: '#0ea5e9', bgColor: '#e0f2fe' },
  medium: { label: 'Medium', color: '#f59e0b', bgColor: '#fef3c7' },
  high: { label: 'High', color: '#ef4444', bgColor: '#fee2e2' },
};

export function TaskList({ projectId }: TaskListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const tasks = useSelector((state: RootState) => 
    state.tasks.tasks.filter(t => t.projectId === projectId)
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (!token) return;

      try {
        const response = await fetch(`/api/tasks?projectId=${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          dispatch(setTasks(data.tasks));
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [token, projectId, dispatch]);

  const handleDeleteClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTaskId || !token) return;

    try {
      const response = await fetch(`/api/tasks/${selectedTaskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        dispatch(deleteTask(selectedTaskId));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedTaskId(null);
    }
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setEditTaskOpen(true);
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...task,
          status: newStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(updateTask(data.task));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Group tasks by status
  const groupedTasks = {
    todo: tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  const filteredTasks = filterStatus 
    ? groupedTasks[filterStatus as keyof typeof groupedTasks] || []
    : tasks;

  // Task card component
  const TaskCard = ({ task }: { task: Task }) => (
    <Card
      className="mb-3 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4"
      sx={{
        borderLeft: `4px solid ${
          priorityConfig[task.priority]?.color || '#6b7280'
        }`,
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent className="p-4">
        {/* Title */}
        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-gray-600 text-xs mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Priority Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Chip
            label={priorityConfig[task.priority]?.label}
            size="small"
            sx={{
              backgroundColor: priorityConfig[task.priority]?.bgColor,
              color: priorityConfig[task.priority]?.color,
              fontWeight: 600,
              height: '24px',
              fontSize: '0.7rem',
            }}
          />
          {task.dueDate && (
            <span className="text-xs text-gray-500">
              {format(new Date(task.dueDate), 'MMM dd')}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 justify-end">
          {task.status !== 'done' && (
            <IconButton
              size="small"
              onClick={() => handleStatusChange(task, task.status === 'todo' ? 'in-progress' : 'done')}
              sx={{
                color: task.status === 'todo' ? '#f59e0b' : '#10b981',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
              }}
              title={task.status === 'todo' ? 'Start Task' : 'Complete Task'}
            >
              {task.status === 'todo' ? <PlayArrowIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => handleEditClick(task)}
            sx={{
              color: '#3b82f6',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(task.id)}
            sx={{
              color: '#ef4444',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      </CardContent>
    </Card>
  );

  // Kanban Column Component
  const KanbanColumn = ({ status, statusKey }: { status: typeof statusConfig['todo']; statusKey: string }) => {
    const columnTasks = filterStatus ? filteredTasks : groupedTasks[statusKey as keyof typeof groupedTasks] || [];

    return (
      <div className="flex-shrink-0 w-96 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex flex-col">
        {/* Column Header */}
        <div
          className="px-4 py-3 border-b-2"
          style={{ backgroundColor: status.color, borderColor: status.borderColor }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{status.icon}</span>
              <h3 className="font-bold text-gray-900 text-sm">
                {status.title}
              </h3>
            </div>
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white text-gray-700 text-xs font-semibold">
              {columnTasks.length}
            </span>
          </div>
        </div>

        {/* Column Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {columnTasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <p className="text-sm">No tasks</p>
            </div>
          ) : (
            columnTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="mb-6 flex gap-2 items-center">
        <span className="text-sm font-semibold text-gray-700">Filter by:</span>
        <Button
          variant={filterStatus === null ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setFilterStatus(null)}
          sx={{
            textTransform: 'none',
            borderRadius: '6px',
            backgroundColor: filterStatus === null ? '#3b82f6' : 'transparent',
            color: filterStatus === null ? 'white' : '#6b7280',
            borderColor: '#d1d5db',
            '&:hover': {
              backgroundColor: filterStatus === null ? '#2563eb' : '#f3f4f6',
            },
          }}
        >
          All Tasks ({tasks.length})
        </Button>
        {Object.entries(statusConfig).map(([key, value]) => (
          <Button
            key={key}
            variant={filterStatus === key ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilterStatus(key)}
            sx={{
              textTransform: 'none',
              borderRadius: '6px',
              backgroundColor: filterStatus === key ? value.borderColor : 'transparent',
              color: filterStatus === key ? 'white' : value.borderColor,
              borderColor: value.borderColor,
              '&:hover': {
                backgroundColor: value.color,
              },
            }}
          >
            {value.title} ({groupedTasks[key as keyof typeof groupedTasks].length})
          </Button>
        ))}
      </div>

      {/* Kanban Board */}
      {filterStatus ? (
        <div className="space-y-4">
          <KanbanColumn status={statusConfig[filterStatus as keyof typeof statusConfig]} statusKey={filterStatus} />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn status={statusConfig.todo} statusKey="todo" />
          <KanbanColumn status={statusConfig['in-progress']} statusKey="in-progress" />
          <KanbanColumn status={statusConfig.done} statusKey="done" />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          Delete Task
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <p className="text-gray-600">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      {selectedTask && (
        <EditTaskDialog
          open={editTaskOpen}
          onClose={() => {
            setEditTaskOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
        />
      )}
    </div>
  );
}
