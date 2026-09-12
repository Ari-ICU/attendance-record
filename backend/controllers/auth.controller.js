const AuthService = require('../services/auth.service');
const { ApiResponse } = require('../utils/apiResponse');
const { REFRESH_EXPIRES_IN } = require('../middlewares/auth.middleware');

class AuthController {
    static async login(req, res) {
        try {
            const { user, token, refreshToken } = await AuthService.loginUser(req.body);

            // Cookie settings optimized for local development
            const cookieOptions = {
                httpOnly: true,
                secure: false, // Must be false for localhost HTTP
                sameSite: 'lax', // Lax is generally better for localhost cross-port
                maxAge: REFRESH_EXPIRES_IN * 1000,
                path: '/', // Explicitly set path
            };

            // For debugging - log cookie setting
            console.log('Setting refresh token cookie for user:', user.username || user.email);
            console.log('Cookie options:', JSON.stringify(cookieOptions));

            res.cookie('refreshToken', refreshToken, cookieOptions);

            // Don't expose refresh token in response body
            return res.status(200).json(ApiResponse.success({ user, token }, 'Login successful'));
        } catch (err) {
            console.error('Login error:', err.message);
            return res.status(400).json(ApiResponse.error('Login failed', 400, err.message));
        }
    }

    static async refreshToken(req, res) {
        try {
            // Debug: Log all cookies received
            console.log('--- Token Refresh Attempt ---');
            console.log('Origin:', req.get('Origin'));
            console.log('Cookies:', req.cookies);
            console.log('Raw Cookie Header:', req.headers.cookie);

            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                console.log('No refresh token found in cookies');
                return res.status(401).json(ApiResponse.error('Refresh token required', 401));
            }

            console.log('Found refresh token, attempting refresh...');
            const tokens = await AuthService.refreshToken(refreshToken);

            // Set new refresh token cookie with same options as login
            const cookieOptions = {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: REFRESH_EXPIRES_IN * 1000,
                path: '/',
            };

            res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

            return res.status(200).json(ApiResponse.success({ token: tokens.token }, 'Token refreshed'));
        } catch (err) {
            console.error('Refresh token error:', err.message);
            res.clearCookie('refreshToken', { path: '/', httpOnly: true, secure: false, sameSite: 'lax' });
            return res.status(401).json(ApiResponse.error('Invalid or expired refresh token', 401, err.message));
        }
    }

    static async getProfile(req, res) {
        try {
            const user = await AuthService.getProfile(req.user._id);
            return res.status(200).json(ApiResponse.success(user, 'Profile retrieved successfully'));
        } catch (err) {
            return res.status(404).json(ApiResponse.error('Failed to get profile', 404, err.message));
        }
    }

    static async updateProfile(req, res) {
        try {
            const user = await AuthService.updateProfile(req.user._id, req.body);
            return res.status(200).json(ApiResponse.success(user, 'Profile updated successfully'));
        } catch (err) {
            return res.status(400).json(ApiResponse.error('Failed to update profile', 400, err.message));
        }
    }

    static async logout(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (refreshToken) {
                await AuthService.logoutUser(req.user._id, refreshToken);
            }

            // Clear cookie with same options used to set it
            res.clearCookie('refreshToken', {
                path: '/',
                httpOnly: true,
                secure: false,
                sameSite: 'lax'
            });

            return res.status(200).json(ApiResponse.success(null, 'Logout successful'));
        } catch (err) {
            res.clearCookie('refreshToken', { path: '/' });
            return res.status(500).json(ApiResponse.error('Logout failed', 500, err.message));
        }
    }

    static async getAllUsers(req, res) {
        try {
            const users = await AuthService.getAllUsers();
            return res.status(200).json(ApiResponse.success(users, 'Users retrieved successfully'));
        } catch (err) {
            return res.status(500).json(ApiResponse.error('Failed to get users', 500, err.message));
        }
    }

    static async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            const user = await AuthService.updateUserRole(id, role);
            return res.status(200).json(ApiResponse.success(user, 'User role updated successfully'));
        } catch (err) {
            return res.status(400).json(ApiResponse.error('Failed to update user role', 400, err.message));
        }
    }
}


module.exports = AuthController;