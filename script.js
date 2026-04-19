// script.js

// --- Mock Data ---
const airlines = {
    'AA': { name: 'AeroAir', icon: 'fa-plane' },
    'SH': { name: 'SkyHigh', icon: 'fa-paper-plane' },
    'GE': { name: 'GlobalExpress', icon: 'fa-jet-fighter' }
};

const initialMockFlights = [
    { id: 'FL-101', airline: 'AA', from: 'DEL', to: 'BOM', depTime: '06:00', arrTime: '08:15', duration: '2h 15m', price: 5400, stops: 'Non-stop' },
    { id: 'FL-202', airline: 'SH', from: 'DEL', to: 'BOM', depTime: '09:30', arrTime: '11:40', duration: '2h 10m', price: 6200, stops: 'Non-stop' },
    { id: 'FL-305', airline: 'GE', from: 'DEL', to: 'BOM', depTime: '14:00', arrTime: '17:30', duration: '3h 30m', price: 4800, stops: '1 Stop' },
    { id: 'FL-410', airline: 'AA', from: 'BOM', to: 'BLR', depTime: '07:15', arrTime: '09:00', duration: '1h 45m', price: 4200, stops: 'Non-stop' },
    { id: 'FL-505', airline: 'SH', from: 'BOM', to: 'BLR', depTime: '18:45', arrTime: '20:30', duration: '1h 45m', price: 5100, stops: 'Non-stop' },
];

// Initialize localStorage if empty
if (!localStorage.getItem('flights')) {
    localStorage.setItem('flights', JSON.stringify(initialMockFlights));
}

// Initial Offers Data
if (!localStorage.getItem('offersData')) {
    const defaultOffers = [
        { title: 'Flat 25% Off', desc: 'Get flat 25% off on your first domestic flight booking with AeroBook.', code: 'AEROFEST25', icon: 'fa-plane-arrival', color: '' },
        { title: 'Weekend Getaway', desc: 'Save 10% on flights departing on Friday, Saturday, or Sunday.', code: 'WEEKEND10', icon: 'fa-umbrella-beach', color: 'linear-gradient(135deg, #10B981, #059669)' },
        { title: 'HDFC Bank Special', desc: 'Flat ₹500 discount when paying with HDFC Bank Credit Cards.', code: 'HDFC500', icon: 'fa-credit-card', color: 'linear-gradient(135deg, #F59E0B, #D97706)' }
    ];
    localStorage.setItem('offersData', JSON.stringify(defaultOffers));
}

// Initialize Users in localStorage if empty
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}

// Initialize Bookings in localStorage if empty
if (!localStorage.getItem('userBookings')) {
    localStorage.setItem('userBookings', JSON.stringify([]));
}

function getFlights() {
    return JSON.parse(localStorage.getItem('flights')) || [];
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function getBookings() {
    return JSON.parse(localStorage.getItem('userBookings')) || [];
}

function saveBooking(booking) {
    const bookings = getBookings();
    bookings.push(booking);
    localStorage.setItem('userBookings', JSON.stringify(bookings));
}

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

// Auth Elements
const navLoginBtn = document.getElementById('nav-login-btn');
const navSignupBtn = document.getElementById('nav-signup-btn');
const navLogoutBtn = document.getElementById('nav-logout-btn');
const guestActions = document.getElementById('guest-actions');
const userActions = document.getElementById('user-actions');
const userGreeting = document.getElementById('user-greeting');

const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const authCloseBtns = document.querySelectorAll('.auth-close');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');

const authLoginForm = document.getElementById('auth-login-form');
const authSignupForm = document.getElementById('auth-signup-form');
const loginErrorMsg = document.getElementById('login-error-msg');
const signupErrorMsg = document.getElementById('signup-error-msg');

// Nav Links & Sections
const navHomeBtn = document.getElementById('nav-home');
const navBookingsBtn = document.getElementById('nav-bookings');
const navOffersBtn = document.getElementById('nav-offers');
const navSupportBtn = document.getElementById('nav-support');
const myBookingsSection = document.getElementById('my-bookings-section');
const offersSection = document.getElementById('offers-section');
const supportSection = document.getElementById('support-section');
const bookingsContainer = document.getElementById('bookings-container');
const noBookingsMsg = document.getElementById('no-bookings-msg');
const btnGoSearch = document.getElementById('btn-go-search');

// --- Navigation Logic ---
function showHome() {
    navHomeBtn.classList.add('active');
    navBookingsBtn.classList.remove('active');
    navOffersBtn.classList.remove('active');
    navSupportBtn.classList.remove('active');
    
    myBookingsSection.classList.add('hidden');
    offersSection.classList.add('hidden');
    supportSection.classList.add('hidden');
    heroSection.classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMyBookings() {
    const user = getCurrentUser();
    if (!user) {
        loginModal.classList.remove('hidden');
        return;
    }
    
    navHomeBtn.classList.remove('active');
    navOffersBtn.classList.remove('active');
    navSupportBtn.classList.remove('active');
    navBookingsBtn.classList.add('active');
    
    heroSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    offersSection.classList.add('hidden');
    supportSection.classList.add('hidden');
    myBookingsSection.classList.remove('hidden');
    
    renderMyBookings(user.email);
}

function showOffers() {
    navHomeBtn.classList.remove('active');
    navBookingsBtn.classList.remove('active');
    navSupportBtn.classList.remove('active');
    navOffersBtn.classList.add('active');
    
    heroSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    myBookingsSection.classList.add('hidden');
    supportSection.classList.add('hidden');
    offersSection.classList.remove('hidden');
    
    renderOffers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSupport() {
    navHomeBtn.classList.remove('active');
    navBookingsBtn.classList.remove('active');
    navOffersBtn.classList.remove('active');
    navSupportBtn.classList.add('active');
    
    heroSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    myBookingsSection.classList.add('hidden');
    offersSection.classList.add('hidden');
    supportSection.classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

navHomeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showHome();
});

navBookingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showMyBookings();
});

navOffersBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showOffers();
});

navSupportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showSupport();
});

btnGoSearch.addEventListener('click', () => {
    showHome();
});

// --- Auth Logic ---
function updateHeaderAuth() {
    const user = getCurrentUser();
    if (user) {
        guestActions.classList.add('hidden');
        userActions.classList.remove('hidden');
        userGreeting.textContent = `Hi, ${user.name.split(' ')[0]}`;
    } else {
        guestActions.classList.remove('hidden');
        userActions.classList.add('hidden');
    }
}
updateHeaderAuth();

// Open Auth Modals
navLoginBtn.addEventListener('click', () => { loginModal.classList.remove('hidden'); });
navSignupBtn.addEventListener('click', () => { signupModal.classList.remove('hidden'); });

// Close Auth Modals
authCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        signupModal.classList.add('hidden');
        loginErrorMsg.style.display = 'none';
        signupErrorMsg.style.display = 'none';
        authLoginForm.reset();
        authSignupForm.reset();
    });
});

// Switch between Modals
switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.classList.add('hidden');
    signupModal.classList.remove('hidden');
});
switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupModal.classList.add('hidden');
    loginModal.classList.remove('hidden');
});

// Handle Sign Up
authSignupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        signupErrorMsg.style.display = 'block';
        return;
    }
    
    const newUser = { name, email, password };
    saveUser(newUser);
    
    // Auto login
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    signupModal.classList.add('hidden');
    authSignupForm.reset();
    updateHeaderAuth();
});

// Handle Log In
authLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        loginModal.classList.add('hidden');
        authLoginForm.reset();
        loginErrorMsg.style.display = 'none';
        updateHeaderAuth();
        
        // If they were trying to book, open the booking modal
        if (pendingFlightToBook) {
            openBookingModal(pendingFlightToBook);
            pendingFlightToBook = null;
        }
    } else {
        loginErrorMsg.style.display = 'block';
    }
});

// Handle Log Out
navLogoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('currentUser');
    updateHeaderAuth();
});

