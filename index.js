const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'sushmasussu07@gmail.com',        // Your Gmail address
    pass: 'ziup cnph clzd gkjl'            // Gmail App Password (generate in Google Account)
  }
});

// --- BOOKING PERSISTENCE ---
let bookings = [];

// Save a booking
app.post('/api/bookings', (req, res) => {
  const booking = req.body;
  // Assign a simple ID based on timestamp
  booking.bookingId = Date.now();
  bookings.push(booking);
  console.log('Booking saved:', booking);
  res.json({ success: true, message: 'Booking saved', bookingId: booking.bookingId });
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// Email sending API endpoint
app.post('/send-confirmation', (req, res) => {
  const { name, email, origin, destination, date, seat } = req.body;

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Flight Booking Confirmation',
    text: `Dear ${name},\n\nYour flight from ${origin} to ${destination} on ${date} has been booked.\nSeat: ${seat}\n\nThank you!`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send({ success: false, message: 'Failed to send email' });
    } else {
      res.send({ success: true, message: 'Confirmation email sent' });
    }
  });
});

// --- Flight Data Generation & Search API ---

const origins = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
  "San Antonio", "San Diego", "Dallas", "San Jose", "Miami", "Boston"];
const destinations = ["London", "Paris", "Tokyo", "Dubai", "Berlin", "Singapore",
  "Rome", "Amsterdam", "Hong Kong", "Sydney", "Toronto", "Barcelona"];

let flights = [];

const airlines = ["Air Ocean", "Global Fly", "Pacific Jet", "Windy City Air", "Desert Wings", "Sun Valley Air", "Liberty Fly"];

function getRandomTime() {
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function generateFlights() {
  const startDate = new Date("2026-01-01");
  const endDate = new Date("2026-12-31");
  const dayInMs = 24 * 60 * 60 * 1000;
  let id = 1;

  for (let d = startDate; d <= endDate; d = new Date(d.getTime() + dayInMs)) {
    for (let i = 0; i < origins.length; i++) {
      for (let j = 0; j < destinations.length; j++) {
        if (origins[i] !== destinations[j]) {
          if (Math.random() > 0.5) {
            flights.push({
              id: id++,
              origin: origins[i],
              destination: destinations[j],
              date: d.toISOString().split("T")[0],
              price: Math.floor(Math.random() * 1000) + 100,
              airline: airlines[Math.floor(Math.random() * airlines.length)],
              time: getRandomTime()
            });
          }
        }
      }
    }
  }

  // Add some explicit flights for guaranteed availability
  flights.push(
    { id: 1000001, origin: "Miami", destination: "Barcelona", date: "2026-06-15", price: 6500, airline: "Tropical Air", time: "05:00 PM" },
    { id: 1000002, origin: "Boston", destination: "Toronto", date: "2026-07-20", price: 4000, airline: "Harbor Sky", time: "09:00 AM" },
    { id: 1000003, origin: "New York", destination: "Rome", date: "2026-12-25", price: 8000, airline: "Liberty Fly", time: "08:30 PM" },
    { id: 1000004, origin: "Dallas", destination: "Berlin", date: "2026-10-10", price: 7000, airline: "Lone Star Aviation", time: "02:15 PM" },
    { id: 1000005, origin: "San Diego", destination: "Hong Kong", date: "2026-09-05", price: 7200, airline: "Bay City Jets", time: "07:45 AM" },
    { id: 1000006, origin: "San Antonio", destination: "Amsterdam", date: "2026-08-19", price: 6800, airline: "Alamo Air", time: "06:20 PM" },
    { id: 1000007, origin: "India", destination: "Singapore", date: "2026-01-11", price: 9100, airline: "Indo Air", time: "11:00 AM" }
  );
}

// Generate flights once when server starts
generateFlights();

app.get('/api/flights', (req, res) => {
  const { origin, destination, date } = req.query;

  console.log('Search request:', { origin, destination, date });

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: 'Missing required query parameters: origin, destination, date' });
  }

  const results = flights.filter(f =>
    f.origin === origin &&
    f.destination === destination &&
    f.date === date
  );

  res.json(results);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
