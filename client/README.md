# CySecK Assessment 2 Frontend

This is the fronend code for CySecK Assessment 2. its a simple app to handle employee perfromance reviews.

### tech stack 
- **React + Vite** 
- **Tailwind CSS** (for all the stlyling)
- **React Router Dom** (handels the page switching)
- **React Icons** 

### how it works
basically we have 3 main views:
- **Login:** simple pin based entry. checks who you are and sends you to the right dashboard.
- **Admin Dashbaord:** this is tab based. admins can add emplyees, create new reviews, assgin reviewers, and read through feedback popups and update if want.
- **Emplyee page:** action driven. employees login, see what reviews they are assigned to, and can submit thier feedback. once submitted, the card locks out and just shows what they wrote in a green badge state.

we keep state local to the components and just make async `fetch` calls to our local backend. simple and straighforward.

### how to run
1. open terminal in this folder
2. run `npm install`
3. hit `npm run dev`

### features included
- route guarding (cant bypass login)
- dynamic tab navigation for admins
- instant pop up modles for viewing and editing reviews
- auto lock out on employee feedback (prevents double submits)

