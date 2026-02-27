/**
 * Seed roles - using Sequelize.
 */

import { Role } from '../../models/index.js';
import { ROLES } from '../../config/constants.js';

export async function seed() {
  try {
    await Role.findOrCreate({
      where: { name: ROLES.ADMIN },
      defaults: {
        description: 'System administrator with full access',
        permissions: { users: ['create', 'read', 'update', 'delete'] },
        status: 'active'
      }
    });

    console.log('✓ Seeded roles table');
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw error;
  }
}
