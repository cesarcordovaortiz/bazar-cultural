import { readFile, writeFile } from 'node:fs/promises';

const sourceUrl = 'https://www.bcb.gob.bo/librerias/indicadores/dolar/bolsin.php';
const outputPath = new URL('../public/exchange-rate.json', import.meta.url);

function toPlainText(html) {
  return html
    .replace(/&nbsp;/gi, ' ')
    .replace(/&oacute;/gi, 'ó')
    .replace(/&aacute;/gi, 'á')
    .replace(/&eacute;/gi, 'é')
    .replace(/&iacute;/gi, 'í')
    .replace(/&uacute;/gi, 'ú')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseBcbNumber(value) {
  const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
  return Number(normalized);
}

function findDate(text, expression) {
  const match = text.match(expression);
  return match?.[1]?.trim();
}

const response = await fetch(sourceUrl, { headers: { 'User-Agent': 'Bazar-Cultural exchange-rate sync' } });
if (!response.ok) throw new Error(`BCB respondió ${response.status}`);

const text = toPlainText(await response.text());
const rateText = text.match(/Bs\s*([\d.,]+)\s*por\s*1\s*US\$/i)?.[1];
const rate = rateText ? parseBcbNumber(rateText) : Number.NaN;
if (!Number.isFinite(rate) || rate <= 0) throw new Error('No se pudo interpretar el tipo de cambio oficial publicado por el BCB.');

const publishedDate = findDate(text, /FECHA:\s*(\d{1,2}\s+de\s+[A-Za-záéíóú]+\s+\d{4})/i);
const effectiveDate = findDate(text, /vigente\s+desde\s+el\s*(\d{1,2}\s+de\s+[A-Za-záéíóú]+\s+\d{4})/i);

const rateData = {
  schemaVersion: 1,
  baseCurrency: 'USD',
  quoteCurrency: 'BOB',
  rate,
  unit: 'BOB por USD',
  publishedDate: publishedDate ?? null,
  effectiveDate: effectiveDate ?? null,
  source: {
    name: 'Banco Central de Bolivia — Tipo de Cambio Oficial del dólar estadounidense',
    url: sourceUrl,
  },
  retrievedAt: new Date().toISOString(),
};

let currentData = null;
try {
  currentData = JSON.parse(await readFile(outputPath, 'utf8'));
} catch {
  // The initial data file is created below.
}

const hasChanged = !currentData
  || currentData.rate !== rateData.rate
  || currentData.effectiveDate !== rateData.effectiveDate
  || currentData.publishedDate !== rateData.publishedDate;

if (hasChanged) {
  await writeFile(outputPath, `${JSON.stringify(rateData, null, 2)}\n`, 'utf8');
  console.log(`Tipo de cambio actualizado: 1 USD = Bs ${rateData.rate}.`);
} else {
  console.log(`Sin cambios: 1 USD = Bs ${rateData.rate}.`);
}
