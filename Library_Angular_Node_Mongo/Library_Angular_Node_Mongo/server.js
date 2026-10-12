
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Book Schema
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        default: () => new Date().getFullYear()
    },
    status: {
        type: String,
        default: "Available"
    }
});

const Book = mongoose.model("Book", bookSchema);

// GET: Display all books
app.get("/api/books", async (req, res) => {
    try {
        const books = await Book.find().sort({ title: 1 });
        res.json(books);
    } catch (error) {
        console.error("Error fetching books:", error.message);
        res.status(500).json({
            message: "Could not fetch books"
        });
    }
});

// POST: Add a new book
app.post("/api/books", async (req, res) => {
    try {
        const { title, author, year, status } = req.body;

        if (!title || !author) {
            return res.status(400).json({
                message: "Please enter both title and author"
            });
        }

        const book = new Book({
            title,
            author,
            year: year ? Number(year) : undefined,
            status: status || "Available"
        });

        const savedBook = await book.save();

        console.log("Book added:", savedBook.title);
        res.status(201).json(savedBook);
    } catch (error) {
        console.error("Error adding book:", error.message);
        res.status(500).json({
            message: error.message || "Could not add book"
        });
    }
});

// PUT: Update a book
app.put("/api/books/:id", async (req, res) => {
    try {
        const { title, author, year, status } = req.body;

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title,
                author,
                year: year ? Number(year) : undefined,
                status
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedBook) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json(updatedBook);
    } catch (error) {
        console.error("Error updating book:", error.message);
        res.status(400).json({
            message: error.message || "Could not update book"
        });
    }
});

// DELETE: Delete a book
app.delete("/api/books/:id", async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(
            req.params.id
        );

        if (!deletedBook) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        console.log("Book deleted:", deletedBook.title);
        res.json({
            message: "Book deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting book:", error.message);
        res.status(400).json({
            message: error.message || "Could not delete book"
        });
    }
});

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Connect to MongoDB Atlas, then start the server
async function startServer() {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        console.error(
            "MONGODB_URI is missing. Check the variable name in your .env file."
        );
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoURI);

        console.log("MongoDB Atlas connected successfully!");

        app.listen(PORT, () => {
            console.log(
                `Library app running at http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        console.error(
            "Check your Atlas connection string, database credentials, and network access."
        );
        process.exit(1);
    }
}

startServer();
