# Organización del proyecto

## Frontend

`frontend/` contiene la aplicación React, sus componentes, páginas, estilos, recursos públicos y configuración de Vite/TypeScript. Se instala y ejecuta de forma independiente con npm.

## Backend

`backend/` contiene la API FastAPI, routers, modelos, esquemas, conexión a SQLite y `requirements.txt`. Se ejecuta desde esa carpeta para que los imports actuales (`main`, `models`, `database` y `routers`) sigan funcionando sin cambios.

## Documentación

`docs/` reúne documentación técnica y decisiones de organización. El punto de entrada para instalación y ejecución es el `README.md` de la raíz.

## GitHub

`.github/workflows/` contiene automatizaciones de integración continua. Los archivos `.env`, entornos virtuales, dependencias instaladas, cachés y la base SQLite local quedan fuera del control de versiones mediante `.gitignore`.
