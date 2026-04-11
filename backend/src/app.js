const express = require("express");
const cors = require("cors");

const app = express();
// Trust proxy MUST be set before any other middleware
app.set('trust proxy', 1);
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const customerRoutes = require("./routes/customer.routes");
const dealRoutes = require("./routes/deal.routes");
const leadRoutes = require("./routes/lead.routes");
const taskRoutes = require("./routes/task.routes");
const noteRoutes = require("./routes/note.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportRoutes = require("./routes/report.routes");
const projectRoutes = require("./routes/project.routes");

const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler.middleware");

// middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/projects", projectRoutes);

// test API
app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use(errorHandler);

// Prometheus Metrics Setup
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// Expose default runtime metrics (Memory, CPU, event loop)
app.get("/metrics", async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

module.exports = app;