import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const authMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Find user by ID from token payload
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            error: error.message
        });
    }
};

export default authMiddleware;
