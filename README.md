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
├── components/           # Menú, login y pantallas
│   ├── DynamicModule.jsx # ABM de las secciones configuradas en la base
│   ├── Clients/          # Configuración y reglas de Clientes
│   ├── Employees/        # Configuración y reglas de Empleados
│   ├── Users/            # Pantalla, formulario y listado de usuarios
│   ├── shared/           # Formulario, grilla y resumen reutilizables
│   └── Statistics/       # Pantalla de estadísticas
├── store/                # Zustand stores
│   ├── index.js
│   ├── api.js
│   └── *.store.js
└── utils/                # Renderizado de campos dinámicos
```

Clientes y Empleados definen sus reglas en sus respectivos componentes y utilizan
el módulo dinámico compartido. Proveedores, Productos, Pedidos y otros ABM lo
utilizan directamente. Usuarios y Estadísticas tienen componentes propios. Las
rutas HTTP y migraciones del backend se conservan para usos externos y operativos.

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
