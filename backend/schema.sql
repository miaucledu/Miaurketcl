CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol VARCHAR(20) NULL CHECK (rol IN ('admin','producto','pedido')),
    estado_acceso VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado_acceso IN ('pendiente','aprobado','denegado')),
    creado_en TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE producto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL CHECK (precio > 0),
    imagen_filename VARCHAR(255),
    vendedor_id UUID NOT NULL REFERENCES usuario(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente','aprobado','rechazado')),
    creado_en TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE solicitud_interes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuario(id),
    producto_id UUID NOT NULL REFERENCES producto(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'interesado'
        CHECK (estado IN ('interesado','contactado','cerrado')),
    creado_en TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES usuario(id),
    total NUMERIC(12,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente_pago'
        CHECK (estado IN ('pendiente_pago','pagado','enviado','cancelado')),
    creado_en TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE pedido_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedido(id),
    producto_id UUID NOT NULL REFERENCES producto(id),
    cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL
);
