require("dotenv").config();

const express = require("express");
const pool = require("./db");
const productRoutes = require("./routes/productRoutes");
const { connectRedis } = require("./redis");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Redis Cache API is running",
  });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "healthy",
      database: "connected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
    });
  }
});

app.use("/products", productRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectRedis();

    await pool.query("SELECT 1");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();