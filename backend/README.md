# CySecK Assessment 2 Backend

hey, this is the backend server for CySecK Assessment 2. i kept everything as simple as humanly possible so it runs entirely in menory. no need to setup any databses or deal with heavy ORMs.

### tech stack
- **Express.js** (the standard way to build servers in node)
- **Cors** (so the fronend can actually talk to it without browser blocking)
- **Node.js** (runtime obv)

### how it works
because its an in menory desgin, all the data (`emps`, `revs`, `fb`) are just arrays living while the server is running. if you restart the server, everything wipes clean back to default hardcded state. 

its simple REST over http:
- **Auth:** we don't have real JWTs or sessions. the client just passes `x-user` id in headers and the server belives it. super basic just for the assessement.
- **Login:** `/login` post checks name and pin against our `emps` array.
- **Employees:** standard CRUD to add, delete, and edit (PUT) employees.
- **Reviews:** GET and POST for reviews, along with PUT to edit title/assginments. `/my-revs/:empId` joins the names so frontend doesn't have to doing it.
- **Feedback:** isolated to `/fb` for submisisons and fetching.

### how to run
1. open terminal in this backend folder
2. run `npm install`
3. hit `npm run start` or `node server.js`
4. runs on `localhost:7250`


