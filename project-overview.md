# Contrisoft: Chat-Driven Hotel Planning Engine

Contrisoft is a modern, chat-driven hotel-planning engine that replaces weeks of spreadsheets and manual take-offs with a guided conversation, an intuitive editor and automated costing. Users answer six simple questions, and within seconds receive a fully structured base hotel model stored in Supabase.

## Key Features

- **Smart Chat Wizard**: Simple, jargon-free questions (city/ZIP, brand, floors, room mix, public areas) with button shortcuts for rapid data entry.
- **Instant Base Model**: Behind-the-scenes LLM transforms chat inputs into a normalized data model persisted in Supabase.
- **Projects Dashboard**: Live project cards showing name, date, status (Draft → Needs Re-calc → Costs Ready → Compliant).
- **Design Tab**: Floor-by-floor room layout editor with +/– controls and public-area sliders.
- **3D View**: Interactive stack-of-floors visualization; color-coded by room type, live-updated as you edit.
- **Budget Analytics**: LOW/MID/HIGH cost-per-key tiles, detailed bar charts, and Excel export for Bill of Quantities.
- **Compliance Checks**: ADA, brand rules and local code validations with actionable guidance for any red flags.
- **History & Collaboration**: Timeline of changes, version rollback, and role-based sharing (designers vs. investors).

## Architecture Overview

- **Front-End**: React with React Router, state management (Zustand/Redux), and react-three-fiber for 3D.
- **Back-End**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions).
- **LLM Integration**: Serverless edge functions invoke the LLM (OpenAI or similar) for chat orchestration and model generation.
- **Background Workers**: Supabase Functions or serverless workers handle quantity recalculations and cost engine jobs.
- **Monorepo**: Yarn Workspaces housing `apps/` and `packages/` for UI components, shared utils, and workers.

## Getting Started

### Prerequisites

- Node.js v16+ and Yarn (or npm)
- Supabase project with URL and API key
- OpenAI (or equivalent) API key

### Installation

```bash
# Clone the repo
git clone git@github.com:your-org/Contrisoft.git
cd Contrisoft

# Install dependencies
yarn install
```

### Environment Variables

Create a `.env.local` file in the root:

```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENAI_API_KEY=your-openai-api-key
```

### Running Locally

```bash
yarn dev
```

This will start the front-end on `http://localhost:3000` and deploy edge functions/workers locally.

## Project Structure

```
/Contrisoft
  /apps
    /frontend      # React web app
    /workers       # Edge functions & background jobs
  /packages
    /ui            # Shared UI components
    /utils         # Shared utility functions
  modules.md       # Development roadmap
  project-overview.md  # Project overview for new team members
  README.md        # High-level README and contribution guide
```

## Contributing

- **Code Style:** Prettier and ESLint enforced via pre-commit hooks
- **Testing:** Jest and React Testing Library
- **CI/CD:** GitHub Actions workflows for build, test and deploy

## License

This project is licensed under the MIT License. See `LICENSE` for details. 