// ==================== API CONFIGURATION ====================
const API_BASE_URL = '';

// API Functions for backend communication
async function apiSignup(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, data: { error: 'Network error. Please try again.' } };
    }
}

async function apiLogin(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, data: { error: 'Network error. Please try again.' } };
    }
}

async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/check-auth`);
        const data = await response.json();
        
        if (data.authenticated) {
            return data.user;
        }
        return null;
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}

// ==================== MEDICATION API FUNCTIONS ====================//

async function apiGetMedications() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch(`${API_BASE_URL}/api/medications`, {
            method: 'GET', 
            headers: {
                'Authorization': `Bearer ${user.user_id}`  // FIXED: user.user_id not user.user
            }
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Get medications error:', error);
        return { success: false, data: { error: 'Network error. Please try again.' } };
    }
}

async function apiGetMonthlyMedications(year, month) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch(`${API_BASE_URL}/api/medications/monthly?year=${year}&month=${month}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user.user_id}`  // FIXED: user.user_id not user.user
            }
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Get monthly medications error:', error);
        return { success: false, data: { error: 'Network error. Please try again.' } };
    }
}

async function apiGetTodayMedications() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch(`${API_BASE_URL}/api/medications/today`, {
            method: 'GET', 
            headers: {
                'Authorization': `Bearer ${user.user_id}`,
                'User-Id': user.user_id  // Add this fallback header
            },
            credentials: 'include'  // Important for session cookies
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Get today medications error:', error);
        return { success: false, data: { error: 'Network error. Please try again.' } };
    }
}

async function apiAddMedication(medicationData) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const response = await fetch(`${API_BASE_URL}/api/medications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.user_id}`,
                'User-Id': user.user_id  // ADD THIS LINE
            },
            body: JSON.stringify(medicationData),
            credentials: 'include'
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Add medication error:', error);
        return { success: false, data: { error: 'Network error. Please try again.' } };
    }
}
async function apiUpdateMedication(medicineId, medicationData) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const response = await fetch(`${API_BASE_URL}/api/medications/${medicineId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.user_id}`  // ADD THIS LINE
            },
            body: JSON.stringify(medicationData)
            // Remove credentials: 'include'
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Update medication error:', error);
        return { success: false, data: { error: 'Network error. Please try again.' } };
    }
}
async function apiDeleteMedication(medicationId) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const response = await fetch(`${API_BASE_URL}/api/medications/${medicationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user.user_id}`,
                'User-Id': user.user_id,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        return { success: response.ok, data }; // ← ADD THIS RETURN STATEMENT
    } catch (error) {
        console.error('Delete medication API error:', error);
        return { success: false, data: { error: 'Network error. Please try again.' } }; // ← AND THIS ONE
    }
}

async function apiUpdateMedicationStatus(medicineId, status) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        console.log(`🔄 Calling API to update medication ${medicineId} status to ${status}`);
        
        const response = await fetch(`${API_BASE_URL}/api/medications/${medicineId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.user_id}`,
                'User-Id': user.user_id
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();
        console.log(`📊 Status update API response:`, data);
        
        return { success: response.ok, data };
    } catch (error) {
        console.error('Update medication status error:', error);
        return { success: false, data: { error: 'Network error. Please try again.' } };
    }
}


async function apiGetMyMedications() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch(`${API_BASE_URL}/api/my-medications`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user.user_id}`,
                'User-Id': user.user_id  // Fallback header
            }
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Get my medications error:', error);
        return { success: false, data: { error: 'Network error. Please try again.' } };
    }
}

async function apiSearchMyMedications(searchTerm) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch(`${API_BASE_URL}/api/my-medications/search?q=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user.user_id}`,
                'User-Id': user.user_id  // Fallback header
            }
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.error('Search medications error:', error);
        return { success: false, data: { error: 'Network error. Please try again.' } };
    }
}
//====Modals====//
// ==================== MODAL FUNCTIONS ====================
function closeModal() {
    const medicineModal = document.getElementById('medicineModal');
    const medicineForm = document.getElementById('medicineForm');
    
    if (medicineModal) {
        medicineModal.style.display = 'none';
    }
    if (medicineForm) {
        medicineForm.reset();
    }
    editingMedicineId = null;
}

function openModal() {
    const medicineModal = document.getElementById('medicineModal');
    if (!medicineModal) {
        console.log('❌ Medicine modal not found on this page');
        return;
    }
    
    medicineModal.style.display = 'flex';
    editingMedicineId = null;
    
    // Set default values
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // Set start date to today
    const startDateInput = document.getElementById('medicineStartDate');
    if (startDateInput) startDateInput.value = formattedDate;
    
    // Set end date to 1 week from today
    const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const formattedEndDate = oneWeekLater.toISOString().split('T')[0];
    const endDateInput = document.getElementById('medicineEndDate');
    if (endDateInput) endDateInput.value = formattedEndDate;
    
    // Set default time to next hour
    const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
    const formattedTime = nextHour.toTimeString().slice(0, 5);
    const timeInput = document.getElementById('medicineTime');
    if (timeInput) timeInput.value = formattedTime;
    
    // Set frequency to daily
    const frequencySelect = document.getElementById('medicineFrequency');
    if (frequencySelect) frequencySelect.value = 'daily';
    
    // Update modal title and button
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    if (modalTitle) modalTitle.textContent = 'Add New Medicine';
    if (submitBtn) submitBtn.textContent = 'Add Medicine';
    
    console.log('✅ Medicine modal opened with default values');
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
// ==================== AUTH FORMS ====================
function initAuthForms() {
    console.log("initAuthForms called - setting up form handlers");
    
    // Login Form Handling
    const loginForm = document.querySelector('.auth-form');
    if (loginForm && window.location.pathname.includes('login.html')) {
        console.log("Setting up login form handler");
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Login form submitted");

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !password) {
                alert('Please fill in all fields.');
                return;
            }

            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;

            // Use the API function
            const result = await apiLogin(email, password);
            
            if (result.success) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(result.data.user));
                alert('Login successful!');
                
                // Redirect based on role
                if (result.data.user.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'user dashboard.html';
                }
            } else {
                alert(result.data.error || 'Login failed');
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Signup Form Handling
    if (loginForm && window.location.pathname.includes('signup.html')) {
        console.log("Setting up signup form handler");
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Signup form submitted");

            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();
            const age = document.getElementById('age')?.value;
            const gender = document.getElementById('gender')?.value;
            const contact = document.getElementById('contact')?.value;

            if (!fullname || !email || !password || !confirmPassword) {
                alert('Please fill in all required fields.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;

            const formData = {
                name: fullname,
                email: email,
                password: password,
                age: age || null,
                gender: gender || null,
                contact: contact || null,
                role: 'client'
            };

            console.log("Sending signup data:", formData);

            // Use the API function
            const result = await apiSignup(formData);
            
            if (result.success) {
                alert('Account created successfully! Please login.');
                window.location.href = 'login.html';
            } else {
                alert(result.data.error || 'Signup failed');
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// ==================== PASSWORD TOGGLE ====================
function initPasswordToggle() {
    // Function to toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const passwordInput = toggle.previousElementSibling;
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggle.innerHTML = '<i class="fas fa-eye-slash" style="top: 74%; "></i>';
            } else {
                passwordInput.type = 'password';
                toggle.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });
}

// ==================== SMOOTH SCROLLING ====================
function initSmoothScrolling() {
    // Function to enable smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Prevent default anchor link behavior
            e.preventDefault();

            // Get the ID of the target section (e.g., '#features')
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Scroll to the target element smoothly
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Optional: Add a subtle effect to the header on scroll
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            } else {
                header.style.boxShadow = 'none';
            }
        });
    }
}

