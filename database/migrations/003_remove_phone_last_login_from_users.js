/**
 * Remove phone, phone_verified, last_login from users table.
 * Safe for fresh installs (columns missing) and existing DBs.
 */

import sequelize from '../../config/database.js';

export async function up() {
  try {
    const [rows] = await sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
       AND COLUMN_NAME IN ('phone', 'phone_verified', 'last_login')`
    );
    const toDrop = rows.map((r) => r.COLUMN_NAME);
    for (const col of toDrop) {
      await sequelize.query(`ALTER TABLE users DROP COLUMN \`${col}\``);
    }
    if (toDrop.length) {
      console.log('✓ Removed from users table:', toDrop.join(', '));
    }
  } catch (error) {
    console.error('Error altering users table:', error);
    throw error;
  }
}

export async function down() {
  try {
    await sequelize.query(`
      ALTER TABLE users
        ADD COLUMN phone VARCHAR(20) NULL AFTER last_name,
        ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE AFTER email_verified,
        ADD COLUMN last_login TIMESTAMP NULL AFTER phone_verified
    `);
    console.log('✓ Restored phone, phone_verified, last_login to users table');
  } catch (error) {
    console.error('Error altering users table:', error);
    throw error;
  }
}
