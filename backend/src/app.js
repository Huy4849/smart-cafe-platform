const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const helmet = require("helmet");
const morgan = require("morgan");

// middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(helmet());
app.use(morgan("dev"));

// test API
app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
    });
});

app.get("/metrics", (req, res) => {
    res.send("OK metrics");
});

module.exports = app;