// ==================== MEDICINE TRACKER ====================//
let medicines = [];
let editingMedicineId = null;

// DOM Elements - declare them but don't assign yet
let medicineList, emptyState, addMedicineBtn, addMedicineEmptyBtn, medicineModal, closeModalBtn, cancelBtn, medicineForm, notification;
function initMedicineTracker() {
    console.log("🏥 MEDICINE TRACKER INITIALIZED");
    
    // Get DOM elements - ASSIGN TO GLOBAL VARIABLES (no const)
    medicineList = document.getElementById('medicineList');
    emptyState = document.getElementById('emptyState'); // ADD THIS LINE
    medicineModal = document.getElementById('medicineModal');
    addMedicineBtn = document.getElementById('addMedicineBtn');
    addMedicineEmptyBtn = document.getElementById('addMedicineEmptyBtn'); // ADD THIS LINE
    closeModalBtn = document.getElementById('closeModalBtn');
    cancelBtn = document.getElementById('cancelBtn');
    medicineForm = document.getElementById('medicineForm');
    notification = document.getElementById('notification'); // ADD THIS LINE

    console.log("🔍 Modal elements found:", { 
        medicineModal: !!medicineModal, 
        medicineForm: !!medicineForm,
        addMedicineBtn: !!addMedicineBtn,
        medicineList: !!medicineList, // ADD THIS
        emptyState: !!emptyState // ADD THIS
    });

    // Set up modal event listeners if modal exists
    if (medicineModal) {
        console.log("✅ Setting up modal event listeners");
        
        if (addMedicineBtn) {
            addMedicineBtn.addEventListener('click', openModal);
        }
        
        // ADD THIS: Also set up the empty state add button
        if (addMedicineEmptyBtn) {
            addMedicineEmptyBtn.addEventListener('click', openModal);
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }
        
        if (medicineForm) {
            medicineForm.addEventListener('submit', handleFormSubmit);
        }
        
        // Close modal when clicking outside
        medicineModal.addEventListener('click', function (e) {
            if (e.target === medicineModal) {
                closeModal();
            }
        });
    } else {
        console.log('ℹ️ No medicine modal found on this page');
    }

    // Load medications if medicine list exists
    if (medicineList) {
        console.log("✅ Loading medications for schedule page");
        loadMedications();
    }
}
let loadMedicationsCallCount = 0;
async function loadMedications() {
    loadMedicationsCallCount++;
    console.log(`🔢 loadMedications called #${loadMedicationsCallCount} times`);
    
    let result;
    
    // SPECIFIC check for today's schedule page
    if (window.location.pathname.includes('medicine_schedule.html')) {
        console.log('📋 Loading TODAY medications for schedule page...');
        result = await apiGetTodayMedications();
    } else {
        // Load all medications (for other pages)
        console.log('📋 Loading ALL medications...');
        result = await apiGetMedications();
    }
    
    console.log('API Response:', result);
    
    if (result.success) {
        medicines = result.data.medications || [];
        console.log(`✅ Loaded ${medicines.length} medications for today`);
        
        renderMedicineList();
    } else {
        console.error('API Error:', result.data.error);
        showNotification('Failed to load medications: ' + (result.data.error || 'Unknown error'), 'error');
        medicines = [];
        renderMedicineList();
    }
}
function renderMedicineList() {
    // Check if medicineList exists
    if (!medicineList) return;

    // Clear the list
    medicineList.innerHTML = '';

    // Check if there are medicines
    if (medicines.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Sort medicines by time
    const sortedMedicines = [...medicines].sort((a, b) => {
        return a.time.localeCompare(b.time);
    });

    // Create medicine items
    sortedMedicines.forEach(medicine => {
        const li = document.createElement('li');
        li.className = 'medicine-item';

        // Map database status to frontend status
        let statusClass, statusIcon, displayStatus;
        if (medicine.status === 'Completed' || medicine.status === 'taken') {
            statusClass = 'status-taken';
            statusIcon = 'fas fa-check-circle';
            displayStatus = 'Taken';
        } else if (medicine.status === 'Pending' || medicine.status === 'upcoming') {
            statusClass = 'status-upcoming';
            statusIcon = 'far fa-clock';
            displayStatus = 'Upcoming';
        } else {
            statusClass = 'status-missed';
            statusIcon = 'fas fa-exclamation-circle';
            displayStatus = 'Missed';
        }

        li.innerHTML = `
            <div class="medicine-info">
                <div class="medicine-name">
                    <i class="fas fa-capsules"></i> ${medicine.name}
                </div>
                <div class="medicine-details">
                    <span class="dosage-badge">
                        <i class="fas fa-prescription-bottle-alt"></i> ${medicine.dosage}
                    </span>
                    <span class="medicine-time">
                        <i class="far fa-clock"></i> ${formatTime(medicine.time)}
                    </span>
                    <span class="status ${statusClass}">
                        <i class="${statusIcon}"></i>${displayStatus}
                    </span>
                </div>
                ${medicine.notes ? `<div class="medicine-notes">${medicine.notes}</div>` : ''}
            </div>
            <div class="medicine-actions">
                <button class="action-btn mark-taken-btn" data-id="${medicine.id}" title="Mark as taken">
                    <i class="fas fa-check"></i>
                </button>
                <button class="action-btn edit-btn" data-id="${medicine.id}" title="Edit medicine">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${medicine.id}" title="Delete medicine">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        medicineList.appendChild(li);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.mark-taken-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            markMedicineAsTaken(id);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            deleteMedicine(id);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            openEditModal(id);
        });
    });
}

function formatTime(timeString) {
    // Handle both "HH:MM:SS" and "YYYY-MM-DD HH:MM:SS" formats
    const timePart = timeString.includes(' ') ? timeString.split(' ')[1] : timeString;
    const [hours, minutes] = timePart.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    console.log("📋 Medication form submitted");
    
    try {
        // Get form values
        const name = document.getElementById('medicineName').value.trim();
        const dosage = document.getElementById('medicineDosage').value.trim();
        const timeValue = document.getElementById('medicineTime').value; // HH:MM format
        const startDate = document.getElementById('medicineStartDate').value; // YYYY-MM-DD
        const endDate = document.getElementById('medicineEndDate').value; // YYYY-MM-DD (optional)
        const frequency = document.getElementById('medicineFrequency').value;
        const notes = document.getElementById('medicineNotes').value.trim();
        
        console.log("📝 Form data:", { name, dosage, timeValue, startDate, endDate, frequency, notes });
        
        // Validation
        if (!name || !dosage || !timeValue || !startDate) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const medicationData = {
            name,
            dosage,
            time: timeValue, // Just send time in HH:MM format
            start_date: startDate,
            end_date: endDate || startDate, // If no end date, use start date (one-time)
            frequency: frequency,
            notes: notes
        };
        
        console.log("🚀 Sending to API:", medicationData);
        
        const result = await apiAddMedication(medicationData);
        
        if (result.success) {
            console.log("✅ Medication added successfully");
            showNotification(`Medication added with ${result.data.reminders_created} reminders!`, 'success');
            e.target.reset();
            closeModal();
            loadMedications();
        } else {
            console.error('❌ API returned error:', result);
            showNotification(result.data.error || 'Failed to add medication', 'error');
        }
        
    } catch (error) {
        console.error('💥 Error in form submission:', error);
        showNotification('Error adding medication: ' + error.message, 'error');
    }
}

async function markMedicineAsTaken(id) {
    const result = await apiUpdateMedicationStatus(id, 'taken');
    
    if (result.success) {
        showNotification('Medicine marked as taken!', 'success');
        await loadMedications(); // Reload medications from server
    } else {
        showNotification(result.data.error || 'Failed to update status', 'error');
    }
}

async function deleteMedicine(id) {
    if (confirm('Are you sure you want to delete this medicine?')) {
        const result = await apiDeleteMedication(id);
        
        if (result.success) {
            showNotification('Medicine deleted successfully!', 'success');
            await loadMedications(); // Reload medications from server
        } else {
            showNotification(result.data.error || 'Failed to delete medicine', 'error');
        }
    }
}


function openEditModal(id) {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;

    editingMedicineId = id;

    // Open the modal
    openModal();

    // Change the modal title and button text
    document.getElementById('modalTitle').textContent = 'Edit Medicine';
    document.getElementById('submitBtn').textContent = 'Update Medicine';

    // Pre-fill the form
    document.getElementById('medicineName').value = medicine.name;
    document.getElementById('dosage').value = medicine.dosage;
    document.getElementById('frequency').value = 'once'; // Default since your schema doesn't have frequency
    // Extract just the time part for the time input
    const timePart = medicine.time.split(' ')[1].substring(0, 5); // Gets "HH:MM"
    document.getElementById('scheduleTime').value = timePart;
    document.getElementById('notes').value = medicine.notes;
}


// ==================== MY MEDICATIONS PAGE FUNCTIONALITY ====================//
function initMyMedicationsPage() {
    // Check if we're on the my_medications page
    if (!window.location.pathname.includes('my_medications.html')) {
        return;
    }

    console.log("Initializing My Medications page...");
    
    // Update user info
    const userData = getUserData();
    const userName = userData.name || 'User';
    
    // Update username display
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = `${userName}`;
    }
    
    loadMyMedications();
    setupSearchFunctionality();
    setupAddMedicationButton();
}
async function loadMyMedications(searchTerm = '') {
    console.log("🔄 ========== LOADING MY MEDICATIONS ==========");
    
    let result;
    
    if (searchTerm) {
        console.log(`🔍 Searching medications: ${searchTerm}`);
        result = await apiSearchMyMedications(searchTerm);
    } else {
        console.log('📋 Loading all my medications...');
        result = await apiGetMyMedications();
    }
    
    console.log('📦 MY MEDICATIONS API RESPONSE:', result);
    
    if (result.success) {
        const medications = result.data.medications || [];
        console.log(`🔢 Raw medications from API: ${medications.length}`);
        console.log("📋 Raw medications:", medications);
        
        // Check for duplicates in the API response
        const seenIds = new Set();
        const duplicates = [];
        
        medications.forEach(med => {
            if (seenIds.has(med.id)) {
                duplicates.push(med.id);
                console.log(`🚨 DUPLICATE IN MY MEDICATIONS: ${med.name} (ID: ${med.id})`);
            }
            seenIds.add(med.id);
        });
        
        if (duplicates.length > 0) {
            console.log(`🚨 DUPLICATE IDs in My Medications: ${duplicates.join(', ')}`);
        }
        
        // Force uniqueness for My Medications
        const uniqueMedications = [];
        const finalSeenIds = new Set();
        
        medications.forEach(med => {
            if (!finalSeenIds.has(med.id)) {
                finalSeenIds.add(med.id);
                uniqueMedications.push(med);
            }
        });
        
        console.log(`✅ After deduplication: ${uniqueMedications.length} medications`);
        console.log("========== LOADING COMPLETE ==========");
        
        renderMyMedications(uniqueMedications);
    } else {
        console.error('❌ My Medications API Error:', result.data.error);
        showNotification('Failed to load medications: ' + (result.data.error || 'Unknown error'), 'error');
        renderMyMedications([]);
    }
}

// Helper function to get prescriber from localStorage
function getMedicationPrescriber(medicineId) {
    const key = `meditrack-prescriber-${medicineId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}
function renderMyMedications(medications) {
    const grid = document.getElementById('medicationsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (medications.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No medications found matching your search.</p>
            </div>
        `;
        return;
    }

    medications.forEach(med => {
        // Get prescriber info ONLY for My Medications page
        const prescriber = getMedicationPrescriber(med.id);
        
        const card = document.createElement('div');
        card.className = 'medication-card';
        
        card.innerHTML = `
            <div class="medication-header">
                <h3 class="medication-name">${med.name}</h3>
                <span class="medication-dosage">${med.dosage}</span>
            </div>
            <div class="medication-details">
                <div class="detail-item">
                    <span class="detail-label">Frequency:</span>
                    <span class="detail-value">${med.frequency}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Purpose:</span>
                    <span class="detail-value">${med.purpose}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Prescriber:</span>
                    <span class="detail-value">${prescriber ? `${prescriber.name} (${prescriber.specialty})` : 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Start Date:</span>
                    <span class="detail-value">${med.startDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Refills:</span>
                    <span class="detail-value">${med.refills} remaining</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value status-badge status-${med.status.toLowerCase()}">${med.status}</span>
                </div>
                ${med.notes ? `
                <div class="detail-item">
                    <span class="detail-label">Notes:</span>
                    <span class="detail-value">${med.notes}</span>
                </div>` : ''}
            </div>
            <div class="medication-actions">
                <button class="action-btn edit-btn" data-id="${med.id}" title="Edit medication">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" data-id="${med.id}" title="Delete medication">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        `;

        grid.appendChild(card);
    });

    attachMedicationActionListeners();
}
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            loadMyMedications(searchTerm);
        });
        
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                loadMyMedications(searchTerm);
            }
        });
    }
}

