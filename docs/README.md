# Task Management Application

A modern full-stack task management web application built as an internship project using **React, Vite, Tailwind CSS, React Router, and Supabase (Auth, PostgreSQL, Row Level Security)** deployed on **Vercel**.

---

## 1. Project Overview
The Task Management Application is a responsive Single Page Application (SPA) that enables authenticated users to create, view, update, organize, track, and delete personal tasks. The project leverages Supabase as a Backend-as-a-Service (BaaS) for secure user authentication, database persistence, and fine-grained data isolation enforced by PostgreSQL Row Level Security (RLS).

---

## 2. Problem Statement
Users need an intuitive, secure, and accessible platform to organize daily tasks, assign priorities, set completion deadlines, and monitor task completion status. This application addresses that need by providing a responsive, real-time-capable task dashboard with multi-criteria search and filtering.

---

## 3. Core Features
* **User Authentication:** Registration, login, logout, and session persistence via Supabase Auth.
* **Protected Routing:** Client-side route guarding preventing unauthenticated access to the dashboard.
* **Task CRUD Operations:** Complete capability to create, read, update, and delete tasks.
* **Status Management:** Track progress using `TODO`, `IN_PROGRESS`, and `COMPLETED` statuses.
* **Priority Classification:** Organize tasks by `LOW`, `MEDIUM`, and `HIGH` priority levels.
* **Due Date Tracking:** Assign and view completion target dates.
* **Search & Filtering:** Real-time text search and multi-field status/priority filter controls.
* **Dashboard Analytics:** Visual overview metric cards displaying task summary counts.
* **Responsive Layout:** Tailored design for desktop, tablet, and mobile displays.
* **Database Authorization:** Strict Row Level Security (RLS) guaranteeing users can only view and modify their own tasks.

---

## 4. Technology Stack
* **Frontend:** React 18, Vite, Tailwind CSS, Lucide React (Icons)
* **Routing:** React Router v6
* **Backend / BaaS:** Supabase Cloud
* **Authentication:** Supabase Auth
* **Database:** Supabase PostgreSQL
* **Authorization:** PostgreSQL Row Level Security (RLS)
* **Client Library:** `@supabase/supabase-js`
* **Deployment:** Vercel

---

## 5. Architecture

```text
React SPA (Vite + Tailwind CSS)
    ↓
React Router (ProtectedRoute)
    ↓
@supabase/supabase-js Client
    ↓
Supabase Auth (Session Management)
    ↓
Supabase PostgreSQL Database
    ↓
PostgreSQL Row Level Security (auth.uid() = user_id)
```

---

## 6. Suggested Project Structure
```text
Task Management App/
├── docs/                           # Documentation pack
│   ├── 01_SRS_Task_Management_Application.docx
│   ├── 02_SDD_Task_Management_Application.docx
│   ├── 03_REST_API_Documentation.docx
│   ├── 04_Database_Design_Document.docx
│   ├── 05_Test_Plan_and_Report.docx
│   ├── 06_User_Manual.docx
│   ├── 07_Deployment_and_Submission_Guide.docx
│   ├── FINAL_SUBMISSION_CHECKLIST.txt
│   └── README.md
├── supabase/
│   └── schema.sql                  # Database migration & RLS script
├── vercel.json                     # Vercel SPA routing configuration
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── lib/
    │   └── supabase.js             # Supabase client singleton
    ├── context/
    │   └── AuthContext.jsx         # Auth state provider
    ├── services/
    │   └── taskService.js          # Task API service layer
    ├── components/
    │   ├── Navbar.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── DashboardStats.jsx
    │   ├── TaskFilterBar.jsx
    │   ├── TaskList.jsx
    │   ├── TaskCard.jsx
    │   ├── TaskFormModal.jsx
    │   ├── ConfirmDeleteModal.jsx
    │   └── Toast.jsx
    └── pages/
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── DashboardPage.jsx
        └── NotFoundPage.jsx
```

---

## 7. Supabase & Database Setup

Execute the following SQL migration script in your Supabase SQL Editor to create the `tasks` table, indexes, and RLS policies:

```sql
-- 1. Create Tasks Table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')) DEFAULT 'TODO',
    priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')) DEFAULT 'MEDIUM',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Performance Indexes
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX idx_tasks_user_priority ON public.tasks(user_id, priority);

-- 3. Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
CREATE POLICY "Users can view own tasks" 
ON public.tasks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" 
ON public.tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" 
ON public.tasks FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" 
ON public.tasks FOR DELETE 
USING (auth.uid() = user_id);
```

---

## 8. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://<your-supabase-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi... (your-supabase-anon-key)
```

> **IMPORTANT:** Never expose the Supabase `service_role` secret key in client-side code or commit it to version control.

---

## 9. Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

---

## 10. Row Level Security & Defense-in-Depth
The application enforces security at two distinct layers:
1. **Client Layer:** `ProtectedRoute` guards frontend pages and provides seamless navigation UX.
2. **Database Layer (Primary Security):** PostgreSQL Row Level Security (RLS) policies mandate `auth.uid() = user_id` for every query. Direct API attempts to access or mutate another user's tasks are automatically rejected by PostgreSQL.

---

## 11. Testing & Verification
The project includes test plan coverage for 18 core scenarios:
* Authentication flow (registration, login, logout, invalid credentials)
* Protected route guards & session recovery across refresh
* Task CRUD operations & validation
* Search and multi-criteria filtering
* Mobile UI responsiveness
* Explicit cross-user RLS data isolation verification

---

## 12. Deployment to Vercel
1. Push project repository to GitHub.
2. Import project into Vercel.
3. Configure Framework Preset: **Vite**.
4. Configure Environment Variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Deploy and verify.

---

## 13. Internship Submission Checklist
* [x] Synchronized documentation pack in `/docs`
* [ ] Live Vercel application URL
* [ ] GitHub repository URL
* [ ] Database migration script in `supabase/schema.sql`
* [ ] Verification screenshots and test evidence
