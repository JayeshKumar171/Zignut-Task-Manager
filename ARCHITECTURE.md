# Task Management App - Complete Architecture Documentation

## Overview

This is a **Next.js-based task management application** with a **Jira/Trello-style Kanban board** interface. It demonstrates modern web development practices including JWT authentication, Redux state management, file-based persistence, and real-time validation.

**Tech Stack:**
- Frontend: React + TypeScript + Material-UI + Redux Toolkit
- Backend: Next.js API Routes + Node.js
- Database: File-based JSON storage (`.data/storage.json`)
- Authentication: JWT tokens with 7-day expiration
- Build: Next.js 16.0.10

---

## Part 1: Frontend Data Management

### 1.1 Redux State Structure

We use **Redux Toolkit** to manage three main slices:

#### Auth Slice (`store/slices/authSlice.ts`)
```typescript
// State Shape
{
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
```

**Actions:**
- `signup(email, password, name)` - Register new user
- `signin(email, password)` - Login user
- `logout()` - Clear auth state
- `initializeAuth()` - Restore from localStorage on app load

**Flow:**
1. User submits email + password in SignupForm
2. Frontend validates email format and password strength (lib/validation.ts)
3. Thunk action calls POST `/api/auth/signup`
4. Backend hashes password with bcryptjs, stores in storage
5. Backend returns JWT token + user object
6. Redux saves to state + localStorage
7. Token used in Authorization header for all subsequent requests

#### Projects Slice (`store/slices/projectsSlice.ts`)
```typescript
{
  projects: [
    {
      id: string;
      title: string;
      description: string;
      userId: string;
      createdAt: string;
    }
  ];
  isLoading: boolean;
  error: string | null;
}
```

**Actions:**
- `fetchProjects()` - GET `/api/projects`
- `createProject({title, description})` - POST `/api/projects`
- `updateProject({id, title, description})` - PUT `/api/projects/[id]`
- `deleteProject(id)` - DELETE `/api/projects/[id]`

**Data Flow:**
1. User clicks "Add Project" → AddProjectDialog opens
2. User types title (max 80 chars enforced in handleChange)
3. User types description (max 400 chars enforced in handleChange)
4. On submit: validation runs, then createProject thunk called
5. API POST returns new project with generated ID
6. Redux updates projects array
7. localStorage synced automatically

#### Tasks Slice (`store/slices/tasksSlice.ts`)
```typescript
{
  tasks: [
    {
      id: string;
      title: string;
      description: string;
      projectId: string;
      userId: string;
      status: "to-do" | "in-progress" | "done";
      priority: "low" | "medium" | "high";
      createdAt: string;
    }
  ];
  isLoading: boolean;
  error: string | null;
}
```

**Actions:**
- `fetchTasks(projectId)` - GET `/api/tasks?projectId=xyz`
- `createTask({projectId, title, description, priority})` - POST `/api/tasks`
- `updateTask({id, status, priority, ...})` - PUT `/api/tasks/[id]`
- `deleteTask(id)` - DELETE `/api/tasks/[id]`

### 1.2 localStorage Strategy

**Why localStorage?**
- Persists auth token across page reloads
- Persists user object so we don't need to refetch on every load
- Faster UX - immediate state restoration

**What We Store:**
```typescript
localStorage.setItem('auth_token', jwtToken);
localStorage.setItem('auth_user', JSON.stringify({
  id: string;
  email: string;
  name: string;
}));
localStorage.setItem('projects', JSON.stringify(projectsArray));
localStorage.setItem('tasks', JSON.stringify(tasksArray));
```

**Initialization Flow (app/layout.tsx):**
1. App loads
2. `useAuth` hook reads localStorage['auth_token']
3. If token exists: dispatch `initializeAuth()` to restore user
4. If token expired (checked via JWT decode): clear localStorage, redirect to signin
5. `useProjects` hook fetches from `/api/projects`
6. `useTasks` hook fetches from `/api/tasks`
7. Fresh data from backend overwrites localStorage
8. If API fails: serve cached data from localStorage

