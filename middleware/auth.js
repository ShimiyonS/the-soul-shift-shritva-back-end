/**
 * Auth middleware - uses Sequelize User model.
 */

import { verifyAccessToken } from '../utils/jwt.js';
import { ROLES } from '../config/constants.js';
import { User, Role } from '../models/index.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'User account is not active'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role_name: user.role?.name,
      role: user.role,
      status: user.status
    };
    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

export function authorize(...allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role_name || req.user.role?.name;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
}

export const isAdmin = authorize(ROLES.ADMIN);