function setupAddMedicationButton() {
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            // Redirect to add medication page or open modal
            window.location.href = 'medicine_schedule.html?action=add';
        });
    }
}

function attachMedicationActionListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const medicineId = this.getAttribute('data-id');
            editMedication(medicineId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const medicineId = this.getAttribute('data-id');
            deleteMedication(medicineId);
        });
    });
}

async function editMedication(medicineId) {
    // Redirect to edit page or open edit modal
    window.location.href = `medicine_schedule.html?action=edit&id=${medicineId}`;
}

async function deleteMedication(medicineId) {
    if (!confirm('Are you sure you want to delete this medication?')) {
        return;
    }

    try {
        const result = await apiDeleteMedication(medicineId); // This should now work
        
        if (result.success) {
            showNotification('Medication deleted successfully!', 'success');
            loadMyMedications(); // Reload the list
        } else {
            showNotification(result.data.error || 'Failed to delete medication', 'error');
        }
    } catch (error) {
        console.error('Delete medication error:', error);
        showNotification('Error deleting medication', 'error');
    }
}
// ==================== USER DASHBOARD ====================
function getUserData() {
    return JSON.parse(localStorage.getItem('user') || '{}');
}

async function initDashboard() {
    const userData = getUserData();
    const userName = userData.name || 'User';

    // Safe updates for user info
    safeUpdateElement('welcome-message', `Welcome back, ${userName}!`);
    safeUpdateElement('username', userName);
    
    document.getElementById('welcome-message').textContent = `Welcome back, ${userName}!`;
    document.getElementById('username').textContent = userName;
    updateUserAvatar(userName);
    updateCurrentDate();
    
    // Load real data from API
    await updateDashboardStats();
    await loadTodayMedications();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a[data-section]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Don't prevent default for actual page links
            const href = this.getAttribute('href');
            if (href === '#' || !href.includes('.html')) {
                e.preventDefault();
            }
            
            const section = this.getAttribute('data-section');
            console.log('Navigation clicked:', section, '->', href);
            
            // If it's a hash link, handle the section switching
            if (href === '#') {
                navLinks.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                showSection(section);
            }
            // Otherwise, let the browser handle the page navigation
        });
    });

    // Add logout button if it exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }
}

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date-display').textContent = `Today is ${now.toLocaleDateString('en-US', options)}`;
}