let pendingFlightToBook = null;

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
    
    const currentFlights = getFlights();
    let flightsToDisplay = currentFlights.filter(f => 
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
            
            // Check if user is logged in
            if (!getCurrentUser()) {
                pendingFlightToBook = flightData;
                loginModal.classList.remove('hidden');
            } else {
                openBookingModal(flightData);
            }
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
    
    const currentUser = getCurrentUser();
    
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const pnr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const date = document.getElementById('date').value;
    const airlineInfo = airlines[currentSelectedFlight.airline];
    const passengers = document.getElementById('passengers').value;
    const totalAmount = currentSelectedFlight.price * passengers;
    
    // Save to userBookings
    const bookingDetails = {
        userEmail: currentUser.email,
        pnr: pnr,
        firstName: firstName,
        lastName: lastName,
        passengers: passengers,
        totalAmount: totalAmount,
        flightId: currentSelectedFlight.id,
        airlineName: airlineInfo.name,
        airlineIcon: airlineInfo.icon,
        from: currentSelectedFlight.from,
        to: currentSelectedFlight.to,
        depTime: currentSelectedFlight.depTime,
        arrTime: currentSelectedFlight.arrTime,
        date: date,
        bookingDate: new Date().toISOString(),
        status: 'Pending'
    };
    
    saveBooking(bookingDetails);
    
    // Hide booking modal, show success modal
    bookingModal.classList.add('hidden');
    successModal.classList.remove('hidden');
    
    ticketDetails.innerHTML = `
        <strong>Booked By:</strong> ${currentUser ? currentUser.name : 'User'}<br>
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
    searchForm.reset();
    
    // Reset date
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Show My Bookings
    showMyBookings();
});

// Render My Bookings
function renderMyBookings(email) {
    // Clear container except for the no-bookings message
    const allCards = bookingsContainer.querySelectorAll('.ticket-card');
    allCards.forEach(card => card.remove());
    
    const allBookings = getBookings();
    const userBookings = allBookings.filter(b => b.userEmail === email).reverse(); // Newest first
    
    if (userBookings.length === 0) {
        noBookingsMsg.classList.remove('hidden');
    } else {
        noBookingsMsg.classList.add('hidden');
        
        userBookings.forEach(booking => {
            const card = document.createElement('div');
            card.className = 'ticket-card';
            
            const formattedTotal = new Intl.NumberFormat('en-IN', {
                style: 'currency', currency: 'INR', maximumFractionDigits: 0
            }).format(booking.totalAmount);
            
            card.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-airline"><i class="fa-solid ${booking.airlineIcon}"></i> ${booking.airlineName}</div>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <span class="badge ${getBadgeClass(booking.status)}">${booking.status || 'Pending'}</span>
                        <div class="ticket-pnr">PNR: ${booking.pnr}</div>
                    </div>
                </div>
                <div class="ticket-body">
                    <div class="ticket-route">
                        <div class="ticket-city">
                            <h3>${booking.from}</h3>
                            <p>${booking.depTime}</p>
                        </div>
                        <div class="ticket-flight">
                            <p style="font-size: 0.75rem;">${booking.flightId}</p>
                            <i class="fa-solid fa-plane"></i>
                            <p style="font-size: 0.75rem;">${booking.date}</p>
                        </div>
                        <div class="ticket-city" style="text-align: right;">
                            <h3>${booking.to}</h3>
                            <p>${booking.arrTime}</p>
                        </div>
                    </div>
                    
                    <div class="ticket-details-grid">
                        <div>
                            <div class="ticket-label">Passenger</div>
                            <div class="ticket-value">${booking.firstName} ${booking.lastName}</div>
                        </div>
                        <div>
                            <div class="ticket-label">Passengers</div>
                            <div class="ticket-value">${booking.passengers}</div>
                        </div>
                        <div>
                            <div class="ticket-label">Class</div>
                            <div class="ticket-value">Economy</div>
                        </div>
                        <div>
                            <div class="ticket-label">Total Amount</div>
                            <div class="ticket-value" style="color: var(--primary);">${formattedTotal}</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert before the no-bookings message
            bookingsContainer.insertBefore(card, noBookingsMsg);
        });
    }
}

function getBadgeClass(status) {
    if (status === 'Accepted') return 'badge-accepted';
    if (status === 'Rejected') return 'badge-rejected';
    return 'badge-pending';
}

function renderOffers() {
    const offersContainer = document.getElementById('offers-container');
    const offers = JSON.parse(localStorage.getItem('offersData')) || [];
    
    offersContainer.innerHTML = '';
    
    if (offers.length === 0) {
        offersContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No active offers currently.</div>';
        return;
    }
    
    offers.forEach(offer => {
        const div = document.createElement('div');
        div.className = 'offer-card';
        div.innerHTML = `
            <div class="offer-icon" style="${offer.color ? 'background: ' + offer.color + ';' : ''}">
                <i class="fa-solid ${offer.icon || 'fa-tag'}"></i>
            </div>
            <div class="offer-content">
                <h3>${offer.title}</h3>
                <p>${offer.desc}</p>
                <div class="promo-box">
                    <span class="promo-code">${offer.code}</span>
                    <button class="btn btn-outline btn-copy" data-code="${offer.code}">
                        <i class="fa-regular fa-copy"></i> Copy
                    </button>
                </div>
            </div>
        `;
        offersContainer.appendChild(div);
    });
    
    // Re-attach copy listeners
    attachCopyListeners();
}

// Copy Promo Code Logic
function attachCopyListeners() {
    document.querySelectorAll('.btn-copy').forEach(btn => {
        // Remove old listener to avoid duplicates if called multiple times
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            navigator.clipboard.writeText(code).then(() => {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                this.style.background = 'var(--primary)';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.background = 'transparent';
                    this.style.color = 'var(--primary)';
                }, 2000);
            });
        });
    });
}

// Initial attachment
attachCopyListeners();

// Contact Form Logic
const contactForm = document.getElementById('contact-form');
const contactSuccessModal = document.getElementById('contact-success-modal');
const closeContactSuccess = document.getElementById('close-contact-success');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Since there is no backend, just show the success modal
        contactSuccessModal.classList.remove('hidden');
    });
}

if (closeContactSuccess) {
    closeContactSuccess.addEventListener('click', () => {
        contactSuccessModal.classList.add('hidden');
        contactForm.reset();
    });
}
