# Project ICI CMS — task.md (Frontend CMS)

## 0. Project Goal

พัฒนา CMS / Backoffice สำหรับระบบ ICI Insurance  
โดยเน้น:

```text
Clean
Soft Corporate
Insurance CRM Style
Fast Workflow
```

และรองรับ MVP ภายใน 1 สัปดาห์

---

# 1. Tech Stack

## Core Stack

```text
Framework: Next.js (App Router)
Language: TypeScript
Styling: TailwindCSS
State: Zustand
Server State: React Query
Form: React Hook Form
Validation: Zod
HTTP Client: Axios
Icons: Lucide React
Table: TanStack Table
Date: Dayjs
```

---

# 2. Frontend Architecture

## Structure

```text
src/
├── app/
├── api/
├── assets/
├── components/
├── constants/
├── features/
├── hooks/
├── lib/
├── middleware/
├── providers/
├── store/
├── styles/
├── types/
└── utils/
```

---

# 3. Feature Structure

```text
features/
├── auth/
├── dashboard/
├── members/
├── policies/
├── policy-categories/
└── news/
```

---

# 4. Shared UI Structure

```text
components/ui/
├── button/
├── input/
├── select/
├── modal/
├── drawer/
├── table/
├── pagination/
├── badge/
├── card/
├── tabs/
├── search/
├── textarea/
├── datepicker/
├── toast/
├── dropdown/
├── tooltip/
├── skeleton/
└── empty-state/
```

---

# 5. Design System

## Color Palette

| Name | Hex |
|---|---|
| Primary Teal | `#07A2A2` |
| Secondary Blue | `#2D7CA4` |
| Accent Orange | `#FF944D` |
| Error Red | `#F44034` |
| Black | `#000000` |
| Dark Grey | `#565656` |
| Light Grey | `#C9C9C9` |
| Light Cyan | `#CDF5F5` |
| White | `#FFFFFF` |

---

# 6. Sidebar Menu

```text
Dashboard
สมาชิก
กรมธรรม์
หมวดหมู่กรมธรรม์
ข่าวประชาสัมพันธ์
```

---

# 7. Core Components

```text
Button
Input
Select
Search Filter
Data Table
Badge
Card
Modal
Pagination
Drawer
Toast
Empty State
Skeleton
```

---

# 8. Frontend Development Plan

## Day 1

```text
- Setup Next.js
- Setup Tailwind
- Setup Layout
- Setup Sidebar
- Setup Theme
```

## Day 2

```text
- Setup Auth
- Setup Middleware
- Setup Axios
- Setup React Query
- Setup Zustand
```

## Day 3

```text
- Shared Components
- Button
- Input
- Table
- Modal
- Badge
```

## Day 4

```text
- Member Feature
- Member Detail
- Policy Card
```

## Day 5

```text
- Policy CRUD
- Category CRUD
- Policy Form
```

## Day 6

```text
- News CRUD
- Publish/Unpublish
- Responsive
```

## Day 7

```text
- QA
- Fix spacing
- Fix responsive
- Prepare demo
```
