# Task Manager Dashboard

A modern, fully-featured task management application built with Next.js, Redux Toolkit, Material-UI, and TailwindCSS. Manage your projects and tasks with an intuitive, responsive interface.

## 🚀 Features

- **User Authentication**: Secure sign up and sign in with JWT tokens
- **Project Management**: Create, view, update, and delete projects
- **Task Management**: Create, update, delete, and organize tasks by status
- **Task Status Tracking**: Track tasks across To Do, In Progress, and Done states
- **Priority Levels**: Set task priority (Low, Medium, High)
- **Due Dates**: Assign due dates to tasks
- **Responsive Design**: Fully mobile-responsive interface
- **Modern UI**: Material-UI components with TailwindCSS styling
- **State Management**: Redux Toolkit for efficient state management

## 📋 Tech Stack

- **Frontend Framework**: Next.js 16 with App Router
- **State Management**: Redux Toolkit + React-Redux
- **UI Components**: Material-UI (MUI)
- **Styling**: TailwindCSS v4
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Data Persistence**: Browser localStorage
- **Date Handling**: date-fns
- **Language**: TypeScript

## 🎯 Quick Start Guide

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For cloning the repository

### Installation & Setup

#### Step 1: Download/Clone the Project
```bash
# If you have the ZIP file, extract it first
# Or if using git:
git clone <repository-url>
cd task-manager-dashboard
```

#### Step 2: Install Dependencies
```bash
npm install
```
This command will install all required packages including:
- Next.js 16
- React 19
- Redux Toolkit
- Material-UI
- TailwindCSS
- And other dependencies

**Estimated time**: 2-5 minutes (depending on internet speed)

#### Step 3: Start Development Server
```bash
npm run dev
```

**Output will show:**
```
  ▲ Next.js 16.0.10
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

#### Step 4: Open in Browser
- Open your browser and go to: **http://localhost:3000**
- You will see the Task Manager Dashboard home page
- Click "Sign Up" to create a new account
- Or if you already have an account, click "Sign In"

### Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Run linting/code quality check
npm run lint

# Use different port (e.g., 3001 instead of 3000)
npm run dev -- -p 3001
```

### Testing the Application

1. **Create an Account**
   - Go to http://localhost:3000/signup
   - Enter email, name, and password
   - Click "Sign Up"

2. **Sign In**
   - Go to http://localhost:3000/signin
   - Enter your email and password
   - Click "Sign In"

3. **Create a Project**
   - Click "New Project" button on dashboard
   - Enter project name and description
   - Click "Create"

4. **Manage Tasks**
   - Click on a project to view tasks
   - Click "New Task" to create a task
   - Set task title, description, priority, due date
   - Change task status by clicking status dropdown

### Troubleshooting

**Issue: "npm: command not found"**
- Solution: Install Node.js from https://nodejs.org/

**Issue: Port 3000 already in use**
- Solution: Use a different port: `npm run dev -- -p 3001`

**Issue: Dependencies installation fails**
- Solution: Clear npm cache and try again:
  ```bash
  npm cache clean --force
  npm install
  ```

**Issue: Changes not reflecting in browser**
- Solution: Clear browser cache or do hard refresh (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac)

### Project Files After Installation

After `npm install`, you'll have:
- `/node_modules/` - All dependencies installed
- `/app/` - Next.js pages and API routes
- `/components/` - React components
- `/store/` - Redux state management
- `/lib/` - Utility functions
- `package.json` - Project configuration and dependencies

### Important Notes

- **Data Storage**: All data is stored in browser's localStorage
- **Authentication**: Uses JWT tokens stored in localStorage
- **No Backend Database**: This is a frontend-only demo with localStorage
- **Browser Data**: Data persists only in the current browser
- **Multiple Browsers**: Each browser has separate data

### Deployment

To deploy to production:

```bash
# 1. Build the project
npm run build

# 2. Start production server
npm start

# Or deploy to Vercel:
# 1. Push code to GitHub
# 2. Import repository on vercel.com
# 3. Vercel automatically builds and deploys
```

## 📁 Project Structure

