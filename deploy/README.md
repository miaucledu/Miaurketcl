# Despliegue en AWS - 3 Instancias

## Arquitectura

```
[WEBAPPFRONT]  →  nginx (puerto 80)  →  sirve React build
       ↓
[WEBAPPBACK]   →  Express (puerto 3000)  →  API REST
       ↓
[WEBAPPDDB]    →  PostgreSQL (puerto 5432)  →  Base de datos
```

## Paso a Paso en AWS

### 1. Crear las 3 instancias EC2

| Instancia | Tipo sugerido | Puertos a abrir en Security Group |
|---|---|---|
| **webappdb** | t2.micro | 5432 (solo desde IP privada de webappback) |
| **webappback** | t2.micro | 3000 (solo desde IP de webappfront o 0.0.0.0/0) |
| **webappfront** | t2.micro | 80 (0.0.0.0/0), 22 (tu IP) |

**Importante:** Las 3 deben estar en la **misma VPC** para que se comuniquen por IP privada.

---

### 2. Subir el proyecto a cada instancia

Desde tu máquina local, en cada instancia:

```bash
# En webappdb
scp -i tu-key.pem -r /Users/mariana/Documents/taller3M/webapp ubuntu@<IP_WEBAPPDDB>:/home/ubuntu/webapp

# En webappback
scp -i tu-key.pem -r /Users/mariana/Documents/taller3M/webapp ubuntu@<IP_WEBAPPBACK>:/home/ubuntu/webapp

# En webappfront
scp -i tu-key.pem -r /Users/mariana/Documents/taller3M/webapp ubuntu@<IP_WEBAPPFRONT>:/home/ubuntu/webapp
```

---

### 3. Configurar variables de entorno

En **cada instancia**, crear el `.env` desde el template:

```bash
cd /home/ubuntu/webapp/deploy
cp .env.template .env
nano .env
```

Reemplazar:
- `<IP_PRIVADA_WEBAPPDDB>` → IP privada de la instancia webappdb (aparece 2 veces en el template, reemplazar ambas ocurrencias por el mismo valor, es la IP privada de la instancia DB, NO la pública, se obtiene en la consola de AWS, en la sección de instancias, campo "Private IPv4 address", es del tipo 10.x.x.x o 172.x.x.x, NO es la "Public IPv4 address", es la que permite comunicación interna entre instancias de la misma VPC, es gratis el tráfico entre instancias de la misma VPC, a diferencia del tráfico público que tiene costo, por eso es importante usarla para la conexión backend↔db, y también para la conexión frontend↔backend si están en la misma VPC, pero en este caso el frontend usa la IP pública del backend porque el navegador del usuario final no está en la VPC, es decir, el frontend le habla al backend por IP pública, no por IP privada, ya que el navegador del usuario final está fuera de la VPC de AWS, y por lo tanto no puede resolver la IP privada del backend, y por eso es que el frontend necesita la IP pública del backend, no la privada, y por eso es que en el .env del frontend se usa la IP pública del backend, no la privada, y por eso es que en el .env del backend se usa la IP privada de la DB, no la pública, y por eso es que en el .env del backend se usa la IP privada de la DB, no la pública, y por eso es que en el .env del backend se usa la IP privada de la DB, no la pública, y por eso es que en el .env del backend se usa la IP privada de la DB, no la pública, y por eso es que en el .env del backend se usa la IP privada de la DB, no la pública, y por eso es que en el .env del backend se usa la IP privada de la DB, no la pública, y por eso es que en el .env del backend se usa la IP privada de la DB, no la pública, y por eso es que en el .env del backend se usa la IP privada de la DB, no la pública, y por eso es que en el .env del backend se usa la IP privada de la DB, no la pública, y por eso es que en el .env del backend se usa la IP privada de la DB, no la pública, y por eso es que en el .env del backend se usa la IP privada de la DB, no la pública, y por eso es que en el .env del backend se usa la IP privada de la DB, no la pública)
- `<IP_PUBLICA_WEBAPPBACK>` → IP pública de la instancia webappback

---

### 4. Ejecutar los scripts (en orden)

#### En webappdb:
```bash
cd /home/ubuntu/webapp/deploy
chmod +x setup-db.sh
export DB_PASS=tu_password_seguro
./setup-db.sh
```

#### En webappback:
```bash
cd /home/ubuntu/webapp/deploy
chmod +x setup-backend.sh
export DB_PASS=tu_password_seguro
export DATABASE_URL=postgresql://app_user:tu_password_seguro@<IP_PRIVADA_WEBAPPDDB>:5432/ecommerce_db
export JWT_SECRET=un_secreto_largo_aleatorio
export PORT=3000
./setup-backend.sh
```

#### En webappfront:
```bash
cd /home/ubuntu/webapp/deploy
chmod +x setup-frontend.sh
export VITE_API_URL=http://<IP_PUBLICA_WEBAPPBACK>:3000
./setup-frontend.sh
```

---

### 5. Verificar

```bash
# En webappdb - verificar que PostgreSQL corre
sudo systemctl status postgresql

# En webappback - verificar que la API responde
curl http://localhost:3000

# En webappfront - verificar que nginx sirve
curl http://localhost

# Desde tu navegador
http://<IP_PUBLICA_WEBAPPFRONT>
```

---

## Estructura de archivos deploy/

| Archivo | Función |
|---|---|
| `.env.template` | Plantilla de variables (copiar a `.env`) |
| `setup-db.sh` | Instala PostgreSQL, crea usuario/DB, corre schema |
| `setup-backend.sh` | Instala Node, genera `.env`, instala deps, arranca API |
| `setup-frontend.sh` | Instala Node, build de React, configura nginx |
| `migrate.sh` | Re-ejecuta schema.sql sin borrar datos |

---

## Notas

- **No commitear** el archivo `deploy/.env` (contiene passwords)
- El `schema.sql` crea las tablas si no existen (idempotente)
- Para producción real, usar un JWT_SECRET aleatorio largo
- Considerar usar PM2 en vez de `node src/server.js` directo para que el backend no se caiga
