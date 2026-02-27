/**
 * Run all seeders in order (using Sequelize models).
 */

import sequelize from '../config/database.js';
import { seed as seedRoles } from './seeders/001_seed_roles.js';
import { seed as seedAdminUser } from './seeders/002_seed_admin_user.js';

async function run() {
  try {
    await sequelize.authenticate();
    await seedRoles();
    await seedAdminUser();
    console.log('All seeders completed.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
