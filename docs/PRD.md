# PRD — Bazar Cultural

| Campo | Definición |
| --- | --- |
| Producto | Bazar Cultural |
| Documento | Product Requirements Document (PRD) |
| Versión | 1.0 |
| Estado | Base de producto para MVP y evolución a producción |
| Fecha | 10 de agosto de 2026 |
| Propietario | Product Owner de Bazar Cultural |
| Audiencia | Negocio, diseño, ingeniería, QA, operaciones y aliados culturales |

## 1. Resumen ejecutivo

Bazar Cultural es una plataforma de comercio electrónico especializada en bienes, contenidos y experiencias culturales. Su propósito es facilitar el descubrimiento, la compra y la gestión de productos culturales, y ofrecer a creadores, gestores y administradores una forma clara de promover campañas y atender pedidos.

La propuesta se identifica con la **economía naranja**: una experiencia digital cálida, confiable e inclusiva que pone en valor la creatividad, la memoria, los oficios y las comunidades culturales. El producto debe equilibrar una navegación comercial eficaz con una presentación respetuosa del contexto cultural de cada oferta.

La versión actualmente publicada es un frontend estático con datos y procesos simulados. Incluye catálogo, carrito, checkout simulado, perfiles, pedidos, campañas, mensajería y vistas administrativas. Este PRD define tanto el alcance comprobado de ese MVP como los requisitos para llevarlo a una operación real y segura.

## 2. Problema y oportunidad

Las ofertas culturales suelen estar dispersas entre redes sociales, mensajería y catálogos poco estructurados. Esto dificulta que las personas descubran productos relevantes, comparen opciones, reciban información contextual y completen una compra. También limita la capacidad de los gestores para ordenar pedidos, comunicar cambios, medir campañas y entender la demanda.

Bazar Cultural responde a esta oportunidad mediante:

- Un catálogo navegable de productos culturales con identidad visual propia.
- Un flujo de compra simple, primero simulado y luego conectado a pagos y logística reales.
- Herramientas administrativas para pedidos, campañas y atención por pedido.
- Un marco de accesibilidad, rendimiento y privacidad apto para una audiencia diversa.

## 3. Visión, objetivo y principios

### Visión

Ser una plataforma digital de referencia para descubrir y adquirir cultura, fortaleciendo la sostenibilidad económica de las personas y organizaciones que la crean.

### Objetivo de producto

Permitir que una persona encuentre un producto cultural relevante y complete una compra con confianza, mientras el equipo administrador puede operar el pedido, comunicar su progreso y promover ofertas medibles.

### Principios de producto

1. **Cultura primero.** Cada contenido debe respetar atribución, contexto, diversidad y derechos de autor.
2. **Compra sin fricción.** El camino desde el descubrimiento hasta la confirmación debe ser breve, entendible y reversible cuando corresponda.
3. **Confianza por diseño.** Precios, disponibilidad, descuentos, estado de pedido y tratamiento de datos deben ser transparentes.
4. **Accesibilidad por defecto.** La plataforma debe ser utilizable con teclado, lectores de pantalla, dispositivos móviles y conexiones limitadas.
5. **Datos mínimos, valor máximo.** Se recopilarán solo los datos necesarios para prestar el servicio y mejorar la experiencia con consentimiento.
6. **Operación observable.** Los equipos deben poder identificar fallos, pedidos atascados y efectos de las campañas sin depender de revisión manual extensiva.

## 4. Alcance

### 4.1. Alcance del MVP publicado (frontend)

| Área | Capacidades incluidas |
| --- | --- |
| Descubrimiento | Catálogo de 20 productos con imágenes WebP, filtro por categoría y búsqueda por texto, etiquetas y descripción. |
| Oferta comercial | Carrusel de campañas vigentes con descuento, urgencia, CTA y acceso a los productos incluidos. |
| Compra | Carrito persistente, detalle de producto y checkout/pago simulado. |
| Cuenta | Inicio de sesión simulado, roles de cliente y administrador, perfil editable, datos de contacto, dirección y geolocalización opcional. |
| Pedidos | Historial y detalle para cliente; búsqueda, filtros, cambios de estado y lista virtualizada para administración. |
| Campañas | Creación y activación local de campañas, descuento y KPI simulado. |
| Atención | Mensajería local vinculada a pedidos y centro de mensajes. |
| Calidad | Diseño responsivo, carga diferida de vistas, pruebas E2E y análisis automatizado de accesibilidad del catálogo. |

