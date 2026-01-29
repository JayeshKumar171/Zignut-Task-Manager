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

    const { name, description } = await request.json();
    const projects = getFromLocalStorage('projects', []);

    const projectIndex = projects.findIndex((p: any) => p.id === id && p.userId === user.id);

    if (projectIndex === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    projects[projectIndex] = {
      ...projects[projectIndex],
      name: name || projects[projectIndex].name,
      description: description !== undefined ? description : projects[projectIndex].description,
      updatedAt: new Date().toISOString(),
    };

    setToLocalStorage('projects', projects);

    return NextResponse.json({ success: true, project: projects[projectIndex] });
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

    const projects = getFromLocalStorage('projects', []);
    const project = projects.find((p: any) => p.id === id && p.userId === user.id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Also delete associated tasks
    const tasks = getFromLocalStorage('tasks', []);
    const updatedTasks = tasks.filter((t: any) => t.projectId !== id);
    setToLocalStorage('tasks', updatedTasks);

    // Delete project
    const updatedProjects = projects.filter((p: any) => p.id !== id);
    setToLocalStorage('projects', updatedProjects);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