**Key Advantage:**
If the Next.js server hot-reloads during development, user stays logged in because token is in localStorage. Then API refetches fresh data from file-based storage on backend.

### 1.3 Component-Level Data Management

**Form Handling Example (AddProjectDialog.tsx):**
```typescript
const [formData, setFormData] = useState({ name: '', description: '' });

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  
  // REAL-TIME CHARACTER ENFORCEMENT
  if (name === 'name' && value.length > 80) return;
  if (name === 'description' && value.length > 400) return;
  
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async () => {
  // VALIDATION BEFORE SUBMISSION
  const emailError = validateProjectTitle(formData.name);
  const descError = validateProjectDescription(formData.description);
  
  if (emailError || descError) {
    setError(emailError || descError);
    return;
  }
  
  // DISPATCH REDUX THUNK
  await dispatch(createProject(formData));
};
```

**Key Points:**
- Character limits enforced during input (UX improvement)
- Validation runs before API call (fail fast)
- Redux thunk handles async API communication
- Error states managed in Redux

### 1.4 Authentication Flow

**Signup Process:**
```
User Input → validateEmail() + validatePassword() → API call
  ↓
Backend validation + password hashing → Save to storage
  ↓
Return { token, user } → Redux dispatch + localStorage save
  ↓
Redirect to /dashboard
```

**Signin Process:**
```
User Input → validateEmail() → API call
  ↓
Backend finds user + validates password → Generate JWT
  ↓
Return { token, user } → Redux dispatch + localStorage save
  ↓
Redirect to /dashboard
```

**Protected Routes:**
```typescript
// In useAuth hook
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    
    if (!token || !user) {
      // Redirect to signin
      router.push('/signin');
      return;
    }
    
    // Verify token not expired
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      // Token expired, redirect to signin
      localStorage.clear();
      router.push('/signin');
    }
  }, []);
};
```

---

## Part 2: Backend Data Management

### 2.1 File-Based Storage System

**Storage Location:** `.data/storage.json`

**Why File-Based Storage?**
- No external database needed (great for development)
- Data persists across server hot-reloads
- Simple to understand and debug
- JSON is human-readable

**Storage Structure:**
```json
{
  "users": [
    {
      "id": "uuid-1234",
      "email": "john@example.com",
      "password": "$2b$10$...(hashed)",
      "name": "John Doe",
      "createdAt": "2026-01-29T10:00:00Z"
    }
  ],
  "projects": [
    {
      "id": "uuid-5678",
      "userId": "uuid-1234",
      "title": "Website Redesign",
      "description": "Modernize company website",
      "createdAt": "2026-01-29T11:00:00Z"
    }
  ],
  "tasks": [
    {
      "id": "uuid-9999",
      "projectId": "uuid-5678",
      "userId": "uuid-1234",
      "title": "Design mockups",
      "description": "Create Figma mockups",
      "status": "in-progress",
      "priority": "high",
      "createdAt": "2026-01-29T12:00:00Z"
    }
  ]
}
```

### 2.2 Storage Functions (lib/storage.ts)

**Initialization:**
```typescript
export function initializeStorage() {
  if (typeof window !== 'undefined') {
    // CLIENT SIDE: Read from localStorage
    const stored = localStorage.getItem('app_storage');
    if (stored) return JSON.parse(stored);
  } else {
    // SERVER SIDE: Read from file system
    const storagePath = path.join(process.cwd(), '.data', 'storage.json');
    if (fs.existsSync(storagePath)) {
      const content = fs.readFileSync(storagePath, 'utf-8');
      return JSON.parse(content);
    }
  }
  // Default empty storage
  return { users: [], projects: [], tasks: [] };
}
```

