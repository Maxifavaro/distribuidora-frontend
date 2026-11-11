const parse = (value) => {
  const number = Number(String(value ?? '').trim().replace(',', '.'));
  return value === '' || value === null || value === undefined || !Number.isFinite(number) ? null : number;
};

const format = (value, decimals) => (value === null || !Number.isFinite(value) ? '' : String(Number(value.toFixed(decimals))));

// Misma fórmula que el backend (BackEnd/src/products-calc.js); el servidor recalcula al guardar.
export function derivePrices({ costo, compraPack, unidadesPack, modo, valor, alicuota }) {
  const cost = parse(costo);
  const units = compraPack ? parse(unidadesPack) : 1;
  const price = parse(valor);
  const empty = { costoUnit: '', margen: '', neto: '', final: '', netoPack: '', finalPack: '' };
  if (!cost || cost <= 0 || !units || units < 1 || price === null || alicuota === null) return empty;

  const unitCost = cost / units;
  const vat = 1 + alicuota;
  let net;
  if (modo === 'margen') net = unitCost * (1 + price / 100);
  else if (modo === 'neto') net = price;
  else if (modo === 'netoPack') net = price / units;
  else if (modo === 'final') net = price / vat;
  else net = price / units / vat;

  return {
    costoUnit: format(unitCost, 3),
    margen: format((net / unitCost - 1) * 100, 2),
    neto: format(net, 3),
    final: format(net * vat, 3),
    netoPack: format(net * units, 3),
    finalPack: format(net * vat * units, 2)
  };
}

export const percentLabel = (alicuota) => `${Number((alicuota * 100).toFixed(2)).toString().replace('.', ',')} %`;
