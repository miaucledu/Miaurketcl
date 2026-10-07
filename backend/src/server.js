require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./infrastructure/db");
const UsuarioRepositoryAdapter = require("./infrastructure/userRepositoryAdapter");
const PostgresProductoRepository = require("./infrastructure/adapters/out/persistence/PostgresProductoRepository");
const PostgresSolicitudInteresRepository = require("./infrastructure/adapters/out/persistence/PostgresSolicitudInteresRepository");
const UserService = require("./application/userService");
const ProductoService = require("./application/use-cases/producto/ProductoService");
const SolicitudInteresService = require("./application/use-cases/solicitud/SolicitudInteresService");
const UserController = require("./interfaces/userController");
const ProductoController = require("./interfaces/productoController");
const SolicitudInteresController = require("./interfaces/solicitudController");
const { InMemoryCaptchaService } = require("./infrastructure/captcha/InMemoryCaptchaService");
const authMiddleware = require("./infrastructure/adapters/in/http/middlewares/auth.middleware");
const roleMiddleware = require("./infrastructure/adapters/in/http/middlewares/role.middleware");
const upload = require("./infrastructure/adapters/in/http/middlewares/upload.middleware");
const productoRoutes = require("./infrastructure/adapters/in/http/routes/productoRoutes");
const solicitudRoutes = require("./infrastructure/adapters/in/http/routes/solicitudRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const userRepository = new UsuarioRepositoryAdapter();
const productoRepository = new PostgresProductoRepository();
const solicitudRepository = new PostgresSolicitudInteresRepository();
const userService = new UserService(userRepository);
const productoService = new ProductoService(productoRepository);
const solicitudService = new SolicitudInteresService(solicitudRepository, productoRepository);
const captchaStore = new InMemoryCaptchaService();
const userController = new UserController(userService, captchaStore);
const productoController = new ProductoController(productoService);
const solicitudController = new SolicitudInteresController(solicitudService);

// Test DB
pool.query("SELECT 1").then(() => console.log("PostgreSQL conectado")).catch((e) => console.error("DB error:", e.message));

// Captcha (público)
app.get("/auth/captcha", (req, res) => res.json(captchaStore.generate()));

// Auth (público)
app.post("/auth/registro", (req, res) => userController.register(req, res));
app.post("/auth/login", (req, res) => userController.login(req, res));

// Usuarios (admin)
app.use("/usuarios", authMiddleware, roleMiddleware(["admin"]));
app.get("/usuarios", (req, res) => userController.getAll(req, res));
app.get("/usuarios/pendientes", (req, res) => userController.getAll(req, res));
app.patch("/usuarios/:id/rol", (req, res) => userController.updateRol(req, res));
app.patch("/usuarios/:id/acceso", (req, res) => userController.updateEstadoAcceso(req, res));
app.delete("/usuarios/:id", (req, res) => userController.delete(req, res));

// Productos
productoRoutes(app, productoController, upload, authMiddleware, roleMiddleware);

// Solicitudes
solicitudRoutes(app, solicitudController, authMiddleware, roleMiddleware);

// Imágenes estáticas
app.use("/uploads/productos", express.static(path.join(__dirname, "../../uploads/productos")));

// Health
app.get("/", (req, res) => res.send("API funcionando"));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
