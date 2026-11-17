# API-REST-MONGODB

API RESTful de tienda virtual con Node.js, Express, MongoDB (Mongoose) y JWT, patrón MVC.

## Puesta en marcha
```bash
npm install
cp .env.example .env   # completar valores
npm run seed           # opcional: admin + productos de ejemplo (borra datos)
npm run dev
```

Requiere MongoDB como replica set (Atlas ya lo es) porque las órdenes usan transacciones.
Local: `mongod --replSet rs0 --dbpath ./data` y luego `mongosh --eval "rs.initiate()"`.
