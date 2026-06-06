"use strict";
// Hamburger menú para móviles
const hamburger = document.getElementById("hamburger");
const mainNav   = document.getElementById("mainNav");
hamburger.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});
// Cerrar menú al hacer clic en un enlace
mainNav.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
  });
});

// Sistema de tabs para los simuladores
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    // Desactivar todos los tabs y paneles
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".sim-panel").forEach(p => p.classList.remove("active"));

    // Activar el seleccionado
    tab.classList.add("active");
    const target = document.getElementById(tab.dataset.target);
    if (target) target.classList.add("active");
  });
});

/*UTILIDADES*/

/**
 * Obtiene el valor numérico de un input por su ID.
 * @param {string} id - ID del elemento.
 * @returns {number} Valor numérico del campo.
 */
function getNum(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

/**
 * Obtiene el valor de texto de un input por su ID.
 * @param {string} id - ID del elemento.
 * @returns {string} Texto del campo.
 */
function getTxt(id) {
  return document.getElementById(id).value.trim();
}

/**
 * Muestra un mensaje de error en el área de resultados.
 * @param {string} resultId - ID del contenedor de resultados.
 * @param {string} mensaje - Mensaje de error a mostrar.
 */
function mostrarError(resultId, mensaje) {
  const el = document.getElementById(resultId);
  el.innerHTML = `<div class="form-error">⚠️ ${mensaje}</div>`;
}

/**
 * Formatea un número con dos decimales y separador de miles.
 * @param {number} n - Número a formatear.
 * @returns {string} Número formateado.
 */
function fmt(n) {
  return n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Formatea un número entero con separador de miles.
 * @param {number} n - Número a formatear.
 * @returns {string} Número formateado.
 */
function fmtInt(n) {
  return Math.round(n).toLocaleString("es-BO");
}

/**
 * Determina la clase CSS de alerta según el nivel.
 * @param {string} nivel - "ok", "warning" o "danger".
 * @returns {string} Clase CSS del badge.
 */
function alertaClass(nivel) {
  return nivel === "ok" ? "success" : nivel;
}

/**
 * Activa el tab y hace scroll hacia los simuladores.
 * @param {string} simId - ID del simulador ("A"-"F").
 */
function irASimulador(simId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".sim-panel").forEach(p => p.classList.remove("active"));

  const tab = document.querySelector(`[data-target="sim${simId}"]`);
  const panel = document.getElementById(`sim${simId}`);
  if (tab) tab.classList.add("active");
  if (panel) panel.classList.add("active");

  document.getElementById("simuladores").scrollIntoView({ behavior: "smooth" });
}

/*ESCENARIO A — CARBURANTE*/

/**
 * Calcula cuántos días durará la reserva de carburante
 * y en qué día se llegará al nivel crítico.
 * Fórmula: Reserva_día = Reserva_ant + Reabastecimiento - Consumo
 */
function calcularCarburante() {
  const reservaInicial   = getNum("a-reserva");
  const consumoDiario    = getNum("a-consumo");
  const reabastecimiento = getNum("a-reabastecimiento");
  const nivelCritico     = getNum("a-critico");

  // Validaciones básicas
  if (reservaInicial <= 0 || consumoDiario <= 0) {
    mostrarError("resultA", "Ingresa valores válidos para la reserva inicial y el consumo diario.");
    return;
  }
  if (consumoDiario <= reabastecimiento) {
    mostrarError("resultA", "El reabastecimiento supera o iguala el consumo diario. La reserva no se agotará.");
    return;
  }

  // Simulación día a día
  const neto = consumoDiario - reabastecimiento; // litros netos consumidos por día
  let reserva = reservaInicial;
  let diaCritico = -1;
  let diaAgota   = -1;
  const filas    = [];

  for (let dia = 1; dia <= 365; dia++) {
    reserva -= neto;
    filas.push({ dia, reserva: Math.max(reserva, 0) });

    if (diaCritico === -1 && reserva <= nivelCritico) {
      diaCritico = dia;
    }
    if (diaAgota === -1 && reserva <= 0) {
      diaAgota = dia;
      break;
    }
  }

  // Porcentaje restante al día crítico
  const pctCritico = diaCritico > 0
    ? Math.max(0, 100 - (diaCritico / (diaAgota || diaCritico + 1)) * 100)
    : 100;

  // Determinar nivel de alerta
  let nivel, icono, mensaje;
  if (diaCritico <= 3) {
    nivel = "danger"; icono = "🔴"; mensaje = "¡ALERTA CRÍTICA! La reserva llegará al nivel crítico en menos de 3 días.";
  } else if (diaCritico <= 7) {
    nivel = "warning"; icono = "🟠"; mensaje = "ADVERTENCIA: Nivel crítico alcanzado en menos de una semana.";
  } else {
    nivel = "ok"; icono = "🟢"; mensaje = "Reserva en nivel seguro por ahora.";
  }

  // Construir HTML de resultados
  const html = `
    <div class="result-title">📊 Resultados — Carburante</div>

    <div class="result-row">
      <span class="label">Reserva inicial</span>
      <span class="value">${fmtInt(reservaInicial)} L</span>
    </div>
    <div class="result-row">
      <span class="label">Consumo neto diario</span>
      <span class="value">${fmtInt(neto)} L/día</span>
    </div>
    <div class="result-row">
      <span class="label">Nivel crítico</span>
      <span class="value">${fmtInt(nivelCritico)} L</span>
    </div>
    <div class="result-row">
      <span class="label">Día que llega al nivel crítico</span>
      <span class="value">${diaCritico > 0 ? "Día " + diaCritico : "Nunca (en 1 año)"}</span>
    </div>
    <div class="result-row">
      <span class="label">Día que se agota completamente</span>
      <span class="value">${diaAgota > 0 ? "Día " + diaAgota : "> 365 días"}</span>
    </div>

    <div class="progress-wrap">
      <div class="progress-label">
        <span>Reserva inicial</span>
        <span>Nivel crítico en día ${diaCritico > 0 ? diaCritico : "N/A"}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${alertaClass(nivel)}"
             style="width: ${Math.min(100, (diaCritico / (diaAgota || 30)) * 100)}%"></div>
      </div>
    </div>

    <div class="alert-badge ${alertaClass(nivel)}">${icono} ${mensaje}</div>

    <table class="result-table" style="margin-top:0.8rem;">
      <thead><tr><th>Día</th><th>Reserva restante (L)</th></tr></thead>
      <tbody>
        ${filas.slice(0, 10).map(f => `
          <tr>
            <td>${f.dia}</td>
            <td class="mono">${fmtInt(f.reserva)}</td>
          </tr>`).join("")}
        ${filas.length > 10 ? `<tr><td colspan="2" style="color:var(--color-text-muted); font-size:0.8rem;">... y ${filas.length - 10} días más</td></tr>` : ""}
      </tbody>
    </table>
  `;

  document.getElementById("resultA").innerHTML = html;
}

/*ESCENARIO B — PRECIOS DE ALIMENTOS*/

// Lista de productos para el simulador B
let productosB = [];

/**
 * Agrega un producto a la lista del simulador B.
 * Fórmulas:
 *   Incremento = Precio actual - Precio anterior
 *   % Aumento  = (Incremento / Precio anterior) × 100
 *   Gasto ant  = Precio anterior × Cantidad × Semanas
 *   Gasto act  = Precio actual × Cantidad × Semanas
 */
function agregarProducto() {
  const nombre    = getTxt("b-producto");
  const precioAnt = getNum("b-precio-ant");
  const precioAct = getNum("b-precio-act");
  const cantidad  = getNum("b-cantidad");
  const semanas   = getNum("b-semanas");

  if (!nombre || precioAnt <= 0 || precioAct <= 0 || cantidad <= 0 || semanas <= 0) {
    mostrarError("resultB", "Completa todos los campos del producto antes de agregar.");
    return;
  }

  productosB.push({ nombre, precioAnt, precioAct, cantidad, semanas });
  renderizarListaB();
  limpiarCamposB();
}

/** Renderiza la lista de productos agregados en el simulador B. */
function renderizarListaB() {
  const lista = document.getElementById("b-lista-productos");
  lista.innerHTML = productosB.map((p, i) => `
    <div class="product-item">
      <span>${p.nombre} — ${p.cantidad}u/sem · ${p.semanas} sem</span>
      <button class="remove-btn" onclick="eliminarProductoB(${i})">✕</button>
    </div>
  `).join("");
}

/** Elimina un producto de la lista B por índice. */
function eliminarProductoB(index) {
  productosB.splice(index, 1);
  renderizarListaB();
}

/** Limpia los campos del formulario B (sin borrar la lista). */
function limpiarCamposB() {
  ["b-producto", "b-precio-ant", "b-precio-act", "b-cantidad", "b-semanas"]
    .forEach(id => { document.getElementById(id).value = ""; });
}

/** Calcula el impacto total del aumento de precios. */
function calcularPrecios() {
  if (productosB.length === 0) {
    mostrarError("resultB", "Agrega al menos un producto antes de calcular.");
    return;
  }

  let gastoAntTotal = 0;
  let gastoActTotal = 0;

  const filas = productosB.map(p => {
    const incremento   = p.precioAct - p.precioAnt;
    const pctAumento   = ((incremento / p.precioAnt) * 100);
    const gastoAnt     = p.precioAnt * p.cantidad * p.semanas;
    const gastoAct     = p.precioAct * p.cantidad * p.semanas;
    const diferencia   = gastoAct - gastoAnt;
    gastoAntTotal     += gastoAnt;
    gastoActTotal     += gastoAct;
    return { ...p, incremento, pctAumento, gastoAnt, gastoAct, diferencia };
  });

  const diferenciTotal = gastoActTotal - gastoAntTotal;
  const pctTotalAum    = ((diferenciTotal / gastoAntTotal) * 100);

  const html = `
    <div class="result-title">📊 Resultados — Precios de Alimentos</div>

    <table class="result-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th>% Aumento</th>
          <th>Gasto anterior</th>
          <th>Gasto actual</th>
          <th>Diferencia</th>
        </tr>
      </thead>
      <tbody>
        ${filas.map(f => `
          <tr>
            <td>${f.nombre}</td>
            <td class="mono" style="color:var(--color-warning)">${fmt(f.pctAumento)}%</td>
            <td class="mono">${fmt(f.gastoAnt)} Bs</td>
            <td class="mono">${fmt(f.gastoAct)} Bs</td>
            <td class="mono" style="color:var(--color-danger)">+${fmt(f.diferencia)} Bs</td>
          </tr>`).join("")}
      </tbody>
    </table>

    <div class="result-row" style="margin-top:0.8rem;">
      <span class="label">Gasto anterior total</span>
      <span class="value">${fmt(gastoAntTotal)} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">Gasto actual total</span>
      <span class="value">${fmt(gastoActTotal)} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">Gasto adicional</span>
      <span class="value" style="color:var(--color-danger)">+${fmt(diferenciTotal)} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">Porcentaje de aumento promedio</span>
      <span class="value" style="color:var(--color-warning)">${fmt(pctTotalAum)}%</span>
    </div>

    <div class="alert-badge ${diferenciTotal > gastoAntTotal * 0.3 ? "danger" : diferenciTotal > gastoAntTotal * 0.1 ? "warning" : "success"}">
      ${diferenciTotal > gastoAntTotal * 0.3 ? "🔴 Aumento severo: la familia gasta más de un 30% adicional." :
        diferenciTotal > gastoAntTotal * 0.1 ? "🟠 Aumento moderado: entre 10% y 30% de incremento." :
        "🟢 Aumento leve: menos del 10% de incremento."}
    </div>
  `;

  document.getElementById("resultB").innerHTML = html;
}

/*ESCENARIO C — TRANSPORTE*/

/**
 * Calcula el aumento en el costo de transporte por desvíos.
 * Fórmulas:
 *   Costo normal  = distancia normal × costo/km
 *   Costo desvío  = distancia desvío × costo/km
 *   Costo add/sem = (Costo desvío - Costo normal) × viajes
 */
function calcularTransporte() {
  const distNormal = getNum("c-dist-normal");
  const distDesvio = getNum("c-dist-desvio");
  const costoKm    = getNum("c-costo-km");
  const viajes     = getNum("c-viajes");

  if (distNormal <= 0 || distDesvio <= 0 || costoKm <= 0 || viajes <= 0) {
    mostrarError("resultC", "Completa todos los campos con valores válidos.");
    return;
  }
  if (distDesvio < distNormal) {
    mostrarError("resultC", "La distancia con desvío debe ser mayor o igual a la distancia normal.");
    return;
  }

  const costoNormal  = distNormal * costoKm;
  const costoDesvio  = distDesvio * costoKm;
  const diferencia   = costoDesvio - costoNormal;
  const addSemana    = diferencia * viajes;
  const addMes       = addSemana * 4;
  const pctAumento   = ((diferencia / costoNormal) * 100);
  const kmExtra      = distDesvio - distNormal;

  const nivel = pctAumento >= 50 ? "danger" : pctAumento >= 25 ? "warning" : "ok";

  const html = `
    <div class="result-title">📊 Resultados — Transporte</div>

    <div class="result-row">
      <span class="label">Kilómetros extra por desvío</span>
      <span class="value">${fmt(kmExtra)} km</span>
    </div>
    <div class="result-row">
      <span class="label">Costo por viaje normal</span>
      <span class="value">${fmt(costoNormal)} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">Costo por viaje con desvío</span>
      <span class="value">${fmt(costoDesvio)} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">Aumento por viaje</span>
      <span class="value" style="color:var(--color-warning)">+${fmt(diferencia)} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">Porcentaje de aumento</span>
      <span class="value" style="color:var(--color-warning)">${fmt(pctAumento)}%</span>
    </div>

    <hr style="border-color:var(--color-border); margin:0.5rem 0;" />

    <div class="result-row">
      <span class="label">Gasto adicional por semana (${fmtInt(viajes)} viajes)</span>
      <span class="value" style="color:var(--color-danger)">+${fmt(addSemana)} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">Gasto adicional por mes estimado</span>
      <span class="value" style="color:var(--color-danger)">+${fmt(addMes)} Bs</span>
    </div>

    <div class="progress-wrap">
      <div class="progress-label">
        <span>Normal: ${fmt(costoNormal)} Bs</span>
        <span>Desvío: ${fmt(costoDesvio)} Bs</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${alertaClass(nivel)}"
             style="width:${Math.min(100, pctAumento)}%"></div>
      </div>
    </div>

    <div class="alert-badge ${alertaClass(nivel)}">
      ${nivel === "danger" ? "🔴 Impacto severo: el costo de transporte aumentó más del 50%." :
        nivel === "warning" ? "🟠 Impacto moderado: aumento entre 25% y 50%." :
        "🟢 Impacto leve: el aumento es menor al 25%."}
    </div>
  `;

  document.getElementById("resultC").innerHTML = html;
}

/*ESCENARIO D — PRESUPUESTO FAMILIAR*/

// Lista de ítems para el simulador D
let itemsD = [];

/**
 * Agrega un ítem a la lista del simulador D.
 */
function agregarItemPresupuesto() {
  const nombre = getTxt("d-item");
  const precio = getNum("d-precio");
  const cant   = getNum("d-cant");

  if (!nombre || precio <= 0 || cant <= 0) {
    mostrarError("resultD", "Completa el nombre, precio y cantidad del producto.");
    return;
  }

  itemsD.push({ nombre, precio, cant });
  renderizarListaD();
  document.getElementById("d-item").value  = "";
  document.getElementById("d-precio").value = "";
  document.getElementById("d-cant").value  = "";
}

/** Renderiza la lista de ítems del simulador D. */
function renderizarListaD() {
  const lista = document.getElementById("d-lista-items");
  lista.innerHTML = itemsD.map((it, i) => `
    <div class="product-item">
      <span>${it.nombre} × ${it.cant} — ${fmt(it.precio * it.cant)} Bs</span>
      <button class="remove-btn" onclick="eliminarItemD(${i})">✕</button>
    </div>
  `).join("");
}

/** Elimina un ítem de la lista D por índice. */
function eliminarItemD(index) {
  itemsD.splice(index, 1);
  renderizarListaD();
}

/**
 * Calcula si el presupuesto familiar alcanza.
 * Fórmulas:
 *   Total compra = Σ (precio_i × cantidad_i)
 *   Saldo        = Presupuesto - Total
 *   % Gasto      = (Total / Presupuesto) × 100
 */
function calcularPresupuesto() {
  const presupuesto = getNum("d-presupuesto");

  if (presupuesto <= 0) {
    mostrarError("resultD", "Ingresa un presupuesto disponible válido.");
    return;
  }
  if (itemsD.length === 0) {
    mostrarError("resultD", "Agrega al menos un producto a la lista.");
    return;
  }

  const totalCompra = itemsD.reduce((sum, it) => sum + it.precio * it.cant, 0);
  const saldo       = presupuesto - totalCompra;
  const pctGasto    = (totalCompra / presupuesto) * 100;
  const alcanza     = saldo >= 0;

  // Clasificación del gasto
  let clasif, nivelAlerta;
  if (pctGasto <= 60)       { clasif = "Bajo (≤60%)";  nivelAlerta = "ok"; }
  else if (pctGasto <= 90)  { clasif = "Medio (60–90%)"; nivelAlerta = "warning"; }
  else                       { clasif = "Alto (>90%)";  nivelAlerta = "danger"; }

  const html = `
    <div class="result-title">📊 Resultados — Presupuesto Familiar</div>

    <table class="result-table">
      <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
      <tbody>
        ${itemsD.map(it => `
          <tr>
            <td>${it.nombre}</td>
            <td>${it.cant}</td>
            <td>${fmt(it.precio)} Bs</td>
            <td class="mono">${fmt(it.precio * it.cant)} Bs</td>
          </tr>`).join("")}
      </tbody>
    </table>

    <div class="result-row" style="margin-top:0.8rem;">
      <span class="label">Presupuesto disponible</span>
      <span class="value">${fmt(presupuesto)} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">Total de la compra</span>
      <span class="value">${fmt(totalCompra)} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">${alcanza ? "Saldo restante" : "Monto faltante"}</span>
      <span class="value" style="color:${alcanza ? "var(--color-success)" : "var(--color-danger)"}">
        ${alcanza ? fmt(saldo) : fmt(Math.abs(saldo))} Bs
      </span>
    </div>
    <div class="result-row">
      <span class="label">Porcentaje del presupuesto usado</span>
      <span class="value">${fmt(pctGasto)}%</span>
    </div>
    <div class="result-row">
      <span class="label">Clasificación del gasto</span>
      <span class="value">${clasif}</span>
    </div>

    <div class="progress-wrap">
      <div class="progress-label">
        <span>0 Bs</span>
        <span>Presupuesto: ${fmt(presupuesto)} Bs</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${alertaClass(nivelAlerta)}"
             style="width:${Math.min(100, pctGasto)}%"></div>
      </div>
    </div>

    <div class="alert-badge ${alcanza ? "success" : "danger"}">
      ${alcanza
        ? `🟢 El presupuesto ALCANZA. Saldo restante: ${fmt(saldo)} Bs`
        : `🔴 El presupuesto NO ALCANZA. Faltan ${fmt(Math.abs(saldo))} Bs`}
    </div>
  `;

  document.getElementById("resultD").innerHTML = html;
}

/*ESCENARIO E — RUMOR DE ESCASEZ*/

/**
 * Simula el efecto de rumores de escasez sobre la demanda y el stock.
 * Fórmula:
 *   Nueva demanda = Demanda normal + Demanda normal × (% aumento / 100)
 *   Stock restante = Stock disponible - Nueva demanda
 */
function calcularEscasez() {
  const demandaNormal = getNum("e-demanda-normal");
  const pctAumento    = getNum("e-aumento");
  const stock         = getNum("e-stock");
  const familias      = getNum("e-familias");

  if (demandaNormal <= 0 || stock <= 0 || familias <= 0) {
    mostrarError("resultE", "Ingresa valores válidos para todos los campos.");
    return;
  }
  if (pctAumento < 0) {
    mostrarError("resultE", "El porcentaje de aumento no puede ser negativo.");
    return;
  }

  const nuevaDemanda   = demandaNormal + demandaNormal * (pctAumento / 100);
  const diferencia     = nuevaDemanda - demandaNormal;
  const stockRestante  = stock - nuevaDemanda;
  const alcanza        = stockRestante >= 0;
  const porPersona     = alcanza ? (stock / familias) : (nuevaDemanda / familias);
  const cobertura      = (stock / nuevaDemanda) * 100;

  const nivel = !alcanza ? "danger" : cobertura < 120 ? "warning" : "ok";

  const html = `
    <div class="result-title">📊 Resultados — Rumor de Escasez</div>

    <div class="result-row">
      <span class="label">Demanda normal</span>
      <span class="value">${fmtInt(demandaNormal)} unidades</span>
    </div>
    <div class="result-row">
      <span class="label">Aumento por rumor</span>
      <span class="value" style="color:var(--color-warning)">+${fmt(pctAumento)}%</span>
    </div>
    <div class="result-row">
      <span class="label">Nueva demanda (con pánico)</span>
      <span class="value" style="color:var(--color-warning)">${fmt(nuevaDemanda)} unidades</span>
    </div>
    <div class="result-row">
      <span class="label">Unidades extra demandadas</span>
      <span class="value" style="color:var(--color-danger)">+${fmt(diferencia)} unidades</span>
    </div>
    <div class="result-row">
      <span class="label">Stock disponible</span>
      <span class="value">${fmtInt(stock)} unidades</span>
    </div>
    <div class="result-row">
      <span class="label">${alcanza ? "Stock restante" : "Déficit de stock"}</span>
      <span class="value" style="color:${alcanza ? "var(--color-success)" : "var(--color-danger)"}">
        ${fmt(Math.abs(stockRestante))} unidades
      </span>
    </div>
    <div class="result-row">
      <span class="label">Cobertura del stock</span>
      <span class="value">${fmt(cobertura)}%</span>
    </div>
    <div class="result-row">
      <span class="label">Unidades por familia disponibles</span>
      <span class="value">${fmt(stock / familias)}</span>
    </div>

    <div class="progress-wrap">
      <div class="progress-label">
        <span>Stock disponible</span>
        <span>Nueva demanda</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${alertaClass(nivel)}"
             style="width:${Math.min(100, cobertura)}%"></div>
      </div>
    </div>

    <div class="alert-badge ${alertaClass(nivel)}">
      ${!alcanza
        ? `🔴 ¡El stock NO ALCANZA! Faltarán ${fmt(Math.abs(stockRestante))} unidades para cubrir la demanda.`
        : cobertura < 120
        ? `🟠 El stock barely alcanza (${fmt(cobertura)}% de cobertura). Situación frágil.`
        : `🟢 El stock alcanza para cubrir la nueva demanda (${fmt(cobertura)}% de cobertura).`}
    </div>
  `;

  document.getElementById("resultE").innerHTML = html;
}

/*ESCENARIO F — PODER ADQUISITIVO*/

/**
 * Calcula la pérdida del poder adquisitivo familiar.
 * Fórmulas:
 *   Aumento del gasto  = Gasto actual - Gasto anterior
 *   % Pérdida          = (Aumento / Ingreso) × 100
 *   Unidades antes     = Ingreso / Precio anterior
 *   Unidades ahora     = Ingreso / Precio actual
 */
function calcularPoderAdquisitivo() {
  const ingreso   = getNum("f-ingreso");
  const gastoAnt  = getNum("f-gasto-ant");
  const gastoAct  = getNum("f-gasto-act");
  const precioAnt = getNum("f-precio-ant");
  const precioAct = getNum("f-precio-act");

  if (ingreso <= 0 || gastoAnt <= 0 || gastoAct <= 0 || precioAnt <= 0 || precioAct <= 0) {
    mostrarError("resultF", "Completa todos los campos con valores válidos.");
    return;
  }

  const aumentoGasto   = gastoAct - gastoAnt;
  const saldoAnt       = ingreso - gastoAnt;
  const saldoAct       = ingreso - gastoAct;
  const pctPerdida     = ((aumentoGasto / ingreso) * 100);
  const unidadesAnt    = ingreso / precioAnt;
  const unidadesAct    = ingreso / precioAct;
  const unidadesPerd   = unidadesAnt - unidadesAct;
  const pctPerdidaUni  = ((unidadesPerd / unidadesAnt) * 100);

  // Nivel de afectación
  let afectacion, nivel;
  if (pctPerdida > 20)      { afectacion = "Crítica (>20%)";  nivel = "danger"; }
  else if (pctPerdida > 10) { afectacion = "Alta (10-20%)";   nivel = "warning"; }
  else if (pctPerdida > 5)  { afectacion = "Moderada (5-10%)"; nivel = "warning"; }
  else                       { afectacion = "Leve (<5%)";      nivel = "ok"; }

  const html = `
    <div class="result-title">📊 Resultados — Poder Adquisitivo</div>

    <div class="result-row">
      <span class="label">Ingreso familiar mensual</span>
      <span class="value">${fmt(ingreso)} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">Gasto anterior / actual</span>
      <span class="value">${fmt(gastoAnt)} → ${fmt(gastoAct)} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">Aumento del gasto mensual</span>
      <span class="value" style="color:var(--color-danger)">+${fmt(aumentoGasto)} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">Saldo libre anterior / actual</span>
      <span class="value">${fmt(saldoAnt)} → ${fmt(Math.max(0, saldoAct))} Bs</span>
    </div>
    <div class="result-row">
      <span class="label">Porcentaje del ingreso perdido en gasto</span>
      <span class="value" style="color:var(--color-danger)">${fmt(pctPerdida)}%</span>
    </div>

    <hr style="border-color:var(--color-border); margin:0.5rem 0;" />

    <div class="result-row">
      <span class="label">Unidades del producto básico (antes)</span>
      <span class="value">${fmt(unidadesAnt)}</span>
    </div>
    <div class="result-row">
      <span class="label">Unidades del producto básico (ahora)</span>
      <span class="value">${fmt(unidadesAct)}</span>
    </div>
    <div class="result-row">
      <span class="label">Unidades que ya no puede comprar</span>
      <span class="value" style="color:var(--color-danger)">-${fmt(unidadesPerd)}</span>
    </div>
    <div class="result-row">
      <span class="label">Pérdida del poder adquisitivo</span>
      <span class="value" style="color:var(--color-danger)">${fmt(pctPerdidaUni)}%</span>
    </div>
    <div class="result-row">
      <span class="label">Nivel de afectación familiar</span>
      <span class="value">${afectacion}</span>
    </div>

    <div class="alert-badge ${alertaClass(nivel)}">
      ${nivel === "danger"
        ? `🔴 Afectación CRÍTICA: la familia pierde más del 20% de su capacidad de compra.`
        : nivel === "warning"
        ? `🟠 Afectación SIGNIFICATIVA: pérdida de entre 5% y 20% del poder adquisitivo.`
        : `🟢 Afectación LEVE: pérdida menor al 5% del poder adquisitivo.`}
    </div>
  `;

  document.getElementById("resultF").innerHTML = html;
}

/*FUNCIÓN LIMPIAR SIMULADORES*/

/**
 * Limpia los campos y resultados de un simulador.
 * @param {string} sim - Identificador del simulador ("A"-"F").
 */
function limpiarSim(sim) {
  const ids = {
    A: ["a-reserva", "a-consumo", "a-reabastecimiento", "a-critico"],
    B: ["b-producto", "b-precio-ant", "b-precio-act", "b-cantidad", "b-semanas"],
    C: ["c-dist-normal", "c-dist-desvio", "c-costo-km", "c-viajes"],
    D: ["d-presupuesto", "d-item", "d-precio", "d-cant"],
    E: ["e-demanda-normal", "e-aumento", "e-stock", "e-familias"],
    F: ["f-ingreso", "f-gasto-ant", "f-gasto-act", "f-precio-ant", "f-precio-act"],
  };

  // Limpiar inputs
  (ids[sim] || []).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  // Limpiar listas
  if (sim === "B") { productosB = []; renderizarListaB(); }
  if (sim === "D") { itemsD = []; renderizarListaD(); }

  // Restaurar placeholder de resultados
  const resultEl = document.getElementById(`result${sim}`);
  if (resultEl) {
    resultEl.innerHTML = `
      <div class="result-placeholder">
        <span>📊</span>
        <p>Los resultados aparecerán aquí después de calcular.</p>
      </div>`;
  }
}

/*CARGAR CASOS DE ESTUDIO*/

/**
 * Carga datos de los casos de estudio predefinidos en el simulador correspondiente.
 * @param {string} caso - Identificador del caso ("A"-"E").
 */
function cargarCaso(caso) {
  switch (caso) {
    case "A":
      irASimulador("A");
      setTimeout(() => {
        document.getElementById("a-reserva").value         = "10000";
        document.getElementById("a-consumo").value         = "1200";
        document.getElementById("a-reabastecimiento").value = "300";
        document.getElementById("a-critico").value         = "2000";
        calcularCarburante();
      }, 400);
      break;

    case "B":
      irASimulador("B");
      setTimeout(() => {
        productosB = [
          { nombre: "Arroz",  precioAnt: 8,  precioAct: 11, cantidad: 10, semanas: 4 },
          { nombre: "Papa",   precioAnt: 7,  precioAct: 10, cantidad: 8,  semanas: 4 },
          { nombre: "Aceite", precioAnt: 12, precioAct: 18, cantidad: 4,  semanas: 4 },
        ];
        renderizarListaB();
        calcularPrecios();
      }, 400);
      break;

    case "C":
      irASimulador("C");
      setTimeout(() => {
        document.getElementById("c-dist-normal").value = "10";
        document.getElementById("c-dist-desvio").value = "16";
        document.getElementById("c-costo-km").value    = "2";
        document.getElementById("c-viajes").value      = "5";
        calcularTransporte();
      }, 400);
      break;

    case "D":
      irASimulador("D");
      setTimeout(() => {
        document.getElementById("d-presupuesto").value = "500";
        itemsD = [{ nombre: "Compra familiar", precio: 580, cant: 1 }];
        renderizarListaD();
        calcularPresupuesto();
      }, 400);
      break;

    case "E":
      irASimulador("E");
      setTimeout(() => {
        document.getElementById("e-demanda-normal").value = "100";
        document.getElementById("e-aumento").value        = "40";
        document.getElementById("e-stock").value          = "120";
        document.getElementById("e-familias").value       = "50";
        calcularEscasez();
      }, 400);
      break;

    default:
      console.warn("Caso de estudio no reconocido:", caso);
  }
}

/*INICIALIZACIÓN*/

/**
 * Inicialización al cargar la página.
 * Activa el primer tab y configura el header sticky.
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ SimulaCrisis Bolivia — Script cargado correctamente.");

  // Header con sombra al hacer scroll
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".site-header");
    if (window.scrollY > 20) {
      header.style.boxShadow = "0 4px 24px rgba(0,0,0,0.4)";
    } else {
      header.style.boxShadow = "none";
    }
  });
});
