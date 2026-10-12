import { useCallback, useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { getDashboard } from "../services/analyticsService";

const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6"];

const money = (v) =>
  `$${Number(v ?? 0).toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("es-UY", { day: "2-digit", month: "short" });
};

const RANGE_PRESETS = [
  { id: "7d", label: "Últimos 7 días", days: 7 },
  { id: "30d", label: "Últimos 30 días", days: 30 },
  { id: "90d", label: "Últimos 90 días", days: 90 },
  { id: "custom", label: "Personalizado", days: null },
];

function getDateRange(preset) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  if (preset.days) {
    start.setDate(start.getDate() - preset.days + 1);
  }
  start.setHours(0, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [preset, setPreset] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      let fechaDesde, fechaHasta;
      if (preset === "custom") {
        if (!customStart || !customEnd) {
          setMsg({ type: "error", text: "Selecciona ambas fechas para el rango personalizado." });
          setLoading(false);
          return;
        }
        fechaDesde = new Date(customStart + "T00:00:00").toISOString();
        fechaHasta = new Date(customEnd + "T23:59:59").toISOString();
      } else {
        const range = getDateRange(RANGE_PRESETS.find((p) => p.id === preset));
        fechaDesde = range.start;
        fechaHasta = range.end;
      }
      const result = await getDashboard(token, fechaDesde, fechaHasta);
      setData(result);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, [token, preset, customStart, customEnd]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const ingresosData = data?.estados_pedidos?.map((e) => ({
    name: e.estado,
    value: e.cantidad,
    porcentaje: e.porcentaje,
  })) || [];

  const topProductosData = data?.top_productos?.map((p) => ({
    nombre: p.nombre.length > 18 ? p.nombre.slice(0, 18) + "…" : p.nombre,
    unidades: parseInt(p.unidades_vendidas, 10),
    monto: parseFloat(p.monto_recaudado),
  })) || [];

  return (
    <div className="page">
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-head">
          <div className="grow">
            <h3>Panel de Analíticas</h3>
            <p>Métricas clave de rendimiento comercial.</p>
          </div>
          <div className="analytics-filters">
            <select
              className="select"
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
            >
              {RANGE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            {preset === "custom" && (
              <div className="custom-range">
                <input
                  type="date"
                  className="input"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
                <span>→</span>
                <input
                  type="date"
                  className="input"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            )}
            <button className="btn btn-ghost btn-sm" onClick={cargar}>
              Actualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty"><b>Cargando…</b><p>Obteniendo métricas del servidor.</p></div>
        ) : !data ? (
          <div className="empty"><b>Sin datos</b><p>No se pudieron cargar las métricas.</p></div>
        ) : (
          <>
            <div className="stats">
              <div className="stat accent">
                <small>Ingresos totales</small>
                <strong>{money(data.ingresos_totales)}</strong>
              </div>
              <div className="stat">
                <small>Pedidos</small>
                <strong>{data.total_pedidos}</strong>
              </div>
              <div className="stat">
                <small>Ticket promedio</small>
                <strong>{money(data.ticket_promedio)}</strong>
              </div>
              <div className="stat">
                <small>Ticket prom. usuario</small>
                <strong>{money(data.ticket?.ticket_promedio_usuario)}</strong>
              </div>
            </div>

            <div className="analytics-grid">
              <div className="card">
                <div className="card-head">
                  <div className="grow">
                    <h3>Productos más vendidos</h3>
                    <p>Top 10 por unidades vendidas.</p>
                  </div>
                </div>
                {topProductosData.length === 0 ? (
                  <div className="empty"><b>Sin ventas</b><p>No hay productos vendidos en este período.</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProductosData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="nombre" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v, name) => name === "monto" ? money(v) : v} />
                      <Bar dataKey="unidades" fill="#4f46e5" radius={[0, 4, 4, 0]} name="unidades" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card">
                <div className="card-head">
                  <div className="grow">
                    <h3>Estados de pedidos</h3>
                    <p>Distribución por estado.</p>
                  </div>
                </div>
                {ingresosData.length === 0 ? (
                  <div className="empty"><b>Sin pedidos</b><p>No hay pedidos registrados.</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ingresosData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, porcentaje }) => `${name} (${porcentaje}%)`}
                      >
                        {ingresosData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div className="grow">
                  <h3>Ranking de productos</h3>
                  <p>Productos con mayor rotación.</p>
                </div>
              </div>
              {data.top_productos?.length === 0 ? (
                <div className="empty"><b>Sin datos</b><p>No hay productos vendidos en este período.</p></div>
              ) : (
                <div className="table-wrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Producto</th>
                        <th style={{ textAlign: "right" }}>Unidades</th>
                        <th style={{ textAlign: "right" }}>Monto recaudado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.top_productos.map((p, i) => (
                        <tr key={p.id}>
                          <td>{i + 1}</td>
                          <td>{p.nombre}</td>
                          <td style={{ textAlign: "right" }}>{p.unidades_vendidas}</td>
                          <td style={{ textAlign: "right" }}>{money(p.monto_recaudado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
