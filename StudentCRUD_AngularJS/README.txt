STUDENT CRUD APPLICATION — UPDATED
AngularJS + Node.js + Express + MongoDB

ANGULARJS CONCEPTS INCLUDED
- Two-way data binding: ng-model on registration, login and student forms.
- Service: StudentService centralizes API requests for register, login and student CRUD.
- Factory: AuthFactory stores, reads and clears the login session.
- Built-in filters: filter, orderBy, uppercase and lowercase.
- Custom filter: capitalizeWords converts text to title case for display.
- Controllers: RegisterController, LoginController and DashboardController.

RUN BACKEND (Windows CMD)
1. Open CMD and enter the backend folder:
   cd path\to\StudentCRUD_AngularJS\backend
2. Install dependencies:
   npm install
3. Check backend/.env and set MONGODB_URI and a private JWT_SECRET of at least 32 characters.
4. Start backend:
   npm start
Expected messages:
   MongoDB connected successfully!
   Server running at http://localhost:5000

RUN FRONTEND
1. Open a second CMD and enter the frontend folder:
   cd path\to\StudentCRUD_AngularJS\frontend
2. Run:
   npx http-server -p 5500
3. Open http://localhost:5500/register.html
4. Register, then log in at http://localhost:5500/login.html.
5. Successful login should navigate to dashboard.html.

FEATURES
- Register and login
- Add, list, edit and delete student records
- Live search
- Sort by name, email or department in ascending/descending order
- Display names in original case, UPPERCASE, lowercase or title case
- Logout and session token handling

BACKEND API EXPECTED
POST /api/auth/register
POST /api/auth/login -> returns { message, token, name }
GET /api/students
POST /api/students
PUT /api/students/:id
DELETE /api/students/:id

DATABASE
The included backend uses MongoDB and JWT authentication. Update backend/.env for your own database. Do not share database passwords or JWT secrets publicly.
