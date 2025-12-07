// const express = require('express');
// const { MongoClient, ObjectId } = require('mongodb');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const app = express();

// const corsOptions = {
//   origin: '*', // Allow requests from this origin
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   allowedHeaders: 'Content-Type, Authorization',
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.use(bodyParser.json());

// const mongodbURI = 'mongodb+srv://buragaravi:qzlCHauz9boCgeCK@cluster0.aow0j7e.mongodb.net/';
// const databaseName = 'Cluster0';

// const JWT_SECRET = 'raviburaga'; // Replace with a secure secret

// const dbConnection = new MongoClient(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true });

// dbConnection.connect()
//   .then(() => {
//     console.log('Connected to MongoDB');
//     const database = dbConnection.db(databaseName);
//     const usersCollection = database.collection('users');
//     const expensesCollection = database.collection('Expenses');

//     const generateToken = (user) => {
//       const payload = {
//         userId: user._id,
//         email: user.email,
//         name: user.name,
//         phone: user.phone,
//       };
//       return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
//     };

//     const verifyToken = (req, res, next) => {
//       const token = req.headers.authorization;
//       if (!token) {
//         return res.status(401).json({ message: 'Unauthorized - No token provided' });
//       }

//       jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
//         if (err) {
//           return res.status(401).json({ message: 'Unauthorized - Invalid token' });
//         }
//         req.user = decodedToken;
//         next();
//       });
//     };

//     // Root route to verify server deployment
//     app.get('/', (req, res) => {
//       res.send('Backend server is running successfully!');
//     });

//     app.post('/login', async (req, res) => {
//       const { email, password } = req.body;
//       try {
//         const user = await usersCollection.findOne({ email });
//         if (!user) {
//           return res.status(404).json({ message: 'User not found' });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//           return res.status(400).json({ message: 'Invalid credentials' });
//         }

//         const token = generateToken(user);
//         res.status(200).json({ message: 'Login successful', token, user });
//       } catch (error) {
//         console.error('Error logging in:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//       }
//     });

//     app.post('/signup', async (req, res) => {
//       const { name, email, phone, password } = req.body;
//       try {
//         const existingUser = await usersCollection.findOne({ email });
//         if (existingUser) {
//           return res.status(400).json({ message: 'User already exists' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
//         const newUser = { name, email, phone, password: hashedPassword, salary: 0, expenses: [] };

//         const result = await usersCollection.insertOne(newUser);
//         const token = generateToken(newUser);
//         res.status(201).json({ message: 'User created successfully', token, user: newUser });
//       } catch (error) {
//         console.error('Error signing up:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//       }
//     });

//     app.put('/salary', verifyToken, async (req, res) => {
//       try {
//         const userId = req.user.userId;
//         const { salary } = req.body;
//         const filter = { _id: new ObjectId(userId) };
//         const updateDoc = {
//           $set: { salary }
//         };
//         const result = await usersCollection.updateOne(filter, updateDoc);
//         if (result.modifiedCount === 1) {
//           res.status(200).json({ message: 'Salary updated successfully' });
//         } else {
//           res.status(404).json({ message: 'User not found or no changes made' });
//         }
//       } catch (error) {
//         console.error('Error updating salary:', error.message);
//         res.status(500).json({ message: 'Internal Server Error' });
//       }
//     });

//     app.get('/salary', verifyToken, async (req, res) => {
//       try {
//         const userId = req.user.userId;
//         const user = await usersCollection.findOne({ _id: new ObjectId(userId) }, { projection: { salary: 1 } });
//         if (!user) {
//           return res.status(404).json({ message: 'User not found' });
//         }
//         res.status(200).json(user.salary);
//       } catch (error) {
//         console.error('Error fetching user salary:', error.message);
//         res.status(500).send('Internal Server Error');
//       }
//     });

//     app.get('/expenses', verifyToken, async (req, res) => {
//       try {
//         const userId = req.user.userId;
//         const expenses = await expensesCollection.find({ userId: new ObjectId(userId) }).toArray();
//         res.status(200).json(expenses);
//       } catch (error) {
//         console.error('Error fetching expenses:', error.message);
//         res.status(500).send('Internal Server Error');
//       }
//     });

//     app.post('/expenses', verifyToken, async (req, res) => {
//       try {
//         const { amount, category, date } = req.body;
//         const userId = req.user.userId;
//         await expensesCollection.insertOne({ userId: new ObjectId(userId), amount, category, date });

//         await usersCollection.updateOne(
//           { _id: new ObjectId(userId) },
//           { $push: { expenses: { amount, category, date } } }
//         );

//         res.status(201).send('Expense added successfully');
//       } catch (error) {
//         console.error('Error adding expense:', error.message);
//         res.status(500).send('Internal Server Error');
//       }
//     });

//     app.delete('/expenses/:id', verifyToken, async (req, res) => {
//       try {
//         const expenseId = req.params.id;
//         const userId = req.user.userId;
//         const result = await expensesCollection.deleteOne({ _id: new ObjectId(expenseId), userId: new ObjectId(userId) });
//         if (result.deletedCount === 1) {
//           await usersCollection.updateOne(
//             { _id: new ObjectId(userId) },
//             { $pull: { expenses: { _id: new ObjectId(expenseId) } } }
//           );
//           res.status(200).json({ message: 'Expense deleted successfully' });
//         } else {
//           res.status(404).json({ message: 'Expense not found' });
//         }
//       } catch (error) {
//         console.error('Error deleting expense:', error.message);
//         res.status(500).send('Internal Server Error');
//       }
//     });

//     app.put('/expenses/:id', verifyToken, async (req, res) => {
//       try {
//         const expenseId = req.params.id;
//         const userId = req.user.userId;
//         const { amount, category, date } = req.body;
//         const filter = { _id: new ObjectId(expenseId), userId: new ObjectId(userId) };
//         const updateDoc = {
//           $set: { amount, category, date }
//         };
//         const result = await expensesCollection.updateOne(filter, updateDoc);
//         if (result.modifiedCount === 1) {
//           await usersCollection.updateOne(
//             { _id: new ObjectId(userId), 'expenses._id': new ObjectId(expenseId) },
//             { $set: { 'expenses.$.amount': amount, 'expenses.$.category': category, 'expenses.$.date': date } }
//           );
//           res.status(200).json({ message: 'Expense updated successfully' });
//         } else {
//           res.status(404).json({ message: 'Expense not found or no changes made' });
//         }
//       } catch (error) {
//         console.error('Error updating expense:', error.message);
//         res.status(500).json({ message: 'Internal Server Error' });
//       }
//     });

//   })
//   .catch((error) => {
//     console.error('Error connecting to MongoDB:', error.message);
//   });

// const port = process.env.PORT || 5000;
// app.listen(port, () => {
//   console.log(`Server started at port: ${port}`);
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
//  POSTGRES CONNECTION (NEON DB CONNECTION STRING)
// 👉 REPLACE WITH YOUR OWN NEON CONNECTION STRING
// -----------------------------------------------
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_QMDw2BRWPVp6@ep-mute-meadow-a41q86br-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false } // IMPORTANT for Neon
});

// -----------------------------------------------
const JWT_SECRET = "your_super_secret_key"; // 👉 CHANGE THIS
// -----------------------------------------------

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
    const existing = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
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
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

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
    await pool.query("UPDATE users SET salary=$1 WHERE id=$2", [
      salary,
      userId,
    ]);

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
const port = 5000;
app.listen(port, () => {
  console.log(`🚀 Server running on port: ${port}`);
});
