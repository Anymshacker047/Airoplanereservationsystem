// script.js

// --- Mock Data ---
const airlines = {
    'AA': { name: 'AeroAir', icon: 'fa-plane' },
    'SH': { name: 'SkyHigh', icon: 'fa-paper-plane' },
    'GE': { name: 'GlobalExpress', icon: 'fa-jet-fighter' }
};

const mockFlights = [
    { id: 'FL-101', airline: 'AA', from: 'DEL', to: 'BOM', depTime: '06:00', arrTime: '08:15', duration: '2h 15m', price: 5400, stops: 'Non-stop' },
    { id: 'FL-202', airline: 'SH', from: 'DEL', to: 'BOM', depTime: '09:30', arrTime: '11:40', duration: '2h 10m', price: 6200, stops: 'Non-stop' },
    { id: 'FL-305', airline: 'GE', from: 'DEL', to: 'BOM', depTime: '14:00', arrTime: '17:30', duration: '3h 30m', price: 4800, stops: '1 Stop' },
    { id: 'FL-410', airline: 'AA', from: 'BOM', to: 'BLR', depTime: '07:15', arrTime: '09:00', duration: '1h 45m', price: 4200, stops: 'Non-stop' },
    { id: 'FL-505', airline: 'SH', from: 'BOM', to: 'BLR', depTime: '18:45', arrTime: '20:30', duration: '1h 45m', price: 5100, stops: 'Non-stop' },
];

// Generate some random flights if exact match isn't found
function generateRandomFlights(source, dest) {
    const flights = [];
    const airlinesList = Object.keys(airlines);
    const numFlights = Math.floor(Math.random() * 4) + 2; // 2 to 5 flights
    
    for (let i = 0; i < numFlights; i++) {
        const airlineCode = airlinesList[Math.floor(Math.random() * airlinesList.length)];
        const hour = Math.floor(Math.random() * 18) + 5; // 5 AM to 11 PM
        const depTime = `${hour.toString().padStart(2, '0')}:00`;
        const arrTime = `${(hour + 2).toString().padStart(2, '0')}:30`;
        
        flights.push({
            id: `FL-${Math.floor(Math.random() * 900) + 100}`,
            airline: airlineCode,
            from: source.substring(0, 3).toUpperCase(),
            to: dest.substring(0, 3).toUpperCase(),
            depTime: depTime,
            arrTime: arrTime,
            duration: '2h 30m',
            price: Math.floor(Math.random() * 5000) + 3000,
            stops: Math.random() > 0.7 ? '1 Stop' : 'Non-stop'
        });
    }
    return flights;
}

// --- DOM Elements ---
const searchForm = document.getElementById('flight-search-form');
const heroSection = document.getElementById('hero');
const resultsSection = document.getElementById('results');
const flightListContainer = document.getElementById('flight-list-container');

// Summary elements
const sumSource = document.getElementById('summary-source');
const sumDest = document.getElementById('summary-destination');
const sumDate = document.getElementById('summary-date');

// Modals
const bookingModal = document.getElementById('booking-modal');
const successModal = document.getElementById('success-modal');
const closeBookingModal = document.querySelector('.close-modal');
const bookingForm = document.getElementById('booking-form');
const selectedFlightSummary = document.getElementById('selected-flight-summary');
const ticketDetails = document.getElementById('ticket-details');
const closeSuccessBtn = document.getElementById('close-success');

// Exchange Source/Dest
document.querySelector('.exchange-icon').addEventListener('click', () => {
    const sourceInput = document.getElementById('source');
    const destInput = document.getElementById('destination');
    const temp = sourceInput.value;
    sourceInput.value = destInput.value;
    destInput.value = temp;
});

// Set minimum date to today
const dateInput = document.getElementById('date');
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);
dateInput.value = today;

// Selected Flight Data
let currentSelectedFlight = null;

// --- Event Listeners ---

// Search Form Submit
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const source = document.getElementById('source').value;
    const dest = document.getElementById('destination').value;
    const date = document.getElementById('date').value;
    const passengers = document.getElementById('passengers').value;
    
    // Update summary
    sumSource.textContent = source;
    sumDest.textContent = dest;
    sumDate.textContent = date;
    
    // Show results section, hide hero slightly or scroll
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Fetch and display flights
    displayFlights(source, dest, passengers);
});