**Persistence:**
```typescript
export function persistStorage(data: StorageData) {
  if (typeof window !== 'undefined') {
    // CLIENT SIDE: Save to localStorage
    localStorage.setItem('app_storage', JSON.stringify(data));
  } else {
    // SERVER SIDE: Save to file
    const storagePath = path.join(process.cwd(), '.data', 'storage.json');
    const dir = path.dirname(storagePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
  }
}
```

**Key Advantage:**
Server-side and client-side use same interface:
- Client: localStorage (fast, in-memory)
- Server: file system (persistent, survives restarts)

### 2.3 API Endpoints

#### Authentication Endpoints

**POST `/api/auth/signup`**
```typescript
// Request body
{
  email: string;
  password: string;
  name: string;
}

// Process
1. Load storage from file
2. Check if email already exists
3. Hash password using bcryptjs
4. Generate UUID for user ID
5. Add user to storage.users
6. Generate JWT token (expires in 7 days)
7. persistStorage() saves to file
8. Return { token, user }
```

**POST `/api/auth/signin`**
```typescript
// Request body
{
  email: string;
  password: string;
}

// Process
1. Load storage from file
2. Find user by email
3. Compare password with hashed version using bcryptjs
4. Generate JWT token
5. Return { token, user }
```

#### Projects Endpoints

**GET `/api/projects`**
```typescript
// Authorization: Bearer <token>
// Process
1. Extract token from header
2. Verify JWT token
3. Decode to get userId
4. Load storage from file
5. Filter projects where userId matches
6. Return projects array
```

**POST `/api/projects`**
```typescript
// Request body
{
  title: string;
  description: string;
}

// Process
1. Validate JWT token
2. Get userId from token
3. Load storage
4. Validate title (max 80 chars)
5. Validate description (max 400 chars)
6. Create project with generated ID
7. Add to storage.projects
8. persistStorage() saves to file
9. Return new project
```

**PUT `/api/projects/[id]`**
```typescript
// Request body
{
  title?: string;
  description?: string;
}

// Process
1. Validate JWT
2. Load storage
3. Find project by ID
4. Verify user owns project
5. Update title/description if provided
6. persistStorage() saves changes
7. Return updated project
```

**DELETE `/api/projects/[id]`**
```typescript
// Process
1. Validate JWT
2. Load storage
3. Find project by ID
4. Verify ownership
5. Remove from storage.projects
6. Also remove all tasks for this project
7. persistStorage()
8. Return success
```

#### Tasks Endpoints

**GET `/api/tasks?projectId=xyz`**
```typescript
// Process
1. Validate JWT
2. Load storage
3. Filter tasks where projectId matches
4. Return tasks array (frontend groups by status)
```

**POST `/api/tasks`**
```typescript
// Request body
{
  projectId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

// Process
1. Validate JWT
2. Load storage
3. Verify project exists and user owns it
4. Create task with status="to-do"
5. persistStorage()
6. Return new task
```

**PUT `/api/tasks/[id]`**
```typescript
// Request body
{
  status?: string;
  priority?: string;
  description?: string;
}

// Process
1. Validate JWT
2. Load storage
3. Find task by ID
4. Verify user owns task (check projectId ownership)
5. Update fields
6. persistStorage()
7. Return updated task
```

### 2.4 Error Handling Pattern

**All API endpoints follow this pattern:**
```typescript
export async function POST(request: Request) {
  try {
    // 1. Validate JWT
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const decoded = verify(token, SECRET_KEY) as JWTPayload;
    const userId = decoded.sub;
    
    // 2. Parse and validate request body
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // 3. Load storage and process
    let storage = loadStorage();
    // ... business logic ...
    persistStorage(storage);
    
    // 4. Return success
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Part 3: Data Flow & Architecture Diagram

### 3.1 Complete Data Flow

```
USER INTERACTION
        ↓
