# 🚀 Maki SEO & Growth Strategy

Maki tenía **1 sola página indexable** (la home). Con este rediseño pasa a **23 URLs indexables**, todas estáticas (SSG), con schema y enlazado interno. Este documento resume lo que ya quedó implementado y lo que sigue.

---

## ✅ Ya implementado en este rediseño

### 1. Technical SEO
| Cambio | Por qué importa |
|---|---|
| Landing convertida a **Server Component** (solo el formulario y los carruseles son cliente) | Menos JS → mejor INP/LCP. Irónico vender velocidad con una página lenta. |
| `<img>` → **`next/image`** (mascota, celebrate) | WebP/AVIF automático, `srcset`, sin CLS. |
| Bug corregido: `body { font-family: Arial }` sobrescribía Geist | La fuente cargada no se usaba (descarga desperdiciada). |
| **FAQ schema arreglado** — antes el JSON-LD decía "funciona con Shopify", "PDF", "7 problemas"… y no coincidía con el FAQ visible | Google penaliza/ignora FAQ schema que no coincide con el contenido visible. Ahora `lib/faq-data.ts` es la única fuente. |
| Schema `Organization` + `WebSite` globales, `BreadcrumbList`, `TechArticle`, `Article`, `FAQPage` por página | Rich results + entendimiento de entidades (incluye LLMs/AI Overviews). |
| JSON-LD escapado (`<` → `<`) | Recomendación oficial de Next 16 contra XSS. |
| `canonical` por página (antes estaba en el layout → todas las páginas apuntaban a `/`) | Evita que Google consolide todo en la home. |
| Título con plantilla `%s | Maki` | Consistencia en SERPs. |
| `sitemap.xml` dinámico con todas las rutas | Descubrimiento inmediato. |
| `robots.txt`: bloquea también `/report/`, `/pdf-preview`, `/api/` | No desperdiciar crawl budget en páginas privadas. |

### 2. Programmatic SEO por stack — `/wordpress/[stack]`
El equivalente a los `/for-restaurants` de Orama. En Maki la gente no busca por industria, busca por **la herramienta que ya usa**:

- `/wordpress/elementor` — "elementor site slow"
- `/wordpress/woocommerce` — "speed up woocommerce"
- `/wordpress/wp-rocket` — "wp rocket still slow"
- `/wordpress/perfmatters` — "perfmatters best settings"
- `/wordpress/litespeed-cache` — "litespeed cache settings"
- `/wordpress/divi` — "divi site slow"

Datos en `lib/seo/stacks.ts`. Agregar una página = agregar un objeto. Cada una tiene copy único, pain points, fixes enlazados y FAQ con schema.

> ⚠️ No generar cientos de páginas con copy casi idéntico. Google trata eso como *doorway pages*. Mejor 30 páginas buenas que 300 plantillas vacías.

### 3. Fix Library — `/fixes/[slug]` (11 páginas)
Reutiliza **el mismo `WP_FIX_LIBRARY` que genera los planes pagados**. Cada fix es una página con pasos genéricos + pasos por plugin (WP Rocket, Perfmatters, LiteSpeed…). Ataca búsquedas long-tail tipo *"wp rocket exclude lcp image from lazy load"*.

Cada fix nuevo que se agregue al producto → **automáticamente** es una nueva página SEO.

### 4. Guías — `/guides/[slug]` (3 artículos iniciales)
- Why is my WordPress site slow? 9 causes
- Core Web Vitals thresholds explained (2026)
- How to fix LCP in WordPress

Contenido en `lib/seo/guides.tsx`. Cada guía enlaza a los fixes relevantes y termina con el scan.

---

## 🔜 Siguiente fase (recomendado, en orden de impacto)

### A. Herramientas gratis (lead magnets SEO)
Estas tienen miles de búsquedas mensuales y llevan directo al scan:

1. **`/tools/wordpress-plugin-detector`** — "what plugins is this site using". Ya tenemos `lib/wp-detection.ts`. Mostrar tema, builder, plugins de cache/imágenes → CTA "ver qué está frenando este sitio".
2. **`/tools/core-web-vitals-checker`** — versión ligera del scan, solo los 3 números + veredicto. Keyword enorme.
3. **`/tools/lcp-element-finder`** — "what is my LCP element". Muestra el snippet + si está lazy-loaded.
4. **`/compare/[siteA]-vs-[siteB]`** — comparar velocidad de dos sitios (viral entre agencias).