function updateUserAvatar(name) {
    const avatar = document.querySelector('.avatar-placeholder');
    if (name) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        avatar.textContent = initials;
    }
}

async function updateDashboardStats() {
    try {
        console.log("🔄 Updating dashboard stats...");
        
        // Get all medications for active count
        const medsResult = await apiGetMedications();
        const allMedications = medsResult.success ? medsResult.data.medications || [] : [];
        
        // Get today's medications for upcoming doses
        const todayResult = await apiGetTodayMedications();
        const todayMedications = todayResult.success ? todayResult.data.medications || [] : [];
        
        // Calculate stats
        const activeMedsCount = allMedications.length;
        const upcomingDosesCount = todayMedications.filter(med => 
            med.status === 'Pending' || med.status === 'upcoming'
        ).length;
        
        // Get next medication time
        const nextMedTime = getNextMedicationTime(todayMedications);
        
        // Safe DOM updates with null checks
        safeUpdateElement('active-meds-count', activeMedsCount);
        safeUpdateElement('upcoming-doses-count', upcomingDosesCount);
        safeUpdateElement('next-dose-time', nextMedTime || 'None');
        
        // Update adherence
        const adherenceRate = calculateAdherenceRate(allMedications);
        safeUpdateElement('adherence-rate', `${adherenceRate}%`);
        
        // Hide doctors count section if it exists
        const doctorsSection = document.querySelector('.stat-card:has(#doctors-count)');
        if (doctorsSection) {
            doctorsSection.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

// Helper function for safe DOM updates
function safeUpdateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content;
    } else {
        console.warn(`Element with id '${elementId}' not found`);
    }
}

function getNextMedicationTime(medications) {
    const now = new Date();
    const pendingMeds = medications.filter(med => 
        (med.status === 'Pending' || med.status === 'upcoming') && med.time
    );
    
    if (pendingMeds.length === 0) return 'None';
    
    // Find the next medication time
    const nextMed = pendingMeds.sort((a, b) => new Date(a.time) - new Date(b.time))[0];
    const medTime = new Date(nextMed.time);
    
    const diffMs = medTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
        return `In ${diffHours}h ${diffMinutes}m`;
    } else if (diffMinutes > 0) {
        return `In ${diffMinutes}m`;
    } else {
        return 'Now';
    }
}

