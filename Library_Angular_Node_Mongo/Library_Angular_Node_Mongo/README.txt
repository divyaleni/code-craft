BASIC LIBRARY MANAGEMENT: ANGULARJS + NODE.JS + MONGODB

This project demonstrates:
- AngularJS controller
- AngularJS service
- AngularJS filter (filter:searchText)
- Two-way binding using ng-model
- ng-click
- Login page
- Node.js + Express backend
- MongoDB using Mongoose
- CRUD operations

IMPORTANT REQUIREMENTS:
1. Install Node.js.
2. Install and start MongoDB Community Server locally.
3. Keep internet connected for the AngularJS CDN.

HOW TO RUN:
1. Extract the ZIP and open the folder in VS Code.
2. Open a terminal inside the folder.
3. Run: npm install
4. Make sure MongoDB is running.
5. Run: npm start
6. Open http://localhost:3000

DEMO LOGIN:
Username: student
Password: 1234

CRUD:
Create = POST /api/books
Read = GET /api/books
Update = PUT /api/books/:id
Delete = DELETE /api/books/:id

FILES:
public/index.html = HTML + AngularJS directives
public/style.css = CSS
public/app.js = AngularJS controller and service
server.js = Node.js/Express backend and MongoDB connection

NOTE:
The login is only a simple classroom demonstration, not secure authentication.
If MongoDB is not running, the book list and CRUD operations will not work.