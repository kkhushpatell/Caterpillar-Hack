// Supabase configuration
const SUPABASE_URL = SUPABASE_CONFIG.url;
const SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const loadingElement = document.getElementById('loading');
const machineInfoElement = document.getElementById('machine-info');
const errorElement = document.getElementById('error');

// Get machine ID from URL parameters
function getMachineIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('machine_id');
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Update status badge styling
function updateStatusBadge(status) {
    const statusBadge = document.getElementById('status-badge');
    statusBadge.textContent = status;
    statusBadge.className = `status-badge ${status.toLowerCase()}`;
}

// Show rental information if machine is rented
function showRentalInfo(rentalData) {
    const rentalInfo = document.getElementById('rental-info');
    if (rentalData) {
        rentalInfo.classList.remove('hidden');
        document.getElementById('customer-name').textContent = rentalData.customer_name || 'N/A';
        document.getElementById('operator-name').textContent = rentalData.operator_name || 'N/A';
        document.getElementById('rental-start').textContent = formatDate(rentalData.start_date);
        document.getElementById('rental-expected-return').textContent = formatDate(rentalData.expected_return_date);
    } else {
        rentalInfo.classList.add('hidden');
    }
}

// Display machine information
function displayMachineInfo(machineData) {
    // Update machine title
    document.getElementById('machine-title').textContent = `${machineData.model_name} - Machine ${machineData.machine_id}`;
    
            // Update machine information
        document.getElementById('machine-id').textContent = machineData.machine_id;
        document.getElementById('serial-number').textContent = machineData.serial_number || 'N/A';
        document.getElementById('model-name').textContent = machineData.model_name || 'N/A';
        document.getElementById('manufacturer').textContent = machineData.category || 'N/A';
        document.getElementById('machine-type').textContent = machineData.category || 'N/A';
        document.getElementById('weight-capacity').textContent = machineData.capacity ? `${machineData.capacity} tons` : 'N/A';
        document.getElementById('purchase-date').textContent = formatDate(machineData.purchase_date);
        document.getElementById('current-status').textContent = machineData.status;
        
        // Debug: Log the actual status value
        console.log('Machine status from database:', machineData.status);
        console.log('Machine data:', machineData);
        console.log('Rental data:', machineData.rental_data);

    
            // Update status badge
        updateStatusBadge(machineData.status);
        
        // Show rental information if applicable
        if (machineData.rental_data) {
            showRentalInfo(machineData.rental_data);
        }
        
        // Update status form visibility based on rental data, not machine status
        updateStatusFormVisibility(machineData.rental_data ? 'rented' : 'available');
        
        // Hide loading and show machine info
        loadingElement.classList.add('hidden');
        machineInfoElement.classList.remove('hidden');
}

// Show error message
function showError() {
    loadingElement.classList.add('hidden');
    errorElement.classList.remove('hidden');
}

// Fetch machine data from Supabase
async function fetchMachineData(machineId) {
    try {
        // Fetch machine data first
        const { data: machineData, error: machineError } = await supabaseClient
            .from('machines')
            .select('*')
            .eq('machine_id', machineId)
            .single();

        if (machineError) {
            console.error('Error fetching machine data:', machineError);
            throw machineError;
        }

        if (!machineData) {
            throw new Error('Machine not found');
        }

        // Fetch model data separately
        const { data: modelData, error: modelError } = await supabaseClient
            .from('model')
            .select('*')
            .eq('model_id', machineData.model_id)
            .single();

        if (modelError) {
            console.error('Error fetching model data:', modelError);
            // Continue without model data
        }

        // Always check for active rentals regardless of machine status
        let rentalData = null;
        console.log('Checking for active rentals for machine:', machineId);
        
        // Check for active rentals
        const { data: activeRental, error: rentalError } = await supabaseClient
            .from('rentals')
            .select(`
                *,
                customer:customers (name),
                operator:operators (name)
            `)
            .eq('machine_id', machineId)
            .eq('rental_status', 'Active')
            .single();

        if (!rentalError && activeRental) {
            rentalData = {
                ...activeRental,
                customer_name: activeRental.customer?.name,
                operator_name: activeRental.operator?.name
            };
            console.log('Active rental found:', rentalData);
        } else {
            console.log('No active rental found or error:', rentalError);
        }

        // Combine all data
        const combinedData = {
            ...machineData,
            ...modelData,
            rental_data: rentalData
        };

        console.log('Combined data being returned:', combinedData);
        return combinedData;

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Main function to initialize the page
async function initializePage() {
    const machineId = getMachineIdFromURL();
    
    if (!machineId) {
        showError();
        return;
    }

    try {
        const machineData = await fetchMachineData(machineId);
        displayMachineInfo(machineData);
    } catch (error) {
        console.error('Failed to load machine data:', error);
        showError();
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Handle browser back/forward buttons
window.addEventListener('popstate', initializePage);

// Add modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    const checkoutModal = document.getElementById('checkout-modal');
    const checkinModal = document.getElementById('checkin-modal');
    const maintenanceModal = document.getElementById('maintenance-modal');
    
    if (checkoutModal) {
        // Close checkout modal when clicking outside
        checkoutModal.addEventListener('click', function(event) {
            if (event.target === checkoutModal) {
                closeCheckoutModal();
            }
        });
        
        // Close checkout modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && !checkoutModal.classList.contains('hidden')) {
                closeCheckoutModal();
            }
        });
    }
    
    if (checkinModal) {
        // Close checkin modal when clicking outside
        checkinModal.addEventListener('click', function(event) {
            if (event.target === checkinModal) {
                closeCheckinModal();
            }
        });
        
        // Close checkin modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && !checkinModal.classList.contains('hidden')) {
                closeCheckinModal();
            }
        });
    }
    
    if (maintenanceModal) {
        // Close maintenance modal when clicking outside
        maintenanceModal.addEventListener('click', function(event) {
            if (event.target === maintenanceModal) {
                closeMaintenanceModal();
            }
        });
        
        // Close maintenance modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && !maintenanceModal.classList.contains('hidden')) {
                closeMaintenanceModal();
            }
        });
    }
});

