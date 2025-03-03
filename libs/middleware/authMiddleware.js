import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.TOKEN_SECRET);
        req.user = decoded; // Attach user info to request object
        next(); // Proceed to the next middleware or route
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

export default authMiddleware;