import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";
import { login as apiLogin, register, getCaptcha } from "./services/authService";
import { apiCall } from "./services/apiClient";
import { createPedido, getMisPedidos, marcarPagado, cancelarPedido, getVentas, marcarEnviado } from "./services/pedidoService";
import AnalyticsPage from "./components/AnalyticsPage";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3003";
const ROLES = ["admin", "producto", "pedido"];

/* ================= helpers ================= */

const imgUrl = (filename) =>
  filename ? `${API}/uploads/productos/${filename}` : null;

const initials = (name = "?") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

const money = (v) =>
  `$${Number(v ?? 0).toLocaleString("es-UY", { minimumFractionDigits: 0 })}`;

function Badge({ kind, children }) {
  const map = {
    aprobado: "b-ok",
    activo: "b-ok",
    pagado: "b-ok",
    enviado: "b-info",
    interesada: "b-info",
    interesado: "b-info",
    contactado: "b-brand",
    pendiente: "b-warn",
    pendiente_pago: "b-warn",
    cancelado: "b-bad",
    denegado: "b-bad",
    rechazado: "b-bad",
    cerrado: "b-neutral",
    admin: "b-brand",
    producto: "b-info",
    pedido: "b-ok",
  };
  return <span className={`badge ${map[kind] ?? "b-neutral"}`}>{children}</span>;
}

function Alert({ type, children }) {
  if (!children) return null;
  return <div className={`alert alert-${type}`}>{children}</div>;
}

function Empty({ title, text }) {
  return (
    <div className="empty">
      <img
        src="/images/empty.webp"
        alt=""
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
      {title && <b>{title}</b>}
      <p>{text}</p>
    </div>
  );
}

function ProductPhoto({ filename, nombre }) {
  const [failed, setFailed] = useState(false);
  const url = imgUrl(filename) || "/images/placeholder.png";
  if (failed) return <span className="noimg">Sin foto</span>;
  return <img src={url} alt={nombre} onError={() => setFailed(true)} />;
}

function useCaptcha() {
  const [captchaId, setCaptchaId] = useState("");
  const [imgs, setImgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCaptcha();
      setCaptchaId(data.captchaId);
      setImgs(data.imagenes || []);
    } catch {
      /* se muestra el error del formulario */
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return { captchaId, imgs, loadingCaptcha: loading, reloadCaptcha: load };
}

function CaptchaBox({ imgs, loadingCaptcha, onReload }) {
  return (
    <div className="captcha-box">
      <div className="captcha-imgs">
        {imgs.length > 0 ? (
          imgs.map((src, i) => <img key={i} src={src} alt={`captcha ${i + 1}`} />)
        ) : (
          <span className="captcha-empty">Cargando verificación…</span>
        )}
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-block"
        onClick={onReload}
        disabled={loadingCaptcha}
      >
        {loadingCaptcha ? "Cargando…" : "Actualizar código"}
      </button>
    </div>
  );
}

function AuthBrand() {
  return (
    <div className="auth-brand">
      <div className="brand-mark">M</div>
      <div className="brand-name">Miaurketcl</div>
    </div>
  );
}

/* ================= auth ================= */

function LoginPage({ onGoRegister }) {
  const { login: ctxLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const { captchaId, imgs, loadingCaptcha, reloadCaptcha } = useCaptcha();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const data = await apiLogin(email.trim(), password, captchaId, respuesta.trim());
      ctxLogin(data);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
      reloadCaptcha();
      setRespuesta("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-single">
      <AuthBrand />
      <img
        className="auth-mascot"
        src="/images/mascot-cinna.png"
        alt=""
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
      <div className="auth-card single">
        <h2>Bienvenido de nuevo</h2>
        <p className="lede">Ingresá con tu cuenta para continuar.</p>
        <form onSubmit={handleSubmit}>
          <Alert type={msg?.type}>{msg?.text}</Alert>
          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="field">
            <label className="label">Contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="field">
            <label className="label">Verificación de seguridad</label>
            <CaptchaBox
              imgs={imgs}
              loadingCaptcha={loadingCaptcha}
              onReload={reloadCaptcha}
            />
            <input
              className="input"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Escribí el código de la imagen"
              required
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy && <span className="spinner" />} Entrar
          </button>
        </form>
        <p className="auth-switch">
          ¿No tenés cuenta?{" "}
          <button className="link-btn" type="button" onClick={onGoRegister}>
            Crear cuenta
          </button>
        </p>
      </div>
    </div>
  );
}

function RegisterPage({ onBack }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const { captchaId, imgs, loadingCaptcha, reloadCaptcha } = useCaptcha();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await register(
        nombre.trim(),
        email.trim(),
        password,
        captchaId,
        respuesta.trim()
      );
      setDone(true);
      setMsg({
        type: "ok",
        text: "Cuenta creada. Un administrador debe aprobar tu acceso y asignarte un rol.",
      });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
      reloadCaptcha();
      setRespuesta("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-single">
      <AuthBrand />
      <div className="auth-card single">
        <h2>Crear cuenta</h2>
        <p className="lede">Registrate gratis en menos de un minuto.</p>
        <form onSubmit={handleSubmit}>
          <Alert type={msg?.type}>{msg?.text}</Alert>
          <div className="field">
            <label className="label">Nombre</label>
            <input
              className="input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="field">
            <label className="label">Contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
          <div className="field">
            <label className="label">Verificación de seguridad</label>
            <CaptchaBox
              imgs={imgs}
              loadingCaptcha={loadingCaptcha}
              onReload={reloadCaptcha}
            />
            <input
              className="input"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Escribí el código de la imagen"
              required
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy || done}>
            {busy && <span className="spinner" />} Crear cuenta
          </button>
        </form>
        <p className="auth-switch">
          ¿Ya tenés cuenta?{" "}
          <button className="link-btn" type="button" onClick={onBack}>
            Volver al login
          </button>
        </p>
      </div>
    </div>
  );
}

