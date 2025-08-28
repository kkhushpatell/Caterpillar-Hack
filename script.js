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
    if (rentalData && rentalData.status === 'active') {
        rentalInfo.classList.remove('hidden');
        document.getElementById('customer-name').textContent = rentalData.customer_name || 'N/A';
        document.getElementById('operator-name').textContent = rentalData.operator_name || 'N/A';
        document.getElementById('rental-start').textContent = formatDate(rentalData.start_date);
        document.getElementById('rental-end').textContent = formatDate(rentalData.end_date);
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
        document.getElementById('description').textContent = `Model: ${machineData.model_name || 'N/A'}, Category: ${machineData.category || 'N/A'}, Capacity: ${machineData.capacity || 'N/A'} tons`;
    
    // Update status badge
    updateStatusBadge(machineData.status);
    
    // Show rental information if applicable
    if (machineData.rental_data) {
        showRentalInfo(machineData.rental_data);
    }
    
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

        // Fetch current rental information if machine is rented
        let rentalData = null;
        if (machineData.status === 'rented') {
            const { data: rental, error: rentalError } = await supabaseClient
                .from('rentals')
                .select(`
                    *,
                    customer:customers (name),
                    operator:operators (name)
                `)
                .eq('machine_id', machineId)
                .eq('status', 'active')
                .single();

            if (!rentalError && rental) {
                rentalData = {
                    ...rental,
                    customer_name: rental.customer?.name,
                    operator_name: rental.operator?.name
                };
            }
        }

        // Combine all data
        const combinedData = {
            ...machineData,
            ...modelData,
            rental_data: rentalData
        };

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