```
task-manager-dashboard/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.ts
│   │   │   └── signin/route.ts
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── tasks/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── projects/[id]/page.tsx
│   ├── signup/page.tsx
│   ├── signin/page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── providers.tsx
├── components/
│   ├── auth/
│   │   ├── SignupForm.tsx
│   │   └── SigninForm.tsx
│   ├── dashboard/
│   │   └── DashboardHeader.tsx
│   ├── projects/
│   │   ├── ProjectList.tsx
│   │   └── AddProjectDialog.tsx
│   └── tasks/
│       ├── TaskList.tsx
│       ├── AddTaskDialog.tsx
│       └── EditTaskDialog.tsx
├── store/
│   ├── index.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── projectsSlice.ts
│       └── tasksSlice.ts
├── lib/
│   ├── auth.ts
│   └── storage.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Authentication Flow

### Sign Up
1. User provides email, name, and password
2. Password is hashed using bcryptjs
3. User is stored in localStorage
4. JWT token is generated and stored
5. User is redirected to dashboard

### Sign In
1. User provides email and password
2. Password is verified against stored hash
3. JWT token is generated
4. User is authenticated and redirected to dashboard

### Token Management
- Tokens are stored in localStorage with key `token`
- Tokens expire after 7 days
- User session is restored on page reload if valid token exists

## 📊 Database Structure

Data is persisted in browser's localStorage with the following structure:

### Users
```json
{
  "id": "timestamp",
  "email": "user@example.com",
  "name": "User Name",
  "passwordHash": "hashed_password"
}
```

### Projects
```json
{
  "id": "timestamp",
  "name": "Project Name",
  "description": "Project description",
  "userId": "user_id",
  "createdAt": "ISO_timestamp",
  "updatedAt": "ISO_timestamp"
}
```

### Tasks
```json
{
  "id": "timestamp",
  "projectId": "project_id",
  "title": "Task Title",
  "description": "Task description",
  "status": "todo|in-progress|done",
  "priority": "low|medium|high",
  "dueDate": "ISO_date|null",
  "createdAt": "ISO_timestamp",
  "updatedAt": "ISO_timestamp"
}
```

## 🏃 Getting Started

### Prerequisites
- Node.js 18+ or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   # Create .env.local file
   # JWT_SECRET=your-secret-key-here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   - Navigate to `http://localhost:3000`
   - You'll be redirected to sign in page

### Build for Production
```bash
npm run build
npm start
```

## 👤 Usage

### Creating an Account
1. Click "Sign Up" on the landing page
2. Enter your name, email, and password
3. Confirm your password
4. Click "Create Account"

### Managing Projects
1. After login, go to "My Projects" dashboard
2. Click "New Project" button
3. Enter project name and description
4. Click "Create Project"
5. Click on a project to view and manage its tasks

### Managing Tasks
1. Open a project from the dashboard
2. Click "New Task" button
3. Enter task title, description, priority, and due date
4. Click "Create Task"
5. Move tasks between statuses using status buttons
6. Edit or delete tasks using the action buttons

## 🔄 Redux State Structure

```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  projects: {
    projects: Project[],
    currentProject: Project | null,
    isLoading: boolean,
    error: string | null
  },
  tasks: {
    tasks: Task[],
    isLoading: boolean,
    error: string | null
  }
}
```

## 🎨 UI/UX Features

- **Responsive Grid Layout**: Projects displayed in 1-3 column grid based on screen size
- **Task Organization**: Tasks grouped by status (To Do, In Progress, Done)
- **Color-Coded Priorities**: Visual indicators for task priority levels
- **Loading States**: Spinner animations during API calls
- **Modal Dialogs**: Clean forms for creating and editing items
- **User Menu**: Profile information and sign out option
- **Smooth Transitions**: Hover effects and animations throughout

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Token-based authentication system
- **Protected Routes**: API endpoints require valid JWT token
- **Input Validation**: Client and server-side validation
- **XSS Protection**: React's built-in XSS prevention

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Components adapt layout using TailwindCSS responsive prefixes:
- `sm:` for tablets and up
- `md:` for medium screens and up
- `lg:` for large screens and up

## 🚀 Future Enhancements

- [ ] Team collaboration features
- [ ] Task comments and mentions
- [ ] File attachments
- [ ] Task templates
- [ ] Advanced filtering and search
- [ ] Dark mode
- [ ] Real-time notifications
- [ ] Export to PDF/CSV
- [ ] Integration with calendar apps
- [ ] Mobile app (React Native)

## 🐛 Troubleshooting

### Can't log in
- Clear browser cache and localStorage
- Ensure you've created an account first
- Check browser console for error messages

### Tasks not appearing
- Verify you're on the correct project page
- Refresh the page
- Check browser localStorage in DevTools

### Styling issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Next.js cache: `rm -rf .next && npm run dev`

## 📞 Support

For issues and questions, please create an issue in the repository or contact the development team.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Development

### Available Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Run production build
npm start

# Linting
npm run lint
```

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create a Pull Request

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Material-UI Documentation](https://mui.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ using modern web technologies**