La aplicación está desplegada en GitHub Pages. Los datos de usuario, carrito, pedidos, campañas y mensajes son simulados y se persisten en el navegador; no constituyen una operación transaccional real.

### 4.2. Fuera de alcance del MVP publicado

- Cobros reales, emisión de comprobantes, devoluciones financieras y conciliación.
- Inventario, precios, usuarios y pedidos persistidos en un servidor.
- Entrega, asignación de repartidor, cálculo de costos de envío y trazabilidad logística real.
- Autenticación segura, recuperación de contraseña, MFA, autorización en servidor y gestión de sesiones.
- Sincronización en tiempo real, notificaciones push, correo, SMS o WhatsApp.
- Gestión de múltiples vendedores, liquidaciones, comisiones y panel de creadores.
- Mapa visual o validación geográfica de direcciones.

### 4.3. Decisiones que requieren validación de negocio

Antes de una salida comercial se debe definir: mercados y moneda de operación, países de envío, impuestos, política de devolución, quién vende legalmente cada producto, modelo de comisión, proveedor de pagos, proveedor logístico y política de derechos/licencias de contenidos culturales.

## 5. Usuarios, roles y necesidades

| Rol | Objetivo principal | Necesidades críticas |
| --- | --- | --- |
| Visitante | Explorar cultura y decidir si compra. | Descubrimiento rápido, información clara, imágenes, precios y ofertas. |
| Cliente | Comprar y seguir sus pedidos. | Cuenta confiable, carrito persistente, pago seguro, dirección, historial y soporte. |
| Administrador/a | Operar la tienda. | Gestionar pedidos, estados, campañas, catálogo, atención y métricas. |
| Creador/a o gestor/a cultural (futuro) | Ofrecer y contextualizar sus productos. | Perfil, catálogo propio, atribución, inventario, ventas y liquidaciones. |
| Equipo de soporte | Resolver dudas e incidencias. | Conversaciones contextualizadas, historial, estados y trazabilidad. |

### Personas de referencia

- **Compradora exploradora:** usa principalmente móvil, busca regalos o piezas con identidad local; necesita señales de confianza y una compra rápida.
- **Coleccionista informado:** compara ediciones, autoría, materiales y disponibilidad; necesita descripciones completas y transparencia de inventario.
- **Gestora operativa:** atiende varios pedidos a la vez; necesita priorizar, filtrar, actualizar estados y comunicarse sin perder contexto.

## 6. Objetivos, métricas y criterios de éxito

Las métricas se medirán una vez exista analítica con consentimiento y una línea base. Los objetivos siguientes corresponden a los primeros 90 días de operación comercial; deben ajustarse después de la fase piloto.

| Objetivo | Indicador | Meta inicial | Fuente |
| --- | --- | --- | --- |
| Mejorar descubrimiento | Uso de búsqueda o filtros por sesión | ≥ 20 % | Analítica de producto |
| Convertir interés en compra | Conversión de sesión a pedido pagado | Meta a calibrar en piloto; medir desde día 1 | Analítica + pagos |
| Reducir abandono | Inicio de checkout que llega a confirmación | ≥ 60 % | Eventos de embudo |
| Operar con rapidez | Tiempo mediano hasta primera actualización del pedido | < 4 horas hábiles | Backend de pedidos |
| Mantener calidad | Éxito técnico de checkout | ≥ 99 % mensual | Observabilidad |
| Proteger la inclusión | Flujos críticos conformes con WCAG 2.2 AA | 100 % antes de producción | Auditoría manual y automatizada |
| Evaluar campañas | Ingresos y conversión atribuible por campaña | Reporte semanal disponible | Analítica de campañas |

No se deberá optimizar una métrica comercial a costa de engañar con disponibilidad, descuentos, urgencia o consentimiento de datos.

## 7. Recorridos críticos

### 7.1. Descubrimiento y compra

1. La persona llega al catálogo desde un enlace, búsqueda o campaña.
2. Ve una propuesta de valor y las ofertas vigentes destacadas.
3. Busca o filtra por categoría; revisa tarjeta y detalle del producto.
4. Añade un producto disponible al carrito y revisa cantidades, total y moneda.
5. Inicia sesión o continúa según la política definida.
6. Indica o elige dirección y método de pago.
7. Confirma la compra, recibe un identificador de pedido y ve el siguiente paso.
8. Consulta el historial, estado y mensajes de ese pedido.

### 7.2. Operación de un pedido

