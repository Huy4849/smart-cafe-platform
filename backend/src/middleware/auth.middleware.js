const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        // lấy token từ header
        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        // format: Bearer token
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};