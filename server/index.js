require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const app = express();

// Middlewares
app.use(cors())
app.use(express.json())
app.use((err, req, res, next) =>{
    console.log(err);
    res.status(500).send({message: 'Internal Server Error'})
})


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
  
    console.log(
      "Pinged deployment. Successfully connected to MongoDB!",
    );
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
