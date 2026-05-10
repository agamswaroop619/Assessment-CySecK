# CySecK Assessment 2

lightweight employee performance + feedback app split into two parts: client + backend.

### User
- role-based login flow: admin, hr, manager, employee
- admin can add employee (auto auth code generated)
- admin can edit employee (name, auth code)
- admin can delete employee
- admin can create reviews and assign multiple reviewers
- admin can edit review details and assignees
- admin can open any review and read submitted feedback
- employee can see only assigned reviews
- employee can submit feedback once per review (no double submit)
- dedicated dashboard routes exist for hr and manager

#### Sample Login Users (From Seed Data)
- admin: name `admin`, auth `admin@123`
- manager: name `john doe`, auth `john@123`
- hr: name `jane smith`, auth `jane@123`
- employee: name `mike ross`, auth `mike@123`
- employee: name `emma stone`, auth `emma@123`

### Technical
- backend: node + express + cors
- frontend: react + vite + tailwind
- routing with react-router
- charts: recharts (hr analytics view)
- icons: react-icons/fi
- simple auth flow with `name + auth` plus `x-user` header
- data is stored in memory arrays (resets on server restart)
- backend supports employee, review, feedback, onboarding, and scorecard APIs
- scorecard has dept summary and skill gap endpoints

#### Main Backend Endpoints
- `POST /login`
- `POST /onboarding`
- `GET/POST /emps`, `PUT/DELETE /emps/:id`
- `GET/POST /revs`, `PUT /revs/:id`
- `GET /my-revs/:empId`
- `GET /fb/:reviewId`, `POST /fb`
- `POST /scorecard`
- `GET /scorecard/dept-summary?dept=engineering`
- `GET /scorecard/:employee_id`
- `PUT /scorecard/:id`
- `GET /scorecard/gaps/:employee_id`

### Role Access Matrix
| Feature | Admin | Manager | HR | Employee |
| --- | --- | --- | --- | --- |
| View all employees | ✓ | ✓ | ✓ | — |
| Add / edit / delete employees | ✓ | — | — | — |
| Bulk onboard users | ✓ | — | — | — |
| Create & assign reviews | ✓ | — | — | — |
| Submit scorecard rating | — | ✓ | — | — |
| View peer feedback | ✓ | ✓ | — | — |
| View dept analytics | — | — | ✓ | — |
| View own ratings | — | — | — | ✓ |
| Submit peer feedback | — | — | — | ✓ |

#### Routing Behavior
- app loads `user` from localStorage on startup
- if logged in, `/` auto-redirects by role: `/admin`, `/hr`, `/manager`, `/employee`
- unknown role or unauthenticated users get redirected to login

### Scorecard Parameters
1. **Technical Skills** - depth of technical knowledge and code quality
2. **Communication** - clarity in written and verbal collaboration
3. **Teamwork** - how well the person works with others
4. **Leadership** - guidance, mentoring, and unblock behavior
5. **Problem Solving** - structured thinking and solution quality
6. **Ownership** - end-to-end accountability without hand-holding
7. **Adaptability** - handling changing requirements and ambiguity
8. **Delivery Quality** - reliability of output and on-time completion

each parameter is rated 1-5 in manager scorecards. hr gap view flags parameters below `3.0` avg as `needs_improvement`.

### Run Full System (One Script)
- open terminal in project root
- `chmod +x start-system.sh` (first time only)
- `./start-system.sh`
- script auto-installs deps if missing
- backend runs on `7250`
- client runs on `7150`
- press `ctrl + c` to stop both

### Assumptions
- no db in this phase; everything is intentionally in-memory and ephemeral
- auth is intentionally simple: login with `name + auth`, then client sends `x-user`
- role behavior is mostly frontend route/page logic (no strict backend role middleware)
- onboarding route accepts a JSON users array (admin ui parses pasted csv-like lines into JSON first)
- employee feedback is one-time per review (`reviewId + fromId`), duplicate submit is blocked
- manager can submit a scorecard and later edit/update that same scorecard
