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
