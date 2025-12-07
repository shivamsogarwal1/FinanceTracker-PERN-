// // -----------------------------------------------
// //  IMPORTS
// // -----------------------------------------------
// const express = require('express');
// const { Pool } = require('pg');  // PostgreSQL client
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const app = express();

// // -----------------------------------------------
// //  CORS CONFIG
// // -----------------------------------------------
// app.use(cors({
//   origin: '*',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   allowedHeaders: 'Content-Type, Authorization'
// }));

// app.use(bodyParser.json());

// // -----------------------------------------------
// //  POSTGRES CONNECTION (NEON DB CONNECTION STRING)
// // 👉 REPLACE WITH YOUR OWN NEON CONNECTION STRING
// // -----------------------------------------------
// const pool = new Pool({
//   connectionString:
//     "postgresql://neondb_owner:npg_QMDw2BRWPVp6@ep-mute-meadow-a41q86br-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
//   ssl: { rejectUnauthorized: false } // IMPORTANT for Neon
// });

// // -----------------------------------------------
// const JWT_SECRET = "your_super_secret_key"; // 👉 CHANGE THIS
// // -----------------------------------------------

// // -----------------------------------------------
// //  TOKEN FUNCTIONS
// // -----------------------------------------------
// const generateToken = (user) => {
//   return jwt.sign(
//     {
//       userId: user.id,
//       email: user.email,
//       name: user.name,
//       phone: user.phone,
//     },
//     JWT_SECRET,
//     { expiresIn: "1h" }
//   );
// };

// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization;
//   if (!token) return res.status(401).json({ message: "No token found" });

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(401).json({ message: "Invalid token" });

//     req.user = decoded;
//     next();
//   });
// };

// // -----------------------------------------------
// // ROOT ROUTE
// // -----------------------------------------------
// app.get("/", (req, res) => {
//   res.send("Neon PostgreSQL Backend is running! 🚀");
// });

// // -----------------------------------------------
// // SIGNUP
// // -----------------------------------------------
// app.post("/signup", async (req, res) => {
//   const { name, email, phone, password } = req.body;

//   try {
//     const existing = await pool.query("SELECT * FROM users WHERE email=$1", [
//       email,
//     ]);
//     if (existing.rows.length > 0)
//       return res.status(400).json({ message: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await pool.query(
//       `INSERT INTO users (name, email, phone, password, salary)
//        VALUES ($1, $2, $3, $4, 0)
//        RETURNING *`,
//       [name, email, phone, hashedPassword]
//     );

//     const token = generateToken(newUser.rows[0]);
//     res.status(201).json({ message: "User created", token, user: newUser.rows[0] });
//   } catch (err) {
//     console.error("Signup error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // -----------------------------------------------
// // LOGIN
// // -----------------------------------------------
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const result = await pool.query("SELECT * FROM users WHERE email=$1", [
//       email,
//     ]);

//     if (result.rows.length === 0)
//       return res.status(404).json({ message: "User not found" });

//     const user = result.rows[0];

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid credentials" });

//     const token = generateToken(user);
//     res.json({ message: "Login successful", token, user });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // -----------------------------------------------
// // UPDATE SALARY
// // -----------------------------------------------
// app.put("/salary", verifyToken, async (req, res) => {
//   const { salary } = req.body;
//   const userId = req.user.userId;

//   try {
//     await pool.query("UPDATE users SET salary=$1 WHERE id=$2", [
//       salary,
//       userId,
//     ]);

//     res.json({ message: "Salary updated successfully" });
//   } catch (err) {
//     console.error("Salary update error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // -----------------------------------------------
// // GET SALARY
// // -----------------------------------------------
// app.get("/salary", verifyToken, async (req, res) => {
//   const userId = req.user.userId;

//   try {
//     const result = await pool.query(
//       "SELECT salary FROM users WHERE id=$1",
//       [userId]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error("Fetch salary error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // -----------------------------------------------
// // GET EXPENSES
// // -----------------------------------------------
// app.get("/expenses", verifyToken, async (req, res) => {
//   const userId = req.user.userId;

//   try {
//     const expenses = await pool.query(
//       "SELECT * FROM expenses WHERE user_id=$1 ORDER BY date DESC",
//       [userId]
//     );
//     res.json(expenses.rows);
//   } catch (err) {
//     console.error("Fetch expenses error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // -----------------------------------------------
// // ADD EXPENSE
// // -----------------------------------------------
// app.post("/expenses", verifyToken, async (req, res) => {
//   const { amount, category, date } = req.body;
//   const userId = req.user.userId;

//   try {
//     await pool.query(
//       `INSERT INTO expenses (user_id, amount, category, date)
//        VALUES ($1, $2, $3, $4)`,
//       [userId, amount, category, date]
//     );

//     res.status(201).json({ message: "Expense added" });
//   } catch (err) {
//     console.error("Add expense error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // -----------------------------------------------
// // DELETE EXPENSE
// // -----------------------------------------------
// app.delete("/expenses/:id", verifyToken, async (req, res) => {
//   const expenseId = req.params.id;
//   const userId = req.user.userId;

//   try {
//     const del = await pool.query(
//       "DELETE FROM expenses WHERE id=$1 AND user_id=$2",
//       [expenseId, userId]
//     );

//     if (del.rowCount === 0)
//       return res.status(404).json({ message: "Expense not found" });

//     res.json({ message: "Expense deleted" });
//   } catch (err) {
//     console.error("Delete error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // -----------------------------------------------
// // UPDATE EXPENSE
// // -----------------------------------------------
// app.put("/expenses/:id", verifyToken, async (req, res) => {
//   const expenseId = req.params.id;
//   const userId = req.user.userId;
//   const { amount, category, date } = req.body;

//   try {
//     const upd = await pool.query(
//       `UPDATE expenses
//        SET amount=$1, category=$2, date=$3
//        WHERE id=$4 AND user_id=$5`,
//       [amount, category, date, expenseId, userId]
//     );

//     if (upd.rowCount === 0)
//       return res.status(404).json({ message: "Expense not found" });

//     res.json({ message: "Expense updated" });
//   } catch (err) {
//     console.error("Update error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // -----------------------------------------------
// const port = 5000;
// app.listen(port, () => {
//   console.log(`🚀 Server running on port: ${port}`);
// });





























// -----------------------------------------------
//  IMPORTS
// -----------------------------------------------
const express = require('express');
const { Pool } = require('pg');  // PostgreSQL client
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load variables from .env

const app = express();

// -----------------------------------------------
//  CORS CONFIG
// -----------------------------------------------
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization'
}));