┌─────────────────────────────────────────────────────────┐
│ FRONTEND (React Component)                              │
│ • User types in form                                    │
│ • Real-time validation (character limits)               │
│ • State managed in component useState                   │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│ VALIDATION LAYER (lib/validation.ts)                    │
│ • validateEmail(email)                                  │
│ • validatePassword(password)                            │
│ • validateProjectTitle(title)                           │
│ • validateProjectDescription(description)               │
└─────────────────────────────────────────────────────────┘
        ↓ (if valid)
┌─────────────────────────────────────────────────────────┐
│ REDUX THUNK ACTION (store/slices/)                      │
│ • Dispatch async action                                 │
│ • Add auth header with JWT token                        │
│ • Call API endpoint                                     │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│ NEXT.JS API ROUTE (app/api/)                            │
│ • Receive HTTP request                                  │
│ • Verify JWT token                                      │
│ • Load storage from file system                         │
│ • Validate data (server-side)                           │
│ • Process business logic                                │
│ • Persist to .data/storage.json                         │
│ • Return JSON response                                  │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│ REDUX STATE & LOCALSTORAGE                              │
│ • Update Redux state with response data                 │
│ • Automatically sync to localStorage                    │
│ • UI re-renders with new data                           │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│ USER SEES RESULT                                         │
│ • New project appears in list                           │
│ • Success toast notification                            │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Persistence Layer

```
FRONTEND (Browser)
    ↓
localStorage
├── auth_token (JWT)
├── auth_user (User object)
├── projects (Project array)
└── tasks (Task array)
    ↓
BACKEND (Server)
    ↓
.data/storage.json (File System)
├── users[] (with hashed passwords)
├── projects[]
└── tasks[]
```

**Key Feature:** If server restarts, data is still in file. If frontend reloads, data is still in localStorage. Both sync together via API calls.

---

## Part 4: Validation Strategy

### 4.1 Three Layers of Validation

**Layer 1: Real-Time UI Validation (Character Limits)**
```typescript
// In AddProjectDialog.tsx handleChange
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  
  // PREVENT INPUT if exceeds limit (user can't type more)
  if (name === 'name' && value.length > 80) return;
  if (name === 'description' && value.length > 400) return;
  
  setFormData(prev => ({ ...prev, [name]: value }));
};
```
**Purpose:** Best UX - user can't even enter invalid data

**Layer 2: Submit Validation (Before API)**
```typescript
// In AddProjectDialog.tsx handleSubmit
const emailError = validateProjectTitle(formData.name);
const descError = validateProjectDescription(formData.description);

if (emailError || descError) {
  setError(emailError || descError);
  return; // Don't call API
}
```
**Purpose:** Fail fast - don't waste network request

**Layer 3: Server Validation (Before Save)**
```typescript
// In app/api/projects/route.ts
const { title, description } = await request.json();

if (!title || title.length > 80) {
  return NextResponse.json(
    { error: 'Title must be 1-80 characters' },
    { status: 400 }
  );
}

if (!description || description.length > 400) {
  return NextResponse.json(
    { error: 'Description must be 1-400 characters' },
    { status: 400 }
  );
}
```
**Purpose:** Security - never trust frontend, validate on backend

### 4.2 Validation Rules

| Field | Rule | Layer |
|-------|------|-------|
| Email | Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Frontend + Backend |
| Password | Min 6 characters | Frontend + Backend |
| Project Title | Max 80 characters | Real-time + Submit + Server |
| Project Description | Max 400 characters | Real-time + Submit + Server |

---

## Part 5: Kanban Board Implementation

### 5.1 Status-Based Grouping

**Data Structure:**
```typescript
// Raw tasks from API
tasks: [
  { id: '1', title: 'Task 1', status: 'to-do', priority: 'high' },
  { id: '2', title: 'Task 2', status: 'in-progress', priority: 'medium' },
  { id: '3', title: 'Task 3', status: 'done', priority: 'low' },
]

// Component groups by status
const groupedTasks = {
  'to-do': [{ id: '1', ... }],
  'in-progress': [{ id: '2', ... }],
  'done': [{ id: '3', ... }]
}
```

