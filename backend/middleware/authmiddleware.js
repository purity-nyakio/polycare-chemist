const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate users and check roles
 * @param {Array} roles - Optional array of roles allowed (e.g., ['admin'])
 */
const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        // 1. Get token from the header
        const token = req.header('x-auth-token');

        // 2. Check if no token
        if (!token) {
            return res.status(401).json({ msg: "No token, authorization denied" });
        }

        try {
            // 3. Verify token
            // Ensure process.env.JWT_SECRET is defined in your .env file
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Add user info to the request object
            // This 'decoded.user' MUST contain 'id' and 'role'
            req.user = decoded.user;

            // 4. Role-based access control
            // If the route specifies roles, check if user has one of them
            if (roles.length > 0 && !roles.includes(req.user.role)) {
                return res.status(403).json({ msg: "Access denied: Unauthorized role" });
            }

            next();
        } catch (err) {
            console.error("Token verification failed:", err.message);
            res.status(401).json({ msg: "Token is not valid" });
        }
    };
};

module.exports = authMiddleware;