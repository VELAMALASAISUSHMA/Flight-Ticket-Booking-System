document.addEventListener('DOMContentLoaded', () => {

  /* ================= DATE SETUP ================= */
  const dateInput = document.getElementById('date');
  dateInput.min = "2026-01-01";
  dateInput.max = "2026-12-31";

  /* ================= DOM REFERENCES ================= */
  const flightForm = document.getElementById('flightForm');
  const resultsDiv = document.getElementById('results');

  /* ================= LOCAL STORAGE HELPERS ================= */
  function getBookedSeats(flightId) {
    return JSON.parse(localStorage.getItem('flight_' + flightId)) || [];
  }

  function saveBookedSeats(flightId, seats) {
    localStorage.setItem('flight_' + flightId, JSON.stringify(seats));
  }

  /* ================= SEAT SELECTION UI ================= */
  const seatSelectionDiv = document.createElement('div');
  seatSelectionDiv.id = 'seatSelectionDiv'; // ADDED ID
  seatSelectionDiv.style.display = 'none';
  seatSelectionDiv.innerHTML = `
    <h3>Select Your Seat(s)</h3>

    <div style="display:flex; justify-content:center; gap:220px; font-weight:bold; margin-bottom:10px;">
      <span>LEFT SIDE</span>
      <span>RIGHT SIDE</span>
    </div>

    <div id="seatsContainer"
      style="
        display:grid;
        grid-template-columns: 45px 45px 45px 120px 45px 45px 45px;
        gap:12px;
        justify-content:center;
        margin-bottom:20px;
      ">
    </div>

    <button id="confirmSeatsBtn">Confirm Seats</button>
    <button id="cancelSeatsBtn" style="margin-left:10px;">Cancel</button>
  `;
  document.body.appendChild(seatSelectionDiv);

  /* ================= PASSENGER DETAILS ================= */
  const userDetailsDiv = document.createElement('div');
  userDetailsDiv.id = 'userDetailsDiv'; // ADDED ID
  userDetailsDiv.style.display = 'none';
  userDetailsDiv.innerHTML = `
    <h3>Enter Passenger Details</h3>
    <form id="userDetailsForm">
      <label>Name:</label><br/>
      <input type="text" id="passengerName" required /><br/><br/>

      <label>Email:</label><br/>
      <input type="email" id="passengerEmail" required /><br/><br/>

      <label>Phone:</label><br/>
      <input type="text" id="passengerPhone" pattern="\\d{10}" required /><br/><br/>

      <button type="submit">Confirm Booking</button>
    </form>
  `;
  document.body.appendChild(userDetailsDiv);

  /* ================= ELEMENT REFERENCES ================= */
  const seatsContainer = document.getElementById('seatsContainer');
  const confirmSeatsBtn = document.getElementById('confirmSeatsBtn');
  const cancelSeatsBtn = document.getElementById('cancelSeatsBtn');
  const userDetailsForm = document.getElementById('userDetailsForm');

  let selectedSeats = new Set();
  let currentBookingFlight = null;

  /* ================= CREATE SEAT BUTTON ================= */
  function createSeatButton(seatLabel, bookedSeats) {
    const seat = document.createElement('button');
    seat.textContent = seatLabel;
    seat.style.width = '45px';
    seat.style.height = '40px';
    seat.style.borderRadius = '6px';
    seat.style.border = '1px solid #999';

    if (bookedSeats.includes(seatLabel)) {
      seat.style.backgroundColor = '#ff4d4d';
      seat.style.color = 'white';
      seat.disabled = true;
    } else {
      seat.style.backgroundColor = '#eee';
      seat.style.cursor = 'pointer';

      seat.addEventListener('click', () => {
        if (selectedSeats.has(seatLabel)) {
          selectedSeats.delete(seatLabel);
          seat.style.backgroundColor = '#eee';
          seat.style.color = '';
        } else {
          selectedSeats.add(seatLabel);
          seat.style.backgroundColor = '#6a11cb';
          seat.style.color = 'white';
        }
      });
    }

    seatsContainer.appendChild(seat);
  }

  /* ================= CREATE SEAT MAP ================= */
  /* ================= CREATE SEAT MAP (PREMIUM UI) ================= */
  function createSeatMap() {
    seatsContainer.innerHTML = '';
    selectedSeats.clear();

    const rows = 12; // increased rows
    const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const bookedSeats = getBookedSeats(currentBookingFlight.id);

    // Create a fuselage container for visual styling
    const fuselage = document.createElement('div');
    fuselage.classList.add('fuselage');

    // Header for the cabin
    const cabinHeader = document.createElement('div');
    cabinHeader.classList.add('cabin-header');
    cabinHeader.innerHTML = `
      <div class="side-label">ABC</div>
      <div class="aisle-label">FRONT</div>
      <div class="side-label">DEF</div>
    `;
    fuselage.appendChild(cabinHeader);

    // Seat Rows
    for (let row = 1; row <= rows; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('seat-row');

      // Left Side (A, B, C)
      for (let i = 0; i < 3; i++) {
        const label = seatLetters[i] + row;
        createSeatButtonNew(label, bookedSeats, rowDiv);
      }

      // Aisle
      const aisle = document.createElement('div');
      aisle.classList.add('aisle-spacer');
      aisle.textContent = row;
      rowDiv.appendChild(aisle);

      // Right Side (D, E, F)
      for (let i = 3; i < seatLetters.length; i++) {
        const label = seatLetters[i] + row;
        createSeatButtonNew(label, bookedSeats, rowDiv);
      }

      fuselage.appendChild(rowDiv);
    }
    seatsContainer.appendChild(fuselage);
  }

  function createSeatButtonNew(seatLabel, bookedSeats, parent) {
    const seat = document.createElement('button');
    seat.textContent = seatLabel; // Show label on hover? or inside?
    seat.classList.add('seat-btn');
    // Optional: Tooltip
    seat.title = seatLabel;

    if (bookedSeats.includes(seatLabel)) {
      seat.classList.add('seat-booked');
      seat.disabled = true;
    } else {
      seat.addEventListener('click', () => {
        if (selectedSeats.has(seatLabel)) {
          selectedSeats.delete(seatLabel);
          seat.classList.remove('seat-selected');
        } else {
          selectedSeats.add(seatLabel);
          seat.classList.add('seat-selected');
        }
      });
    }
    parent.appendChild(seat);
  }

  /* ================= FLIGHT SEARCH (FIXED) ================= */
  flightForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;

    if (!origin || !destination || !date) {
      alert('Please fill all fields');
      return;
    }

    if (origin === destination) {
      alert('Origin and destination cannot be the same.');
      return;
    }

    // DYNAMIC FLIGHT SEARCH
    // Clear previous results and show loading
    resultsDiv.innerHTML = '<p>Searching flights...</p>';

    // STATIC FLIGHT SEARCH MOCK
    // Simulate finding flights
    setTimeout(() => {
      const mockFlights = [
        { baseId: 101, airline: 'Delta Airlines', time: '10:00 AM', price: 45000 },
        { baseId: 102, airline: 'United Airlines', time: '02:30 PM', price: 42000 },
        { baseId: 103, airline: 'Emirates', time: '06:45 PM', price: 55000 },
        { baseId: 104, airline: 'British Airways', time: '09:15 AM', price: 48000 },
        { baseId: 105, airline: 'Lufthansa', time: '01:00 PM', price: 51000 }
      ];

      // "Find" flights for this route
      const flights = mockFlights.map(f => ({
        id: `${f.baseId}-${origin.substring(0, 3).toUpperCase()}-${destination.substring(0, 3).toUpperCase()}`,
        airline: f.airline,
        time: f.time,
        price: f.price,
        origin: origin,
        destination: destination,
        date: date
      }));

      if (flights.length === 0) {
        resultsDiv.innerHTML = '<p>No flights available for this route on this date.</p>';
        return;
      }

      let output = '<h3>Available Flights:</h3><ul>';
      flights.forEach(f => {
        output += `
          <li>
            <strong>${f.airline}</strong> (${f.time}) <br/>
            Flight ID: ${f.id} - ₹${f.price} 
            <button data-id="${f.id}" class="bookFlightBtn" style="margin-left:10px;">Book Now</button>
          </li>`;
      });
      output += '</ul>';
      resultsDiv.innerHTML = output;

      document.querySelectorAll('.bookFlightBtn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentBookingFlight = flights.find(f => f.id == btn.dataset.id);
          flightForm.style.display = 'none';
          resultsDiv.style.display = 'none';
          seatSelectionDiv.style.display = 'block';
          createSeatMap();
        });
      });
    }, 500);
  });

  /* ================= CONFIRM SEATS ================= */
  confirmSeatsBtn.addEventListener('click', () => {
    if (selectedSeats.size === 0) {
      alert('Please select at least one seat.');
      return;
    }
    seatSelectionDiv.style.display = 'none';
    userDetailsDiv.style.display = 'block';
  });

  /* ================= CANCEL ================= */
  cancelSeatsBtn.addEventListener('click', () => {
    seatSelectionDiv.style.display = 'none';
    flightForm.style.display = 'block';
    resultsDiv.style.display = 'block';
    selectedSeats.clear();
    currentBookingFlight = null;
  });

  /* ================= CONFIRM BOOKING ================= */
  userDetailsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('passengerName').value.trim();
    const email = document.getElementById('passengerEmail').value.trim();
    const phone = document.getElementById('passengerPhone').value.trim();

    if (!name || !email || !phone) {
      alert("Please fill in all details.");
      return;
    }

    const oldSeats = getBookedSeats(currentBookingFlight.id);
    const updatedSeats = [...new Set([...oldSeats, ...selectedSeats])];
    saveBookedSeats(currentBookingFlight.id, updatedSeats);

    const seatString = [...selectedSeats].join(', ');

    // Prepare data for email
    const bookingData = {
      name: name,
      email: email,
      origin: currentBookingFlight.origin,
      destination: currentBookingFlight.destination,
      date: currentBookingFlight.date,
      seat: seatString
    };

    // Show processing state
    userDetailsDiv.innerHTML = '<h3>Processing Booking...</h3>';

    // 1. SAVE BOOKING TO PYTHON BACKEND
    // Using port 5000
    const backendUrl = 'http://127.0.0.1:5000/api/bookings';
    const emailUrl = 'http://127.0.0.1:5000/send-confirmation';

    fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    })
      .then(res => res.json())
      .then(savedBooking => {
        console.log('Booking saved to Python backend:', savedBooking);

        // 2. SEND EMAIL
        return fetch(emailUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });
      })
      .then(res => res.json())
      .then(emailData => {
        console.log('Email sent:', emailData);
      })
      .catch(err => {
        console.error('Backend error:', err);
      })
      .finally(() => {
        // Show Confirmation UI
        userDetailsDiv.style.display = 'none';

        const confirmationDiv = document.createElement('div');
        confirmationDiv.id = 'confirmationDiv'; // ADDED ID
        confirmationDiv.style.marginTop = '20px';
        confirmationDiv.style.padding = '20px';
        confirmationDiv.style.border = '2px solid #4CAF50';
        confirmationDiv.style.borderRadius = '10px';
        confirmationDiv.style.backgroundColor = '#f9fff9';
        confirmationDiv.innerHTML = `
          <h2 style="color:#4CAF50;">🎉 Booking Confirmed!</h2>
          <p><strong>Passenger:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Flight:</strong> ${currentBookingFlight.origin} ➝ ${currentBookingFlight.destination}</p>
          <p><strong>Date:</strong> ${currentBookingFlight.date}</p>
          <p><strong>Seats:</strong> ${seatString}</p>
          <p><em>A confirmation email has been sent to ${email}.</em></p>
          <button id="homeBtn" style="margin-top:15px; padding:10px 20px; cursor:pointer;">Book Another Flight</button>
        `;
        document.body.appendChild(confirmationDiv);

        document.getElementById('homeBtn').addEventListener('click', () => {
          confirmationDiv.remove();
          // Reset form and return to home
          flightForm.reset();
          resultsDiv.innerHTML = '';
          flightForm.style.display = 'block';
          resultsDiv.style.display = 'block';
        });

        selectedSeats.clear();
        currentBookingFlight = null;
      });
  });

  /* ================= MY BOOKINGS NAVIGATION ================= */
  const navSearchBtn = document.getElementById('navSearchBtn');
  const navBookingsBtn = document.getElementById('navBookingsBtn');
  const myBookingsView = document.getElementById('myBookingsView');
  const bookingsList = document.getElementById('bookingsList');

  // Helper to close all overlays
  function closeOverlays() {
    seatSelectionDiv.style.display = 'none';
    userDetailsDiv.style.display = 'none';
    const confirm = document.getElementById('confirmationDiv');
    if (confirm) confirm.remove();
  }

  // Switch to Search View
  navSearchBtn.addEventListener('click', () => {
    closeOverlays();
    myBookingsView.style.display = 'none';
    flightForm.style.display = 'block'; // Show Search Form
    resultsDiv.style.display = 'block';

    // Update button styles for active state
    navSearchBtn.style.background = 'transparent';
    navBookingsBtn.style.background = 'rgba(255,255,255,0.2)';
  });

  // Switch to My Bookings View
  navBookingsBtn.addEventListener('click', () => {
    closeOverlays();
    flightForm.style.display = 'none';
    resultsDiv.style.display = 'none';

    myBookingsView.style.display = 'block';

    // Update button styles
    navBookingsBtn.style.background = 'transparent';
    navSearchBtn.style.background = 'rgba(255,255,255,0.2)';

    // Fetch Bookings from Python Backend
    bookingsList.innerHTML = '<p>Loading...</p>';
    fetch('http://127.0.0.1:5000/api/bookings')
      .then(res => {
        if (!res.ok) throw new Error("Backend connection failed");
        return res.json();
      })
      .then(bookings => {
        if (bookings.length === 0) {
          bookingsList.innerHTML = '<p>No bookings found.</p>';
        } else {
          let html = '<ul style="list-style:none; padding:0;">';
          // Show latest first
          bookings.reverse().forEach(b => {
            html += `
              <li style="background:#f0f0f0; margin-bottom:10px; padding:15px; border-radius:8px; border-left: 5px solid #6a11cb;">
                <strong>Flight:</strong> ${b.origin} ➝ ${b.destination}<br/>
                <small>Date: ${b.date} | Seats: ${b.seat}</small><br/>
                <span style="color:#555;">Passenger: ${b.name} (${b.email})</span>
              </li>
             `;
          });
          html += '</ul>';
          bookingsList.innerHTML = html;
        }
      })
      .catch(err => {
        console.error(err);
        bookingsList.innerHTML = '<p style="color:red;">Error loading bookings. Make sure <code>python app.py</code> is running.</p>';
      });
  });

});