### 5.2 Rendering Kanban Columns

**TaskList.tsx Component:**
```typescript
const statuses = ['to-do', 'in-progress', 'done'];

return (
  <div className="kanban-board">
    {statuses.map(status => (
      <KanbanColumn 
        key={status}
        status={status}
        tasks={tasks.filter(t => t.status === status)}
      />
    ))}
  </div>
);

// KanbanColumn shows:
// ┌─────────────────────┐
// │ To Do (3 tasks)     │
// │ ┌─────────────────┐ │
// │ │ Task Card       │ │
// │ │ Priority: HIGH  │ │
// │ │ [Edit] [Delete] │ │
// │ └─────────────────┘ │
// └─────────────────────┘
```

### 5.3 Status Update Flow

**When user drags task or clicks status button:**
```typescript
const handleStatusChange = async (taskId: string, newStatus: string) => {
  // 1. Update Redux
  await dispatch(updateTask({ id: taskId, status: newStatus }));
  
  // 2. Redux calls PUT /api/tasks/[id] with { status: newStatus }
  
  // 3. Backend verifies user owns task, updates storage
  
  // 4. Frontend gets response, updates Redux state
  
  // 5. Component re-renders, task moves to new column
}
```

---

## Part 6: Authentication & Security

### 6.1 JWT Token Implementation

**Token Generation (Backend):**
```typescript
import { sign } from 'jsonwebtoken';

const token = sign(
  { sub: userId, email: user.email },
  process.env.SECRET_KEY!,
  { expiresIn: '7d' } // Expires in 7 days
);
```

**Token Storage (Frontend):**
```typescript
localStorage.setItem('auth_token', token); // HTTP header uses this
```

**Token Verification (Backend):**
```typescript
import { verify } from 'jsonwebtoken';

const token = request.headers.get('authorization')?.split(' ')[1];
const decoded = verify(token, process.env.SECRET_KEY!);
const userId = decoded.sub; // Extract user ID
```

**Token Used in Every Request:**
```typescript
// Redux thunk adds authorization header
const response = await fetch('/api/projects', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`, // JWT token here
    'Content-Type': 'application/json'
  }
});
```

### 6.2 Password Security

**Hashing (Backend):**
```typescript
import bcryptjs from 'bcryptjs';

const hashedPassword = await bcryptjs.hash(password, 10);
// Store hashedPassword in storage, NOT plaintext
```

**Verification (Backend):**
```typescript
const isValid = await bcryptjs.compare(inputPassword, storedHash);
// Never compare plaintext to plaintext
```

**Why This Matters:**
- If `.data/storage.json` is leaked, passwords can't be used
- Each password has unique hash (bcryptjs adds salt)
- Attackers can't reverse the hash

---

## Part 7: Data Synchronization

### 7.1 Sync Strategy

**Client-Server Sync Happens In Two Ways:**

**A) Automatic (localStorage → Redux)**
```typescript
// On app initialization
useEffect(() => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('auth_user');
  
  // Restore state from localStorage
  dispatch(setAuth({ token, user }));
}, []);
```

**B) On-Demand (API → Redux → localStorage)**
```typescript
// When user navigates to dashboard
useEffect(() => {
  dispatch(fetchProjects()); // GET /api/projects
}, []);

