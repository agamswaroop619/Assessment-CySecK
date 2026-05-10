# CySecK Assessment 2 Backend

hey, this is the backend server for cyseck assessment 2. kept it intentionally lean so everything runs in memory. no db setup, no orm config, no migrations.

### Tech Stack
- **express.js** (REST API server)
- **cors** (lets frontend call backend without browser blocking)
- **node.js** (runtime)

### How It Works
because its an in-memory setup, all data (`emps`, `revs`, `fb`, `scorecards`) lives in arrays while the server runs. if you restart it, data resets to seed state from `config.js`.

its plain REST over HTTP:
- **auth model:** no jwt/session. client sends `x-user` header and backend checks that the id exists.
- **login:** `POST /login` validates `name + auth` and returns user profile (id, role, dept).
- **employees:** `GET/POST /emps`, `PUT/DELETE /emps/:id`.
- **reviews:** `GET/POST /revs`, `PUT /revs/:id`, and `GET /my-revs/:empId`.
- **feedback:** `GET /fb/:reviewId`, `POST /fb` (blocks duplicate submit per `reviewId + fromId`).
- **scorecard:** `POST /scorecard`, `GET /scorecard/:employee_id`, `PUT /scorecard/:id`, `GET /scorecard/gaps/:employee_id`, `GET /scorecard/dept-summary?dept=...`.
- **onboarding:** `POST /onboarding` for bulk user creation from parsed input rows.

### How To Run
1. open a terminal in this backend folder
2. run `npm install`
3. run `npm run start` or `node server.js`
4. server runs on `localhost:7250`

for full-stack ports, one-shot startup, and how the client handles auth/UI, see the **repo root** `README.md`.