### B. Reportes públicos compartibles (link building orgánico)
Opción opt-in: `getmaki.app/report/public/example-com` con un badge "Speed checked by Maki". Las agencias lo comparten con clientes → backlinks.

### C. Más páginas de stack (alta intención)
Astra, GeneratePress, Kadence, Bricks, Oxygen, WPBakery, Beaver Builder (ya los detectamos en `wp-detection.ts`), más hosts: SiteGround, Hostinger, Kinsta, WP Engine, Bluehost ("hostinger wordpress slow").

### D. Comparativas (bottom of funnel)
- `/vs/gtmetrix`, `/vs/pagespeed-insights`, `/vs/debugbear`
- "WP Rocket vs Perfmatters vs LiteSpeed Cache: which do you need?"

### E. Calendario de contenido (2 guías/semana)
- How to pass Core Web Vitals on WordPress (pillar page)
- How to fix INP in WordPress
- How to fix CLS in WordPress
- Best WP Rocket settings 2026
- Best Perfmatters settings 2026
- How to remove unused CSS in WordPress
- How to delay JavaScript in WordPress (without breaking your site)
- How to host Google Fonts locally in WordPress
- Is Elementor slow? (data from real scans)
- Why is my WooCommerce site slow?
- WordPress TTFB: what's a good server response time?
- Does page speed affect SEO? (honest answer)

### F. Data propia = backlinks
Con los scans anónimos agregados: *"We scanned 5,000 WordPress sites: Elementor sites are 1.8× slower"*. Este tipo de estudio es lo que los blogs citan y enlazan.

### G. Medir
- Google Search Console + enviar sitemap.
- Vercel/Firebase analytics para conversiones `/wordpress/*` → scan.
- Revisar Rich Results Test en `/`, `/wordpress/elementor`, `/fixes/*`.

---

## 🧰 Evaluación de Perfmatters → qué más podemos recomendar después del scan

Perfmatters agrupa sus features en: toggles rápidos, Script Manager, JS (defer/delay), CSS (remove unused), lazy load, preloading, fonts, CDN, analytics local, base de datos y snippets.

La pregunta clave para Maki es: **¿qué de esto podemos *detectar desde fuera* con los datos de PageSpeed?** Lo que se puede detectar se convierte en una recomendación concreta y personalizada (nuestro diferencial). Lo que no, va a una sección de *"Quick wins recomendados"* genérica.

### ✅ Tier 1 — Implementado (`lib/wp-fixes/fixes/delivery.ts` y `wordpress-bloat.ts`)

> **Bug crítico encontrado y corregido:** PageSpeed Insights ya usa **Lighthouse 13.5**, que reemplazó muchos audits por *insights* (`render-blocking-resources` → `render-blocking-insight`, `font-display` → `font-display-insight`, `dom-size` → `dom-size-insight`, `third-party-summary` → `third-parties-insight`, `largest-contentful-paint-element` → `lcp-discovery-insight`, etc.). Por eso 7 de los 11 fixes originales **nunca se activaban** en producción. El matcher ahora soporta ambos formatos, y lo verifiqué con respuestas reales de PSI (wpastra.com, techcrunch.com, variety.com y wpbeginner.com).
>
> Pendiente aparte: `lib/gemini-client.ts` y `lib/psi-client.ts` también leen IDs viejos (`third-party-summary`, `render-blocking-resources`, `uses-webp-images`…) para el resumen con IA.

Se agregaron 14 fixes nuevos. La librería pasa de 11 a 25, y cada uno es también una página `/fixes/[slug]`:

