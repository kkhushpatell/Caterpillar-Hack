# Machine QR Code System

A complete QR code system for displaying machine information when scanned. Built with HTML, CSS, JavaScript, and Supabase.

## Features

- **QR Code Generation**: Generate unique QR codes for each machine
- **Real-time Data**: Display current machine status, rental information, and specifications
- **Responsive Design**: Works on all devices (mobile, tablet, desktop)
- **No Backend Required**: All data is loaded directly from Supabase via JavaScript

## Database Schema

The system works with the following Supabase tables:

### Model
- `model_id` (INT, Primary Key)
- `model_name` (VARCHAR)
- `manufacturer` (VARCHAR)
- `machine_type` (VARCHAR)
- `weight_capacity` (DECIMAL)
- `description` (TEXT)

### Machines
- `machine_id` (INT, Primary Key)
- `model_id` (INT, Foreign Key to Models)
- `purchase_date` (DATE)
- `status` (VARCHAR: 'available', 'rented', 'maintenance')

### Customers
- `customer_id` (INT, Primary Key)
- `name` (VARCHAR)
- `contact` (VARCHAR)
- `location_lat` (DECIMAL)
- `location_long` (DECIMAL)

### Operators
- `operator_id` (INT, Primary Key)
- `name` (VARCHAR)
- `license_number` (VARCHAR)
- `experience_years` (INT)
- `accident_warning_count` (INT)

### Rentals
- `rental_id` (INT, Primary Key)
- `machine_id` (INT, Foreign Key to Machines)
- `customer_id` (INT, Foreign Key to Customers)
- `operator_id` (INT, Foreign Key to Operators)
- `start_date` (DATE)
- `end_date` (DATE)
- `status` (VARCHAR: 'active', 'completed', 'overdue')

### UsageLog
- `log_id` (INT, Primary Key, Auto Increment)
- `machine_id` (INT, Foreign Key to Machines)
- `rental_id` (INT, Foreign Key to Rentals)
- `timestamp` (DATETIME)
- `engine_hours` (DECIMAL)
- `fuel_consumed` (DECIMAL)
- `load_weight` (DECIMAL)
- `speed` (DECIMAL)
- `idle_time` (DECIMAL)


## File Structure

```
├── index.html          # Main machine details page (accessed via QR code)
├── script.js           # Main JavaScript for machine details
├── config.js           # Supabase configuration
├── styles.css          # CSS styling for both pages
└── README.md           # This file
```

## How It Works

### QR Code Flow
1. User scans QR code on machine
2. QR code contains URL like: `https://kkhushpatell.github.io/Caterpillar-Hack/?machine_id=1`
3. Page loads and extracts machine ID from URL
4. JavaScript queries Supabase for machine details
5. Information is displayed in a beautiful, responsive interface

### Data Queries
- **Machine Details**: Fetches machine info with model specifications
- **Rental Status**: Shows current rental information if machine is rented
- **Real-time Updates**: Data is always current from your Supabase database