function PendientePage() {
  const { user, logout } = useAuth();
  return (
    <div className="pending-wrap">
      <div className="card pending-card">
        <img
          className="pending-mascot"
          src="/images/mascot-cinna.png"
          alt=""
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <h2>Cuenta pendiente de aprobación</h2>
        <p>
          Hola <b>{user?.nombre ?? user?.email}</b>, tu cuenta está en revisión.
          Un administrador debe aprobar tu acceso y asignarte un rol antes de
          que puedas continuar.
        </p>
        <button className="btn btn-ghost btn-block" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function SinRolPage() {
  const { user } = useAuth();
  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 560, margin: "30px auto" }}>
        <div className="card-head">
          <div className="grow">
            <h3>Sin rol asignado</h3>
            <p>
              Tu acceso fue aprobado pero aún no tenés un rol. Pedile a un
              administrador que te asigne <b>producto</b> o <b>pedido</b>.
            </p>
          </div>
          <Badge kind="pendiente">{user?.estado_acceso}</Badge>
        </div>
      </div>
    </div>
  );
}

/* ================= admin ================= */

function AdminPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [filter, setFilter] = useState("pendiente");

  const cargar = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const [u, p] = await Promise.all([
        apiCall("GET", "/usuarios", token),
        apiCall("GET", "/productos/pendientes", token),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setProductos(Array.isArray(p) ? p : []);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const mutate = async (fn, okMsg) => {
    try {
      await fn();
      await cargar();
      if (okMsg) setMsg({ type: "ok", text: okMsg });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const visibles =
    filter === "todos" ? users : users.filter((u) => u.estado_acceso === filter);
  const nPend = users.filter((u) => u.estado_acceso === "pendiente").length;
  const nAprob = users.filter((u) => u.estado_acceso === "aprobado").length;

  return (
    <div className="page">
      <Alert type={msg?.type}>{msg?.text}</Alert>

      <div className="stats">
        <div className="stat accent">
          <small>Usuarios pendientes</small>
          <strong>{nPend}</strong>
        </div>
        <div className="stat">
          <small>Usuarios aprobados</small>
          <strong>{nAprob}</strong>
        </div>
        <div className="stat">
          <small>Productos por revisar</small>
          <strong>{productos.length}</strong>
        </div>
        <div className="stat">
          <small>Total usuarios</small>
          <strong>{users.length}</strong>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="grow">
            <h3>Usuarios</h3>
            <p>Aprobá accesos, asigná roles y gestioná cuentas.</p>
          </div>
          <select
            className="select role-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobados</option>
            <option value="denegado">Denegados</option>
            <option value="todos">Todos</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={cargar}>
            Actualizar
          </button>
        </div>

        {loading ? (
          <Empty title="Cargando…" text="Obteniendo datos del servidor." />
        ) : visibles.length === 0 ? (
          <Empty
            text={
              filter === "pendiente"
                ? "No hay cuentas esperando aprobación."
                : "Probá con otro filtro."
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="cell-main">
                        <b>{u.nombre}</b>
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        className="select role-select"
                        value={u.rol ?? ""}
                        onChange={(e) =>
                          mutate(
                            () =>
                              apiCall("PATCH", `/usuarios/${u.id}/rol`, token, {
                                rol: e.target.value,
                              }),
                            `Rol de ${u.nombre} actualizado.`
                          )
                        }
                      >
                        <option value="" disabled>
                          Sin rol
                        </option>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Badge kind={u.estado_acceso}>{u.estado_acceso}</Badge>
                    </td>
                    <td>
                      <div className="row-actions">
                        {u.estado_acceso === "pendiente" && (
                          <>
                            <button
                              className="btn btn-ok btn-sm"
                              onClick={() =>
                                mutate(
                                  () =>
                                    apiCall(
                                      "PATCH",
                                      `/usuarios/${u.id}/acceso`,
                                      token,
                                      { estado_acceso: "aprobado" }
                                    ),
                                  `${u.nombre} aprobado.`
                                )
                              }
                            >
                              Aprobar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                mutate(() =>
                                  apiCall(
                                    "PATCH",
                                    `/usuarios/${u.id}/acceso`,
                                    token,
                                    { estado_acceso: "denegado" }
                                  )
                                )
                              }
                            >
                              Denegar
                            </button>
                          </>
                        )}
                        {u.estado_acceso !== "pendiente" && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() =>
                              mutate(() =>
                                apiCall(
                                  "PATCH",
                                  `/usuarios/${u.id}/acceso`,
                                  token,
                                  { estado_acceso: "pendiente" }
                                )
                              )
                            }
                          >
                            Revertir
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar a ${u.nombre}?`))
                              mutate(() =>
                                apiCall("DELETE", `/usuarios/${u.id}`, token)
                              );
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="grow">
            <h3>Productos por revisar</h3>
            <p>Aprobá o rechazá publicaciones de vendedores.</p>
          </div>
          <Badge kind="pendiente">{productos.length} pendientes</Badge>
        </div>
        {productos.length === 0 ? (
          <Empty
            title="Nada por revisar"
            text="No hay productos pendientes de aprobación."
          />
        ) : (
          <div className="grid-products">
            {productos.map((p) => (
              <div className="product-card" key={p.id}>
                <div className="product-img">
                  <ProductPhoto filename={p.imagen_filename} nombre={p.nombre} />
                </div>
                <div className="product-body">
                  <h4>{p.nombre}</h4>
                  <p className="product-desc">{p.descripcion || "Sin descripción"}</p>
                  <div className="product-foot">
                    <span className="price">{money(p.precio)}</span>
                    <Badge kind={p.estado}>{p.estado}</Badge>
                  </div>
                  <div className="btn-row">
                    <button
                      className="btn btn-ok btn-sm"
                      style={{ flex: 1 }}
                      onClick={() =>
                        mutate(
                          () =>
                            apiCall("PATCH", `/productos/${p.id}/estado`, token, {
                              estado: "aprobado",
                            }),
                          "Producto aprobado."
                        )
                      }
                    >
                      Aprobar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1 }}
                      onClick={() =>
                        mutate(() =>
                          apiCall("PATCH", `/productos/${p.id}/estado`, token, {
                            estado: "rechazado",
                          })
                        )
                      }
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= vendedor ================= */

function ProductoPage() {
  const { token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiCall("GET", "/productos/mios", token);
      setProductos(Array.isArray(d) ? d : []);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const onFile = (f) => {
    setImagen(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const formData = new FormData();
      if (imagen) formData.append("imagen", imagen);
      formData.append("nombre", nombre.trim());
      formData.append("descripcion", descripcion.trim());
      formData.append("precio", precio);
      const res = await fetch(
        editando ? `${API}/productos/${editando}` : `${API}/productos`,
        {
          method: editando ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.msg || "No se pudo guardar el producto");
      setEditando(null);
      setNombre("");
      setDescripcion("");
      setPrecio("");
      onFile(null);
      await cargar();
      setMsg({
        type: "ok",
        text: editando
          ? "Producto actualizado. Quedó pendiente de aprobación."
          : "Producto publicado. Quedó pendiente de aprobación.",
      });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const productoEditando = productos.find((p) => p.id === editando);

  const editar = (p) => {
    setMsg(null);
    setEditando(p.id);
    setNombre(p.nombre);
    setDescripcion(p.descripcion || "");
    setPrecio(String(p.precio));
    onFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setMsg(null);
    setEditando(null);
    setNombre("");
    setDescripcion("");
    setPrecio("");
    onFile(null);
  };

  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return;
    try {
      await apiCall("DELETE", `/productos/${p.id}`, token);
      await cargar();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  return (
    <div className="page">
      <Alert type={msg?.type}>{msg?.text}</Alert>

      <div className="card">
        <div className="card-head">
          <div className="grow">
            <h3>{editando ? "Editar producto" : "Publicar producto"}</h3>
            <p>
              {editando
                ? "Modificá los datos. Al guardar, el producto vuelve a quedar pendiente de aprobación."
                : "Completá los datos. Un admin lo revisará antes de publicarlo."}
            </p>
          </div>
          {editando && (
            <button className="btn btn-ghost btn-sm" onClick={cancelarEdicion}>
              Cancelar
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label className="label">Nombre *</label>
              <input
                className="input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Mesa de roble"
                required
              />
            </div>
            <div className="field">
              <label className="label">Precio *</label>
              <input
                className="input"
                type="number"
                min="1"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="1500"
                required
              />
            </div>
            <div className="field full">
              <label className="label">Descripción</label>
              <textarea
                className="textarea"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Materiales, medidas, estado…"
              />
            </div>
            <div className="field full">
              <label className="label">Foto</label>
              {editando && !preview && productoEditando && (
                <div className="img-preview">
                  <ProductPhoto
                    filename={productoEditando.imagen_filename}
                    nombre={productoEditando.nombre}
                  />
                </div>
              )}
              <input
                className="input"
                type="file"
                accept="image/*"
                onChange={(e) => onFile(e.target.files[0])}
              />
              {preview && (
                <div className="img-preview">
                  <img src={preview} alt="vista previa" />
                </div>
              )}
            </div>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving && <span className="spinner" />}
              {editando ? "Guardar cambios" : "Publicar producto"}
            </button>
            {editando && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={cancelarEdicion}
                disabled={saving}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="grow">
            <h3>Mis productos</h3>
            <p>{productos.length} publicación(es) en tu cuenta.</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={cargar}>
            Actualizar
          </button>
        </div>
        {loading ? (
          <Empty title="Cargando…" text="Obteniendo tus productos." />
        ) : productos.length === 0 ? (
          <Empty
            title="Todavía no publicaste nada"
            text="Usá el formulario de arriba para crear tu primer producto."
          />
        ) : (
          <div className="grid-products">
            {productos.map((p) => (
              <div className="product-card" key={p.id}>
                <div className="product-img">
                  <ProductPhoto filename={p.imagen_filename} nombre={p.nombre} />
                </div>
                <div className="product-body">
                  <h4>{p.nombre}</h4>
                  <p className="product-desc">{p.descripcion || "Sin descripción"}</p>
                  <div className="product-foot">
                    <span className="price">{money(p.precio)}</span>
                    <Badge kind={p.estado}>{p.estado}</Badge>
                  </div>
                  <div className="btn-row">
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => editar(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => eliminar(p)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= comprador ================= */

function PedidoPage() {
  const { token } = useAuth();
  const { cartItems, addToCart, removeFromCart, clearCart, total } = useCart();
  const [tab, setTab] = useState("catalogo");
  const [productos, setProductos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const [c, s, p] = await Promise.all([
        apiCall("GET", "/productos/catalogo", token),
        apiCall("GET", "/solicitudes/mias", token),
        getMisPedidos(token),
      ]);
      setProductos(Array.isArray(c) ? c : []);
      setSolicitudes(Array.isArray(s) ? s : []);
      setPedidos(Array.isArray(p) ? p : []);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const nombreDe = (s) =>
    s.producto_nombre ??
    productos.find((p) => p.id === s.producto_id)?.nombre ??
    `Producto ${String(s.producto_id ?? "").slice(0, 8)}`;

  const marcarInteres = async (producto_id) => {
    try {
      await apiCall("POST", "/solicitudes", token, { producto_id });
      await cargar();
      setMsg({ type: "ok", text: "¡Listo! Marcaste tu interés en el producto." });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const cancelar = async (id) => {
    try {
      await apiCall("DELETE", `/solicitudes/${id}`, token);
      await cargar();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const checkout = async () => {
    if (cartItems.length === 0) return;
    setCheckingOut(true);
    setMsg(null);
    try {
      const items = cartItems.map((i) => ({ productoId: i.id, cantidad: i.cantidad }));
      await createPedido(items, token);
      clearCart();
      await cargar();
      setMsg({ type: "ok", text: "¡Pedido creado! Revisá tu email para las instrucciones de pago." });
      setTab("pedidos");
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setCheckingOut(false);
    }
  };

  const yaPedida = new Set(solicitudes.map((s) => s.producto_id));
  const enCarrito = new Set(cartItems.map((i) => i.id));

  return (
    <div className="page">
      <Alert type={msg?.type}>{msg?.text}</Alert>

      <div className="card">
        <div className="card-head">
          <div className="grow">
            <h3>
              {tab === "catalogo" && "Catálogo"}
              {tab === "carrito" && `Carrito (${cartItems.length})`}
              {tab === "mias" && `Mis solicitudes (${solicitudes.length})`}
              {tab === "pedidos" && `Mis pedidos (${pedidos.length})`}
            </h3>
            <p>
              {tab === "catalogo" && `${productos.length} producto(s) disponibles.`}
              {tab === "carrito" && (cartItems.length > 0 ? `Total: ${money(total)}` : "Tu carrito está vacío.")}
              {tab === "mias" && `${solicitudes.length} solicitud(es) de interés.`}
              {tab === "pedidos" && `${pedidos.length} pedido(s) realizado(s).`}
            </p>
          </div>
          <div className="btn-row">
            <button className={`btn btn-sm ${tab === "catalogo" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("catalogo")}>Catálogo</button>
            <button className={`btn btn-sm ${tab === "carrito" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("carrito")}>Carrito ({cartItems.length})</button>
            <button className={`btn btn-sm ${tab === "mias" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("mias")}>Solicitudes</button>
            <button className={`btn btn-sm ${tab === "pedidos" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("pedidos")}>Pedidos</button>
            <button className="btn btn-ghost btn-sm" onClick={cargar}>Actualizar</button>
          </div>
        </div>

        {loading ? (
          <Empty title="Cargando…" text="Obteniendo datos." />
        ) : tab === "catalogo" ? (
          productos.length === 0 ? (
            <Empty title="Catálogo vacío" text="Aún no hay productos aprobados." />
          ) : (
            <div className="grid-products">
              {productos.map((p) => (
                <div className="product-card" key={p.id}>
                  <div className="product-img">
                    <ProductPhoto filename={p.imagen_filename} nombre={p.nombre} />
                  </div>
                  <div className="product-body">
                    <h4>{p.nombre}</h4>
                    <p className="product-desc">{p.descripcion || "Sin descripción"}</p>
                    <div className="product-foot">
                      <span className="price">{money(p.precio)}</span>
                    </div>
                    <div className="btn-row">
                      <button
                        className={`btn btn-sm ${enCarrito.has(p.id) ? "btn-ghost" : "btn-primary"}`}
                        style={{ flex: 1 }}
                        disabled={enCarrito.has(p.id)}
                        onClick={() => addToCart(p)}
                      >
                        {enCarrito.has(p.id) ? "En carrito" : "Agregar"}
                      </button>
                      <button
                        className={`btn btn-sm ${yaPedida.has(p.id) ? "btn-ghost" : "btn-ghost"}`}
                        style={{ flex: 1 }}
                        disabled={yaPedida.has(p.id)}
                        onClick={() => marcarInteres(p.id)}
                      >
                        {yaPedida.has(p.id) ? "Interés registrado" : "Me interesa"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === "carrito" ? (
          cartItems.length === 0 ? (
            <Empty title="Carrito vacío" text="Agregá productos desde el catálogo." />
          ) : (
            <>
              <div className="list">
                {cartItems.map((item) => (
                  <div className="list-item" key={item.id}>
                    <div className="grow">
                      <b>{item.nombre}</b>
                      <small>{item.cantidad} x {money(item.precio)}</small>
                    </div>
                    <span className="price">{money(Number(item.precio) * item.cantidad)}</span>
                    <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>Quitar</button>
                  </div>
                ))}
              </div>
              <div className="card-head" style={{ marginTop: 16, justifyContent: "space-between" }}>
                <h3>Total: {money(total)}</h3>
                <button className="btn btn-primary" disabled={checkingOut || cartItems.length === 0} onClick={checkout}>
                  {checkingOut ? "Procesando…" : "Finalizar compra"}
                </button>
              </div>
            </>
          )
        ) : tab === "mias" ? (
          solicitudes.length === 0 ? (
            <Empty title="Sin solicitudes" text="Explorá el catálogo y marcá tu interés." />
          ) : (
            <div className="list">
              {solicitudes.map((s) => (
                <div className="list-item" key={s.id}>
                  <div className="grow">
                    <b>{nombreDe(s)}</b>
                    <small>{s.creado_en ? new Date(s.creado_en).toLocaleDateString("es-UY") : ""}</small>
                  </div>
                  <Badge kind={s.estado}>{s.estado}</Badge>
                  <button className="btn btn-ghost btn-sm" onClick={() => cancelar(s.id)}>Cancelar</button>
                </div>
              ))}
            </div>
          )
        ) : (
          pedidos.length === 0 ? (
            <Empty title="Sin pedidos" text="Finalizá una compra desde el carrito." />
          ) : (
            <div className="list">
              {pedidos.map((p) => (
                <div className="list-item" key={p.id}>
                  <div className="grow">
                    <b>Pedido #{String(p.id).slice(0, 8)}</b>
                    <small>{p.items?.map((i) => `${i.cantidad}x ${i.nombre}`).join(", ")}</small>
                  </div>
                  <span className="price">{money(p.total)}</span>
                  <Badge kind={p.estado}>{p.estado.replace("_", " ")}</Badge>
                  <div className="row-actions">
                    {p.estado === "pendiente_pago" && (
                      <button
                        className="btn btn-ok btn-sm"
                        onClick={async () => {
                          try {
                            await marcarPagado(p.id, token);
                            await cargar();
                            setMsg({ type: "ok", text: "Pedido marcado como pagado." });
                          } catch (err) {
                            setMsg({ type: "error", text: err.message });
                          }
                        }}
                      >
                        Ya pagué
                      </button>
                    )}
                    {(p.estado === "pendiente_pago" || p.estado === "pagado") && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={async () => {
                          if (!window.confirm("¿Cancelar este pedido?")) return;
                          try {
                            await cancelarPedido(p.id, token);
                            await cargar();
                            setMsg({ type: "ok", text: "Pedido cancelado." });
                          } catch (err) {
                            setMsg({ type: "error", text: err.message });
                          }
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ================= vendedor: ventas ================= */

function VentasPage() {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const d = await getVentas(token);
      setPedidos(Array.isArray(d) ? d : []);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const enviar = async (p) => {
    try {
      await marcarEnviado(p.id, token);
      await cargar();
      setMsg({ type: "ok", text: "Pedido marcado como enviado." });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const mios = (p) => p.items?.map((i) => `${i.cantidad}x ${i.nombre}`).join(", ");

  return (
    <div className="page">
      <Alert type={msg?.type}>{msg?.text}</Alert>

      <div className="card">
        <div className="card-head">
          <div className="grow">
            <h3>Ventas</h3>
            <p>Pedidos que incluyen tus productos.</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={cargar}>Actualizar</button>
        </div>

        {loading ? (
          <Empty title="Cargando…" text="Obteniendo tus ventas." />
        ) : pedidos.length === 0 ? (
          <Empty title="Sin ventas todavía" text="Cuando alguien compre tus productos vas a ver los pedidos acá." />
        ) : (
          <div className="list">
            {pedidos.map((p) => (
              <div className="list-item" key={p.id}>
                <div className="grow">
                  <b>Pedido #{String(p.id).slice(0, 8)}</b>
                  <small>
                    {p.client_nombre} ({p.client_email}) · {mios(p)}
                  </small>
                </div>
                <span className="price">{money(p.total)}</span>
                <Badge kind={p.estado}>{p.estado.replace("_", " ")}</Badge>
                {p.estado === "pagado" && (
                  <button className="btn btn-primary btn-sm" onClick={() => enviar(p)}>
                    Marcar enviado
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= shell ================= */

const TABS = {
  admin: [
    { id: "admin", label: "Administración" },
    { id: "analytics", label: "Analíticas" },
    { id: "producto", label: "Mis productos" },
  ],
  producto: [
    { id: "producto", label: "Mis productos" },
    { id: "ventas", label: "Ventas" },
  ],
  pedido: [{ id: "pedido", label: "Catálogo" }],
};

export default function App() {
  const { user, token, logout } = useAuth();
  const [view, setView] = useState("login");

  useEffect(() => {
    if (!user) return;
    if (user.rol === "admin") setView("admin");
    else if (user.rol === "producto") setView("producto");
    else if (user.rol === "pedido") setView("pedido");
  }, [user?.id, user?.rol]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!token) {
    if (view === "register")
      return <RegisterPage onBack={() => setView("login")} />;
    return <LoginPage onGoRegister={() => setView("register")} />;
  }
  if (!user || user.estado_acceso !== "aprobado") return <PendientePage />;

  const tabs = TABS[user.rol] ?? [];
  const active = tabs.some((t) => t.id === view) ? view : tabs[0]?.id;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark">M</div>
            <div>
              <div className="brand-name">Miaurketcl</div>
            </div>
          </div>
          <div className="topbar-spacer" />
          <div className="user-chip">
            <div className="avatar">{initials(user.nombre)}</div>
            <div className="user-meta">
              <b>{user.nombre}</b>
              <span>{user.email}</span>
            </div>
            {user.rol && <Badge kind={user.rol}>{user.rol}</Badge>}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              logout();
              setView("login");
              window.location.reload();
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {tabs.length > 1 && (
        <nav className="tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab ${active === t.id ? "active" : ""}`}
              onClick={() => setView(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      )}

      {tabs.length === 0 && <SinRolPage />}
      {active === "admin" && <AdminPage />}
      {active === "analytics" && <AnalyticsPage />}
      {active === "producto" && <ProductoPage />}
      {active === "ventas" && <VentasPage />}
      {active === "pedido" && <PedidoPage />}

      <footer className="footer">
        Miaurketcl · {new Date().getFullYear()}
      </footer>
    </>
  );
}
