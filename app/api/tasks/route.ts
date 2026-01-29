import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getFromLocalStorage, setToLocalStorage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const projects = getFromLocalStorage('projects', []);
    const tasks = getFromLocalStorage('tasks', []);

    // Check if project belongs to user
    const project = projects.find((p: any) => p.id === projectId && p.userId === user.id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectTasks = tasks.filter((t: any) => t.projectId === projectId);

    return NextResponse.json({ success: true, tasks: projectTasks });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { projectId, title, description, priority, dueDate } = await request.json();

    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Project ID and title are required' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const projects = getFromLocalStorage('projects', []);
    const project = projects.find((p: any) => p.id === projectId && p.userId === user.id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const tasks = getFromLocalStorage('tasks', []);

    const newTask = {
      id: Date.now().toString(),
      projectId,
      title,
      description: description || '',
      status: 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    setToLocalStorage('tasks', tasks);

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
