# PREPNMCN.COM Implementation Plan

This document outlines the step-by-step implementation of PREPNMCN.COM features. Check off completed items as we progress.

## Phase 0: Setup and Infrastructure (Current)

- [x] Scaffold Next.js TypeScript project
- [x] Install dependencies (Next.js, TypeScript, Tailwind, ESLint)
- [x] Set up TypeORM with PostgreSQL
- [x] Configure database connection (add .env with DB credentials)
- [x] Create initial entities (User, etc.)
- [x] Set up authentication (NextAuth.js or Clerk)
- [x] Run initial migration

## Phase 1: Core Infrastructure and User Management

### 1. Enforce Institution Name Compliance

- [x] Update User entity: Add `institutionName` field (string, uppercase validation)
- [x] Create institution validation service (regex + whitelist)
- [x] Update registration form: Add institution field with validation
- [x] Update login: Check compliance, deny if invalid
- [x] Add profile update page for non-compliant users
- [x] Test: Register with valid/invalid institution names

### 2. Fix Feedback Page

- [x] Inspect current feedback page (`src/app/feedback/page.tsx`)
- [x] Create Feedback entity (userId, message, timestamp)
- [x] Create API route: `src/app/api/feedback/route.ts` (POST)
- [x] Update feedback form: Handle submission, show success/error
- [ ] Add feedback widget to dashboard (persistent)
- [ ] Test: Submit feedback, verify DB storage

### 3. Fix Leaderboard by University

- [x] Update User entity: Ensure institutionName is indexed
- [x] Create leaderboard API: Aggregate by institution (sum points)
- [x] Update leaderboard page: Display by university, not individual
- [x] Add ranking logic (points desc, then alphabetical)
- [x] Test: Add sample users, verify ranking

### 4. Admin Dashboard: Download Student Bios

- [x] Create AdminBio entity or query existing User data
- [x] Create API: `src/app/api/admin/bios/route.ts` (GET, admin-only)
- [x] Install docx/pdf library (e.g., `npm install docx`)
- [x] Generate Word/PDF file with bios (name, institution, email, regDate, alphabetical)
- [x] Add download button on admin dashboard
- [ ] Test: Download file, verify data

## Phase 2: User Engagement and Study Tools

### 5. Personal Study Planner

- [x] Personal Study Planner
- [ ] Create planner page: `src/app/planner/page.tsx`
- [ ] Add form: Input exam date, subjects
- [ ] Implement timetable generation algorithm (divide days, allocate slots)
- [ ] Display calendar view with tasks
- [ ] Test: Generate timetable for sample input

### 6. Progress Tracker

- [ ] Create Progress entity (userId, planId, completion%, daysLeft, streaks)
- [ ] Integrate into planner/dashboard
- [ ] Add UI: Progress bars, streak badges
- [ ] Real-time updates with hooks
- [ ] Test: Track progress, calculate metrics

### 7. Resource Library

- [ ] Create Resource entity (title, type, topic, level, fileUrl)
- [ ] Set up file storage (AWS S3 or Vercel Blob)
- [ ] Create resources page: `src/app/resources/page.tsx`
- [ ] Add upload (admin-only) and display with filters
- [ ] Support PDFs, videos, notes
- [ ] Test: Upload/download resources

### 8. Gamification

- [ ] Update User entity: Add points, badges, streaks
- [ ] Create Challenge entity (type, reward)
- [ ] Add XP system: Earn points for tasks
- [ ] Implement badges (e.g., streak milestones)
- [ ] Weekly challenges
- [ ] Test: Earn points, unlock badges

### 9. Certificate of Completion

- [ ] Install PDF library (e.g., `npm install pdfkit`)
- [ ] Create certificate generation function
- [ ] Add download/share on plan completion
- [ ] Test: Generate certificate

### 10. Motivational Pop-ups/Reminders

- [ ] Create messages DB/array
- [ ] Add pop-up component (timed)
- [ ] Add sidebar for reminders
- [ ] Test: Trigger pop-ups

## Phase 3: Social and Community Features

### 11. Discussion Forums

- [ ] Create Thread/Post entities (university, userId, title, content, replies)
- [ ] Create forum pages: `src/app/forums/[university]/page.tsx`
- [ ] Add create thread/reply UI
- [ ] Moderation features (admin)
- [ ] Test: Create threads, interact

### 12. Study Buddy Matching

- [ ] Create Buddy entity (user1, user2, matchCriteria)
- [ ] Matching algorithm (university, goals)
- [ ] Buddies page: `src/app/buddies/page.tsx`
- [ ] Integrate chat (WebSockets or external)
- [ ] Test: Match users, chat

## Phase 4: Admin and Analytics

