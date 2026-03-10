require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require('morgan');
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const app = express();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

const corsOptions = {
  origin: ["http://localhost:5000"],
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'))
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: "Internal Server Error" });
});

// Custom Middlewares
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(403).send({ message: "Unauthorized Access" });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: "Unauthorized Access" });
    req.user = decoded;
    next();
  });
};

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
    /* JWT related APIs Start */
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "300d",
      });
      res.cookie("token", token, cookieOptions).send({ success: true });
    });

    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
              ...cookieOptions,
            maxAge: 0,
          })
          .send({ success: "Logged out" });
      } catch (err) {
        res.status(500).send(err);
      }
    });

    /* JWT related APIs End */

    console.log("Pinged deployment. Successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Laga re Laga, Gach laga");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
