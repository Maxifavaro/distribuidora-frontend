# Distribuidora Frontend - Vite.js

Frontend moderno de la aplicación de stock management para distribuidora, migrado a Vite.js desde Create React App.

## Características

- ⚡ Vite.js (dev server ultrarrápido)
- ⚛️ React 19.2.1
- 🎯 Zustand para state management
- 🎨 Bootstrap 5.3.2
- 📋 Módulos CRUD completos (Proveedores, Clientes, Productos, Pedidos, etc.)
- 🔐 Autenticación JWT

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor inicia en `http://localhost:3000`

## Build para Producción

```bash
npm run build
npm run preview
```

## Estructura del Proyecto

```
src/
├── main.jsx              # Punto de entrada
├── App.jsx               # Componente principal
├── components/           # Componentes de la UI
│   ├── Providers/
│   ├── Clients/
│   ├── Products/
│   ├── Orders/
│   ├── Repartidores/
│   ├── Rubros/
│   ├── Marcas/
│   └── Statistics/
├── store/                # Zustand stores
│   ├── index.js
│   ├── api.js
│   └── [entity].store.js
└── componentsUI/         # Componentes reutilizables
```

## Variables de Entorno

```
VITE_API_BASE=http://localhost:3002
```

## Diferencias con Create React App

- ✅ Uso de `import.meta.env` en lugar de `process.env`
- ✅ Variables con prefijo `VITE_` en lugar de `REACT_APP_`
- ✅ Velocidad de desarrollo 10x más rápida
- ✅ Build más rápido y optimizado
- ✅ Hot Module Replacement instantáneo
