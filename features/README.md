# Feature-wise Structure

This directory contains feature modules organized by domain. Each feature is self-contained with its own components, logic, and related code.

## Structure

```
features/
├── tickets/
│   ├── TicketsList.js       # List view component
│   ├── TicketDetails.js     # Detail view component
│   ├── components/          # Feature-specific components
│   └── index.js             # Public exports
│
└── assets/
    ├── AssetsList.js        # List view component
    ├── AssetDetails.js      # Detail view component
    ├── components/          # Feature-specific components
    └── index.js             # Public exports
```

## Features

### Tickets
- **TicketsList**: Display all tickets in a table with filtering and pagination
- **TicketDetails**: Show detailed ticket information including timeline, device summary, and action buttons
- Data source: `dummyJson/dummyJson.js` - `ticketsTableData` and `ticketDetailsData`

### Assets
- **AssetsList**: Display all assets with search and filter capabilities
- **AssetDetails**: Show asset specifications, components, and movement history
- Data source: `dummyJson/dummyJson.js` - `assetsPageData` and `assetDetailsData`

## Usage

Import feature components directly:

```javascript
import TicketsList from '@/features/tickets/TicketsList';
import AssetsList from '@/features/assets/AssetsList';
```

Or use barrel exports:

```javascript
import { TicketsList, TicketDetails } from '@/features/tickets';
import { AssetsList, AssetDetails } from '@/features/assets';
```

## Adding New Features

1. Create a new directory under `features/`
2. Add feature components
3. Create `index.js` for exports
4. Add dummy data to `dummyJson/dummyJson.js`
5. Create page routes in `app/` directory
