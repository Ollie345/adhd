# ADHD Developmental Screening App

A Next.js web app for collecting developmental screening responses, generating risk insights across key domains, emailing results, and (optionally) syncing leads to Odoo CRM.

## Features

- Guided assessment flow with domain progress
- Result scoring and risk summary (Low/Moderate/High)
- Email results via HTML template (no PDF attachments)
- Optional Odoo CRM lead creation with rich HTML internal notes
- Smooth UI animations with Framer Motion (page transitions, progress, 3D cube loader)

## Tech Stack

- Web: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS
- UI/UX: Framer Motion (AnimatePresence, micro-interactions), Lucide Icons
- Backend: Next.js API routes (Node.js runtime)
- Database: PostgreSQL + Prisma 6
- Email: Nodemailer + Mustache templates
- CRM (optional): Odoo JSON‑RPC integration

## Project Structure

- `app/` - App Router routes (UI + API)
  - `api/submit-assessment/route.ts` - Accepts assessment submissions, scores results, saves to DB, calls Odoo sync (non-blocking)
  - `api/send-report/route.js` - Sends email with results using the HTML template
- `components/` - UI components (assessment pages, results, loader)
- `lib/` - Utilities (`prisma`, scoring logic, Odoo client)
- `templates/` - Mustache templates (email HTML)
- `prisma/` - Prisma schema + migrations

## Environment Variables

Copy `.env.example` to `.env` and set:

- Database
  - `DATABASE_URL` (PostgreSQL connection string)

- SMTP / Email
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

- Odoo CRM (optional)
  - `ODOO_URL`, `ODOO_DB`, `ODOO_USERNAME`, `ODOO_PASSWORD`

Do not commit `.env`. Use Vercel Project Settings for Production/Preview env vars.

## Local Development

1) Install
```bash
npm install
```

2) Prisma
```bash
npx prisma generate
# If using a fresh DB:
# npx prisma migrate deploy   # apply existing migrations
```

3) Run dev
```bash
npm run dev
# http://localhost:3000
```

## Database

- Prisma schema: `prisma/schema.prisma`
- Model: `ADHDAssessment` stores personal info, responses (JSON), domain scores, overall risk, messages, recommendations, timestamps.

## Scoring

- Scoring logic in `lib/assessment-bot.ts`:
  - Calculates domain scores for Behavioral, Cognitive/Attention, Motor Skills, Language/Academic
  - Produces `overallRisk`, `flaggedDomains`, top-level message, and recommendations

## APIs

### POST /api/submit-assessment
- Input: JSON with personal info and responses (keys 1–4 as strings; see `lib/assessment-bot.ts` for question keys)
- Flow:
  - Validates required fields
  - Builds normalized responses
  - Scores assessment
  - Saves to DB
  - Triggers non-blocking Odoo sync (if Odoo env present)
- Response: `{ success: true, domainScores, flaggedDomains, overallRisk, message, detailed_message, recommendations }`

### POST /api/send-report
- Input: JSON with the results payload (name, email, age, risk, domain scores, flagged domains, detailed_message, recommendations)
- Output: Sends an HTML email (no PDF) in production; logs in development
- Response: `{ success: true, message, ... }`

## Odoo CRM Integration (Optional)

- Client: `lib/odoo.ts` (JSON‑RPC)
  - `odooAuthenticate()`
  - `ensureTag(uid, name)`
  - `ensurePartner(uid, email, name)`
  - `createLead(uid, leadData)`
  - `postNote(uid, leadId, html)` (optional)

- Integration: `app/api/submit-assessment/route.ts`
  - Runs after DB save, in a fire‑and‑forget block
  - Creates/ensures contact by email
  - Ensures tags: `adhd_assessment` and `risk_<level>`
  - Creates a lead with:
    - `name`, `contact_name`, `email_from`, optional `partner_id`
    - `tag_ids` (many2many replace: `[[6,0,[...ids]]]`)
    - `description` as rich HTML:
      - Personal info
      - Assessment summary
      - Domain scores table (status, max)
      - Recommendations list
      - Responses list (each question with chosen label)
  - Errors are caught and logged; user flow is never blocked

Note: In serverless environments, long-running RPCs may be cut short. For high reliability, consider a background job/queue.

## Email

- Uses `templates/report-email.html` (Mustache)
- Dev mode logs instead of sending (checks `NODE_ENV !== 'production'`)
- Production requires SMTP vars to be set

## UX / Animations

- `components/LoadingCube.jsx`: 3D spinning cube with gradient text
- `HealthAssessmentFlow.jsx`: page transitions with `AnimatePresence`, loading step before results
- `QuestionPage.jsx`: animated progress bar, option hover/tap, button micro-interactions
- `ResultsPage.jsx`: staggered domain score reveal, animated success banner

## Deployment (Vercel)

- Framework: Next.js (auto-detected)
- Ensure env vars are set in Project Settings (Production + Preview)
- No PDF generation; only emails are sent
- Next config traces email template:
  - `outputFileTracingIncludes: { 'app/api/send-report/route.js': ['templates/report-email.html'] }`

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Security & Notes

- Do not commit `.env` (use `.env.example` for reference)
- The tool is informational and is not a medical diagnosis
- Validate SMTP and Odoo credentials before production

## License

Proprietary (or add your preferred license here).
