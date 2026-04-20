// admin.js

// --- Mock Airlines Data (Same as script.js) ---
const airlines = {
    'AA': { name: 'AeroAir' },
    'SH': { name: 'SkyHigh' },
    'GE': { name: 'GlobalExpress' }
};

// --- DOM Elements ---
const loginSection = document.getElementById('admin-login');
const dashboardSection = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const flightsTableBody = document.getElementById('flights-body');
const addFlightModal = document.getElementById('add-flight-modal');
const openAddModalBtn = document.getElementById('open-add-modal');
const closeAddModalBtn = document.querySelector('.close-modal');
const addFlightForm = document.getElementById('add-flight-form');

const navFlights = document.getElementById('admin-nav-flights');
const navBookings = document.getElementById('admin-nav-bookings');
const navOffers = document.getElementById('admin-nav-offers');
const navSettings = document.getElementById('admin-nav-settings');

const flightsSection = document.getElementById('admin-flights-section');
const bookingsSection = document.getElementById('admin-bookings-section');
const offersSection = document.getElementById('admin-offers-section');
const settingsSection = document.getElementById('admin-settings-section');

const bookingsTableBody = document.getElementById('bookings-body');
const offersTableBody = document.getElementById('offers-body');
const usersTableBody = document.getElementById('users-body');

const addOfferModal = document.getElementById('add-offer-modal');
const openAddOfferBtn = document.getElementById('open-add-offer-modal');
const closeOfferModalBtn = document.getElementById('close-offer-modal');
const addOfferForm = document.getElementById('add-offer-form');

// --- Initialization ---

// Check if already logged in (using sessionStorage so it clears on tab close)
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    showDashboard();
}

// Ensure localStorage has data
if (!localStorage.getItem('flights')) {
    // If not, redirect to index to initialize, or initialize here
    window.location.href = 'index.html';
}

function getFlights() {
    return JSON.parse(localStorage.getItem('flights')) || [];
}

function saveFlights(flights) {
    localStorage.setItem('flights', JSON.stringify(flights));
}

function getBookings() {
    return JSON.parse(localStorage.getItem('userBookings')) || [];
}

function saveBookings(bookings) {
    localStorage.setItem('userBookings', JSON.stringify(bookings));
}

function getOffers() {
    return JSON.parse(localStorage.getItem('offersData')) || [];
}

function saveOffers(offers) {
    localStorage.setItem('offersData', JSON.stringify(offers));
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// --- Login Logic ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('admin-pass').value;
    
    if (pass === 'anymshere') { // Mock password
        sessionStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    } else {
        loginError.style.display = 'block';
    }
});

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('adminLoggedIn');
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    document.getElementById('admin-pass').value = '';
    loginError.style.display = 'none';
});

function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    renderFlightsTable();
}

// --- Navigation Logic ---
function resetNavAndSections() {
    navFlights.classList.remove('active');
    navBookings.classList.remove('active');
    navOffers.classList.remove('active');
    if(navSettings) navSettings.classList.remove('active');
    
    flightsSection.classList.add('hidden');
    bookingsSection.classList.add('hidden');
    offersSection.classList.add('hidden');
    if(settingsSection) settingsSection.classList.add('hidden');
}

navFlights.addEventListener('click', (e) => {
    e.preventDefault();
    resetNavAndSections();
    navFlights.classList.add('active');
    flightsSection.classList.remove('hidden');
    renderFlightsTable();
});

navBookings.addEventListener('click', (e) => {
    e.preventDefault();
    resetNavAndSections();
    navBookings.classList.add('active');
    bookingsSection.classList.remove('hidden');
    renderBookingsTable();
});

navOffers.addEventListener('click', (e) => {
    e.preventDefault();
    resetNavAndSections();
    navOffers.classList.add('active');
    offersSection.classList.remove('hidden');
    renderOffersTable();
});