| Nuevo fix | Cómo detectarlo | Fix típico |
|---|---|---|
| **LCP image sin `fetchpriority="high"` / sin preload** | Audit `prioritize-lcp-image` / `lcp-discovery-insight`; snippet del LCP sin `fetchpriority` | Perfmatters → Preloading → Critical Images; WP Rocket → Preload; tema |
| **Google Fonts externos** | Requests a `fonts.googleapis.com` / `fonts.gstatic.com` | Hostear localmente (Perfmatters Fonts, WP Rocket, OMGF) |
| **Falta preconnect a orígenes críticos** | Audit `uses-rel-preconnect` | Perfmatters → Preconnect / DNS prefetch |
| **YouTube/Vimeo/Maps embebidos pesados** | Audit `third-party-facades` + requests a `youtube.com/embed`, `maps.googleapis.com` | Reemplazar iframe por thumbnail (Perfmatters "YouTube preview thumbnails", WP Rocket "Replace YouTube iframe") |
| **WooCommerce cart fragments** | Request a `wc-ajax=get_refreshed_fragments` o script `cart-fragments` | Desactivar/limitar (Perfmatters toggle, plugin "Disable Cart Fragments") |
| **Scripts de WooCommerce en páginas no-tienda** | `woocommerce.min.js`, `wc-blocks` cargando en home/blog | Script Manager / "Disable WooCommerce scripts" |
| **Emojis de WordPress** | `wp-emoji-release.min.js` | Toggle "Disable Emojis" |
| **jQuery Migrate** | `jquery-migrate.min.js` | Toggle "Remove jQuery Migrate" (verificar compatibilidad) |
| **Dashicons en frontend** | `dashicons.min.css` para usuarios no logueados | Toggle "Disable Dashicons" |
| **Block library CSS sin usar** | `wp-block-library` + `global-styles` en sitios con Elementor/Divi | "Disable global styles" / "Separate block styles" |
| **Google Analytics / GTM pesado** | `gtag/js`, `googletagmanager.com` en `third-party-summary` | Delay JS o GA local (Perfmatters Analytics) |
| **Texto sin comprimir** | Audit `uses-text-compression` | Activar Gzip/Brotli en host / Cloudflare |
| **Cache headers débiles** | Audit `uses-long-cache-ttl` / `cache-insight` | Reglas de cache en servidor/CDN |
| **CSS/JS sin minificar** | Audits `unminified-css`, `unminified-javascript` | Minify en plugin de cache |

No implementados aún (detección poco confiable desde fuera): CDN ausente, speculative loading, hero con `background-image`.

### Tier 2 — No detectables, pero valiosos como checklist post-scan
Mostrar en el plan pagado como *"Mantenimiento recomendado"* (con nota "no lo podemos verificar desde fuera"):

- Limitar revisiones de posts (`WP_POST_REVISIONS`) y aumentar intervalo de autosave.
- Controlar el **Heartbeat API** (reduce carga de CPU en hosting compartido → mejora TTFB).
- **Limpieza de base de datos**: revisiones, transients expirados, spam, tablas sin optimizar (programado semanal).
- Desactivar XML-RPC y pingbacks (seguridad + carga de servidor).
- Object cache (Redis/Memcached) para WooCommerce y sitios con usuarios logueados.
- Actualizar a PHP 8.3+.
- Revisar plugins inactivos/abandonados.

### Tier 3 — Oportunidades de producto
1. **Score de "plugin overlap"**: detectamos WP Rocket + Autoptimize + LiteSpeed a la vez → advertir de optimizaciones duplicadas (causa común de sitios rotos y lentos).
2. **Recomendación de stack**: si no detectamos ningún plugin de performance, recomendar uno según el host (LiteSpeed server → LiteSpeed Cache; otros → WP Rocket o Perfmatters + cache del host). *Posible ingreso por afiliados* (WP Rocket y Perfmatters tienen programas de afiliados).
3. **Script Manager map**: listar qué assets de cada plugin cargan en la página escaneada (ya tenemos `network-requests`), agrupados por plugin → "Contact Form 7 carga 42KB en tu home y probablemente no lo necesitas ahí". Es exactamente lo que el Script Manager de Perfmatters hace manualmente — nosotros lo podemos *sugerir* automáticamente.

---

## Archivos clave
- `components/LandingPage.tsx` — home rediseñada
- `components/site/*` — header, footer, scan form, carrusel, shell de páginas SEO
- `lib/seo/stacks.ts` — páginas `/wordpress/*`
- `lib/seo/guides.tsx` — guías
- `lib/seo/fix-meta.ts` — metadatos de la fix library
- `lib/faq-data.ts` — FAQ (visible + schema)
- `app/sitemap.ts`, `app/robots.ts`
