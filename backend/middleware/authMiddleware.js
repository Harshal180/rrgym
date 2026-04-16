const jwt = require("jsonwebtoken");

const getTokenFromRequest = (req) => {
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== "string") {
        return null;
    }

    const [scheme, token] = authHeader.split(" ");
    if (!/^Bearer$/i.test(scheme) || !token) {
        return null;
    }

    return token.trim();
};

/* ================================================
   AUTH MIDDLEWARE
   Verifies JWT from cookie, attaches decoded
   payload to req.user
   Works for BOTH members and admins
================================================ */
const authMiddleware = (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ message: "Not authenticated. Please log in." });
    }
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired session. Please log in again." });
    }
};

/* ================================================
   ADMIN ONLY MIDDLEWARE
   Allows only users logged in via /api/admin/login
   (user_type === 'admin' in the JWT payload)
   Use on ALL admin dashboard routes
================================================ */
const adminOnly = (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);

        if (!token) {
            return res.status(403).json({ message: "No token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
};
/* ================================================
   TRAINER ONLY MIDDLEWARE  (legacy member system)
   Allows Trainers from the members table
   Keep this for member-facing routes where trainers
   need access (e.g. marking member attendance)
================================================ */
const trainerOnly = (req, res, next) => {
    if (!req.user || req.user.member_type !== "Trainer") {
        return res.status(403).json({ message: "Access denied. Trainer access required." });
    }
    next();
};

/* ================================================
   ADMIN OR TRAINER MIDDLEWARE
   Allows EITHER an admin login OR a Trainer member.
   Useful for routes that both admin dashboard and
   trainer-member login need to access.
================================================ */
const adminOrTrainer = (req, res, next) => {
    const isAdmin = req.user && req.user.user_type === "admin";
    const isTrainer = req.user && req.user.member_type === "Trainer";
    if (!isAdmin && !isTrainer) {
        return res.status(403).json({ message: "Access denied. Admin or Trainer required." });
    }
    next();
};

module.exports = { authMiddleware, adminOnly, trainerOnly, adminOrTrainer };
