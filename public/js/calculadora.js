/* ============================================================
   Lunette — Calculadora de precios (herramienta interna)
   ============================================================ */

const CALC_HISTORY_KEY = 'lunette_calc_history_v1';

const CALC_DEFAULTS = {
  calcName: '',
  calcCost: 81.49,
  calcShip: 0,
  calcTax: 0,
  calcLocalShip: 25,
  calcPack: 5,
  calcLabor: 0,
  calcFeePct: 0,
  calcFeeFixed: 0,
  calcReserve: 8,
  calcMargin: 40,
  calcRounding: 'end9'
};

function calcMoney(value) {
  return 'Q' + (Number(value) || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function calcPct(value) {
  return (Number(value) || 0).toFixed(1).replace('.0', '') + '%';
}

function calcNum(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const value = parseFloat(el.value);
  return Number.isFinite(value) ? value : 0;
}

function calcRound(value, mode) {
  if (value <= 0) return 0;
  if (mode === 'none') return Math.round(value * 100) / 100;
  if (mode === 'end9') return Math.ceil((value + 1) / 10) * 10 - 1;
  if (mode === 'end99') return Math.ceil((value + 1) / 100) * 100 - 1;
  const step = parseFloat(mode) || 1;
  return Math.ceil(value / step) * step;
}

function calcReadInputs() {
  return {
    name: (document.getElementById('calcName')?.value || '').trim(),
    cost: calcNum('calcCost'),
    ship: calcNum('calcShip'),
    taxPct: calcNum('calcTax') / 100,
    localShip: calcNum('calcLocalShip'),
    pack: calcNum('calcPack'),
    labor: calcNum('calcLabor'),
    feePct: calcNum('calcFeePct') / 100,
    feeFixed: calcNum('calcFeeFixed'),
    reservePct: calcNum('calcReserve') / 100,
    marginPct: calcNum('calcMargin') / 100,
    rounding: document.getElementById('calcRounding')?.value || 'none'
  };
}

function calcCompute(input) {
  const tax = (input.cost + input.ship) * input.taxPct;
  const landed = input.cost + input.ship + tax + input.localShip + input.pack + input.labor;

  const percentCosts = input.feePct + input.reservePct + input.marginPct;
  const denom = 1 - percentCosts;
  const breakEvenDenom = 1 - input.feePct - input.reservePct;

  const breakEven = breakEvenDenom > 0
    ? (landed + input.feeFixed) / breakEvenDenom
    : null;

  if (denom <= 0) {
    return {
      tax,
      landed,
      breakEven,
      rawPrice: 0,
      price: 0,
      fee: 0,
      reserve: 0,
      profit: 0,
      realMargin: 0,
      invalid: true
    };
  }

  const rawPrice = (landed + input.feeFixed) / denom;
  const price = calcRound(rawPrice, input.rounding);
  const fee = price * input.feePct + input.feeFixed;
  const reserve = price * input.reservePct;
  const profit = price - landed - fee - reserve;
  const realMargin = price > 0 ? (profit / price) * 100 : 0;

  return {
    tax,
    landed,
    breakEven,
    rawPrice,
    price,
    fee,
    reserve,
    profit,
    realMargin,
    invalid: false
  };
}

function calcRenderBreakdown(input, result) {
  const host = document.getElementById('calcBreakdown');
  if (!host) return;

  const rows = [
    ['Costo del producto', input.cost],
    ['Envío internacional', input.ship],
    ['Impuestos / aduana', result.tax],
    ['Envío local', input.localShip],
    ['Empaque / otros', input.pack],
    ['Tu tiempo', input.labor]
  ];

  let html = rows.map(([label, value]) =>
    `<div class="calc-row"><span>${label}</span><strong>${calcMoney(value)}</strong></div>`
  ).join('');

  html += `<div class="calc-row calc-row-total"><span>Costo total</span><strong>${calcMoney(result.landed)}</strong></div>`;
  html += `<div class="calc-row"><span>Comisión de pago</span><strong>${calcMoney(result.fee)}</strong></div>`;
  html += `<div class="calc-row"><span>Reserva pérdidas</span><strong>${calcMoney(result.reserve)}</strong></div>`;

  host.innerHTML = html;
}

function calcRender() {
  const input = calcReadInputs();
  const result = calcCompute(input);

  const priceEl = document.getElementById('calcPrice');
  const priceRawEl = document.getElementById('calcPriceRaw');
  const profitEl = document.getElementById('calcProfit');
  const marginEl = document.getElementById('calcRealMargin');
  const profitBox = document.getElementById('calcProfitBox');
  const warningEl = document.getElementById('calcWarning');
  const breakEvenEl = document.getElementById('calcBreakEven');

  if (priceEl) priceEl.textContent = calcMoney(result.price);
  if (priceRawEl) {
    priceRawEl.textContent = result.invalid || !result.rawPrice
      ? ''
      : 'Sin redondear: ' + calcMoney(result.rawPrice);
  }

  calcRenderBreakdown(input, result);

  if (profitEl) profitEl.textContent = calcMoney(result.profit);
  if (marginEl) marginEl.textContent = result.invalid ? '—' : calcPct(result.realMargin);
  if (profitBox) profitBox.classList.toggle('is-negative', result.profit < 0);
  if (breakEvenEl) breakEvenEl.textContent = result.breakEven === null ? '—' : calcMoney(result.breakEven);

  if (warningEl) {
    if (result.invalid) {
      warningEl.hidden = false;
      warningEl.textContent = 'La suma de margen, comisión y reserva no puede llegar al 100%. Baja el margen o la reserva.';
    } else if (result.profit < 0) {
      warningEl.hidden = false;
      warningEl.textContent = 'Estás vendiendo por debajo del costo. Sube el precio o baja los costos.';
    } else {
      warningEl.hidden = true;
      warningEl.textContent = '';
    }
  }

  return { input, result };
}

function calcHistory() {
  try {
    const raw = localStorage.getItem(CALC_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function calcSaveHistory(history) {
  localStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(history));
}

function calcRenderHistory() {
  const body = document.getElementById('calcHistoryBody');
  const empty = document.getElementById('calcHistoryEmpty');
  const wrap = document.querySelector('.calc-history-table-wrap');
  if (!body) return;

  const history = calcHistory();

  if (!history.length) {
    body.innerHTML = '';
    if (empty) empty.hidden = false;
    if (wrap) wrap.hidden = true;
    return;
  }

  if (empty) empty.hidden = true;
  if (wrap) wrap.hidden = false;

  body.innerHTML = history.map(item => {
    const date = item.date ? new Date(item.date).toLocaleDateString('es-GT') : '—';
    const margin = Number(item.margin) || 0;
    return `
      <tr>
        <td>${item.name || 'Producto sin nombre'}</td>
        <td>${calcMoney(item.cost)}</td>
        <td><strong>${calcMoney(item.price)}</strong></td>
        <td style="color:${item.profit < 0 ? '#be185d' : '#15803d'};">${calcMoney(item.profit)}</td>
        <td>${calcPct(margin)}</td>
        <td>${date}</td>
        <td><button type="button" class="calc-del" data-calc-del="${item.id}" aria-label="Eliminar">✕</button></td>
      </tr>
    `;
  }).join('');
}

function calcSaveCurrent() {
  const { input, result } = calcRender();
  if (result.invalid || result.price <= 0) return;

  const history = calcHistory();
  history.unshift({
    id: Date.now().toString(36),
    name: input.name,
    cost: Math.round(result.landed * 100) / 100,
    price: Math.round(result.price * 100) / 100,
    profit: Math.round(result.profit * 100) / 100,
    margin: Math.round(result.realMargin * 10) / 10,
    date: new Date().toISOString()
  });

  calcSaveHistory(history.slice(0, 50));
  calcRenderHistory();
}

function calcReset() {
  Object.entries(CALC_DEFAULTS).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
  calcRender();
}

function calcBind() {
  const panel = document.querySelector('.calc-panel');
  if (panel) {
    panel.addEventListener('input', calcRender);
    panel.addEventListener('change', calcRender);
  }

  document.getElementById('calcSave')?.addEventListener('click', calcSaveCurrent);
  document.getElementById('calcReset')?.addEventListener('click', calcReset);

  document.getElementById('calcClearHistory')?.addEventListener('click', () => {
    if (window.confirm('¿Borrar todo el historial de cálculos?')) {
      calcSaveHistory([]);
      calcRenderHistory();
    }
  });

  document.getElementById('calcHistoryBody')?.addEventListener('click', event => {
    const btn = event.target.closest('[data-calc-del]');
    if (!btn) return;
    const id = btn.getAttribute('data-calc-del');
    calcSaveHistory(calcHistory().filter(item => item.id !== id));
    calcRenderHistory();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  calcBind();
  calcRender();
  calcRenderHistory();
});
