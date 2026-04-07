const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const customerRoutes = require("./routes/customer.routes");

const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler.middleware");

// rate limiter
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!"
});
app.use("/api", limiter);

// middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use(helmet());
app.use(morgan("dev"));

// test API
app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use(errorHandler);

app.get("/metrics", (req, res) => {
    res.send("OK metrics");
});

module.exports = app;