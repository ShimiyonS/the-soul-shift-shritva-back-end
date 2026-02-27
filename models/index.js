import Role from './Role.js';
import User from './User.js';

// User belongs to Role
User.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role'
});

// Role has many Users
Role.hasMany(User, {
  foreignKey: 'roleId',
  as: 'users'
});

export { Role, User };
