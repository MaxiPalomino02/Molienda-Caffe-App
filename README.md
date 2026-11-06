# Molienda Café

Aplicación web para una cafetería especializada en la venta de café en granos, molinillos, tazas y accesorios. Permite explorar el catálogo, filtrar productos por categoría, consultar el detalle de cada artículo y realizar pedidos mediante un carrito de compras. El backend valida la disponibilidad de stock, calcula el total del pedido y guarda la información en una base de datos SQLite.

**Equipo:** Cristobal Maximiliano Palomino y Lourdes Ruiz.

## Características principales

- Catálogo de productos organizado por categorías.
- Filtro por categoría y consulta del detalle de cada producto.
- Carrito de compras con modificación de cantidades y cálculo del total.
- Creación de pedidos desde el carrito.
- Validación de existencia y stock disponible antes de confirmar un pedido.
- Descuento automático del stock al registrar una compra.
- Interfaz adaptable a computadoras, tablets y celulares.

## Stack tecnológico

| Área | Tecnologías |
|---|---|
| Frontend | React 19, TypeScript, Vite y React Router |
| Backend | Python, FastAPI, Uvicorn y Pydantic |
| Persistencia | SQLite y SQLAlchemy |
| Control de versiones | Git y GitHub |
| Integración continua | GitHub Actions (compilación del frontend) |

## Requisitos previos

| Herramienta | Versión / requisito |
|---|---|
| Python | 3.10 o superior recomendado |
| Node.js | 20.19+ o 22.12+ |
| npm | Incluido con Node.js |
| Git | Versión reciente |

> La aplicación utiliza Vite 8. Para evitar incompatibilidades, se recomienda utilizar una versión de Node.js compatible con Vite 8.

## Estructura de carpetas

```text
Cafeteria_app/
├── frontend/
│   ├── public/                 recursos estáticos e imágenes
│   ├── src/
│   │   ├── components/         componentes reutilizables
│   │   ├── context/            contexto global del carrito
│   │   ├── pages/              páginas de la aplicación
│   │   ├── services/           comunicación con la API
│   │   ├── types/              tipos e interfaces TypeScript
│   │   ├── App.tsx             rutas principales
│   │   ├── index.css           estilos globales
│   │   └── main.tsx            punto de entrada de React
│   ├── .env.example            ejemplo de configuración
│   ├── package.json            dependencias y scripts
│   ├── package-lock.json       versiones bloqueadas
│   └── vite.config.ts          configuración de Vite
│
├── backend/
│   ├── routers/
│   │   ├── products.py         endpoints de productos
│   │   └── orders.py           endpoints de pedidos
│   ├── main.py                 creación y configuración de FastAPI
│   ├── database.py             conexión y sesiones de SQLite
│   ├── models.py               modelos de SQLAlchemy
│   ├── schemas.py              validación y esquemas Pydantic
│   └── requirements.txt        dependencias de Python
│
├── docs/
│   └── ESTRUCTURA.md           descripción de la organización
│
├── .github/
│   └── workflows/
│       └── frontend.yml        verificación automática del build
│
├── .gitignore
└── README.md
```

## Instalación y ejecución

Para trabajar localmente hay que iniciar el backend y el frontend en dos terminales diferentes. Los comandos siguientes están pensados para Windows con PowerShell.

### 1. Clonar el repositorio

```powershell
git clone URL_DEL_REPOSITORIO
cd Cafeteria_app
```

Reemplazá `URL_DEL_REPOSITORIO` por la dirección real del repositorio de GitHub.

### 2. Backend: instalación y ejecución

Desde la carpeta raíz del proyecto:

```powershell
cd backend
```

Crear un entorno virtual:

```powershell
py -m venv .venv
```

Activarlo:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instalar las dependencias:

```powershell
py -m pip install -r requirements.txt
```

Iniciar el servidor:

```powershell
py -m uvicorn main:app --reload
```

El backend estará disponible en:

- API: http://localhost:8000
- Documentación interactiva (Swagger): http://localhost:8000/docs
- Documentación alternativa (ReDoc): http://localhost:8000/redoc

**Importante:** ejecutar Uvicorn desde la carpeta `backend/`, porque allí se encuentra `main.py` y desde allí se resuelven sus módulos.