// Status Update Functions
function showCheckoutForm() {
    console.log('showCheckoutForm called');
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Modal shown');
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const startDateInput = document.getElementById('start-date');
        const expectedReturnInput = document.getElementById('expected-return-date');
        
        if (startDateInput && expectedReturnInput) {
            startDateInput.value = today;
            expectedReturnInput.value = nextWeek;
        }
        
        // Load customers and operators
        loadCustomersAndOperators();
    } else {
        console.log('Modal element not found');
    }
}

function closeCheckoutModal() {
    console.log('closeCheckoutModal called');
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('Modal hidden');
    } else {
        console.log('Modal element not found');
    }
}

function showCheckinModal() {
    console.log('showCheckinModal called');
    const modal = document.getElementById('checkin-modal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Checkin modal shown');
    } else {
        console.log('Checkin modal element not found');
    }
}

function closeCheckinModal() {
    console.log('closeCheckinModal called');
    const modal = document.getElementById('checkin-modal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('Checkin modal hidden');
    } else {
        console.log('Checkin modal element not found');
    }
}

function showMaintenanceModal() {
    console.log('showMaintenanceModal called');
    const modal = document.getElementById('maintenance-modal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Maintenance modal shown');
    } else {
        console.log('Maintenance modal element not found');
    }
}

function closeMaintenanceModal() {
    console.log('closeMaintenanceModal called');
    const modal = document.getElementById('maintenance-modal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('Maintenance modal hidden');
    } else {
        console.log('Maintenance modal element not found');
    }
}

