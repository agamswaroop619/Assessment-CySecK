# CySecK assessment Frontend

This is the frontend application for cyseck assessment. it handles auth and role-based dashboards for admin, manager, hr, and employee.

### Tech Stack

- **react + vite**
- **tailwind css** (styling)
- **react router** (role-based routes and redirects)
- **framer motion** (page transitions on route change; animated admin tab nav)
- **react icons** (ui icons)
- **recharts** (hr analytics visualizations)

### How It Works

we have 5 main views:

- **login:** `name + auth` flow, then stores user in localStorage.
- **admin dashboard:** tab-based flow for employees, review create/edit, feedback modal, and bulk onboarding input. on narrow screens you get a **bottom nav**; on wider screens a **side nav**, both wired to the same tabs with motion on the active pill and on panel swaps.
- **manager dashboard:** submits 8-parameter scorecards, edits saved ratings, and opens peer feedback per review.
- **hr dashboard:** department selector with average charts, skill-gap flags, and comments view.
- **employee dashboard:** sees assigned reviews, submits feedback once per review, and views own scorecard ratings.

moving between routes (login vs dashboards) runs a short framer-motion transition so page changes feel smoother on phones.

state is kept local in components, and data calls are simple `fetch` requests to backend (`http://localhost:7250`).

### How To Run

1. open a terminal in this folder
2. run `npm install`
3. run `npm run dev`
4. app runs at `localhost:7150`

vite 8 wants a recent node: if dev or `npm run build` errors on imports like `styleText`, upgrade to **node 20.19+** or **22.12+**.

### Features Included

- role route guards and redirects based on `user.role`
- animated route transitions between main pages
- localStorage session bootstrap on app load
- admin tab workflow for employee/review/onboarding actions
- responsive admin navigation (bottom bar vs side rail) with motion on tab change
- manager scorecard submit + edit flow
- hr analytics chart + gap highlighting
- one-time feedback submit lock for employees
