require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { MongoClient, ServerApiVersion } = require("mongodb");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const plantRoutes = require("./routes/plant.routes");
const orderRoutes = require("./routes/order.routes");

const globalErrorHandler = require("./middlewares/error.middleware");
const sellerRequestRoutes = require("./routes/sellerrequest.routes");

const port = process.env.PORT || 5000;
const app = express();

/* ── Middleware ───────────────────────────────────── */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://luminous-garden.web.app",
      "https://luminous-garden.firebaseapp.com",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

/* ── MongoDB ──────────────────────────────────────── */
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
    await client.connect();

    const db = client.db("luminous-garden");

    // Collections
    const usersCollection = db.collection("users");
    const plantsCollection = db.collection("plants");
    const ordersCollection = db.collection("orders");
    const trackingCollection = db.collection("tracking");
    const sellerRequestsCollection = db.collection("sellerRequests");

    // Routes
    app.use("/users", userRoutes(usersCollection));
    app.use("/auth", authRoutes);
    app.use("/plants", plantRoutes(plantsCollection, usersCollection));
    app.use(
      "/orders",
      orderRoutes(
        ordersCollection,
        plantsCollection,
        usersCollection,
        trackingCollection,
      ),
    );
    app.use(
      "/seller-requests",
      sellerRequestRoutes(sellerRequestsCollection, usersCollection),
    );

    console.log("Database connected & all routes initialized");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

run();

/* ── Base + Error ─────────────────────────────────── */
app.get("/", (req, res) => res.send("Luminous Garden Server 🌱"));
app.use(globalErrorHandler);

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
