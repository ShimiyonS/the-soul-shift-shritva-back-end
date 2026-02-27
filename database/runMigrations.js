/**
 * Run all migrations in order (using Sequelize).
 */

import sequelize from '../config/database.js';
import { up as upRoles } from './migrations/001_create_roles_table.js';
import { up as upUsers } from './migrations/002_create_users_table.js';
import { up as upRemovePhoneLastLogin } from './migrations/003_remove_phone_last_login_from_users.js';

async function run() {
  try {
    await sequelize.authenticate();
    await upRoles();
    await upUsers();
    await upRemovePhoneLastLogin();
    console.log('All migrations completed.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
