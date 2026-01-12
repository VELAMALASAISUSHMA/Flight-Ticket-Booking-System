from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import smtplib
from email.message import EmailMessage
import json
import os

# ================= LOAD ENV VARIABLES =================
load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

print("EMAIL:", EMAIL_ADDRESS)
print("PASSWORD LOADED:", EMAIL_PASSWORD is not None)

# ================= APP SETUP =================
app = Flask(__name__)
CORS(app)

BOOKINGS_FILE = 'bookings.json'

# ================= HELPERS =================
def load_bookings():
    if not os.path.exists(BOOKINGS_FILE):
        return []
    with open(BOOKINGS_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_bookings(bookings):
    with open(BOOKINGS_FILE, 'w') as f:
        json.dump(bookings, f, indent=2)

# ================= FLIGHT API (DUMMY DATA) =================
@app.route('/api/flights', methods=['GET'])
def get_flights():
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    date = request.args.get('date')

    flights = [
        {"id": 1, "origin": origin, "destination": destination, "date": date, "price": 4500},
        {"id": 2, "origin": origin, "destination": destination, "date": date, "price": 5200}
    ]
    return jsonify(flights)

# ================= BOOKINGS API =================
@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    return jsonify(load_bookings())

@app.route('/api/bookings', methods=['POST'])
def add_booking():
    data = request.json
    bookings = load_bookings()
    bookings.append(data)
    save_bookings(bookings)
    return jsonify(data), 201

# ================= EMAIL SENDING =================
@app.route('/send-confirmation', methods=['POST'])
def send_confirmation():
    data = request.json

    try:
        msg = EmailMessage()
        msg['Subject'] = "✈️ Flight Booking Confirmation"
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = data['email']

        msg.set_content(f"""
Dear {data['name']},

🎉 Your flight booking is confirmed!

Route: {data['origin']} → {data['destination']}
Date: {data['date']}
Seat(s): {data['seat']}

Thank you for choosing Ready To Fly ✈️
Have a safe journey!

Regards,
Ready To Fly Team
""")

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

        print("✅ Email sent to:", data['email'])
        return jsonify({"success": True, "message": "Email sent successfully"}), 200

    except Exception as e:
        print("❌ EMAIL ERROR:", e)
        return jsonify({"success": False, "error": str(e)}), 500

# ================= RUN SERVER =================
if __name__ == '__main__':
    print("🚀 Backend running at http://localhost:5000")
    app.run(debug=True, port=5000)
