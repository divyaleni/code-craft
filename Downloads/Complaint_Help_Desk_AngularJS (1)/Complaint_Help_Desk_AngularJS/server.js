const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' }
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);

// READ all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Could not load tickets.' });
  }
});

// READ one ticket
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Invalid ticket ID.' });
  }
});

// CREATE ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { title, category, priority } = req.body;
    if (!title || !title.trim() || !category) {
      return res.status(400).json({ message: 'Title and category are required.' });
    }
    const ticket = await Ticket.create({ title: title.trim(), category, priority: priority || 'Medium', status: 'Open' });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Could not create ticket. Check the entered values.' });
  }
});

// UPDATE ticket details
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { title, category, priority, status } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { title, category, priority, status },
      { new: true, runValidators: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Could not update ticket.' });
  }
});

// CLOSE ticket
app.patch('/api/tickets/:id/close', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: 'Closed' }, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Could not close ticket.' });
  }
});

// DELETE ticket
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    res.json({ message: 'Ticket deleted.' });
  } catch (err) {
    res.status(400).json({ message: 'Could not delete ticket.' });
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/HelpDeskDB';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => console.log(`Help Desk running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    console.error('Check that MongoDB is running and MONGODB_URI in .env is correct.');
    process.exit(1);
  });