function calculateAdherenceRate(medications) {
    // Simple calculation - you might want to use your Log table data
    const takenMeds = medications.filter(med => 
        med.status === 'Completed' || med.status === 'taken'
    ).length;
    
    if (medications.length === 0) return 0;
    
    return Math.round((takenMeds / medications.length) * 100);
}

async function loadTodayMedications() {
    try {
        const result = await apiGetTodayMedications();
        if (result.success) {
            const todayMeds = result.data.medications || [];
            renderTodayMedications(todayMeds);
        }
    } catch (error) {
        console.error('Error loading today medications:', error);
    }
}

function renderTodayMedications(medications) {
    const container = document.getElementById('today-medications');
    if (!container) {
        console.error('❌ Container #today-medications not found!');
        return;
    }
    
    console.log('📦 Medications received:', medications);
    
    // Group by time of day with debugging
    const morningMeds = medications.filter(med => {
        const isMorning = isMorningTime(med.time);
        console.log(`🌅 ${med.name} at ${med.time} -> Morning: ${isMorning}`);
        return isMorning;
    });
    
    const afternoonMeds = medications.filter(med => {
        const isAfternoon = isAfternoonTime(med.time);
        console.log(`☀️ ${med.name} at ${med.time} -> Afternoon: ${isAfternoon}`);
        return isAfternoon;
    });
    
    const eveningMeds = medications.filter(med => {
        const isEvening = isEveningTime(med.time);
        console.log(`🌙 ${med.name} at ${med.time} -> Evening: ${isEvening}`);
        return isEvening;
    });
    
    console.log('⏰ Grouped medications:', {
        morning: morningMeds.length,
        afternoon: afternoonMeds.length, 
        evening: eveningMeds.length
    });
    
    container.innerHTML = `
        ${renderTimeSlot('Morning', morningMeds)}
        ${renderTimeSlot('Afternoon', afternoonMeds)}
        ${renderTimeSlot('Evening', eveningMeds)}
    `;
    
    console.log('✅ HTML updated, attaching event listeners...');
    attachMedicationActionListeners();
}

function renderTimeSlot(timeOfDay, medications) {
    if (medications.length === 0) {
        return `
            <div class="medication-time-group">
                <h4>${timeOfDay}</h4>
                <div class="no-medications">No medications scheduled</div>
            </div>
        `;
    }
    
    return `
        <div class="medication-time-group">
            <h4>${timeOfDay}</h4>
            ${medications.map(med => {
                // Format the actual time from the database
                const medTime = new Date(med.time);
                const displayTime = medTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
                
                const isTaken = med.status === 'completed' || med.status === 'taken';
                const buttonText = isTaken ? 'Taken' : 'Mark Taken';
                const buttonClass = isTaken ? 'taken' : 'pending';
                
                return `
                <div class="medication-item">
                    <div class="med-info">
                        <div class="med-icon"></div>
                        <div>
                            <h5>${med.name}</h5>
                            <p>${med.dosage} · ${displayTime}</p>
                            ${med.notes ? `<span class="med-notes">${med.notes}</span>` : ''}
                        </div>
                    </div>
                    <button class="status-btn ${buttonClass}" 
                            data-id="${med.id}">
                        ${buttonText}
                    </button>
                </div>
                `;
            }).join('')}
        </div>
    `;
}
function isMorningTime(timeString) {
    try {
        const time = new Date(timeString);
        const hour = time.getHours();
        console.log(`🌅 ${timeString} -> hour: ${hour}, isMorning: ${hour >= 6 && hour < 12}`);
        return hour >= 6 && hour < 12;
    } catch (e) {
        console.error('Error parsing morning time:', timeString, e);
        return false;
    }
}

function isAfternoonTime(timeString) {
    try {
        const time = new Date(timeString);
        const hour = time.getHours();
        console.log(`☀️ ${timeString} -> hour: ${hour}, isAfternoon: ${hour >= 12 && hour < 17}`);
        return hour >= 12 && hour < 17;
    } catch (e) {
        console.error('Error parsing afternoon time:', timeString, e);
        return false;
    }
}

function isEveningTime(timeString) {
    try {
        const time = new Date(timeString);
        const hour = time.getHours();
        console.log(`🌙 ${timeString} -> hour: ${hour}, isEvening: ${hour >= 17 || hour < 6}`);
        return hour >= 17 || hour < 6;
    } catch (e) {
        console.error('Error parsing evening time:', timeString, e);
        return false;
    }
}

// Update your existing setupEventListeners to handle real data
function setupEventListeners() {
    // Mark medication as taken
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('status-btn') && e.target.classList.contains('pending')) {
            const medicineId = e.target.getAttribute('data-id');
            markMedicationAsTaken(medicineId, e.target);
        }
    });

    // ... rest of your existing event listeners
}

async function markMedicationAsTaken(medicineId, button) {
    try {
        console.log('🔄 Marking medication as taken:', medicineId);
        const result = await apiUpdateMedicationStatus(medicineId, 'taken');
        console.log('📊 API response:', result);
        
        if (result.success) {
            button.textContent = 'Taken';
            button.classList.remove('pending');
            button.classList.add('taken');
            button.disabled = true;
            
            // Update dashboard stats
            await updateDashboardStats();
            showNotification('Medication marked as taken!', 'success');
        } else {
            console.error('❌ API returned error:', result.data.error);
            showNotification('Error: ' + (result.data.error || 'Failed to update status'), 'error');
        }
    } catch (error) {
        console.error('💥 Error marking medication as taken:', error);
        showNotification('Error updating medication status', 'error');
    }
}

