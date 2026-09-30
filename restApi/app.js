require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Ruta principal
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// POST /usuarios
// Registrar usuario
app.post("/usuarios", async (req, res) => {
  const { nombre, email, password } = req.body;

  // Validación de datos
  if (!nombre || !email || !password) {
    return res.status(400).json({
      msg: "Faltan datos: nombre, email y password son obligatorios"
    });
  }

  try {
    // Convertir la contraseña a hash
    const passwordHash = await bcrypt.hash(password, 10);

    // Guardar usuario en MySQL
    await pool.query(
      "INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)",
      [nombre, email, passwordHash]
    );

    res.status(201).json({
      msg: "Usuario registrado correctamente"
    });

  } catch (error) {
    console.error("Error al registrar usuario:", error);

    // Correo duplicado
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        msg: "El correo ya existe"
      });
    }

    res.status(500).json({
      msg: "Error del servidor"
    });
  }
});

// GET /usuarios
// Consultar usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, email, password_hash FROM usuarios"
    );

    res.json(rows);

  } catch (error) {
    console.error("Error al consultar usuarios:", error);

    res.status(500).json({
      msg: "Error del servidor"
    });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log("Servidor escuchando en el puerto " + PORT);
});





