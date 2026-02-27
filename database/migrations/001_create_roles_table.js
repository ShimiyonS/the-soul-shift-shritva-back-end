/**
 * Create roles table - using Sequelize (same as presco-hrms pattern).
 */

import sequelize from '../../config/database.js';

export async function up() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        permissions JSON,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        INDEX idx_status (status),
        INDEX idx_deleted_at (deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Created roles table');
  } catch (error) {
    console.error('Error creating roles table:', error);
    throw error;
  }
}

export async function down() {
  try {
    await sequelize.query('DROP TABLE IF EXISTS roles');
    console.log('✓ Dropped roles table');
  } catch (error) {
    console.error('Error dropping roles table:', error);
    throw error;
  }
}