async function loadCustomersAndOperators() {
    try {
        // Load customers
        const { data: customers, error: customersError } = await supabaseClient
            .from('customers')
            .select('customer_id, name')
            .order('name');
        
        if (!customersError && customers) {
            const customerSelect = document.getElementById('customer-select');
            customerSelect.innerHTML = '<option value="">Select a customer...</option>';
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.customer_id;
                option.textContent = customer.name;
                customerSelect.appendChild(option);
            });
        }
        
        // Load operators
        const { data: operators, error: operatorsError } = await supabaseClient
            .from('operators')
            .select('operator_id, name')
            .order('name');
        
        if (!operatorsError && operators) {
            const operatorSelect = document.getElementById('operator-select');
            operatorSelect.innerHTML = '<option value="">Select an operator...</option>';
            operators.forEach(operator => {
                const option = document.createElement('option');
                option.value = operator.operator_id;
                option.textContent = operator.name;
                operatorSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading customers/operators:', error);
    }
}

async function processCheckout(event) {
    event.preventDefault();
    
    const machineId = getMachineIdFromURL();
    const customerId = document.getElementById('customer-select').value;
    const operatorId = document.getElementById('operator-select').value;
    const startDate = document.getElementById('start-date').value;
    const expectedReturnDate = document.getElementById('expected-return-date').value;
    
    if (!customerId || !operatorId || !startDate || !expectedReturnDate) {
        showMessage('Please fill in all fields.', 'error');
        return;
    }
    
    try {
        // Create new rental with all required fields
        const { data: rental, error: rentalError } = await supabaseClient
            .from('rentals')
            .insert([{
                machine_id: parseInt(machineId),
                customer_id: parseInt(customerId),
                operator_id: parseInt(operatorId),
                start_date: startDate,
                expected_return_date: expectedReturnDate,
                rental_status: 'Active'
            }])
            .select()
            .single();
        
        if (rentalError) {
            throw rentalError;
        }
        
        // Update machine status
        const { error: machineError } = await supabaseClient
            .from('machines')
            .update({ status: 'Rented' })
            .eq('machine_id', parseInt(machineId));
        
        if (machineError) {
            throw machineError;
        }
        
        showMessage('Machine checked out successfully!', 'success');
        closeCheckoutModal();
        
        // Refresh the page to show updated status
        setTimeout(() => {
            location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('Error checking out machine:', error);
        showMessage('Error checking out machine. Please try again.', 'error');
    }
}

async function confirmCheckin() {
    const machineId = getMachineIdFromURL();
    console.log('Confirming check-in for machine:', machineId);
    
    try {
        // First, update the rental record to mark it as completed
        console.log('Updating rental status...');
        const { data: rentalUpdate, error: rentalError } = await supabaseClient
            .from('rentals')
            .update({ 
                rental_status: 'Completed',
                actual_return_date: new Date().toISOString().split('T')[0]
            })
            .eq('machine_id', parseInt(machineId))
            .eq('rental_status', 'Active')
            .select();
        
        if (rentalError) {
            console.error('Error updating rental:', rentalError);
            // Continue anyway to update machine status
        } else {
            console.log('Rental updated successfully:', rentalUpdate);
        }
        
        // Update machine status to available
        console.log('Updating machine status...');
        const { data: machineUpdate, error: machineError } = await supabaseClient
            .from('machines')
            .update({ status: 'Available' })
            .eq('machine_id', parseInt(machineId))
            .select();
        
        if (machineError) {
            throw machineError;
        } else {
            console.log('Machine status updated successfully:', machineUpdate);
        }
        
        showMessage('Machine checked in successfully!', 'success');
        closeCheckinModal();
        
        // Refresh the page to show updated status
        setTimeout(() => {
            location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('Error checking in machine:', error);
        showMessage('Error checking in machine. Please try again.', 'error');
    }
}

async function checkInMachine() {
    const machineId = getMachineIdFromURL();
    console.log('Checking in machine:', machineId);
    
    if (!confirm('Are you sure you want to check in this machine?')) {
        return;
    }
    
    try {
        // First, update the rental record to mark it as completed
        console.log('Updating rental status...');
        const { data: rentalUpdate, error: rentalError } = await supabaseClient
            .from('rentals')
            .update({ 
                rental_status: 'Completed',
                actual_return_date: new Date().toISOString().split('T')[0]
            })
            .eq('machine_id', parseInt(machineId))
            .eq('rental_status', 'Active')
            .select();
        
        if (rentalError) {
            console.error('Error updating rental:', rentalError);
            // Continue anyway to update machine status
        } else {
            console.log('Rental updated successfully:', rentalUpdate);
        }
        
        // Update machine status to available
        console.log('Updating machine status...');
        const { data: machineUpdate, error: machineError } = await supabaseClient
            .from('machines')
            .update({ status: 'Available' })
            .select();
        
        if (machineError) {
            throw machineError;
        } else {
            console.log('Machine status updated successfully:', machineUpdate);
        }
        
        showMessage('Machine checked in successfully!', 'success');
        
        // Refresh the page to show updated status
        setTimeout(() => {
            location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('Error checking in machine:', error);
        showMessage('Error checking in machine. Please try again.', 'error');
    }
}

async function confirmMaintenance() {
    const machineId = getMachineIdFromURL();
    console.log('Confirming maintenance for machine:', machineId);
    
    try {
        // Update machine status to maintenance
        const { error: machineError } = await supabaseClient
            .from('machines')
            .update({ status: 'maintenance' })
            .eq('machine_id', parseInt(machineId));
        
        if (machineError) {
            throw machineError;
        }
        
        showMessage('Machine set to maintenance successfully!', 'success');
        closeMaintenanceModal();
        
        // Refresh the page to show updated status
        setTimeout(() => {
            location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('Error setting machine to maintenance:', error);
        showMessage('Error updating machine status. Please try again.', 'error');
    }
}

async function setMaintenance() {
    const machineId = getMachineIdFromURL();
    
    if (!confirm('Are you sure you want to set this machine to maintenance?')) {
        return;
    }
    
    try {
        // Update machine status to maintenance
        const { error: machineError } = await supabaseClient
            .from('machines')
            .update({ status: 'maintenance' })
            .eq('machine_id', parseInt(machineId));
        
        if (machineError) {
            throw machineError;
        }
        
        showMessage('Machine set to maintenance successfully!', 'success');
        
        // Refresh the page to show updated status
        setTimeout(() => {
            location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('Error setting machine to maintenance:', error);
        showMessage('Error updating machine status. Please try again.', 'error');
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert after the header
    const header = document.querySelector('.header');
    header.parentNode.insertBefore(messageDiv, header.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Update status form visibility based on current status
function updateStatusFormVisibility(status) {
    const checkinForm = document.getElementById('checkin-form');
    const checkoutForm = document.getElementById('checkout-form');
    
    console.log('Updating form visibility for status:', status);
    
    // Check for various possible status values (case-insensitive)
    const isRented = status && (
        status.toLowerCase() === 'rented' ||
        status.toLowerCase() === 'rent' ||
        status.toLowerCase() === 'out' ||
        status.toLowerCase() === 'checked out'
    );
    
    if (isRented) {
        checkinForm.classList.remove('hidden');
        checkoutForm.classList.add('hidden');
        console.log('Showing check-in form, hiding check-out form');
    } else {
        checkinForm.classList.add('hidden');
        checkoutForm.classList.remove('hidden');
        console.log('Showing check-out form, hiding check-in form');
    }
}