### 13. About Us Section

- [ ] Create about page: `src/app/about/page.tsx`
- [ ] Add founders, testimonials, social links
- [ ] Testimonial carousel
- [ ] Test: Navigate, links work

### 14. Email Notifications

- [ ] Install email service (e.g., `npm install resend`)
- [ ] Create notification service
- [ ] Set up cron jobs for reminders (day 1, 10, 30)
- [ ] Test: Send emails

### 15. Engagement Analytics

- [ ] Install charting library (e.g., `npm install recharts`)
- [ ] Create analytics API: Aggregate completion data
- [ ] Add charts to admin dashboard
- [ ] Test: View metrics

## Phase 5: Main Sections Implementation

### Pathways

- [ ] Create Pathway entity (name, levels, assessments, payment)
- [ ] Implement RN Pathway: Weekly/Monthly/Mock (Paper1/2), ₦1,500/month
- [ ] Implement RM Pathway: Similar structure
- [ ] Implement RPHN Pathway: Similar
- [ ] Implement NCLEX: Monthly ₦20,000, unlimited questions
- [ ] Implement Online Distance Learning: ₦2,000/month
- [ ] Implement Specialty/Post Basic: ₦2,000/month
- [ ] Implement Undergraduate (100-300 Level): ₦1,000/month each

### Research

- [ ] Create Research entity (type, package, payment)
- [ ] Undergraduate Research: Full ₦40,000, Partial ₦20,000
- [ ] Postgraduate: Flexible for thesis/dissertation/publication

### O'Level and JAMB

- [ ] Create OLevelJamb entity
- [ ] O'Level: Weekly/Monthly/Mock, ₦40,000 one-time or installments
- [ ] JAMB: Similar, ₦30,000 or installments

### Research Consultation

- [ ] Add consultation booking/feature, flexible payment

### Future Services

- [ ] Placeholder page for coming soon

## Phase 6: Testing, Optimization, Launch

- [ ] Unit tests (Jest)
- [ ] E2E tests (Playwright)
- [ ] Performance optimization
- [ ] SEO/Accessibility
- [ ] Security audit
- [ ] Deploy to Vercel
- [ ] Monitor with Sentry

## Phase 2: Authentication and User Management

- [ ] Implement user registration/login
  - [ ] Set up NextAuth.js or Clerk
  - [ ] Create login/register pages
  - [ ] Enforce institution name compliance (uppercase, full name)
- [ ] User profile management
  - [ ] Update profile page
  - [ ] Institution validation
- [ ] Role-based access (student, admin)

## Phase 3: Main Sections Implementation

- [ ] Pathways Section
  - [ ] RN Pathway page with assessments and payment
  - [ ] RM Pathway page
  - [ ] RPHN Pathway page
  - [ ] NCLEX Pathway page
  - [ ] Online Distance Learning page
  - [ ] Specialty/Post Basic page
  - [ ] Undergraduate sections (100-300 level)
- [ ] Research Section
  - [ ] Undergraduate Research page
  - [ ] Postgraduate Research page
- [ ] O'Level and JAMB Section
  - [ ] O'Level page (WAEC/NECO)
  - [ ] JAMB page
- [ ] Research Consultation Session page
- [ ] Future Services placeholder

## Phase 4: Core Features

- [ ] Fix Feedback Page
  - [ ] Update form and API
  - [ ] Test submission
- [ ] Fix Leaderboard
  - [ ] Aggregate by university
  - [ ] Update UI
- [ ] Admin Dashboard
  - [ ] Download student bios feature
  - [ ] Engagement analytics
- [ ] Study Planner
  - [ ] Timetable generation
  - [ ] Progress tracker (% completion, streaks)
- [ ] Resource Library
  - [ ] Upload/display past questions, videos, notes
- [ ] Discussion Forums
  - [ ] Per-university forums
- [ ] Study Buddy Matching
- [ ] Gamification (XP, badges, challenges)
- [ ] Certificate of Completion
- [ ] Feedback Widget
- [ ] Motivational Pop-ups/Reminders
- [ ] Email Notifications

## Phase 5: UI/UX and Polish

- [ ] About Us Section
  - [ ] Founders, testimonials, social links
- [ ] Responsive design with Tailwind
- [ ] Accessibility improvements
- [ ] Performance optimization

## Phase 6: Testing and Deployment

- [ ] Unit tests for components
- [ ] E2E tests with Playwright
- [ ] Security audit
- [ ] Deploy to Vercel
- [ ] Set up monitoring (Sentry)

## Notes

- Use the main sections structure for navigation and routing.
- Prioritize user compliance and payment integration.
- Test each feature thoroughly before marking complete.
- Update this file as we progress.