// ==================== ADMIN DASHBOARD ====================
// Only run this code on the admin dashboard page
if (window.location.pathname.includes("admin.html")) {

    // Sidebar navigation handling
    const navLinks = document.querySelectorAll('.sidebar ul li');
    const sections = document.querySelectorAll('.main-content section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active state from all links
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show corresponding section
            const targetId = link.dataset.target;
            sections.forEach(section => {
                section.style.display = (section.id === targetId) ? 'block' : 'none';
            });
        });
    });

    // Example: Delete user (just for frontend demo)
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            if (confirm("Are you sure you want to delete this user?")) {
                row.remove();
                alert("User deleted!");
            }
        });
    });

    // Example: Add advertisement
    const adForm = document.getElementById('ad-form');
    if (adForm) {
        adForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const adTitle = document.getElementById('ad-title').value.trim();
            const adDesc = document.getElementById('ad-desc').value.trim();

            if (!adTitle || !adDesc) {
                alert("Please fill out all fields.");
                return;
            }

            alert(`Advertisement "${adTitle}" added successfully!`);
            adForm.reset();
        });
    }

    // Example: Display simple stats dynamically
    const totalUsers = document.getElementById('total-users');
    const activeAds = document.getElementById('active-ads');
    const dbEntries = document.getElementById('db-entries');

    if (totalUsers && activeAds && dbEntries) {
        totalUsers.textContent = "126";
        activeAds.textContent = "18";
        dbEntries.textContent = "547";
    }
}

// ==================== DOCTORS HELPER FUNCTIONS ====================

let doctors = [];
let editingDoctorId = null;

// ==================== FORM VALIDATION FUNCTIONS ====================

function clearFormErrors() {
    // Remove error styles from all fields
    const errorFields = document.querySelectorAll('.form-group-doctor.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
    
    // Remove error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
}

function markFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group-doctor');
    
    if (formGroup) {
        // Add error class to form group
        formGroup.classList.add('error');
        
        // Remove existing error message
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        // Add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.cssText = 'color: #e74c3c; font-size: 0.8rem; margin-top: 0.25rem;';
        
        formGroup.appendChild(errorElement);
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Basic phone validation - allows numbers, spaces, hyphens, parentheses, and +
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// ==================== DOCTORS MODAL FUNCTIONS ====================

function openDoctorModal() {
    const modal = document.getElementById('doctorModal');
    const modalTitle = document.getElementById('doctorModalTitle');
    const submitBtn = document.getElementById('submitModalDoctorBtn');
    
    console.log("🔄 Opening doctor modal...");
    console.log("Modal elements:", { modal, modalTitle, submitBtn });
    
    if (modal) {
        modal.style.display = 'flex';
        editingDoctorId = null;
        
        if (modalTitle) {
            modalTitle.textContent = 'Add New Doctor';
        }
        
        if (submitBtn) {
            submitBtn.textContent = 'Add Doctor';
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Doctor';
        }
        
        const form = document.getElementById('doctorModalForm');
        if (form) form.reset();
    }
}

// Rename this function to avoid conflict with the button ID
function closeDoctorModalFunc() {
    const modal = document.getElementById('doctorModal');
    if (modal) {
        modal.style.display = 'none';
    }
    editingDoctorId = null;
    console.log("✅ Modal closed successfully");
}

function setupDoctorModal() {
    console.log("Setting up doctor modal...");
    
    const modal = document.getElementById('doctorModal');
    const closeBtn = document.getElementById('closeDoctorModal');
    const cancelBtn = document.getElementById('cancelModalDoctorBtn');
    const openBtn = document.getElementById('openDoctorModal');
    const form = document.getElementById('doctorModalForm');

    console.log("Modal elements:", { modal, openBtn, form });

    if (openBtn) {
        console.log("Adding click listener to open button");
        openBtn.addEventListener('click', openDoctorModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeDoctorModalFunc);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeDoctorModalFunc);
    }

    if (form) {
        form.addEventListener('submit', handleDoctorFormSubmit);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeDoctorModalFunc();
            }
        });
    }
}

// ==================== DOCTORS CRUD FUNCTIONS ====================

async function handleDoctorFormSubmit(e) {
    e.preventDefault();
    console.log("📋 Form submitted!");

    // Get form values
    const name = document.getElementById('modalDoctorName').value.trim();
    const specialty = document.getElementById('modalDoctorSpecialty').value.trim();
    const phone = document.getElementById('modalDoctorPhone').value.trim();
    const email = document.getElementById('modalDoctorEmail').value.trim();
    const address = document.getElementById('modalDoctorAddress').value.trim();

    console.log("Form data:", { name, specialty, phone, email, address });

    // Clear previous error styles
    clearFormErrors();

    // Validate required fields
    let isValid = true;
    let errorMessage = '';

    // Name validation (required)
    if (!name) {
        markFieldError('modalDoctorName', 'Doctor name is required');
        isValid = false;
        errorMessage = 'Please enter doctor name';
    }

    // Specialty validation (required)
    if (!specialty) {
        markFieldError('modalDoctorSpecialty', 'Specialty is required');
        isValid = false;
        if (!errorMessage) errorMessage = 'Please enter doctor specialty';
    }

    // Phone validation (required and format)
    if (!phone) {
        markFieldError('modalDoctorPhone', 'Phone number is required');
        isValid = false;
        if (!errorMessage) errorMessage = 'Please enter phone number';
    } else if (!isValidPhone(phone)) {
        markFieldError('modalDoctorPhone', 'Please enter a valid phone number');
        isValid = false;
        if (!errorMessage) errorMessage = 'Please enter a valid phone number';
    }

    // Email validation (required and format)
    if (!email) {
        markFieldError('modalDoctorEmail', 'Email is required');
        isValid = false;
        if (!errorMessage) errorMessage = 'Please enter email address';
    } else if (!isValidEmail(email)) {
        markFieldError('modalDoctorEmail', 'Please enter a valid email address');
        isValid = false;
        if (!errorMessage) errorMessage = 'Please enter a valid email address';
    }

    // If validation fails, show error and stop submission
    if (!isValid) {
        showNotification(errorMessage, 'error');
        return;
    }

    // If all validation passes, proceed with form submission
    const doctorData = {
        name,
        specialty: specialty || 'General Practitioner',
        phone,
        email,
        address
    };

    console.log("Processing doctor data:", doctorData);

    try {
        if (editingDoctorId) {
            console.log("Updating existing doctor:", editingDoctorId);
            await updateDoctor(editingDoctorId, doctorData);
        } else {
            console.log("Adding new doctor");
            await addDoctor(doctorData);
        }
    } catch (error) {
        console.error('Error saving doctor:', error);
        showNotification('Error saving doctor', 'error');
    }
}

