# 🚀 Thrink - AI-Powered Project Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **Complete project management lifecycle platform with AI-powered assistance**

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Development Tools](#development-tools)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**Thrink** is a comprehensive project management application that covers the entire project lifecycle from initiation to completion. Built entirely on Supabase with AI-powered assistance through OpenRouter.ai integration, Thrink provides teams with real-time collaboration, intelligent insights, and complete project tracking capabilities.

### Key Highlights

- **🔄 Complete Lifecycle Management**: From project initiation to completion
- **🤖 AI-Powered Assistance**: Tink AI assistant powered by OpenRouter.ai
- **⚡ Real-Time Collaboration**: Live updates across all team members
- **📊 Database-Driven Analytics**: All metrics pull from live Supabase data
- **🔒 Enterprise Security**: Built on Supabase's secure platform
- **📱 Responsive Design**: Works seamlessly across all devices

## ✨ Features

### 🏢 Workspace Management
- Multi-workspace support with secure user access
- Role-based permissions and team management
- Workspace-specific project isolation
- Real-time workspace switching

### 📊 Real-Time Dashboard
- **Active Projects**: Live count of planning and in-progress projects
- **Team Members**: Real-time resource assignment tracking
- **Budget Utilization**: Live budget health monitoring
- **Completed This Month**: Monthly completion metrics
- **Average Project Duration**: Calculated from project data
- **Upcoming Deadlines**: Task deadline tracking
- **Performance Indicators**: Project success metrics (Coming Soon)

### 📋 Project Management
- **Interactive Gantt Charts**: Task dependencies and critical path analysis
- **Real-Time Task Boards**: Drag-and-drop Kanban functionality
- **Advanced Rebaseline Management**: Project adjustment capabilities
- **Project Health Monitoring**: Risk assessment and alerts
- **Stakeholder Management**: Communication and approval workflows

### 👥 Resource Management
- **Team Member Profiles**: Skills, availability, and performance tracking
- **Real-Time Utilization**: Live resource allocation monitoring
- **Project Assignment**: Workload management and optimization
- **Performance Metrics**: Availability calculations and reporting
- **Skill-Based Allocation**: Intelligent resource matching

### 🔄 Advanced Features
- **Real-Time Collaboration**: Instant updates across all team members
- **Issue Tracking**: Centralized problem resolution management
- **Document Management**: Version control and file organization
- **Audit Trails**: Complete project history and change tracking
- **Escalation Management**: Automated alert systems

### 🤖 AI-Powered Assistance (Tink AI)

#### OpenRouter.ai Integration
- **Offline Mode**: Local AI processing for sensitive data
- **Online Mode**: Cloud-based AI for enhanced capabilities
- **Context-Aware Support**: Understands project context and team dynamics
- **Intelligent Recommendations**: Resource allocation, risk mitigation, and optimization

#### AI Assistant Features
- **Project Guidance**: Step-by-step project management assistance
- **Risk Analysis**: AI-powered risk identification and mitigation strategies
- **Resource Optimization**: Intelligent resource allocation recommendations
- **Documentation Help**: Automated report generation and documentation support
- **Real-Time Support**: Instant answers to project management queries

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI framework with hooks and context
- **TypeScript**: Type-safe development and better IDE support
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Radix UI**: Accessible component library (Select, Tabs, Dialog, Switch)
- **Recharts**: Data visualization and analytics charts
- **Vite**: Fast build tool and development server

### Backend & Infrastructure
- **Supabase**: Complete backend-as-a-service platform
  - **PostgreSQL**: Robust relational database
  - **Real-time Subscriptions**: Live data synchronization
  - **Row Level Security (RLS)**: Enterprise-grade security
  - **Edge Functions**: Serverless computing for complex operations
  - **Authentication**: Built-in user management and auth
- **Event Bus Pattern**: Real-time communication between services

### AI & Intelligence
- **OpenRouter.ai**: Powers Tink AI assistant with intelligent project management support
- **Context-Aware Processing**: AI understands project context and team dynamics
- **Multi-Modal Support**: Text, code, and data analysis capabilities

### Development Tools
- **Lovable**: Primary tool for developing React components, context providers, and custom hooks
- **Cursor**: Comprehensive code review, refactoring, and development assistance
- **Claude AI**: Documentation generation, technical writing, and knowledge management

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Supabase Account** (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd thrink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. **Database Setup**
   - Run Supabase migrations in the `supabase/migrations/` directory
   - Set up Row Level Security policies
   - Configure real-time subscriptions

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:8080`

### Development Workflow

1. **Using Lovable** (Recommended)
   - Visit [Lovable Project](https://lovable.dev/projects/bb45fe55-9940-4055-a46f-2de2effdefa7)
   - Make changes through the Lovable interface
   - Changes are automatically committed to the repository

2. **Using Local IDE**
   - Clone the repository locally
   - Make changes in your preferred IDE
   - Push changes to sync with Lovable

3. **Using Cursor**
   - Open the project in Cursor for AI-assisted development
   - Leverage Cursor's code review and refactoring capabilities

## 📁 Project Structure

```
thrink/
├── src/
│   ├── components/           # React components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── project-management/ # Project management components
│   │   ├── analytics/        # Analytics and reporting components
│   │   └── ui/              # Reusable UI components
│   ├── contexts/            # React context providers
│   │   ├── ProjectContext.tsx
│   │   ├── ResourceContext.tsx
│   │   ├── TaskContext.tsx
│   │   └── WorkspaceContext.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useProject.ts
│   │   ├── useResources.ts
│   │   ├── useTaskManagement.ts
│   │   └── useAIDashboardData.ts
│   ├── services/            # Business logic services
│   │   ├── ProjectRebaselineService.ts
│   │   ├── AvailabilityCalculationService.ts
│   │   └── DataPersistenceService.ts
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Projects.tsx
│   │   ├── ProjectManagement.tsx
│   │   ├── Resources.tsx
│   │   └── Stakeholders.tsx
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── integrations/        # External service integrations
│       └── supabase/
├── supabase/
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge functions
├── public/                  # Static assets
└── docs/                   # Documentation
```

## 🗄️ Database Schema

### Core Tables

#### `projects`
- Project management with status, timeline, and metadata
- Real-time updates and collaboration features

#### `project_tasks`
- Task management with dependencies and assignments
- Status tracking and progress monitoring

#### `resources`
- Team member profiles with skills and availability
- Performance metrics and utilization tracking

#### `performance_profiles`
- Performance tracking and analytics
- Success metrics and historical data

#### `rebaseline_history`
- Audit trail for project adjustments
- Change tracking and approval workflows

### Key Relationships
- Projects ↔ Tasks (One-to-Many)
- Projects ↔ Resources (Many-to-Many)
- Tasks ↔ Resources (Many-to-Many)
- Workspaces ↔ Projects (One-to-Many)

## 📚 API Documentation

### Supabase Integration

#### Authentication
```typescript
// User authentication
const { user, session } = await supabase.auth.getUser()
```

#### Real-time Subscriptions
```typescript
// Subscribe to project updates
const subscription = supabase
  .channel('projects')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, handleChange)
  .subscribe()
```

#### Database Operations
```typescript
// Fetch projects with real-time data
const { data: projects, error } = await supabase
  .from('projects')
  .select('*')
  .eq('workspace_id', workspaceId)
```

### Custom Hooks

#### useProject
```typescript
const { projects, loading, error, addProject, updateProject } = useProject()
```

#### useResources
```typescript
const { resources, loading, error, assignToProject } = useResources()
```

#### useTaskManagement
```typescript
const { tasks, loading, error, createTask, updateTask } = useTaskManagement()
```

## 🚀 Deployment

### Lovable Deployment
1. Open [Lovable Project](https://lovable.dev/projects/bb45fe55-9940-4055-a46f-2de2effdefa7)
2. Click **Share → Publish**
3. Your application will be deployed automatically

### Custom Domain Setup
1. Navigate to **Project > Settings > Domains**
2. Click **Connect Domain**
3. Follow the DNS configuration instructions

### Environment Variables
Ensure the following environment variables are set in production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENROUTER_API_KEY`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Write comprehensive tests
- Update documentation as needed
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the powerful backend-as-a-service platform
- **OpenRouter.ai** for AI-powered assistance capabilities
- **Lovable** for rapid frontend development
- **Cursor** for intelligent code review and development assistance
- **Claude AI** for comprehensive documentation support

## 📞 Support

For support and questions:
- **Documentation**: Check the docs folder
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

---

**Built with ❤️ using modern AI-powered development tools**
