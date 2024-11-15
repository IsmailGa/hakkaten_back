require("dotenv").config();
const pool = require("../model/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult, body } = require("express-validator");
const SECRET_KEY = process.env.SECRET_KEY || "[]2nn4";

exports.getPostsByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM posts WHERE user_id = $1", [
      user_id,
    ]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfileByUserdId = async (req, res) => {
  const { uid } = req.params;

  try {
    const result = await pool.query("SELECT * FROM users WHERE uid = $1", [
      uid,
    ]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerUser = async (req, res) => {
  body("username")
    .isLength({ min: 6 })
    .withMessage("Имя пользователя должно быть более 6 символов");
  body("password")
    .isLength({ min: 8 })
    .withMessage("Пароль пользователя должно быть более 8 символов");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, phone_number } = req.body;

  try {
    // Hash the plaintext password instead of using `password_hash` from the request
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash, phone_number, is_admin, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
        RETURNING *`,
      [username, email, hashedPassword, phone_number, false]
    );

    res.status(201).json({
      message: "Пользователь зарегистрирован!",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};


exports.loginUserByEmail = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log("Email query result:", userResult.rows);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { uid: user.uid, email: user.email, is_admin: user.is_admin },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getPostsByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM posts WHERE user_id = $1", [
      user_id,
    ]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
