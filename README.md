# Machine QR Code System

A complete QR code system for displaying machine information when scanned. Built with HTML, CSS, JavaScript, and Supabase.

## Features

- **QR Code Generation**: Generate unique QR codes for each machine
- **Real-time Data**: Display current machine status, rental information, and specifications
- **Responsive Design**: Works on all devices (mobile, tablet, desktop)
- **No Backend Required**: All data is loaded directly from Supabase via JavaScript
- **Professional UI**: Modern, clean interface with smooth animations

## Database Schema

The system works with the following Supabase tables:

### Models
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

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create the database tables using the schema above
4. Insert some sample data

### 2. Configuration

1. Open `config.js`
2. Replace the placeholder values with your actual Supabase credentials:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://your-project-id.supabase.co',
       anonKey: 'your-anon-key-here'
   };
   ```

### 3. Hosting

Upload all files to any web hosting service:

- **GitHub Pages**: Push to a repository and enable Pages
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your GitHub repository
- **Traditional hosting**: Upload via FTP

### 4. Usage

1. **Generate QR Codes**: Open `qr-generator.html` to create QR codes for each machine
2. **Print QR Codes**: Download and print the generated QR codes
3. **Place on Machines**: Attach QR codes to physical machines
4. **Scan**: Anyone can scan the QR code to see machine details

## File Structure

```
├── index.html          # Main machine details page (accessed via QR code)
├── qr-generator.html   # QR code generation tool
├── script.js           # Main JavaScript for machine details
├── qr-generator.js     # JavaScript for QR code generation
├── config.js           # Supabase configuration
├── styles.css          # CSS styling for both pages
└── README.md           # This file
```

## How It Works

### QR Code Flow
1. User scans QR code on machine
2. QR code contains URL like: `https://yoursite.com/index.html?machine_id=123`
3. Page loads and extracts machine ID from URL
4. JavaScript queries Supabase for machine details
5. Information is displayed in a beautiful, responsive interface

### Data Queries
- **Machine Details**: Fetches machine info with model specifications
- **Rental Status**: Shows current rental information if machine is rented
- **Real-time Updates**: Data is always current from your Supabase database

## Customization

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- Update the gradient backgrounds and color scheme
- Adjust responsive breakpoints for different devices

### Functionality
- Add more fields to display in `script.js`
- Modify the QR code generation options in `qr-generator.js`
- Add additional Supabase queries for more data

### Database
- Add new tables or fields as needed
- Modify the SQL queries in the JavaScript files
- Add more complex relationships between tables

## Security Notes

- The anon key is safe to expose in frontend code
- Row Level Security (RLS) can be enabled in Supabase for additional security
- Consider adding authentication if you need to restrict access

## Troubleshooting

### Common Issues

1. **QR codes not working**: Check that your website is accessible and Supabase credentials are correct
2. **No data showing**: Verify your database tables have data and relationships are correct
3. **Styling issues**: Ensure all CSS files are properly linked
4. **JavaScript errors**: Check browser console for Supabase connection issues

### Debug Mode

Open browser developer tools to see:
- Network requests to Supabase
- JavaScript console errors
- Database query results

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Supabase credentials and database setup
3. Ensure all files are properly uploaded to your hosting service

## License

This project is open source and available under the MIT License.