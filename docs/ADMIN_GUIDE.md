# Zerlin Admin Guide

## Overview

The Zerlin admin panel provides comprehensive management capabilities for the platform, including user management, alert monitoring, and oracle configuration.

## Admin Pages

### 1. Admin Dashboard (`/admin`)

The main admin dashboard provides an overview of system health and statistics:

- **System Statistics**
  - Total users
  - Active/total alerts
  - Total fee estimates
  - Average response time
  - Cache hit rate

- **Service Status**
  - Database connection
  - Redis cache
  - Stacks blockchain node

- **Quick Actions**
  - Navigate to user management
  - Navigate to alert management
  - Navigate to oracle settings
  - View fee history

### 2. User Management (`/admin/users`)

Manage all registered users:

- **Features**
  - View all users with pagination
  - See user details (Stacks address, email, creation date)
  - View alert count per user
  - Delete users (cascades to their alerts)

- **User Information**
  - Stacks address (truncated for display)
  - Email (if provided)
  - Number of alerts created
  - Account creation date
  - Last activity timestamp

### 3. Alert Management (`/admin/alerts`)

Monitor and manage all user alerts:

- **Features**
  - View all alerts with pagination
  - Toggle alert active/inactive status
  - Delete alerts
  - Filter by status

- **Alert Information**
  - User address
  - Alert condition (ABOVE/BELOW)
  - Target fee threshold
  - Active status
  - Creation date
  - Trigger count

### 4. Oracle Management (`/admin/oracle`)

Configure the fee oracle smart contract:

- **Current Status**
  - Current fee rate (µSTX/byte)
  - Last update timestamp
  - Contract owner
  - Initialization status

- **Fee Rate Management**
  - Update fee rate
  - Set congestion level (low/medium/high)

- **Oracle Authorization**
  - View authorized oracles
  - Authorize new oracle addresses
  - Revoke oracle permissions

## Backend API Endpoints

### Admin Stats
```
GET /api/admin/stats
```
Returns system-wide statistics.

### User Management
```
GET /api/admin/users?page=1&limit=20
GET /api/admin/users/:id
DELETE /api/admin/users/:id
```

### Alert Management
```
GET /api/admin/alerts?page=1&limit=50
PATCH /api/admin/alerts/:id/toggle
DELETE /api/admin/alerts/:id
```

### Oracle Status
```
GET /fee-oracle/status
POST /fee-oracle/update-rate
POST /fee-oracle/authorize
POST /fee-oracle/revoke
```

## Security Considerations

⚠️ **Important**: The current implementation does not include authentication/authorization. Before deploying to production:

1. **Add Authentication**
   - Implement JWT or session-based auth
   - Protect all `/admin/*` routes
   - Verify admin role/permissions

2. **Add Authorization**
   - Create admin role system
   - Implement role-based access control (RBAC)
   - Verify permissions for sensitive operations

3. **Audit Logging**
   - Log all admin actions
   - Track who made changes and when
   - Store audit trail in database

4. **Rate Limiting**
   - Implement rate limits on admin endpoints
   - Prevent abuse and DoS attacks

## Frontend Components

### AdminDashboard
Main dashboard component with system overview.

### UserManagement
Table view of all users with CRUD operations.

### AlertManagement
Table view of all alerts with toggle and delete actions.

### OracleManagement
Forms for managing oracle configuration and authorizations.

## Usage

1. **Access Admin Panel**
   ```
   Navigate to http://localhost:3001/admin
   ```

2. **View System Stats**
   - Dashboard shows real-time statistics
   - Auto-refreshes every 30 seconds

3. **Manage Users**
   - Click "Manage Users" or navigate to `/admin/users`
   - Use pagination to browse users
   - Delete users as needed (with confirmation)

4. **Manage Alerts**
   - Navigate to `/admin/alerts`
   - Toggle alerts on/off
   - Delete inactive or problematic alerts

5. **Configure Oracle**
   - Navigate to `/admin/oracle`
   - Update fee rates based on network conditions
   - Manage authorized oracle addresses

## Development

### Adding New Admin Features

1. **Backend**
   - Add endpoints to `backend/src/admin/admin.controller.ts`
   - Implement logic in `backend/src/admin/admin.service.ts`
   - Add DTOs in `backend/src/admin/dto/`

2. **Frontend**
   - Create components in `frontend/src/components/organisms/admin/`
   - Add pages in `frontend/src/app/admin/`
   - Update API client in `frontend/src/lib/adminApi.ts`
   - Add types in `frontend/src/types/admin.ts`

### Testing

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run build
npm run dev
```

## Future Enhancements

- [ ] Authentication & authorization
- [ ] Audit logging
- [ ] Advanced analytics dashboard
- [ ] Bulk operations
- [ ] Export data (CSV, JSON)
- [ ] Real-time notifications
- [ ] Activity timeline
- [ ] User impersonation (for support)
- [ ] System configuration UI
- [ ] Database backup/restore
