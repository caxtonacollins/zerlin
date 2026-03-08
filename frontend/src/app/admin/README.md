# Admin Panel

## Pages

- `/admin` - Main dashboard with system overview
- `/admin/users` - User management
- `/admin/alerts` - Alert management
- `/admin/oracle` - Oracle configuration

## Features

### Dashboard
- System statistics (users, alerts, estimates)
- Service health monitoring (DB, Redis, Stacks)
- Quick action links
- Auto-refresh every 30 seconds

### User Management
- Paginated user list
- View user details and alert counts
- Delete users (cascades to alerts)
- Search and filter capabilities

### Alert Management
- View all user alerts
- Toggle alert active/inactive
- Delete alerts
- Filter by status and user

### Oracle Management
- View current fee rate and status
- Update fee rates
- Manage authorized oracles
- Revoke oracle permissions

## Security Note

⚠️ **This implementation does not include authentication/authorization.**

Before production deployment:
1. Add authentication (JWT/session)
2. Implement role-based access control
3. Add audit logging
4. Implement rate limiting

See `/docs/ADMIN_GUIDE.md` for detailed documentation.
