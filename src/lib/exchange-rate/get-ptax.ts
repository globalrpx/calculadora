const INTERNAL_EXCHANGE_RATE_FACTOR = 1.03;

type PtaxResponse = {
  value?: Array<{
    cotacaoVenda?: number;
    dataHoraCotacao?: string;
  }>;
};

function formatPtaxDate(date: Date) {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month}-${day}-${date.getUTCFullYear()}`;
}

export type ExchangeRate = {
  rate: number;
  quotedAt: string;
};

export async function getCurrentExchangeRate(): Promise<ExchangeRate> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 10);

  const url =
    "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/" +
    "CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)" +
    `?@dataInicial='${formatPtaxDate(startDate)}'` +
    `&@dataFinalCotacao='${formatPtaxDate(endDate)}'` +
    "&$top=1&$orderby=dataHoraCotacao%20desc" +
    "&$format=json&$select=cotacaoVenda,dataHoraCotacao";

  const response = await fetch(url, {
    cache: "no-store",
    headers: { accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`PTAX request failed with status ${response.status}`);
  }

  const data = (await response.json()) as PtaxResponse;
  const latestQuote = data.value?.[0];

  if (
    !latestQuote ||
    typeof latestQuote.cotacaoVenda !== "number" ||
    !latestQuote.dataHoraCotacao
  ) {
    throw new Error("PTAX response did not include a valid selling rate");
  }

  return {
    rate: latestQuote.cotacaoVenda * INTERNAL_EXCHANGE_RATE_FACTOR,
    quotedAt: latestQuote.dataHoraCotacao
  };
}
