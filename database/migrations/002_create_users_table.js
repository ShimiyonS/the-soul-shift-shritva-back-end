/**
 * Create users table - using Sequelize (same as presco-hrms pattern).
 */

import sequelize from '../../config/database.js';

export async function up() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role_id INT NOT NULL,
        status ENUM('active', 'inactive', 'suspended', 'pending_verification') DEFAULT 'pending_verification',
        email_verified BOOLEAN DEFAULT FALSE,
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
        INDEX idx_email (email),
        INDEX idx_role_id (role_id),
        INDEX idx_status (status),
        INDEX idx_deleted_at (deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Created users table');
  } catch (error) {
    console.error('Error creating users table:', error);
    throw error;
  }
}

export async function down() {
  try {
    await sequelize.query('DROP TABLE IF EXISTS users');
    console.log('✓ Dropped users table');
  } catch (error) {
    console.error('Error dropping users table:', error);
    throw error;
  }
}