async function addDoctor(doctorData) {
    console.log("📝 Adding new doctor:", doctorData);
    
    const result = await apiAddDoctor(doctorData);
    
    if (result.success) {
        console.log("✅ Doctor added successfully");
        await loadDoctors();
        closeDoctorModalFunc(); // Use the new function name
        showNotification('Doctor added successfully!', 'success');
    } else {
        throw new Error(result.error || 'Failed to add doctor');
    }
}

async function updateDoctor(doctorId, doctorData) {
    console.log("📝 Updating doctor:", doctorId, doctorData);
    
    const result = await apiUpdateDoctor(doctorId, doctorData);
    
    if (result.success) {
        console.log("✅ Doctor updated successfully");
        await loadDoctors();
        closeDoctorModalFunc(); // Use the new function name
        showNotification('Doctor updated successfully!', 'success');
    } else {
        throw new Error(result.error || 'Failed to update doctor');
    }
}

async function deleteDoctor(doctorId) {
    if (confirm('Are you sure you want to delete this doctor?')) {
        console.log("🗑️ Deleting doctor:", doctorId);
        
        const result = await apiDeleteDoctor(doctorId);
        
        if (result.success) {
            console.log("✅ Doctor deleted successfully");
            await loadDoctors();
            showNotification('Doctor deleted successfully!', 'success');
        } else {
            console.error('❌ Failed to delete doctor:', result.error);
            showNotification('Error deleting doctor', 'error');
        }
    }
}

// Helper function to get doctors list
async function getDoctorsList() {
    try {
        const result = await apiGetDoctors();
        return result.success ? result.doctors : [];
    } catch (error) {
        console.error('Error getting doctors list:', error);
        return [];
    }
}

// Store prescriber info in localStorage
function saveMedicationPrescriber(medicineId, doctor) {
    const key = `meditrack-prescriber-${medicineId}`;
    localStorage.setItem(key, JSON.stringify(doctor));
}

// Function to load doctors for the prescriber dropdown
async function loadDoctorsForPrescriber() {
    try {
        const result = await apiGetDoctors();
        
        if (result.success) {
            const doctors = result.doctors || [];
            const prescriberSelect = document.getElementById('medicinePrescriber');
            
            if (prescriberSelect) {
                // Clear existing options except the first one
                prescriberSelect.innerHTML = '<option value="">Select a doctor</option>';
                
                // Add doctor options
                doctors.forEach(doctor => {
                    const option = document.createElement('option');
                    option.value = doctor.id;
                    option.textContent = `${doctor.name} - ${doctor.specialty || 'General Practitioner'}`;
                    prescriberSelect.appendChild(option);
                });
                
                console.log(`✅ Loaded ${doctors.length} doctors for prescriber dropdown`);
            } else {
                console.log('ℹ️ Prescriber dropdown not found on this page');
            }
        } else {
            console.error('❌ Failed to load doctors for prescriber:', result.error);
        }
    } catch (error) {
        console.error('💥 Error loading doctors for prescriber:', error);
    }
}

function editDoctor(doctorId) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    editingDoctorId = doctorId;

    const modal = document.getElementById('doctorModal');
    const modalTitle = document.getElementById('doctorModalTitle');
    const submitBtn = document.getElementById('submitModalDoctorBtn');
    
    if (modal) {
        modal.style.display = 'flex';
        
        if (modalTitle) {
            modalTitle.textContent = 'Edit Doctor';
        }
        
        if (submitBtn) {
            submitBtn.textContent = 'Update Doctor';
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Doctor';
        }

        document.getElementById('modalDoctorName').value = doctor.name;
        document.getElementById('modalDoctorSpecialty').value = doctor.specialty || '';
        document.getElementById('modalDoctorPhone').value = doctor.phone || '';
        document.getElementById('modalDoctorEmail').value = doctor.email || '';
        document.getElementById('modalDoctorAddress').value = doctor.address || '';
    }
}

// ==================== DOCTORS DISPLAY FUNCTIONS ====================

function renderDoctors() {
    const doctorsGrid = document.getElementById('doctorsGrid');
    if (!doctorsGrid) return;

    doctorsGrid.innerHTML = '';

    if (doctors.length === 0) {
        doctorsGrid.innerHTML = `
            <div class="no-doctors">
                <i class="fas fa-user-md"></i>
                <p>No doctors added yet. Add your first doctor to get started!</p>
                <button class="add-doctor-main-btn" id="addDoctorEmptyBtn">
                    <i class="fas fa-plus"></i> Add Your First Doctor
                </button>
            </div>
        `;
        
        const addBtn = document.getElementById('addDoctorEmptyBtn');
        if (addBtn) {
            addBtn.addEventListener('click', openDoctorModal);
        }
    } else {
        doctors.forEach(doctor => {
            const card = document.createElement('div');
            card.className = 'doctor-card';
            
            card.innerHTML = `
                <div class="doctor-header">
                    <h3 class="doctor-name">${doctor.name}</h3>
                    <span class="doctor-specialty">${doctor.specialty || 'General Practitioner'}</span>
                </div>
                <div class="doctor-contact">
                    ${doctor.phone ? `
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${doctor.phone}</span>
                    </div>` : ''}
                    ${doctor.email ? `
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>${doctor.email}</span>
                    </div>` : ''}
                    ${doctor.address ? `
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${doctor.address}</span>
                    </div>` : ''}
                </div>
                <div class="doctor-actions">
                    <button class="doctor-action-btn edit-doctor-btn" data-id="${doctor.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="doctor-action-btn delete-doctor-btn" data-id="${doctor.id}">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            `;

            doctorsGrid.appendChild(card);
        });
    }

    updateDoctorsStats();
    attachDoctorActionListeners();
}

function attachDoctorActionListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-doctor-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const doctorId = parseInt(this.getAttribute('data-id'));
            editDoctor(doctorId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-doctor-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const doctorId = parseInt(this.getAttribute('data-id'));
            deleteDoctor(doctorId);
        });
    });
}

function updateDoctorsStats() {
    // Update doctors count
    const doctorsCount = document.getElementById('doctorsCount');
    const totalDoctors = document.getElementById('totalDoctors');
    const specialtiesCount = document.getElementById('specialtiesCount');
    
    if (doctorsCount) doctorsCount.textContent = `${doctors.length} doctor${doctors.length !== 1 ? 's' : ''}`;
    if (totalDoctors) totalDoctors.textContent = doctors.length;
    
    // Count unique specialties and update tooltip
    const specialties = new Set(doctors.map(doctor => doctor.specialty).filter(Boolean));
    if (specialtiesCount) {
        specialtiesCount.textContent = specialties.size;
        specialtiesCount.title = `Unique specialties: ${Array.from(specialties).join(', ') || 'None'}`;
    }
    
    updateRecentActivity();
    console.log(`📊 Stats: ${doctors.length} doctors, ${specialties.size} specialties`);
}

function updateRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    if (doctors.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <i class="fas fa-info-circle"></i>
                <span>No recent activity</span>
            </div>
        `;
        return;
    }
    
    const recentDoctors = doctors.slice(-3).reverse();
    activityList.innerHTML = recentDoctors.map(doctor => `
        <div class="activity-item">
            <i class="fas fa-user-plus"></i>
            <span>Added ${doctor.name}</span>
        </div>
    `).join('');
}

// ==================== DOCTORS API FUNCTIONS ====================

async function apiGetDoctors() {
    try {
        const userData = getUserData();
        const response = await fetch(`${API_BASE_URL}/api/doctors`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.user_id || ''}`,
                'User-Id': userData.user_id || ''
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return { success: false, error: error.message };
    }
}

async function apiAddDoctor(doctorData) {
    try {
        const userData = getUserData();
        const response = await fetch(`${API_BASE_URL}/api/doctors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.user_id || ''}`,
                'User-Id': userData.user_id || ''
            },
            body: JSON.stringify(doctorData),
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error adding doctor:', error);
        return { success: false, error: error.message };
    }
}

async function apiUpdateDoctor(doctorId, doctorData) {
    try {
        const userData = getUserData();
        const response = await fetch(`${API_BASE_URL}/api/doctors/${doctorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.user_id || ''}`,
                'User-Id': userData.user_id || ''
            },
            body: JSON.stringify(doctorData),
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating doctor:', error);
        return { success: false, error: error.message };
    }
}

async function apiDeleteDoctor(doctorId) {
    try {
        const userData = getUserData();
        const response = await fetch(`${API_BASE_URL}/api/doctors/${doctorId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.user_id || ''}`,
                'User-Id': userData.user_id || ''
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting doctor:', error);
        return { success: false, error: error.message };
    }
}

// ==================== MY DOCTORS PAGE FUNCTIONALITY ====================

function initMyDoctorsPage() {
    if (!window.location.pathname.includes('doctors.html')) {
        return;
    }

    console.log("Initializing My Doctors page...");
    
    const userData = getUserData();
    const userName = userData.name || 'User';
    
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = userName;
    }
    
    const avatar = document.querySelector('.avatar-placeholder');
    if (avatar && userName) {
        const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
        avatar.textContent = initials;
    }
    
    console.log("📋 Loading doctors...");
    loadDoctors();
    
    console.log("🔄 Setting up modal...");
    setupDoctorModal();
    
    console.log("✅ My Doctors page initialized");
}

async function loadDoctors() {
    try {
        console.log("📥 Loading doctors from backend...");
        const result = await apiGetDoctors();
        
        if (result.success) {
            doctors = result.doctors || [];
            console.log(`✅ Loaded ${doctors.length} doctors from backend:`, doctors);
        } else {
            console.error('❌ Failed to load doctors:', result.error);
            doctors = [];
        }
        
        renderDoctors();
    } catch (error) {
        console.error('💥 Error loading doctors:', error);
        doctors = [];
        renderDoctors();
    }
}

// ==================== MAIN INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function () {
    console.log("=== DEBUG: Page loaded ===");
    console.log("Current page:", window.location.pathname);
    
    // Initialize everything
    initMedicineTracker();
    initPasswordToggle();
    initAuthForms();
    initSmoothScrolling();
    initMyMedicationsPage();
    initMyDoctorsPage();



    // User Dashboard Initialization
    if (window.location.pathname.includes("dashboard.html")) {
        initDashboard().then(() => {
            console.log("Dashboard initialized");
            setupNavigation();
            setupEventListeners();
        }
        ).catch(err => {
            console.error("Error initializing dashboard:", err);
        });
    }
    // Medicine Schedule Page - Load doctors for prescriber dropdown
    if (window.location.pathname.includes("medicine_schedule.html")) {
        console.log("📋 Loading doctors for prescriber dropdown...");
        loadDoctorsForPrescriber();
    }

    // My Medications Page - Load doctors for prescriber dropdown (if you add it there too)
    if (window.location.pathname.includes("my_medications.html")) {
        console.log("📋 Loading doctors for prescriber dropdown...");
        loadDoctorsForPrescriber();
    }

    // Schedule Links
    const scheduleLinks = document.querySelectorAll('a[data-section="schedule"], a.view-all[data-section="schedule"]');
    scheduleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'medicine_schedule_overall.html';
        });
    });
    // Today's Schedule Links - For the "View All" in Today's Medications box
    const todayLinks = document.querySelectorAll('a.view-all[data-section="today"]');
    todayLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'medicine_schedule.html';
        });
    });
});
// SAMPLE DATA (You can replace these with real values)
const medicinesTaken = 24;
const medicinesMissed = 6;
const totalDays = medicinesTaken + medicinesMissed;

// Update text fields
document.getElementById("medTaken").textContent = medicinesTaken;
document.getElementById("medMissed").textContent = medicinesMissed;

const rate = ((medicinesTaken / totalDays) * 100).toFixed(1);
document.getElementById("adherenceRate").textContent = rate + "%";

// Chart drawing
const canvas = document.getElementById("adherenceChart");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 300;

// Bar positions
const barWidth = 120;
const spacing = 80;
const baseLine = 250;

// Scale
const maxValue = Math.max(medicinesTaken, medicinesMissed);
const scale = 180 / maxValue;

// Draw bars
function drawBar(x, height, color, label, value) {
    ctx.fillStyle = color;
    ctx.fillRect(x, baseLine - height, barWidth, height);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#1f2937";
    ctx.fillText(label, x + 20, baseLine + 25);
    ctx.fillText(value, x + 40, baseLine - height - 10);
}

drawBar(120, medicinesTaken * scale, "#b5e48c", "Taken", medicinesTaken);
drawBar(120 + barWidth + spacing, medicinesMissed * scale, "#ffadad", "Missed", medicinesMissed);



