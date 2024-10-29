// server.js

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Path to bookings.json
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');
const OPERATORS_FILE = path.join(__dirname, 'data', 'operators.json');


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

// Helper function to read operators
async function readOperators() {
  try {
    const data = await fs.readFile(OPERATORS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return []; // Default operators
    }
    throw err;
  }
}
 
// Helper function to write operators
async function writeOperators(operators) {
  await fs.writeFile(OPERATORS_FILE, JSON.stringify(operators, null, 2));
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
    newBooking.id = uuidv4();

    const bookings = await readBookings();
    bookings.push(newBooking);
    await writeBookings(bookings);
    res.status(201).json({ message: 'Booking saved successfully', id: newBooking.id });
  } catch (err) {
    console.error('Error saving booking:', err);
    res.status(500).json({ error: 'Error saving booking' });
  }
});

// API endpoint to update a booking
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updatedBooking = req.body;
    const bookings = await readBookings();

    const index = bookings.findIndex(booking => booking.id === bookingId);
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    bookings[index] = { ...updatedBooking, id: bookingId };
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
    const bookingId = req.params.id;
    const bookings = await readBookings();

    const index = bookings.findIndex(booking => booking.id === bookingId);
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    bookings.splice(index, 1);
    await writeBookings(bookings);
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'Error deleting booking' });
  }
});

// API endpoint to get filtered bookings
app.get('/api/bookings/filter', async (req, res) => {
  try {
    const { operator, startDate, endDate } = req.query;
    let bookings = await readBookings();
 
    if (operator) {
      bookings = bookings.filter(booking => booking.systemOperator === operator);
    }
 
    if (startDate && endDate) {
      bookings = bookings.filter(booking => {
        return booking.entries.some(entry => {
          return entry.date >= startDate && entry.date <= endDate;
        });
      });
    }
 
    res.json(bookings);
  } catch (err) {
    console.error('Error filtering bookings:', err);
    res.status(500).json({ error: 'Error filtering bookings' });
  }
});
 
// API endpoint to get all operators
app.get('/api/bookings/operators', async (req, res) => {
  try {
    const operators = await readOperators();
    res.json(operators);
  } catch (err) {
    console.error('Error reading operators:', err);
    res.status(500).json({ error: 'Error reading operators' });
  }
});
 
// API endpoint to add a new operator
app.post('/api/bookings/operators', async (req, res) => {
  try {
    const newOperator = req.body.operator;
    const operators = await readOperators();
    if (!operators.includes(newOperator)) {
      operators.push(newOperator);
      await writeOperators(operators);
    }
    res.status(201).json({ message: 'Operator added successfully' });
  } catch (err) {
    console.error('Error adding operator:', err);
    res.status(500).json({ error: 'Error adding operator' });
  }
});

// Serve static files (your HTML, CSS, JS files)
app.use(express.static(__dirname));

// Start the server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
const server = app.listen(port, '0.0.0.0', () => {
  const host = server.address().address;
  console.log(`Server running at http://${host}:${port}`);
});