// Redux thunk automatically saves to localStorage
```

### 7.2 Conflict Resolution

**What if data differs between client and server?**

**Server is Source of Truth:**
```typescript
// Frontend always fetches latest from server
const handleRefresh = () => {
  dispatch(fetchProjects()); // Overwrites local cache
}
```

**localStorage is only for:**
- Auth token (never changes server-side)
- Temporary UI state while offline
- Performance optimization (read before API call)

---

## Part 8: Example: Complete Project Creation Flow

### 8.1 Step-by-Step Walkthrough

**User clicks "Add Project" → Dialog opens**
```typescript
// components/projects/AddProjectDialog.tsx
const [open, setOpen] = useState(false);
const [formData, setFormData] = useState({ name: '', description: '' });
```

**User types project name: "Website Redesign"**
```typescript
handleChange({ target: { name: 'name', value: 'Website Redesign' } });
// formData.name = 'Website Redesign' (19 chars < 80 limit, allowed)
// Character counter shows: "19/80 characters"
```

**User types description: "Modernize company website..."**
```typescript
handleChange({ target: { name: 'description', value: '...' } });
// formData.description updated (150 chars < 400 limit, allowed)
// Character counter shows: "150/400 characters"
```

**User clicks "Create Project"**
```typescript
// Step 1: Real-time validation
const titleError = validateProjectTitle('Website Redesign');
const descError = validateProjectDescription('Modernize...');
// Both return empty string (valid), so continue

// Step 2: Dispatch Redux thunk
dispatch(createProject({ 
  name: 'Website Redesign',
  description: 'Modernize company website'
}));
```

**Redux Thunk Executes:**
```typescript
// store/slices/projectsSlice.ts
export const createProject = createAsyncThunk(
  'projects/create',
  async (data, { getState }) => {
    const state = getState().auth;
    const token = state.token;
    
    // API call with Authorization header
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: data.name,
        description: data.description
      })
    });
    
    return response.json();
  }
);
```

**Backend Receives Request:**
```typescript
// app/api/projects/route.ts
export async function POST(request: Request) {
  // 1. Extract JWT token
  const token = request.headers.get('authorization')?.split(' ')[1];
  const decoded = verify(token, SECRET_KEY);
  const userId = decoded.sub;
  
  // 2. Parse request body
  const { title, description } = await request.json();
  
  // 3. Server-side validation
  if (!title || title.length > 80) throw new Error('Invalid title');
  if (!description || description.length > 400) throw new Error('Invalid description');
  
  // 4. Load storage from file
  let storage = loadStorage(); // Reads from .data/storage.json
  
  // 5. Create new project object
  const newProject = {
    id: generateUUID(),
    userId: userId,
    title: title,
    description: description,
    createdAt: new Date().toISOString()
  };
  
  // 6. Add to storage
  storage.projects.push(newProject);
  
  // 7. Persist to file
  persistStorage(storage); // Writes to .data/storage.json
  
  // 8. Return response
  return NextResponse.json({ success: true, data: newProject });
}
```

**Backend Stores Data:**
```json
// .data/storage.json (updated)
{
  "projects": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-123",
      "title": "Website Redesign",
      "description": "Modernize company website",
      "createdAt": "2026-01-29T14:30:00Z"
    }
  ]
}
```

**Redux Updates State:**
```typescript
// Reducer handles API response
case createProject.fulfilled:
  state.projects.push(action.payload.data);
  state.isLoading = false;
  // Also saves to localStorage automatically
