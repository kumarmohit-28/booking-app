const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection string - replace with your actual connection string
const uri = "mongodb+srv://kumarmohit:Import__cv2@cluster0.mcp2c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
  } catch (e) {
    console.error("Could not connect to MongoDB", e);
    process.exit(1);
  }
}

connectToDatabase();

// Get database and collections
const db = client.db();
const bookingsCollection = db.collection('bookings');
const operatorsCollection = db.collection('operators');

// API endpoint to get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await bookingsCollection.find({}).toArray();
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
    const result = await bookingsCollection.insertOne(newBooking);
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
    const result = await bookingsCollection.updateOne(
      { id: bookingId },
      { $set: updatedBooking }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
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
    const result = await bookingsCollection.deleteOne({ id: bookingId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
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
    let query = {};

    if (operator) {
      query.systemOperator = operator;
    }

    if (startDate && endDate) {
      query['entries.date'] = { $gte: startDate, $lte: endDate };
    }

    const bookings = await bookingsCollection.find(query).toArray();
    res.json(bookings);
  } catch (err) {
    console.error('Error filtering bookings:', err);
    res.status(500).json({ error: 'Error filtering bookings' });
  }
});

// API endpoint to get all operators
app.get('/api/bookings/operators', async (req, res) => {
  try {
    const operators = await operatorsCollection.find({}).toArray();
    res.json(operators.map(op => op.name));
  } catch (err) {
    console.error('Error reading operators:', err);
    res.status(500).json({ error: 'Error reading operators' });
  }
});

// API endpoint to add a new operator
app.post('/api/bookings/operators', async (req, res) => {
  try {
    const newOperator = req.body.operator;
    const result = await operatorsCollection.updateOne(
      { name: newOperator },
      { $set: { name: newOperator } },
      { upsert: true }
    );
    res.status(201).json({ message: 'Operator added successfully' });
  } catch (err) {
    console.error('Error adding operator:', err);
    res.status(500).json({ error: 'Error adding operator' });
  }
});

// Serve static files (your HTML, CSS, JS files)
app.use(express.static(__dirname));

const server = app.listen(port, '0.0.0.0', () => {
  const host = server.address().address;
  console.log(`Server running at http://${host}:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});
