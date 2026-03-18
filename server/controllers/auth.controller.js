const jwt = require("jsonwebtoken");

// Match this exactly with your index.js cookie logic
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

const generateToken = async (req, res) => {
  try {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "300d",
    });

    res.cookie("token", token, cookieOptions).send({ success: true });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    res
      .clearCookie("token", { ...cookieOptions, maxAge: 0 })
      .send({ success: true });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { generateToken, logoutUser };
