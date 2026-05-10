# CySecK Assessment 2

app for employee performance and feedback. two parts: client + backend.

### User
- role based login: admin, hr, manager, employee
- admin can add employee (auto pin generated)
- admin can edit employee (name, pin)
- admin can delete employee
- admin can create review and assign multiple reviewers
- admin can edit review details and assignees
- admin can open review and read submitted feedback
- employee can see only assigned reviews
- employee can submit feedback one time per review (no double submit)
- hr and manager dashboard routes are present

#### sample login users (from seed data)
- admin: name `admin`, pin `admin@123`
- manager: name `john doe`, pin `john@123`
- hr: name `jane smith`, pin `jane@123`
- employee: name `mike ross`, pin `mike@123`
- employee: name `emma stone`, pin `emma@123`

### Technical
- backend: node + express + cors
- frontend: react + vite + tailwind
- routing with react-router
- simple auth by login + `x-user` header
- data is in memory arrays (resets on server restart)
- backend supports employee, review, feedback, onboarding, and scorecard apis
- scorecard has dept summary and skill gap endpoints

#### main backend endpoints
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

### Run full system (one script)
- open terminal in project root
- `chmod +x start-system.sh` (first time only)
- `./start-system.sh`
- script auto installs deps if missing
- backend runs on `7250`
- client runs on `7150`
- press `ctrl + c` to stop both