```

**Frontend Updates:**
```typescript
// Component re-renders
<ProjectList projects={projects} /> // Now includes new project
```

**User Sees:**
- Dialog closes
- New project appears in dashboard
- "Project created successfully" toast
- localStorage has new project in `projects` key
- `.data/storage.json` on server has new project

---

## Part 9: Interview Talking Points

### 9.1 Architecture Decisions

**Q: Why file-based storage instead of a database?**
> "For development and prototyping, file-based JSON storage is perfect. It's easy to understand, doesn't require external infrastructure, and survives server hot-reloads. In production, we'd swap `.data/storage.json` with a database like PostgreSQL without changing the API layer, because all database logic is abstracted in `lib/storage.ts`."

**Q: Why Redux Toolkit?**
> "Redux provides a single source of truth for app state. It's easier to debug, test, and trace data flow. Redux Toolkit reduces boilerplate with createSlice and createAsyncThunk. We get automatic localStorage sync which improves performance."

**Q: Why three layers of validation?**
> "User experience + security. Layer 1 (UI) prevents invalid input before they finish typing. Layer 2 (submit) fails fast without network request. Layer 3 (server) is security - never trust frontend, always validate on backend. This is a best practice."

**Q: Why Kanban board instead of list?**
> "Kanban is industry-standard for task management (Jira, Trello). It visualizes workflow (to-do → in-progress → done) and makes status changes obvious. Users intuitively understand it."

### 9.2 Data Flow Explanation

**Q: Walk me through creating a task.**
> "User fills form with title, description, priority. Frontend validates character limits in real-time, preventing over-limit input. On submit, we validate again before API call. Redux thunk adds JWT token to Authorization header and POSTs to `/api/tasks`. Backend verifies token, loads storage from file, validates data, creates task object with auto-generated ID, adds to storage array, persists to `.data/storage.json`, returns response. Redux updates state and localStorage. Component re-renders, task appears in appropriate Kanban column."

**Q: How do you ensure data persists?**
> "We have dual persistence. On frontend: localStorage stores auth token and cached data. On backend: `.data/storage.json` stores authoritative data. When user reloads page, localStorage restores immediately (fast), then API fetches fresh data (accurate). If server restarts, data is still in file. If frontend reloads, data still in storage. Both always sync via API."

### 9.3 Security Considerations

**Q: How do you handle authentication?**
> "We use JWT tokens with 7-day expiration. After user signs up/in, backend generates a signed token containing user ID. Token stored in localStorage, sent in Authorization header for all protected requests. Backend verifies token signature on each request - if invalid/expired, returns 401. Password never stored plaintext - hashed with bcryptjs."

**Q: What if localStorage is cleared?**
> "User gets logged out, redirected to signin page. Next API request will fail (no Authorization header). User must sign in again. This is expected behavior."

---

## Part 10: Development Workflow

### 10.1 Adding a New Feature

**Example: Add "due date" field to tasks**

1. **Update Storage Structure**
   - Add `dueDate: string` to task object in `.data/storage.json`

2. **Update Redux**
   - Add `dueDate` to tasksSlice state
   - Update createTask thunk to include dueDate
   - Update updateTask thunk to handle dueDate updates

3. **Update API**
   - Modify `POST /api/tasks` to accept dueDate
   - Modify `PUT /api/tasks/[id]` to update dueDate
   - Add server-side validation (date in future, etc.)

4. **Update UI**
   - Add DatePicker to AddTaskDialog
   - Display due date on TaskCard
   - Add due date to TaskList filters (overdue, due soon, etc.)

5. **Test**
   - Create task with due date
   - Refresh page (verify localStorage + file persistence)
   - Edit task due date
   - Delete task
   - Check `.data/storage.json` has new field

### 10.2 Debugging

**Check localStorage:**
```javascript
localStorage.getItem('auth_token')
localStorage.getItem('projects')
JSON.parse(localStorage.getItem('projects'))
```

**Check server storage:**
```bash
cat .data/storage.json
```

**Check Redux state:**
```javascript
// React DevTools Redux extension
// Or add console.log in reducers
```

**Check API response:**
```bash
# Network tab in browser DevTools
# Or curl command:
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/projects
```

---

## Summary

This application demonstrates **full-stack development** with:
- ✅ **Frontend:** React + Redux for state management, Material-UI for components
- ✅ **Backend:** Next.js API routes with file-based persistence
- ✅ **Authentication:** JWT tokens + bcryptjs password hashing
- ✅ **Data Persistence:** Dual-layer (localStorage + file system)
- ✅ **Validation:** Three-layer (UI + submit + server)
- ✅ **UX:** Kanban board, real-time feedback, character counters

The architecture is **production-ready** in structure but uses file-based storage for development. In production, swap `lib/storage.ts` functions to query a real database while keeping the rest of the code unchanged.