1. La persona administradora consulta pedidos por estado, fecha o búsqueda.
2. Revisa artículos, importe, dirección y contacto con acceso según permisos.
3. Acepta, actualiza el estado o cancela indicando un motivo cuando aplique.
4. Envía un mensaje contextualizado al pedido.
5. El cliente recibe el cambio de estado y puede responder.
6. Cada cambio queda auditado y es visible para los roles autorizados.

### 7.3. Creación de campaña

1. La persona administradora define nombre, productos, vigencia y descuento.
2. El sistema valida fechas, productos elegibles y reglas de precio.
3. La campaña se publica o programa; no debe aplicarse fuera de vigencia.
4. El catálogo la muestra como oferta destacada con CTA claro.
5. La administración revisa impresiones, clics, conversión, pedidos e ingreso atribuible.

## 8. Requisitos funcionales

La prioridad usa MoSCoW: **Must** (necesario para producción), **Should** (alta prioridad posterior), **Could** (deseable) y **Won't** (fuera del horizonte actual).

### 8.1. Catálogo y descubrimiento

| ID | Prioridad | Requisito | Criterio de aceptación |
| --- | --- | --- | --- |
| CAT-01 | Must | Mostrar un catálogo de productos publicados. | Cada tarjeta incluye imagen con texto alternativo útil, nombre, precio, moneda, disponibilidad y acceso al detalle. |
| CAT-02 | Must | Permitir búsqueda y filtro por categorías. | Los resultados se actualizan en menos de 300 ms para el catálogo objetivo; se informa cuando no hay coincidencias. |
| CAT-03 | Must | Presentar el detalle cultural y comercial del producto. | El detalle muestra descripción, atribución cuando corresponda, formato/material, precio, inventario, condiciones de entrega y acción de añadir. |
| CAT-04 | Should | Incorporar colecciones, etiquetas y ordenación. | Se puede navegar por una colección y ordenar sin perder filtros activos. |
| CAT-05 | Should | Soportar inventario real. | No se permite comprar unidades no disponibles; el inventario se reserva y confirma de forma transaccional. |
| CAT-06 | Could | Incorporar favoritos y recomendaciones. | El usuario puede guardar artículos con consentimiento y recibir recomendaciones explicables. |

### 8.2. Ofertas y campañas

| ID | Prioridad | Requisito | Criterio de aceptación |
| --- | --- | --- | --- |
| CAM-01 | Must | Mostrar campañas activas en una zona visible del catálogo. | El carrusel es operable por teclado, no rota automáticamente sin control y expone nombre, vigencia, beneficio y CTA. |
| CAM-02 | Must | Aplicar descuentos de campaña de manera consistente. | Precio original, descuento, precio final y condiciones son inequívocos en catálogo, carrito y checkout. |
| CAM-03 | Must | Administrar campañas con fecha de inicio/fin, estado y productos. | No se pueden publicar campañas con fechas inválidas, productos inexistentes o reglas incompatibles. |
| CAM-04 | Should | Medir desempeño de cada campaña. | Se muestran impresiones, clics, conversión, pedidos, ingreso atribuible y ventana temporal. |
| CAM-05 | Could | Recomendar campañas por preferencias declaradas. | La recomendación indica por qué se muestra y ofrece controles de privacidad. |

### 8.3. Carrito, checkout y pagos

| ID | Prioridad | Requisito | Criterio de aceptación |
| --- | --- | --- | --- |
| COM-01 | Must | Permitir añadir, ajustar y eliminar artículos del carrito. | Cantidad, subtotal, descuento, impuestos y total se recalculan correctamente y se anuncian de forma accesible. |
| COM-02 | Must | Persistir el carrito de forma segura entre sesiones. | Un usuario autenticado recupera su carrito desde el servidor; se resuelven conflictos entre dispositivos. |
| COM-03 | Must | Obtener datos de entrega y presentar el resumen final. | Los campos se validan antes del pago; dirección y costes se muestran antes de confirmar. |
| COM-04 | Must | Integrar un proveedor de pago conforme a regulación aplicable. | Datos de tarjeta no atraviesan ni se almacenan en Bazar Cultural; se usan tokenización, confirmación y manejo de errores. |
| COM-05 | Must | Crear un pedido idempotente tras un pago aprobado. | Reintentos no duplican pedidos ni cargos; se conserva referencia del proveedor. |
| COM-06 | Should | Soportar comprobantes, reembolsos y cancelaciones. | La persona recibe estado y comprobante; cada reembolso queda trazado. |

