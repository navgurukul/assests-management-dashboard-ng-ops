# Consignments Feature

This feature module manages consignments in the Assets Management Dashboard, following the same architectural pattern as Assets and Components sections.

## Overview

The consignment feature allows users to:
- Create new consignments from open allocations
- View and search all consignments with filtering
- Track consignment status (Pending, In Transit, Delivered, etc.)
- Manage courier services and tracking information
- View detailed consignment information

## File Structure

```
features/consignments/
├── CreateConsignment.js       # Create new consignment form
├── ConsignmentsList.js        # List all consignments with table
├── ConsignmentDetails.js      # Detailed view of a consignment
└── index.js                   # Exports all components

app/consignments/
├── page.js                    # Main consignments list page
├── create/
│   └── page.js               # Create consignment page
└── [id]/
    └── page.js               # Consignment details page

app/config/
├── formConfigs/
│   └── consignmentFormConfig.js  # Form fields and validation
└── tableConfigs/
    └── consignmentTableConfig.js # Table column definitions
```

## Key Features

### 1. Consignment Form (Create)
Based on the wireframe design, the form includes:
- **Allocation ID**: Auto-complete dropdown for open allocations
- **Assets**: Auto-populated from selected allocation
- **Source**: Auto-populated from allocation
- **Destination**: Auto-populated from allocation
- **Courier Service**: Select or add new courier service provider
- **Tracking Link**: Auto-populated or manually entered
- **Tracking ID**: Manual input field
- **Shipped At**: Date picker
- **Estimated Delivery Date**: Date picker
- **Notes**: Optional textarea

### 2. Consignments List
Features:
- Paginated table with customizable columns
- Search functionality with debouncing
- Filters: Status, Courier Service
- Column selector for customizing visible columns
- Click row to view details
- Create new consignment button

Default visible columns:
- Consignment Code
- Status
- Allocation Code
- Courier Service
- Source
- Destination
- Shipped At
- Estimated Delivery Date

### 3. Consignment Details
Detailed view showing:
- Quick info (status, code, allocation, asset count)
- Shipping timeline (shipped, estimated, delivered dates)
- Consignment details (source, destination, courier, tracking)
- Assets in consignment
- Allocation information
- System information (created by, timestamps)

## API Endpoints

Configured in `app/config/env.config.js`:
- `GET /consignments` - List all consignments
- `POST /consignments` - Create new consignment
- `GET /consignments/:id` - Get consignment details
- `PATCH /consignments/:id` - Update consignment
- `PATCH /consignments/:id/status` - Update consignment status
- `DELETE /consignments/:id` - Delete consignment

## Data Transformers

Added to `app/utils/dataTransformers.js`:
- `formatConsignmentStatus()` - Convert status codes to readable text
- `transformConsignmentForTable()` - Transform API data for table display

## Status Types

- **PENDING**: Consignment created but not shipped
- **IN_TRANSIT**: Shipped and on the way
- **DELIVERED**: Successfully delivered
- **CANCELLED**: Consignment cancelled
- **RETURNED**: Returned to sender

## Integration

The consignment section integrates with:
- **Allocations**: Consignments are created from open allocations
- **Assets**: Tracks which assets are in each consignment
- **Courier Services**: References courier service providers
- **Campuses/Locations**: Source and destination tracking

## Usage

### Creating a Consignment
1. Navigate to `/consignments`
2. Click "Create Consignment"
3. Select an allocation ID (only open allocations shown)
4. Assets, source, and destination auto-populate
5. Select courier service
6. Add tracking information
7. Set dates and optional notes
8. Submit form

### Viewing Consignments
1. Navigate to `/consignments`
2. Use search and filters to find consignments
3. Click on any row to view detailed information

### Updating Status
Available from the details page for non-delivered consignments.

## Pattern Consistency

This implementation follows the exact same patterns as:
- **Assets**: Similar list, create, and details structure
- **Components**: Same form handling and API integration
- **Allocations**: Consistent routing and state management

Key patterns maintained:
- ✅ Feature-based folder structure
- ✅ Centralized configuration files
- ✅ Reusable table and form components
- ✅ Data transformers for consistency
- ✅ SessionStorage for details page data
- ✅ Toast notifications for user feedback
- ✅ Error handling and loading states
- ✅ Responsive design with Tailwind CSS
