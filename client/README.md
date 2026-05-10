# CySecK Assessment 2 Frontend

this is the frontend app for cyseck assessment 2. it handles auth and role-based dashboards for admin, manager, hr, and employee.

### Tech Stack
- **react + vite**
- **tailwind css** (styling)
- **react router** (role-based routes and redirects)
- **react icons** (ui icons)
- **recharts** (hr analytics visualizations)

### How It Works
we have 5 main views:
- **login:** `name + auth` flow, then stores user in localStorage.
- **admin dashboard:** tab-based flow for employees, review create/edit, feedback modal, and bulk onboarding input.
- **manager dashboard:** submits 8-parameter scorecards, edits saved ratings, and opens peer feedback per review.
- **hr dashboard:** department selector with average charts, skill-gap flags, and comments view.
- **employee dashboard:** sees assigned reviews, submits feedback once per review, and views own scorecard ratings.

state is kept local in components, and data calls are simple `fetch` requests to backend (`http://localhost:7250`).

### How To Run
1. open a terminal in this folder
2. run `npm install`
3. run `npm run dev`
4. app runs at `localhost:7150`

### Features Included
- role route guards and redirects based on `user.role`
- localStorage session bootstrap on app load
- admin tab workflow for employee/review/onboarding actions
- manager scorecard submit + edit flow
- hr analytics chart + gap highlighting
- one-time feedback submit lock for employees