Si ya tenés Python y las dependencias instaladas, podés iniciar directamente el servidor con `py -m uvicorn main:app --reload`, sin crear nuevamente el entorno virtual.

### 3. Frontend: instalación y ejecución

Abrí una segunda terminal desde la carpeta raíz del proyecto y ejecutá:

```powershell
cd frontend
npm install
npm run dev
```

Vite mostrará la dirección local de la aplicación, normalmente:

http://localhost:5173

Abrí esa dirección en el navegador. El backend debe permanecer ejecutándose en la otra terminal para que el catálogo y las operaciones de compra puedan comunicarse con la API.

## Configuración del frontend

El frontend utiliza la variable `VITE_API_URL` para conocer la dirección del backend. El archivo `frontend/.env.example` contiene la configuración de ejemplo:

```env
VITE_API_URL=http://localhost:8000
```

Si necesitás configurar el entorno local, copiá el archivo de ejemplo:

```powershell
Copy-Item .env.example .env
```

Este comando se ejecuta desde `frontend/`. En la configuración habitual no hace falta crear el archivo `.env`, porque la aplicación utiliza `http://localhost:8000` como dirección predeterminada.

## Base de datos y stock

La aplicación utiliza SQLite mediante SQLAlchemy. La base de datos se encuentra en `backend/molienda.db` y se crea automáticamente cuando se inicia el backend.

Al iniciar, la aplicación crea las tablas necesarias y carga los productos iniciales si la tabla de productos está vacía. Si ya existen productos, no vuelve a insertar el catálogo inicial.

Cuando se registra un pedido, el backend:

1. Comprueba que los productos solicitados existan.
2. Verifica que haya stock suficiente para las cantidades pedidas.
3. Calcula el importe total utilizando los precios guardados en la base de datos.
4. Descuenta las unidades correspondientes del stock.
5. Guarda el pedido.

El archivo de base de datos es local y está excluido del repositorio mediante `.gitignore`. No se debe subir la base de datos local a GitHub.

## API: endpoints principales

La API utiliza el prefijo `/api`.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/products` | Obtiene el catálogo completo. |
| GET | `/api/products?category=granos` | Filtra productos por categoría. |
| GET | `/api/products/{product_id}` | Obtiene el detalle de un producto. |
| POST | `/api/orders` | Registra un pedido y actualiza el stock. |

Las categorías disponibles son `granos`, `molinillos`, `tazas` y `accesorios`.

Para consultar los esquemas, probar solicitudes y ver las respuestas de la API, iniciá el backend y entrá a http://localhost:8000/docs.

## Comandos útiles

### Frontend (desde `frontend/`)

| Comando | Acción |
|---|---|
| `npm install` | Instala las dependencias. |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Comprueba TypeScript y genera la versión de producción. |
| `npm run lint` | Ejecuta el análisis estático con Oxlint. |
| `npm run preview` | Previsualiza localmente la compilación de producción. |

### Backend (desde `backend/`)

| Comando | Acción |
|---|---|
| `py -m venv .venv` | Crea el entorno virtual. |
| `py -m pip install -r requirements.txt` | Instala las dependencias. |
| `py -m uvicorn main:app --reload` | Inicia FastAPI con recarga automática. |

## Git y GitHub

El repositorio está organizado en dos commits iniciales para separar claramente las dos partes principales del sistema:

| Commit | Contenido |
|---|---|
| `feat: frontend Molienda Café` | Aplicación React, componentes, páginas, estilos y configuración del frontend. |
| `feat: backend Molienda Café` | API FastAPI, base de datos, documentación, configuración general y workflow de GitHub Actions. |

Para publicar el proyecto, creá un repositorio vacío en GitHub (sin README, licencia ni `.gitignore`, porque esos archivos ya están incluidos) y ejecutá desde la carpeta raíz:

```bash
git branch -M main
git remote add origin 
git push -u origin main
```

Reemplazá `USUARIO/REPOSITORIO` por la dirección real de tu repositorio.

### Buenas prácticas

- No subir carpetas `node_modules/`, `.venv/` ni archivos de compilación.
- No subir archivos `.env` ni credenciales privadas.
- Mantener `package-lock.json` para reproducir las dependencias del frontend.
- Realizar commits con mensajes claros que describan los cambios.
- Trabajar con ramas para desarrollar nuevas funcionalidades sin afectar directamente `main`.


