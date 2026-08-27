const express = require("express");
const pool = require("../db");
const { redisClient } = require("../redis");

const router = express.Router();

// router.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query("SELECT * FROM products WHERE id = $1", [
//       id,
//     ]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message: "Product not found",
//       });
//     }

//     res.json(result.rows[0]);
//   } catch (error) {
    // console.error(error);

//     res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// });


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `product:${id}`;

    // 1. Check Redis
    const cachedProduct = await redisClient.get(cacheKey);

    if (cachedProduct) {
      console.log("CACHE HIT:", cacheKey);

      return res.json(JSON.parse(cachedProduct));
    }

    console.log("CACHE MISS:", cacheKey);

    // 2. Query database
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = result.rows[0];

    // 3. Store in Redis
    await redisClient.set(cacheKey, JSON.stringify(product), {
      EX: 60,
    });

    // 4. Return
    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
