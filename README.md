# Bazar Cultural

Tienda virtual de productos culturales construida con Vite, React, TypeScript y Tailwind CSS.

La definición funcional, criterios de calidad y hoja de ruta se encuentran en el [PRD del proyecto](docs/PRD.md).

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Desarrollo local

```bash
npm ci
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Verificación y build de producción

```bash
npm run build
npm run typecheck
npm run test:e2e
npm run preview
```

`npm run build` crea los archivos estáticos en `dist/`. `npm run preview` sirve ese mismo resultado para una comprobación local.

Las pruebas E2E cubren los flujos de catálogo, carrito, checkout, pedidos administrativos, campañas y mensajería. Incluyen una auditoría automatizada de accesibilidad Axe sobre el catálogo y una comprobación de visualización móvil.

## Despliegue en GitHub Pages

El workflow [deploy-pages.yml](.github/workflows/deploy-pages.yml) construye y publica la aplicación al hacer *push* a la rama `main`, o al ejecutarlo manualmente.

Antes del primer despliegue:

1. Inicializa y publica el repositorio en GitHub.
2. En **Settings → Pages**, selecciona **GitHub Actions** como fuente de despliegue.
3. Asegura que la rama de producción se llame `main`, o ajusta `branches` en el workflow.
4. Haz *push* a `main` y consulta el enlace publicado en el resumen de la ejecución de Actions.

El frontend usa *hash routing* para ser compatible con hosting estático. Las rutas se comparten como `/#/orders` o `/#/admin/orders`, por lo que una recarga no requiere reglas especiales del servidor.

## Contenedor opcional

El proyecto incluye un `Dockerfile` con Nginx y fallback SPA. Para ejecutarlo cuando Docker esté disponible:

```bash
docker build -t bazar-cultural .
docker run --rm -p 8080:80 bazar-cultural
```

Después abre `http://localhost:8080`.
