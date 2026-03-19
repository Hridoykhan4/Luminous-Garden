require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { MongoClient, ServerApiVersion } = require("mongodb");

// Import your Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const port = process.env.PORT || 5000;
const app = express();

// --- Foundations (Keep these in index.js) ---
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// --- MongoDB Connection ---
// index.js
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@happiness-hill.1es2bek.mongodb.net/?appName=Happiness-Hill`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("luminous-garden");
    const usersCollection = db.collection("users");
    const plantsCollection = db.collection('plants')
    // Add more collections as you grow (e.g., plantsCollection)

    // --- The Folder Connection ---
    // We pass 'db' or specific collections to our routes
    app.use("/users", userRoutes(usersCollection)); // Handles user sync/role
    app.use("/auth", authRoutes); // Handles JWT and Logout

    console.log("Database connected and Routes initialized!");
  } finally {
    // Keep connection alive
  }
}
run().catch(console.dir);

app.get("/", (req, res) => res.send("Luminous Garden Server Running"));
app.listen(port, () => console.log(`Server on port ${port}`));