if (navSettings) {
    navSettings.addEventListener('click', (e) => {
        e.preventDefault();
        resetNavAndSections();
        navSettings.classList.add('active');
        settingsSection.classList.remove('hidden');
        renderUsersTable();
    });
}

// --- Dashboard Logic ---

function renderFlightsTable() {
    const flights = getFlights();
    flightsTableBody.innerHTML = '';
    
    flights.forEach((flight, index) => {
        const tr = document.createElement('tr');
        
        const airlineName = airlines[flight.airline] ? airlines[flight.airline].name : flight.airline;
        
        tr.innerHTML = `
            <td><strong>${flight.id}</strong></td>
            <td>${airlineName}</td>
            <td>${flight.from} &rarr; ${flight.to}</td>
            <td>${flight.depTime}</td>
            <td>${flight.arrTime}</td>
            <td>₹${flight.price}</td>
            <td>
                <button class="btn-danger delete-btn" data-index="${index}">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </td>
        `;
        flightsTableBody.appendChild(tr);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            deleteFlight(index);
        });
    });
}

// Add Flight Modal
openAddModalBtn.addEventListener('click', () => {
    addFlightModal.classList.remove('hidden');
});

closeAddModalBtn.addEventListener('click', () => {
    addFlightModal.classList.add('hidden');
});

// Handle Add Flight Submit
addFlightForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newFlight = {
        id: document.getElementById('new-id').value.toUpperCase(),
        airline: document.getElementById('new-airline').value,
        from: document.getElementById('new-from').value.toUpperCase(),
        to: document.getElementById('new-to').value.toUpperCase(),
        depTime: document.getElementById('new-dep').value,
        arrTime: document.getElementById('new-arr').value,
        duration: '2h 00m', // Default mock duration
        price: parseInt(document.getElementById('new-price').value),
        stops: document.getElementById('new-stops').value
    };
    
    const flights = getFlights();
    flights.push(newFlight);
    saveFlights(flights);
    
    // Reset form and close modal
    addFlightForm.reset();
    addFlightModal.classList.add('hidden');
    
    // Re-render table
    renderFlightsTable();
});

// Delete Flight
function deleteFlight(index) {
    if (confirm('Are you sure you want to delete this flight?')) {
        const flights = getFlights();
        flights.splice(index, 1);
        saveFlights(flights);
        renderFlightsTable();
    }
}

// Render Bookings Table
function renderBookingsTable() {
    const bookings = getBookings().reverse(); // Show newest first
    bookingsTableBody.innerHTML = '';
    
    if (bookings.length === 0) {
        bookingsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No bookings found.</td></tr>';
        return;
    }
    
    bookings.forEach((booking, idx) => {
        const tr = document.createElement('tr');
        
        const formattedTotal = new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(booking.totalAmount);
        
        const status = booking.status || 'Pending';
        let statusBadgeClass = 'badge-pending';
        if (status === 'Accepted') statusBadgeClass = 'badge-accepted';
        if (status === 'Rejected') statusBadgeClass = 'badge-rejected';
        
        // Reverse index mapping to update correct item in local storage array
        const originalIndex = bookings.length - 1 - idx; 
        
        let actionHTML = '';
        if (status === 'Pending') {
            actionHTML = `
                <div style="display: flex; gap: 8px;">
                    <button class="btn-success accept-btn" data-index="${originalIndex}"><i class="fa-solid fa-check"></i></button>
                    <button class="btn-danger reject-btn" data-index="${originalIndex}"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `;
        } else {
            actionHTML = `<span style="color: var(--text-muted); font-size: 0.85rem;">Completed</span>`;
        }
        
        tr.innerHTML = `
            <td><strong>${booking.pnr}</strong></td>
            <td>${booking.firstName} ${booking.lastName}</td>
            <td>${booking.userEmail}</td>
            <td>${booking.flightId}</td>
            <td>${booking.from} &rarr; ${booking.to}</td>
            <td>${booking.date}</td>
            <td style="color: var(--primary); font-weight: bold;">${formattedTotal}</td>
            <td><span class="badge ${statusBadgeClass}">${status}</span></td>
            <td>${actionHTML}</td>
        `;
        bookingsTableBody.appendChild(tr);
    });
    
    // Attach event listeners for Accept/Reject buttons
    document.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            updateBookingStatus(this.getAttribute('data-index'), 'Accepted');
        });
    });
    
    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Removed confirm() as it might be blocked in some browser previews
            updateBookingStatus(this.getAttribute('data-index'), 'Rejected');
        });
    });
}

