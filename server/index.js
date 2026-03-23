require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { MongoClient, ServerApiVersion } = require("mongodb");

// Import Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const plantRoutes = require("./routes/plant.routes");

const globalErrorHandler = require("./middlewares/error.middleware");
const port = process.env.PORT || 5000;
const app = express();

// CorsOptions
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

// Default Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// --- MongoDB Connection ---
// index.js
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL}/?appName=Luminous-Garden`;
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
    const plantsCollection = db.collection("plants");

    // --- The Folder Connection ---
    app.use("/users", userRoutes(usersCollection));
    app.use("/auth", authRoutes);
    app.use("/plants", plantRoutes(plantsCollection, usersCollection));

    console.log("Database connected and Routes initialized!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => res.send("Luminous Garden Server Running"));
app.use(globalErrorHandler);
app.listen(port, () => console.log(`Server on port ${port}`));
