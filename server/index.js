require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { MongoClient, ServerApiVersion } = require("mongodb");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const orderRoutes = require("./routes/order.routes");
const sellerRequestRoutes = require("./routes/sellerrequest.routes");

const globalErrorHandler = require("./middlewares/error.middleware");
const adminStateRoutes = require("./routes/adminState.routes");
const paymentRoutes = require("./routes/payment.routes");
const plantRoutes = require("./routes/plant.routes");

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
app.use(express.urlencoded())

/* ── MongoDB ──────────────────────────────────────── */
const uri = process.env.VERCEL_MONGO_URI;

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
    const ordersCollection = db.collection("orders");
    const trackingCollection = db.collection("tracking");
    const sellerRequestsCollection = db.collection("sellerRequests");
    const sslPaymentsCollection = db.collection("sslPayments");


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
    app.use(
      "/admin-stats",
      adminStateRoutes(
        plantsCollection,
        usersCollection,
        ordersCollection,
        trackingCollection,
        sellerRequestsCollection,
      ),
    );
    app.use(
      "/payments",
      paymentRoutes(
        plantsCollection,
        ordersCollection,
        trackingCollection,
        sslPaymentsCollection,
      ),
    );

    console.log("✅ Database connected & all routes initialized");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

run();

/* ── Base + Error ─────────────────────────────────── */
app.get("/", (req, res) => {
  res.send("Luminous Garden Server 🌱");
});

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});



