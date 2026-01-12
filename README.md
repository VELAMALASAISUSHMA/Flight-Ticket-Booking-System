# Flight-Ticket-Booking-System
A full-stack Flight Ticket Booking System developed as a mini project using HTML, CSS, JavaScript, and Python (Flask). The application allows users to search for flights, select seats with real-time availability, confirm bookings, and store booking details securely
Features

🔍 Flight Search

Search flights by origin, destination, and travel date

Displays multiple available flights with pricing and timing

💺 Interactive Seat Selection

Realistic aircraft seat layout (left & right sides with aisle)

Selected seats are highlighted

Already booked seats are disabled

🔒 Seat Locking (Local Storage)

Prevents the same seat from being booked again

Seat availability persists across browser refreshes

🧾 Booking Confirmation

Passenger details collection (Name, Email, Phone)

Booking summary displayed after confirmation

📂 Booking History

All bookings stored in a JSON file via backend

“My Bookings” view to display previous reservations

📧 Email Notification (Backend Logic Implemented)

Confirmation email feature implemented using Gmail SMTP

Secure credentials management using .env file

🛠️ Technologies Used
Frontend

HTML5

CSS3

JavaScript (DOM manipulation, Fetch API)

Browser Local Storage

Backend

Python

Flask

Flask-CORS

SMTP (Email sending logic)

JSON file storage

⚙️ Project Architecture

Frontend handles UI, seat selection, and user interaction

Backend (Flask API) manages:

Flight data

Booking storage

Email confirmation logic

Local Storage ensures seat locking and availability control

Environment Variables used to protect sensitive data

🚀 How to Run the Project
1️⃣ Backend
cd backend
python app.py


Server runs at:

http://localhost:5000

2️⃣ Frontend

Open index.html in a browser

Make sure backend is running before booking


📚 Learning Outcomes

Full-stack web application development

REST API integration

State management using Local Storage

Secure handling of credentials

Frontend–backend communication using Fetch API

🎓 Project Type

Mini Project

Academic / Learning Purpose
