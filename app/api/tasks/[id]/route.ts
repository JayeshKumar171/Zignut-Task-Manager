import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getFromLocalStorage, setToLocalStorage } from '@/lib/storage';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { title, description, status, priority, dueDate } = await request.json();
    const tasks = getFromLocalStorage('tasks', []);
    const projects = getFromLocalStorage('projects', []);

    const task = tasks.find((t: any) => t.id === id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify project ownership
    const project = projects.find((p: any) => p.id === task.projectId && p.userId === user.id);

    if (!project) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskIndex = tasks.findIndex((t: any) => t.id === id);

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      title: title || tasks[taskIndex].title,
      description: description !== undefined ? description : tasks[taskIndex].description,
      status: status || tasks[taskIndex].status,
      priority: priority || tasks[taskIndex].priority,
      dueDate: dueDate !== undefined ? dueDate : tasks[taskIndex].dueDate,
      updatedAt: new Date().toISOString(),
    };

    setToLocalStorage('tasks', tasks);

    return NextResponse.json({ success: true, task: tasks[taskIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const tasks = getFromLocalStorage('tasks', []);
    const projects = getFromLocalStorage('projects', []);

    const task = tasks.find((t: any) => t.id === id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify project ownership
    const project = projects.find((p: any) => p.id === task.projectId && p.userId === user.id);

    if (!project) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedTasks = tasks.filter((t: any) => t.id !== id);
    setToLocalStorage('tasks', updatedTasks);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