app.use(bodyParser.json());

// -----------------------------------------------
//  POSTGRES CONNECTION (Neon DB)
// -----------------------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Neon
});

// -----------------------------------------------
//  CONFIG VARIABLES
// -----------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;

// -----------------------------------------------
//  TOKEN FUNCTIONS
// -----------------------------------------------
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token found" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// -----------------------------------------------
// ROOT ROUTE
// -----------------------------------------------
app.get("/", (req, res) => {
  res.send("Neon PostgreSQL Backend is running! 🚀");
});

// -----------------------------------------------
// SIGNUP
// -----------------------------------------------
app.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (name, email, phone, password, salary)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING *`,
      [name, email, phone, hashedPassword]
    );

    const token = generateToken(newUser.rows[0]);
    res.status(201).json({ message: "User created", token, user: newUser.rows[0] });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -----------------------------------------------
// LOGIN
// -----------------------------------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -----------------------------------------------
// UPDATE SALARY
// -----------------------------------------------
app.put("/salary", verifyToken, async (req, res) => {
  const { salary } = req.body;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      "UPDATE users SET salary=$1 WHERE id=$2",
      [salary, userId]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Salary updated successfully" });
  } catch (err) {
    console.error("Salary update error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -----------------------------------------------
// GET SALARY
// -----------------------------------------------
app.get("/salary", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      "SELECT salary FROM users WHERE id=$1",
      [userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fetch salary error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -----------------------------------------------
// GET EXPENSES
// -----------------------------------------------
app.get("/expenses", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const expenses = await pool.query(
      "SELECT * FROM expenses WHERE user_id=$1 ORDER BY date DESC",
      [userId]
    );
    res.json(expenses.rows);
  } catch (err) {
    console.error("Fetch expenses error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -----------------------------------------------
// ADD EXPENSE
// -----------------------------------------------
app.post("/expenses", verifyToken, async (req, res) => {
  const { amount, category, date } = req.body;
  const userId = req.user.userId;

  try {
    await pool.query(
      `INSERT INTO expenses (user_id, amount, category, date)
       VALUES ($1, $2, $3, $4)`,
      [userId, amount, category, date]
    );

    res.status(201).json({ message: "Expense added" });
  } catch (err) {
    console.error("Add expense error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -----------------------------------------------
// DELETE EXPENSE
// -----------------------------------------------
app.delete("/expenses/:id", verifyToken, async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.userId;

  try {
    const del = await pool.query(
      "DELETE FROM expenses WHERE id=$1 AND user_id=$2",
      [expenseId, userId]
    );

    if (del.rowCount === 0)
      return res.status(404).json({ message: "Expense not found" });

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -----------------------------------------------
// UPDATE EXPENSE
// -----------------------------------------------
app.put("/expenses/:id", verifyToken, async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.userId;
  const { amount, category, date } = req.body;

  try {
    const upd = await pool.query(
      `UPDATE expenses
       SET amount=$1, category=$2, date=$3
       WHERE id=$4 AND user_id=$5`,
      [amount, category, date, expenseId, userId]
    );

    if (upd.rowCount === 0)
      return res.status(404).json({ message: "Expense not found" });

    res.json({ message: "Expense updated" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -----------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port: ${PORT}`);
});
