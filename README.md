# 🚀 PlacementOS

**PlacementOS** is a premium, all-in-one preparation workspace designed to replace scattered notes and random trackers with a single, focused system for high-stakes interview seasons. Whether you're aiming for Big Tech placements or Sarkari(Government) examinations, PlacementOS provides the clean workflow and analytics you need to stay on track.

![Dashboard Preview](https://github.com/user-attachments/assets/caeb1e8c-843b-4c5c-9c5c-7c0c1737e8c3) *(Replace with actual screenshot if available)*

## ✨ Key Features

- **🎯 Dual-Track Focus**: Specialized workspaces for **Placement** (DSA, Core Subjects) and **Sarkari** (Aptitude, GS) preparation.
- **📊 Progress Analytics**: Visualized tracking of subjects, topics, and subtopics. Spot weak areas quickly with actionable data.
- **🧠 Spaced Repetition**: A built-in revision system (Learned → Revised 1 → 2 → 3 → Final) to ensure high retention for D-day.
- **📚 Integrated Resources**: Attach Videos, LeetCode problems, Articles, and Notes directly to subtopics.
- **⚡ Real-time Updates**: Instant notifications and progress sync across devices powered by Pusher.
- **🔥 Habit Momentum**: Build and maintain streaks with daily targets and overdue visibility.
- **🎨 Premium UI/UX**: A stunning, dark-themed interface built with Tailwind CSS v4, Framer Motion animations, and 3D card effects.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI/UX**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Real-time**: [Pusher](https://pusher.com/)
- **Analytics**: [Recharts](https://recharts.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Instance
- Firebase Project

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/PlacementOS.git
   cd PlacementOS
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   # Database
   MONGODB_URI=your_mongodb_uri

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Pusher
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_SECRET=your_pusher_secret
   NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
   NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster

   # SMTP (Optional for Email Notifications)
   SMTP_HOST=your_smtp_host
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📂 Project Structure

```text
src/
├── app/            # Next.js App Router (Auth, Dashboard, API)
├── components/     # UI Components (Dashboard, Layout, UI, Custom)
├── contexts/       # React Contexts (AuthContext)
├── lib/            # Utility functions & Shared configurations
├── models/         # Mongoose Models (User, Subject, Topic, etc.)
└── data/           # Static data & constants
```

 