### 8.4. Cuenta, perfil y privacidad

| ID | Prioridad | Requisito | Criterio de aceptación |
| --- | --- | --- | --- |
| ACC-01 | Must | Proporcionar registro/inicio de sesión seguro. | Contraseñas con hash fuerte, recuperación segura, limitación de intentos y sesión revocable. |
| ACC-02 | Must | Gestionar roles y permisos en servidor. | Un cliente no puede acceder ni modificar recursos administrativos, incluso alterando la interfaz. |
| ACC-03 | Must | Permitir editar contacto, dirección y preferencias. | Los datos se validan, se guardan con confirmación y el usuario puede rectificarlos o eliminarlos conforme a política. |
| ACC-04 | Must | Obtener consentimiento explícito para ubicación y comunicaciones. | Negar la ubicación no bloquea la compra; se explica para qué se usa y cómo retirarlo. |
| ACC-05 | Should | Mostrar y gestionar métodos de pago tokenizados. | Nunca se muestra información sensible completa; el usuario puede quitar un método. |

### 8.5. Pedidos, administración y atención

| ID | Prioridad | Requisito | Criterio de aceptación |
| --- | --- | --- | --- |
| ORD-01 | Must | Permitir al cliente ver solo sus propios pedidos. | El historial contiene fecha, artículos, total, estado, dirección permitida y acceso al detalle. |
| ORD-02 | Must | Permitir a la administración buscar, filtrar y actualizar pedidos. | Filtros por estado, fecha y texto; cambios autorizados quedan auditados. |
| ORD-03 | Must | Sincronizar cambios de estado con baja latencia. | Los eventos se propagan por WebSocket, SSE o polling controlado; la interfaz se recupera de desconexiones. |
| ORD-04 | Should | Escalar el listado administrativo. | Paginación/infinite scroll y virtualización manejan el volumen objetivo sin degradar la interacción. |
| MSG-01 | Must | Mantener una conversación asociada a un pedido. | Se valida participante, pedido y contenido; el historial ordena mensajes y marca lectura. |
| MSG-02 | Should | Notificar mensajes y cambios importantes. | Canales y consentimiento configurables; las notificaciones no revelan datos sensibles en la pantalla bloqueada. |

## 9. Requisitos no funcionales

| Área | Requisito verificable |
| --- | --- |
| Accesibilidad | Conformidad WCAG 2.2 nivel AA en flujos críticos; foco visible, navegación completa por teclado, semántica HTML, mensajes de error comprensibles, contraste suficiente y alternativas textuales. Se complementará Axe con pruebas manuales y lector de pantalla. |
| Rendimiento | En conexiones móviles representativas, LCP ≤ 2.5 s, INP ≤ 200 ms y CLS ≤ 0.1 en páginas principales, medidos en percentil 75. Imágenes responsivas y comprimidas; código no crítico diferido. |
| Disponibilidad | Objetivo inicial de disponibilidad mensual ≥ 99.5 % para catálogo y checkout, excluyendo mantenimientos anunciados. |
| Seguridad | Aplicar prácticas OWASP ASVS apropiadas al nivel de riesgo: TLS, gestión de secretos, validación de entrada en servidor, control de acceso por recurso, protección contra CSRF/XSS, rate limiting, registros de seguridad y revisión de dependencias. |
| Privacidad | Privacidad por diseño y por defecto; consentimiento granular, minimización, retención definida, exportación/eliminación cuando aplique y contrato de tratamiento con proveedores. Adecuar a la legislación de los mercados de operación. |
| Compatibilidad | Últimas dos versiones estables de Chrome, Edge, Firefox y Safari; móvil desde 360 px de ancho; sin depender solo de hover o color. |
| Localización | Español como idioma inicial; formatos de moneda, fecha, zona horaria e impuestos configurables. La arquitectura debe permitir traducciones posteriores. |
| Observabilidad | Errores de frontend/backend, trazas de checkout, métricas de API, auditoría de cambios y alertas accionables sin registrar datos personales sensibles. |
| Mantenibilidad | TypeScript estricto, arquitectura por funcionalidades, revisiones de código, cobertura de pruebas acordada y documentación de APIs/decisiones. |

## 10. Datos y reglas de negocio

### Entidades mínimas

