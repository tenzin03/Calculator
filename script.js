const display = document.getElementById("display");
const history = document.getElementById("history");

let expression = "";
let justCalculated = false;

function pretty(expr) {
  return expr.replace(/\*/g, "×").replace(/\//g, "÷").replace(/-/g, "−");
}

function render() {
  display.textContent = expression || "0";
}

function add(value) {
  if (justCalculated && /[0-9.]/.test(value)) {
    expression = "";
    history.textContent = "";
  }
  justCalculated = false;

  if (value === ".") {
    const current = expression.split(/[+\-*/]/).pop();
    if (current.includes(".")) return;
    if (!current) value = "0.";
  }

  expression += value;
  render();
}

function clearAll() {
  expression = "";
  history.textContent = "";
  justCalculated = false;
  render();
}

function toggleSign() {
  if (!expression) return;
  const match = expression.match(/(^|[+\-*/])(\d*\.?\d+)$/);
  if (!match) return;
  const start = match[1];
  const number = match[2];
  expression = expression.slice(0, expression.length - number.length);
  expression += number.startsWith("-") ? number.slice(1) : `(-${number})`;
  render();
}

function percent() {
  const match = expression.match(/(\d*\.?\d+)$/);
  if (!match) return;
  const n = parseFloat(match[1]) / 100;
  expression = expression.slice(0, expression.length - match[1].length) + n;
  render();
}

function calculate() {
  if (!expression) return;
  try {
    // Calculator input is restricted to digits/operators/decimal/parentheses.
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) throw new Error();
    const result = Function(`"use strict"; return (${expression})`)();
    if (!Number.isFinite(result)) throw new Error();

    history.textContent = pretty(expression) + " =";
    expression = String(Number(result.toPrecision(12)));
    justCalculated = true;
    render();
  } catch {
    display.textContent = "Error";
    expression = "";
    justCalculated = true;
  }
}

document.querySelector(".keys").addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const { value, action } = button.dataset;
  if (value !== undefined) add(value);
  if (action === "clear") clearAll();
  if (action === "sign") toggleSign();
  if (action === "percent") percent();
  if (action === "calculate") calculate();
});

document.addEventListener("keydown", (e) => {
  if (/^[0-9.]$/.test(e.key)) add(e.key);
  else if ("+-*/".includes(e.key)) add(e.key);
  else if (e.key === "Enter" || e.key === "=") calculate();
  else if (e.key === "Escape") clearAll();
  else if (e.key === "%") percent();
  else if (e.key === "Backspace") {
    expression = expression.slice(0, -1);
    render();
  }
});
