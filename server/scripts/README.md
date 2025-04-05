# Server Scripts

This directory contains utility scripts for managing the e-learning platform.

## Creating an Admin User

To create the first admin user in the system, follow these steps:

1. Open the `seed-admin.js` file and modify the admin credentials:
   ```javascript
   const ADMIN_NAME = 'Super Admin';
   const ADMIN_EMAIL = 'admin@example.com';
   const ADMIN_PASSWORD = 'admin123'; // Change this to a secure password!
   ```

2. Navigate to the server directory and run the script:
   ```bash
   node scripts/seed-admin.js
   ```

3. You should see a confirmation message that the admin user was created successfully.

4. You can now log in with the admin credentials through the regular login page.

5. Once logged in as an admin, you can create additional admin, faculty, or student accounts through the admin dashboard at `/admin/users`.

## Security Note

- Change the default admin password immediately after the first login.
- Delete or secure this script after creating the initial admin account to prevent unauthorized access. 