// ─── APP STATE ────────────────────────────────────────────────────────────
const app = {
    // Constants
    CARS: [
        { id: 1, name: "Swift Dzire", type: "Sedan", price: 1200, available: true, driver: true, seats: 5, fuel: "Petrol", image: "🚗", desc: "Smooth city cruiser, perfect for daily commutes." },
        { id: 2, name: "Mahindra Thar", type: "SUV", price: 2800, available: true, driver: true, seats: 4, fuel: "Diesel", image: "🛻", desc: "Off-road beast for the adventurous soul." },
        { id: 3, name: "Toyota Innova", type: "MPV", price: 2200, available: false, driver: true, seats: 7, fuel: "Diesel", image: "🚐", desc: "Family favourite, spacious and reliable." },
        { id: 4, name: "Hyundai i20", type: "Hatchback", price: 900, available: true, driver: false, seats: 5, fuel: "Petrol", image: "🚙", desc: "Compact and zippy — great mileage in the city." },
        { id: 5, name: "BMW 3 Series", type: "Luxury", price: 5500, available: true, driver: true, seats: 5, fuel: "Petrol", image: "🏎️", desc: "Luxury on wheels. Turn every head on the road." },
        { id: 6, name: "Kia Seltos", type: "SUV", price: 2000, available: true, driver: false, seats: 5, fuel: "Petrol", image: "🚘", desc: "Packed with tech, stylish and powerful." },
        { id: 7, name: "Maruti Ertiga", type: "MPV", price: 1600, available: false, driver: true, seats: 7, fuel: "CNG", image: "🚌", desc: "Budget MPV, ideal for group travel." },
        { id: 8, name: "Tesla Model 3", type: "Luxury", price: 6000, available: true, driver: false, seats: 5, fuel: "Electric", image: "⚡", desc: "Futuristic EV experience with autopilot assist." },
    ],

    DRIVER_COST: 500,

    currentUser: null,
    currentBooking: { carId: null, pickupDate: null, returnDate: null, withDriver: false },
    allBookings: [],
    allUsers: [
        { id: 1, name: "Admin User", email: "admin@vroomvroomrides.com", password: "admin123", bookings: [], isAdmin: true },
    ],
    allCars: [],

    // Helper Functions
    today: () => new Date().toISOString().split("T")[0],
    addDays: (dateStr, n) => {
        const d = new Date(dateStr);
        d.setDate(d.getDate() + n);
        return d.toISOString().split("T")[0];
    },
    daysBetween: (a, b) => Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000)),

    storage: {
        get: (k, fallback) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
        set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    },

    init: function() {
        this.loadData();
        this.restoreUser();
        this.updateNavigation();
    },

    loadData: function() {
        const savedUsers = this.storage.get('users', this.allUsers);
        const savedBookings = this.storage.get('bookings', this.allBookings);
        const savedCars = this.storage.get('cars', null);
        
        this.allUsers = savedUsers;
        this.allBookings = savedBookings;
        
        // If cars are saved in localStorage, use them; otherwise use default CARS
        if (savedCars && Array.isArray(savedCars) && savedCars.length > 0) {
            this.CARS = savedCars;
        } else {
            // Keep the default CARS array intact
            this.CARS = this.CARS;
        }
        this.allCars = this.CARS;
    },

    saveData: function() {
        this.storage.set('users', this.allUsers);
        this.storage.set('bookings', this.allBookings);
        this.storage.set('cars', this.CARS);
    },

    addCar: function(carData) {
        if (!carData.name || !carData.type || !carData.price || !carData.seats || !carData.fuel || !carData.image) {
            this.showToast('Please fill all car details', 'error');
            return false;
        }

        const newCar = {
            id: Math.max(...this.CARS.map(c => c.id), 0) + 1,
            name: carData.name,
            type: carData.type,
            price: parseInt(carData.price),
            available: carData.available,
            driver: carData.driver,
            seats: parseInt(carData.seats),
            fuel: carData.fuel,
            image: carData.image,
            desc: carData.desc || '',
        };

        this.CARS.push(newCar);
        this.saveData();
        this.showToast('Car added successfully!', 'success');
        return true;
    },

    deleteCar: function(carId) {
        if (confirm('Are you sure you want to delete this car?')) {
            this.CARS = this.CARS.filter(c => c.id !== carId);
            this.saveData();
            this.showToast('Car deleted successfully', 'success');
            return true;
        }
        return false;
    },

    updateCarAvailability: function(carId, available) {
        const car = this.CARS.find(c => c.id === carId);
        if (car) {
            car.available = available;
            this.saveData();
            this.showToast('Car status updated', 'success');
        }
    },

    restoreUser: function() {
        const savedUser = this.storage.get('currentUser', null);
        if (savedUser) {
            this.currentUser = savedUser;
        }
    },

    updateNavigation: function() {
        if (this.currentUser) {
            const navAuth = document.getElementById('nav-auth');
            if (navAuth) navAuth.textContent = 'Logout';
            
            const navUserInfo = document.getElementById('nav-user-info');
            if (navUserInfo) navUserInfo.style.display = 'flex';
            
            const currentUserEl = document.getElementById('current-user');
            if (currentUserEl) currentUserEl.textContent = this.currentUser.name;
            
            const avatarEl = document.getElementById('user-avatar');
            if (avatarEl) avatarEl.textContent = this.currentUser.name.charAt(0).toUpperCase();
        } else {
            const navAuth = document.getElementById('nav-auth');
            if (navAuth) navAuth.textContent = 'Login';
            
            const navUserInfo = document.getElementById('nav-user-info');
            if (navUserInfo) navUserInfo.style.display = 'none';
        }
    },

    handleLogin: function(email, password) {
        if (!email || !password) {
            this.showToast('Please fill all fields', 'error');
            return false;
        }

        const user = this.allUsers.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            this.storage.set('currentUser', user);
            this.updateNavigation();
            this.showToast('Login successful!', 'success');
            return true;
        } else {
            this.showToast('Invalid credentials', 'error');
            return false;
        }
    },

    handleSignup: function(name, email, password, confirm) {
        if (!name || !email || !password || !confirm) {
            this.showToast('Please fill all fields', 'error');
            return false;
        }

        if (password !== confirm) {
            this.showToast('Passwords do not match', 'error');
            return false;
        }

        if (this.allUsers.find(u => u.email === email)) {
            this.showToast('Email already registered', 'error');
            return false;
        }

        const newUser = {
            id: Math.max(...this.allUsers.map(u => u.id), 0) + 1,
            name: name,
            email: email,
            password: password,
            bookings: [],
            isAdmin: false,
        };

        this.allUsers.push(newUser);
        this.saveData();
        this.showToast('Account created successfully!', 'success');
        return true;
    },

    handleLogout: function() {
        this.currentUser = null;
        this.storage.set('currentUser', null);
        this.updateNavigation();
        this.showToast('Logged out successfully', 'success');
        window.location.href = 'index.html';
    },

    openBookingModal: function(carId) {
        if (!this.currentUser) {
            this.showToast('Please login first', 'error');
            window.location.href = 'login.html';
            return;
        }

        const car = this.CARS.find(c => c.id === carId);
        if (!car || !car.available) {
            this.showToast('Car is not available', 'error');
            return;
        }

        this.currentBooking = { carId: carId, pickupDate: null, returnDate: null, withDriver: false };
        const bookingModal = document.getElementById('booking-modal');
        
        if (bookingModal) {
            document.getElementById('booking-emoji').textContent = car.image;
            document.getElementById('booking-car-name').textContent = car.name;
            document.getElementById('booking-car-desc').textContent = car.desc;
            document.getElementById('booking-pickup').value = '';
            document.getElementById('booking-return').value = '';
            document.getElementById('driver-option-no').classList.add('selected');
            document.getElementById('driver-option-yes').classList.remove('selected');

            const minDate = this.today();
            document.getElementById('booking-pickup').min = minDate;
            document.getElementById('booking-return').min = minDate;

            bookingModal.style.display = 'flex';
            this.updateBookingSummary();
        }
    },

    closeBookingModal: function() {
        const bookingModal = document.getElementById('booking-modal');
        if (bookingModal) bookingModal.style.display = 'none';
    },

    selectDriver: function(withDriver) {
        this.currentBooking.withDriver = withDriver;
        document.getElementById('driver-option-no').classList.toggle('selected', !withDriver);
        document.getElementById('driver-option-yes').classList.toggle('selected', withDriver);
        this.updateBookingSummary();
    },

    updateBookingSummary: function() {
        const car = this.CARS.find(c => c.id === this.currentBooking.carId);
        const pickup = document.getElementById('booking-pickup').value;
        const returnDate = document.getElementById('booking-return').value;

        if (!pickup || !returnDate) {
            document.getElementById('summary-car-price').textContent = '0';
            document.getElementById('summary-driver-price').textContent = '0';
            document.getElementById('summary-total').textContent = '0';
            return;
        }

        const days = this.daysBetween(pickup, returnDate);
        const carTotal = car.price * days;
        const driverTotal = this.currentBooking.withDriver ? this.DRIVER_COST * days : 0;
        const total = carTotal + driverTotal;

        document.getElementById('summary-car-price').textContent = carTotal;
        document.getElementById('summary-driver-price').textContent = driverTotal;
        document.getElementById('summary-total').textContent = total;
    },

    confirmBooking: function() {
        const pickup = document.getElementById('booking-pickup').value;
        const returnDate = document.getElementById('booking-return').value;

        if (!pickup || !returnDate) {
            this.showToast('Please select dates', 'error');
            return;
        }

        const car = this.CARS.find(c => c.id === this.currentBooking.carId);
        const days = this.daysBetween(pickup, returnDate);
        const carTotal = car.price * days;
        const driverTotal = this.currentBooking.withDriver ? this.DRIVER_COST * days : 0;
        const total = carTotal + driverTotal;

        const booking = {
            id: Math.max(...this.allBookings.map(b => b.id), 0) + 1,
            userId: this.currentUser.id,
            carId: this.currentBooking.carId,
            carName: car.name,
            carImage: car.image,
            pickupDate: pickup,
            returnDate: returnDate,
            withDriver: this.currentBooking.withDriver,
            total: total,
            status: 'Confirmed',
            paymentStatus: 'Pending',
            createdAt: new Date().toISOString(),
        };

        this.allBookings.push(booking);
        this.currentUser.bookings.push(booking.id);
        this.saveData();

        this.showToast('Booking confirmed!', 'success');
        this.closeBookingModal();
    },

    cancelBookingCustomer: function(bookingId) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            this.allBookings = this.allBookings.filter(b => b.id !== bookingId);
            this.saveData();
            this.showToast('Booking cancelled successfully', 'success');
            location.reload();
        }
    },

    payBooking: function(bookingId) {
        const booking = this.allBookings.find(b => b.id === bookingId);
        if (booking) {
            booking.paymentStatus = 'Paid';
            this.saveData();
            this.showToast(`Payment of ₹${booking.total} completed successfully!`, 'success');
            location.reload();
        }
    },

    cancelBookingAdmin: function(bookingId) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            this.allBookings = this.allBookings.filter(b => b.id !== bookingId);
            this.saveData();
            this.showToast('Booking cancelled', 'success');
            location.reload();
        }
    },

    processRefund: function(bookingId) {
        if (confirm('Process refund for this booking?')) {
            this.showToast('Refund processed successfully', 'success');
        }
    },

    deleteUser: function(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.allUsers = this.allUsers.filter(u => u.id !== userId);
            this.allBookings = this.allBookings.filter(b => b.userId !== userId);
            this.saveData();
            this.showToast('User deleted', 'success');
            location.reload();
        }
    },

    viewUserDetails: function(userId) {
        const user = this.allUsers.find(u => u.id === userId);
        if (!user) return;
        
        const userBookings = this.allBookings.filter(b => b.userId === userId);
        alert(`
CUSTOMER DETAILS
================
Name: ${user.name}
Email: ${user.email}
Password: ${user.password}
Phone: N/A
Bookings: ${user.bookings.length}

BOOKING HISTORY:
${userBookings.length === 0 ? 'No bookings' : userBookings.map(b => `- ${b.carName} (${b.pickupDate} to ${b.returnDate}) - ₹${b.total}`).join('\n')}
        `);
    },

    showToast: function(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
            <span>${message}</span>
        `;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },
};

// Initialize immediately when script loads
app.init();