function updateBookingStatus(index, newStatus) {
    const allBookings = getBookings();
    if (allBookings[index]) {
        allBookings[index].status = newStatus;
        saveBookings(allBookings);
        renderBookingsTable();
    }
}

// --- Manage Offers Logic ---
function renderOffersTable() {
    const offers = getOffers();
    offersTableBody.innerHTML = '';
    
    if (offers.length === 0) {
        offersTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No active offers.</td></tr>';
        return;
    }
    
    offers.forEach((offer, index) => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><strong>${offer.title}</strong></td>
            <td><span class="promo-code" style="font-size: 0.85rem; padding: 4px 8px;">${offer.code}</span></td>
            <td>${offer.desc}</td>
            <td>
                <button class="btn-danger delete-offer-btn" data-index="${index}">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </td>
        `;
        offersTableBody.appendChild(tr);
    });
    
    document.querySelectorAll('.delete-offer-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteOffer(this.getAttribute('data-index'));
        });
    });
}

// Add Offer Modal Controls
openAddOfferBtn.addEventListener('click', () => {
    addOfferModal.classList.remove('hidden');
});

closeOfferModalBtn.addEventListener('click', () => {
    addOfferModal.classList.add('hidden');
});

// Handle Add Offer Submit
addOfferForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Choose random colors/icons for variety
    const colors = [
        '',
        'linear-gradient(135deg, #10B981, #059669)',
        'linear-gradient(135deg, #F59E0B, #D97706)',
        'linear-gradient(135deg, #3B82F6, #2563EB)',
        'linear-gradient(135deg, #8B5CF6, #7C3AED)'
    ];
    const icons = ['fa-plane-arrival', 'fa-umbrella-beach', 'fa-credit-card', 'fa-gift', 'fa-percent'];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    const newOffer = {
        title: document.getElementById('new-offer-title').value,
        code: document.getElementById('new-offer-code').value.toUpperCase(),
        desc: document.getElementById('new-offer-desc').value,
        icon: randomIcon,
        color: randomColor
    };
    
    const offers = getOffers();
    offers.push(newOffer);
    saveOffers(offers);
    
    addOfferForm.reset();
    addOfferModal.classList.add('hidden');
    renderOffersTable();
});

// Delete Offer
function deleteOffer(index) {
    if (confirm('Are you sure you want to delete this promo code?')) {
        const offers = getOffers();
        offers.splice(index, 1);
        saveOffers(offers);
        renderOffersTable();
    }
}

// --- Manage Users Logic ---
function renderUsersTable() {
    if (!usersTableBody) return;
    const users = getUsers();
    usersTableBody.innerHTML = '';
    
    if (users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No registered users.</td></tr>';
        return;
    }
    
    users.forEach((user, index) => {
        const tr = document.createElement('tr');
        const passLength = user.password ? user.password.length : 6;
        
        tr.innerHTML = `
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>${'*'.repeat(passLength)}</td>
            <td>
                <button class="btn-danger delete-user-btn" data-index="${index}">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </td>
        `;
        usersTableBody.appendChild(tr);
    });
    
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteUser(this.getAttribute('data-index'));
        });
    });
}

function deleteUser(index) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = getUsers();
        users.splice(index, 1);
        saveUsers(users);
        renderUsersTable();
    }
}