// Display Flights
function displayFlights(source, dest, passengers) {
    flightListContainer.innerHTML = ''; // Clear previous
    
    // Try to find mock flights, otherwise generate random
    let flightsToDisplay = mockFlights.filter(f => 
        f.from.toLowerCase() === source.substring(0,3).toLowerCase() && 
        f.to.toLowerCase() === dest.substring(0,3).toLowerCase()
    );
    
    if (flightsToDisplay.length === 0) {
        flightsToDisplay = generateRandomFlights(source, dest);
    }
    
    flightsToDisplay.forEach(flight => {
        const airlineInfo = airlines[flight.airline];
        const flightElement = document.createElement('div');
        flightElement.className = 'flight-card';
        
        // Format price in INR
        const formattedPrice = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(flight.price);
        
        flightElement.innerHTML = `
            <div class="airline-info">
                <div class="airline-logo">
                    <i class="fa-solid ${airlineInfo.icon}"></i>
                </div>
                <div>
                    <div class="airline-name">${airlineInfo.name}</div>
                    <div class="flight-number">${flight.id} | ${flight.stops}</div>
                </div>
            </div>
            
            <div class="flight-timing">
                <div class="time-box">
                    <div class="time">${flight.depTime}</div>
                    <div class="city">${flight.from}</div>
                </div>
                
                <div class="duration-box">
                    <div class="duration">${flight.duration}</div>
                    <div class="line">
                        <i class="fa-solid fa-plane"></i>
                    </div>
                </div>
                
                <div class="time-box">
                    <div class="time">${flight.arrTime}</div>
                    <div class="city">${flight.to}</div>
                </div>
            </div>
            
            <div class="flight-price">
                <div class="price">${formattedPrice}</div>
                <button class="btn btn-primary btn-book" data-flight='${JSON.stringify(flight)}'>
                    Book Now
                </button>
            </div>
        `;
        
        flightListContainer.appendChild(flightElement);
    });
    
    // Add event listeners to newly created buttons
    document.querySelectorAll('.btn-book').forEach(btn => {
        btn.addEventListener('click', function() {
            const flightData = JSON.parse(this.getAttribute('data-flight'));
            openBookingModal(flightData);
        });
    });
}

// Open Booking Modal
function openBookingModal(flight) {
    currentSelectedFlight = flight;
    const airlineInfo = airlines[flight.airline];
    const passengers = document.getElementById('passengers').value;
    const total = flight.price * passengers;
    
    const formattedTotal = new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(total);
    
    selectedFlightSummary.innerHTML = `
        <strong>${airlineInfo.name} (${flight.id})</strong><br>
        ${flight.from} (${flight.depTime}) &rarr; ${flight.to} (${flight.arrTime})<br>
        Passengers: ${passengers} | <strong>Total Payable: ${formattedTotal}</strong>
    `;
    
    bookingModal.classList.remove('hidden');
}

// Close Booking Modal
closeBookingModal.addEventListener('click', () => {
    bookingModal.classList.add('hidden');
});

// Close modal if clicked outside
window.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
        bookingModal.classList.add('hidden');
    }
});

// Handle Booking Submission
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const pnr = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Hide booking modal, show success modal
    bookingModal.classList.add('hidden');
    successModal.classList.remove('hidden');
    
    const airlineInfo = airlines[currentSelectedFlight.airline];
    const date = document.getElementById('date').value;
    
    ticketDetails.innerHTML = `
        <strong>Passenger:</strong> ${firstName} ${lastName}<br>
        <strong>PNR:</strong> ${pnr}<br>
        <strong>Flight:</strong> ${airlineInfo.name} ${currentSelectedFlight.id}<br>
        <strong>Route:</strong> ${currentSelectedFlight.from} to ${currentSelectedFlight.to}<br>
        <strong>Date & Time:</strong> ${date} | ${currentSelectedFlight.depTime}<br>
    `;
});

// Close Success Modal
closeSuccessBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');
    resultsSection.classList.add('hidden');
    searchForm.reset();
    
    // Reset date
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
