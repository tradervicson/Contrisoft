# Contrisoft MVP Modules Roadmap

This document outlines the chronological development modules for the Contrisoft MVP. Each module builds on previous work and defines clear deliverables and dependencies.

## Module 0: Project Setup & Environment Configuration
- **Description:** Initialize the repository, configure the development environment, and set up essential tooling.
- **Deliverables:**
  - Monorepo initialization with Yarn Workspaces
  - ESLint, Prettier, Husky, and lint-staged configuration
  - Supabase project creation and environment variable management
  - CI/CD pipeline skeleton (GitHub Actions workflows)

## Module 1: Chat-Driven Project Creation
- **Description:** Build the smart chat UI to gather hotel basics (city/ZIP, brand, floors, room mix, public areas) in plain English with button shortcuts, and integrate an LLM call to analyze responses and generate a base hotel JSON model.
- **Deliverables:**
  - React chat window component
  - Multiple-choice buttons and input fields
  - Front-end integration with `/api/generate-model` endpoint to invoke the LLM
  - Backend API endpoint to receive and persist responses once the JSON model is generated
- **Dependencies:** React, LLM API integration (OpenAI or similar)

## Module 2: Data Modeling & Supabase Setup
- **Description:** Design and implement the Supabase schema for users, projects and base hotel model using migrations and seed data via the Supabase CLI.
- **Deliverables:**
  - Supabase tables: users, projects, floors, rooms, public_areas defined in SQL migrations
  - Authentication and role-based access
  - SQL migrations and basic seed data managed via `supabase` CLI
- **Dependencies:** Supabase account, Supabase CLI, database migrations tooling

## Module 3: Base Model Generation
- **Description:** Create a serverless function to call the LLM, transform the chat-generated JSON into a validated hotel model and store it in Supabase.
- **Deliverables:**
  - Edge function or serverless worker for LLM orchestration
  - Data transformation and validation logic
  - Integration with Supabase tables
- **Dependencies:** LLM API keys, Supabase edge functions

## Module 4: Projects Dashboard
- **Description:** Build the Projects page listing all projects as cards with status badges and metadata.
- **Deliverables:**
  - React ProjectsList component
  - ProjectCard UI (name, date, status)
  - Routing to project detail view
- **Dependencies:** React Router, Supabase client SDK

## Module 5: Design Tab & Geometry Editor
- **Description:** Implement the Design tab UI for floors, room counts and public-area sliders, and integrate a basic geometry editor (2D/3D stub).
- **Deliverables:**
  - Floors list and room grid components
  - + / – controls for rooms and floors
  - Public area checkboxes with size sliders
  - Placeholder geometry canvas for visual feedback
- **Dependencies:** React state management (Zustand or Redux), basic canvas or Three.js setup

## Module 6: Background Workers & Status Workflow
- **Description:** Set up serverless workers to trigger recalculations, update quantities and status badges (Draft → Needs Re-calc → Costs Ready → Compliant).
- **Deliverables:**
  - Worker triggers on data change events
  - Status transition logic and Supabase updates
  - Notification or WebSocket hooks for front-end updates
- **Dependencies:** Supabase Functions, realtime subscriptions

## Module 7: Cost Engine Integration (Initial Stub)
- **Description:** Implement a stub cost engine that assigns low/mid/high cost-per-key estimates without full BoQ integration.
- **Deliverables:**
  - Cost calculation service with configurable ranges
  - Budget data model in Supabase
  - API endpoints to retrieve cost summaries
- **Dependencies:** Supabase tables, simple cost config file

## Module 8: 3-D Visualization Module
- **Description:** Build a basic interactive 3D stack-of-floors model, color-coded by room type, with live updates.
- **Deliverables:**
  - react-three-fiber scene setup
  - Controls for rotate/zoom
  - Live data binding to geometry
- **Dependencies:** Three.js or react-three-fiber, Zustand/Redux store

## Module 9: Budget Tab
- **Description:** Develop the Budget tab with LOW/MID/HIGH cost-per-key tiles, bar charts, and Excel export for BoQ.
- **Deliverables:**
  - React chart components (Recharts or Victory)
  - Excel export utility
  - Data fetch hooks
- **Dependencies:** Chart library, Excel generation library (SheetJS)

## Module 10: Compliance Tab
- **Description:** Implement compliance checks for ADA, brand rules and local codes, with actionable feedback.
- **Deliverables:**
  - Compliance rules engine (stub)
  - React ComplianceList component with green ticks/red crosses
  - Modal for guidance on fixes
- **Dependencies:** Compliance rules config, Supabase tables

## Module 11: History & Collaboration Module
- **Description:** Track every change in a history timeline and enable share/role management.
- **Deliverables:**
  - Change log table and API
  - React HistoryTab component
  - Invite/share UI with role assignments
- **Dependencies:** Supabase Auth & table ACLs

## Module 12: Testing, CI/CD & Documentation
- **Description:** Add unit/integration tests, configure CI pipelines, and finalize project documentation.
- **Deliverables:**
  - Jest and React Testing Library tests
  - GitHub Actions workflows
  - README, CONTRIBUTING, and docs folder
- **Dependencies:** Testing libraries, GitHub repo settings

## Module 13: Deployment & Production Hardening
- **Description:** Prepare production deployment, environment variables, monitoring and alerts.
- **Deliverables:**
  - Deploy scripts (Vercel or Netlify)
  - Environment and secret management
  - Monitoring (Sentry, Supabase logs)
- **Dependencies:** Hosting accounts, monitoring integrations 