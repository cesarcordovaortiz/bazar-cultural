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

## Moneda y cotización oficial BCB

Los precios de catálogo se mantienen en USD y la interfaz permite visualizarlos también en bolivianos (BOB/Bs). La conversión usa la cotización oficial del dólar estadounidense publicada por el Banco Central de Bolivia (BCB).

GitHub Pages no puede consultar directamente el sitio del BCB desde el navegador porque esa fuente no habilita CORS. Por ello, el workflow [sync-bcb-rate.yml](.github/workflows/sync-bcb-rate.yml) consulta y valida la publicación oficial cada día hábil, y publica el resultado como `exchange-rate.json` en el mismo sitio estático. También puede ejecutarse manualmente o de forma local:

```bash
npm run sync:exchange-rate
```

La conversión se informa como referencial, con la fuente y la fecha de vigencia visibles. El importe definitivo de un cobro real debe ser confirmado por el proveedor de pagos y el backend.

## Carrusel de ofertas

Las campañas vigentes se presentan con imágenes de sus productos y rotan automáticamente cada seis segundos. El carrusel se detiene al recibir foco o al pasar el cursor, respeta la preferencia del sistema para reducir movimiento y permite avanzar, retroceder, seleccionar una oferta o pausarlo manualmente. La paleta de alto contraste combina naranja, ámbar y fondos oscuros para destacar las llamadas a la acción sin perder legibilidad.

## Pagos y entrega digital (demo frontend)

El perfil permite agregar, retirar y marcar como predeterminado varios métodos de pago con campos estandarizados y ejemplos para efectivo contra entrega, transferencia bancaria, billetera digital y tarjeta. Solo se guardan referencias seguras como los últimos cuatro dígitos; nunca números completos, CVV, PIN o contraseñas. El checkout preselecciona el medio predeterminado.

Los productos digitales crean una entrega local con código de seguimiento, eventos de preparación/envío/confirmación, avisos automáticos en Mensajes y una respuesta de satisfacción del cliente. Las compras físicas crean un delivery demostrativo con repartidor identificado, fases de despacho, mapa gráfico de ruta y mensajes de avance. El Centro de mensajes representa visualmente a cliente, equipo y delivery, permite filtrar la conversación por etapa y ofrece al administrador un gráfico de interacciones por fase y tipología para priorizar la atención.

Las rutas, el avance y la ubicación del delivery son una simulación visual: no representan la localización de una persona. Estos flujos requieren para producción un proveedor de pagos, un servicio de entrega de contenidos, un operador logístico con consentimiento de geolocalización, notificaciones y una API persistente.

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
