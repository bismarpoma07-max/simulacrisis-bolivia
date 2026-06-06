# SimulaCrisis Bolivia 🇧🇴

**Desafío Final — Programación Web I**

Una página web interactiva que simula situaciones reales relacionadas con el abastecimiento, precios, transporte y poder adquisitivo familiar en contexto de crisis.

## Tecnologías usadas

- **HTML5** — Estructura semántica con etiquetas `header`, `nav`, `main`, `section`, `article`, `footer`
- **CSS3** — Estilos externos con diseño responsivo (media queries), variables CSS, paleta de colores coherente
- **JavaScript** — Cálculos dinámicos, manipulación del DOM, validaciones, eventos
- **DOM** — Captura de datos de formularios, modificación del contenido en tiempo real

## Estructura del proyecto

```
proyecto-web-crisis/
├── index.html          ← Página principal con estructura semántica HTML5
├── css/
│   └── estilos.css     ← Todos los estilos (responsivo, paleta, tipografía)
├── js/
│   └── script.js       ← Lógica JavaScript y manipulación del DOM
├── img/                ← Carpeta para imágenes del proyecto
└── README.md           ← Este archivo
```

## Simuladores incluidos

| Escenario | Descripción |
|-----------|-------------|
| **A** — Carburante | Calcula cuántos días durará la reserva según consumo y reabastecimiento |
| **B** — Precios | Mide el impacto del aumento de precios en el presupuesto familiar |
| **C** — Transporte | Estima el costo adicional por desvíos o bloqueos |
| **D** — Presupuesto | Verifica si el presupuesto alcanza para la compra familiar |
| **E** — Escasez | Simula cómo los rumores aumentan la demanda y afectan el stock |
| **F** — Poder Adquisitivo | Calcula la pérdida del poder de compra familiar |

## Modelos matemáticos aplicados

```
Reserva final     = Reserva_ant + Reabastecimiento − Consumo
% Aumento precio  = ((Precio_act − Precio_ant) / Precio_ant) × 100
Gasto mensual     = Precio × Cantidad × Semanas
Costo adicional   = (Distancia_desvío − Distancia_normal) × Costo/km
Nueva demanda     = Demanda_normal × (1 + % aumento / 100)
% Pérdida PA      = (Aumento_gasto / Ingreso) × 100
```

## Características

- Diseño responsivo (mobile-first con media queries)
- 6 simuladores interactivos con formularios validados
- 5 casos de estudio precargables con un clic
- Alertas visuales (verde/naranja/rojo) según el nivel de riesgo
- Tablas de resultados dinámicas
- Barras de progreso visuales
- Menú hamburguesa para móviles
- Código ordenado y comentado

## Publicación

La página está diseñada para ser publicada en **GitHub Pages**, **Netlify** o **Vercel** sin dependencias externas (sin frameworks ni librerías JS).

*Proyecto educativo sin fines políticos — Programación Web I · Bolivia 2026*
