/**
 * Seed admin user - using Sequelize.
 * Password is hashed by User model hook.
 */

import { User, Role } from '../../models/index.js';
import { ROLES, USER_STATUS } from '../../config/constants.js';

export async function seed() {
  try {
    const role = await Role.findOne({ where: { name: ROLES.ADMIN } });
    if (!role) {
      throw new Error('Admin role not found. Please seed roles first.');
    }

    const [adminUser, created] = await User.findOrCreate({
      where: { email: 'admin@shritva.com' },
      defaults: {
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        roleId: role.id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true
      }
    });

    if (!created) {
      await adminUser.update({
        password: 'admin123',
        status: USER_STATUS.ACTIVE
      });
    }

    console.log('✓ Seeded admin user (email: admin@shritva.com, password: admin123)');
  } catch (error) {
    console.error('Error seeding admin user:', error);
    throw error;
  }
}
