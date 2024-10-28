// server.js

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
// Middleware
app.use(bodyParser.json());
app.use(cors());

// Path to bookings.json
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);

// Helper function to read bookings
async function readBookings() {
  try {
    const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

// Helper function to write bookings
async function writeBookings(bookings) {
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

// API endpoint to get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await readBookings();
    res.json(bookings);
  } catch (err) {
    console.error('Error reading bookings:', err);
    res.status(500).json({ error: 'Error reading bookings' });
  }
});

// API endpoint to add a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = req.body;
    const bookings = await readBookings();
    bookings.push(newBooking);
    await writeBookings(bookings);
    res.status(201).json({ message: 'Booking saved successfully' });
  } catch (err) {
    console.error('Error saving booking:', err);
    res.status(500).json({ error: 'Error saving booking' });
  }
});

// API endpoint to update a booking
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const updatedBooking = req.body;
    const bookings = await readBookings();

    if (bookingId < 0 || bookingId >= bookings.length) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    bookings[bookingId] = updatedBooking;
    await writeBookings(bookings);
    res.json({ message: 'Booking updated successfully' });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Error updating booking' });
  }
});

// API endpoint to delete a booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const bookings = await readBookings();

    if (bookingId < 0 || bookingId >= bookings.length) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    bookings.splice(bookingId, 1);
    await writeBookings(bookings);
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'Error deleting booking' });
  }
});

// Serve static files (your HTML, CSS, JS files)
app.use(express.static(__dirname));

// Start the server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