`User`, `Address`, `PaymentMethod`, `Product`, `ProductImage`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Campaign`, `CampaignMetric`, `Message`, `InventoryReservation` y `AuditEvent`.

Las entidades actuales de frontend se encuentran en [`src/types.ts`](../src/types.ts). En producción se deberán añadir identificadores inmutables, timestamps auditables, versiones para concurrencia, referencias de pago, impuestos, descuento aplicado, condiciones de venta y reglas de retención.

### Reglas clave

1. El precio y el descuento que se confirman en checkout quedan registrados en el pedido y no cambian retrospectivamente.
2. Una campaña solo se aplica si está activa, dentro de la ventana de vigencia y sus productos cumplen la regla asociada.
3. El inventario se valida en servidor al crear el pedido y al confirmar el pago; los procesos deben ser idempotentes.
4. Los cambios de estado permitidos se controlan mediante una máquina de estados. Una transición inválida se rechaza y queda registrada.
5. Solo participantes autorizados y personal con permiso pueden leer o enviar mensajes de un pedido.
6. La atribución cultural (autoría, licencia, procedencia y restricciones) debe ser editable y visible cuando aplique.

### Estados de pedido propuestos

`PENDIENTE → ACEPTADO → EN_CAMINO → ENTREGADO`, con `CANCELADO` disponible desde los estados definidos por la política. Las transiciones, causas de cancelación y quién las ejecuta deben almacenarse en auditoría.

## 11. Arquitectura y dependencias de producto

La interfaz usa Vite, React, TypeScript, Tailwind CSS, React Router, TanStack Query, React Hook Form, Axios y React Window. La versión estática utiliza hash routing para funcionar en GitHub Pages y despliega automáticamente con GitHub Actions.

Para producción se requiere una arquitectura de servicios que incluya, como mínimo:

- API autenticada para usuarios, catálogo, carrito, pedidos, campañas y mensajes.
- Base de datos transaccional y almacenamiento de imágenes mediante CDN.
- Proveedor de identidad y proveedor de pagos con tokenización.
- Canal de eventos (WebSocket/SSE) y mecanismo de trabajos asíncronos para pagos, correos y notificaciones.
- Integración de mapas/geocodificación evaluada según disponibilidad y privacidad.
- Plataforma de analítica, monitoreo y gestión de errores con controles de consentimiento.

La definición de endpoints, contratos, errores y versionado se realizará mediante OpenAPI antes de integrar el backend. Ningún secreto, precio final, autorización o validación de inventario debe depender únicamente del cliente.

## 12. Analítica de producto

Los eventos deben tener un esquema versionado, evitar PII en propiedades analíticas y respetar preferencias de consentimiento. Eventos iniciales:

| Evento | Propiedades permitidas de ejemplo | Uso |
| --- | --- | --- |
| `catalog_viewed` | fuente, categoría, campaña_id opcional | Medir adquisición y descubrimiento. |
| `catalog_filtered` | categoría, término normalizado, resultados | Mejorar navegación y demanda. |
| `product_viewed` | producto_id, tipo, campaña_id opcional | Medir interés por oferta. |
| `cart_updated` | producto_id, cantidad, valor agregado | Analizar intención de compra. |
| `checkout_started` / `checkout_completed` | pedido_id pseudonimizado, moneda, importe | Medir embudo sin exponer datos sensibles. |
| `campaign_viewed` / `campaign_cta_clicked` | campaña_id, posición | Medir eficacia de campañas. |
| `order_status_changed` | estado anterior/nuevo, origen | Identificar cuellos operativos. |

## 13. Calidad, pruebas y lanzamiento

### Pirámide de pruebas esperada

| Nivel | Cobertura esperada |
| --- | --- |
| Unitarias | Cálculos de carrito/descuentos, reglas de campaña, validadores, máquina de estados y adaptadores de API. |
| Componentes | Formularios, errores, accesibilidad de controles, tarjetas y estados vacíos. |
| Integración | API, autorización por recurso, inventario, pago simulado y eventos de pedido. |
| E2E | Descubrimiento, compra, perfil, pedidos, campañas, mensajería y recuperación de fallos. |
| No funcionales | Axe + revisión manual, Lighthouse, carga, seguridad, compatibilidad móvil y pruebas de recuperación. |

La versión actual incorpora Playwright y Axe para flujos críticos. Antes de producción se añadirá Vitest para pruebas unitarias/componentes, además de ESLint, Prettier, pre-commit hooks y verificación de dependencias en CI.

### Criterios de salida a producción

1. Todos los requisitos **Must** de la versión seleccionada están aceptados por negocio, QA y seguridad.
2. No existen vulnerabilidades críticas o altas sin mitigación y aceptación formal de riesgo.
3. Pagos, inventario y creación de pedido se validan con pruebas idempotentes de extremo a extremo.
4. Se supera auditoría WCAG 2.2 AA de los flujos críticos y se corrigen hallazgos bloqueantes.
5. Se alcanzan los presupuestos de rendimiento acordados en móvil.
6. Se aprueban políticas legales, privacidad, devoluciones, contenido y soporte.
7. Hay monitoreo, runbooks, respaldos, responsables de incidente y plan de reversión.

## 14. Hoja de ruta propuesta

| Fase | Resultado | Dependencias |
| --- | --- | --- |
| 0. Descubrimiento y diseño (2–4 semanas) | Validación de mercado, reglas comerciales, prototipos y métricas base. | Product Owner, legal, operaciones, diseño, aliados culturales. |
| 1. Fundaciones de producción (3–5 semanas) | Backend, identidad, modelo de datos, OpenAPI, CI de calidad, observabilidad y migración desde mocks. | Decisiones de infraestructura e identidad. |
| 2. Comercio transaccional (4–6 semanas) | Inventario, checkout seguro, pagos, comprobantes, pedidos y política de devoluciones. | Proveedor de pagos, fiscalidad y logística. |
| 3. Operación conectada (3–5 semanas) | Mensajes/eventos en tiempo real, notificaciones, panel administrativo con auditoría. | Servicio de eventos y soporte. |
| 4. Crecimiento cultural (continuo) | KPIs de campañas, atribución, recomendaciones con consentimiento, gestión de creadores y optimización. | Datos de producción y gobernanza cultural. |

Las estimaciones se revisarán tras definir equipo, mercados, integraciones y volumen esperado. No deben interpretarse como fecha comprometida.

## 15. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| Tratar los mocks locales como datos reales. | Alto: pérdida de pedidos, seguridad y confianza. | Señalizar el entorno, bloquear pagos reales hasta disponer de backend y migrar datos con control. |
| Integración tardía de pagos/logística. | Alto: rediseños de checkout y operación. | Seleccionar proveedores y contratos técnicos al inicio de la fase 1. |
| Manejo inadecuado de propiedad intelectual o atribución. | Alto: daño reputacional y legal. | Campos y proceso de revisión de licencias, autoría, procedencia y permisos. |
| Exclusión por accesibilidad o conectividad. | Alto: reducción de audiencia y riesgo normativo. | WCAG AA, pruebas con usuarios, presupuestos de rendimiento y diseño progresivo. |
| Ofertas engañosas o inconsistentes. | Alto: pérdida de confianza. | Motor de precios centralizado, auditoría y términos de campaña visibles. |
| Fuga de datos personales o de pago. | Crítico. | Minimización, tokenización, secreto gestionado, cifrado, pruebas de seguridad y respuesta a incidentes. |
| Métricas sin consentimiento o sin contexto cultural. | Medio/alto. | Gobierno de datos, esquema aprobado y revisión de sesgos/impacto. |

## 16. Preguntas abiertas

1. ¿Cuál será el mercado inicial, moneda de cobro, idioma y régimen tributario?
2. ¿La plataforma operará como tienda propia, marketplace de terceros o modelo híbrido?
3. ¿Qué productos son físicos, digitales, bajo demanda o experiencias con fecha?
4. ¿Qué proveedor de pagos, facturación, logística, geocodificación y mensajería se aprobará?
5. ¿Cuál es la política de derechos, licencias, atribución y revisión de contenido cultural?
6. ¿Se debe ampliar el catálogo objetivo de los 20 productos actuales a 50 o a otra meta?
7. ¿Qué SLA de soporte y devoluciones se comunicará al cliente?

## 17. Anexos

### Referencias de calidad a adoptar

- WCAG 2.2 AA para accesibilidad web.
- Core Web Vitals para experiencia de rendimiento.
- OWASP ASVS y OWASP Top 10 como guía de seguridad de aplicaciones.
- ISO/IEC 25010 como marco de atributos de calidad de software.
- OpenAPI para contratos de APIs y Semantic Versioning para cambios compatibles.

### Definición de “hecho” para cada requisito

Un requisito se considera terminado solo cuando cuenta con diseño aprobado, implementación revisada, pruebas automatizadas pertinentes, prueba manual de accesibilidad cuando aplique, documentación actualizada, telemetría/observabilidad necesaria y aceptación del responsable de producto.
