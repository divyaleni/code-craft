COMPLAINT / HELP DESK SYSTEM (AngularJS + Node.js + Express + MongoDB)

Simple student-style project.

REQUIREMENTS
- Node.js installed
- MongoDB running locally OR a MongoDB Atlas connection string

FOLDER STRUCTURE
Complaint_Help_Desk_AngularJS/
  server.js
  package.json
  .env.example
  public/
    index.html
    style.css
    app.js

SETUP
1. Extract the ZIP file.
2. Open the extracted folder in VS Code.
3. Open Terminal in this folder.
4. Run: npm install
5. Copy .env.example to a new file named .env
6. For local MongoDB, keep:
   MONGODB_URI=mongodb://127.0.0.1:27017/HelpDeskDB
   Make sure MongoDB is installed and running.
   For Atlas, replace the value with your own Atlas connection string.
7. Run: npm start
8. Open: http://localhost:5000

FEATURES
- Raise a ticket with title, category, priority, and status
- View all tickets
- Filter tickets: All / Open / Closed
- Close an open ticket
- Reopen a closed ticket
- Edit ticket details
- Delete a ticket
- REST CRUD API using Express
- TicketService AngularJS service calls the API

API ROUTES
GET     /api/tickets       - read all tickets
GET     /api/tickets/:id   - read one ticket
POST    /api/tickets       - create ticket
PUT     /api/tickets/:id   - update ticket
PATCH   /api/tickets/:id/close - close ticket
DELETE  /api/tickets/:id   - delete ticket

TROUBLESHOOTING
- If "MongoDB connection error" appears, check MongoDB is running and .env URI is correct.
- If port 5000 is busy, change PORT in .env.
- Do not share your MongoDB Atlas password publicly.
