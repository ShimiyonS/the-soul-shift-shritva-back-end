/**
 * Auth service - login, refresh, logout only (no register).
 * Uses Sequelize models.
 */

import { User, Role } from '../models/index.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwt.js';
import { USER_STATUS } from '../config/constants.js';

const toAuthUser = (instance) => {
  const u = instance.get ? instance.get({ plain: true }) : instance;
  const roleName = u.role?.name ?? u.role_name;
  const out = {
    id: u.id,
    email: u.email,
    first_name: u.firstName ?? u.first_name,
    last_name: u.lastName ?? u.last_name,
    role_id: u.roleId ?? u.role_id,
    role_name: roleName,
    status: u.status,
    email_verified: u.emailVerified ?? u.email_verified,
    created_at: u.createdAt ?? u.created_at,
    updated_at: u.updatedAt ?? u.updated_at
  };
  return out;
};

const login = async (email, password) => {
  const user = await User.findOne({
    where: { email: email.trim().toLowerCase() },
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }]
  });
  if (!user) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    const error = new Error('User account is not active');
    error.statusCode = 403;
    throw error;
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role?.name ?? 'admin'
  });
  const refreshToken = generateRefreshToken({ userId: user.id });

  await user.update({ refreshToken });

  const userData = toAuthUser(user);
  return {
    user: userData,
    accessToken,
    refreshToken
  };
};

const refreshToken = async (refreshToken) => {
  try {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (jwtError) {
      const error = new Error('Refresh token expired or malformed');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }]
    });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      const error = new Error('User account is not active');
      error.statusCode = 403;
      throw error;
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      role: user.role?.name ?? 'admin'
    });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    await user.update({ refreshToken: newRefreshToken });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    if (
      error.message === 'User account is not active' ||
      error.message === 'User not found' ||
      error.message === 'Refresh token expired or malformed'
    ) {
      throw error;
    }
    const invalidTokenError = new Error('Invalid refresh token');
    invalidTokenError.statusCode = 401;
    throw invalidTokenError;
  }
};

const logout = async (userId) => {
  await User.update(
    { refreshToken: null },
    { where: { id: userId } }
  );
  return { message: 'Logged out successfully' };
};

export default { login, refreshToken, logout };
