"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField, NumberInput, TextInput } from "@/components/ui/FormField";
import { calculateQuote, formatBrl, formatPercent, formatUsd, type QuoteInput, type QuoteResult } from "@/lib/calculator/calculate-quote";

type QuoteRecord = QuoteInput &
  QuoteResult & {
    id: string;
    createdAt: string;
    status: "submitted";
    images: string[];
    supplierContactImages: string[];
    supplierName?: string;
    supplierEmail?: string;
    supplierPhone?: string;
  };

type NcmOption = {
  code: string;
  description: string;
};

const initialInput: QuoteInput = {
  productName: "",
  hsCode: "",
  fobUnitUsd: 12,
  quantity: 1000,
  usedDollar: 0,
  rpxFactor: 1.8,
  directImportFactor: 2.2
};

export function CalculatorClient({ userEmail }: { userEmail: string }) {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [input, setInput] = useState<QuoteInput>(initialInput);
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [supplierContactImageNames, setSupplierContactImageNames] = useState<string[]>([]);
  const [calculatedResult, setCalculatedResult] = useState<QuoteResult | null>(null);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRecord | null>(null);
  const [ncmOptions, setNcmOptions] = useState<NcmOption[]>([]);
  const [selectedNcm, setSelectedNcm] = useState<NcmOption | null>(null);
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(false);

  const storageKey = `global-rpx-quotes:${userEmail}`;
  const ncmSuggestions = useMemo(() => {
    const query = input.hsCode.trim().toLowerCase();

    if (query.length < 2) {
      return [];
    }

    const normalizedQuery = query.replace(/\D/g, "");

    return ncmOptions
      .filter((option) => {
        const codeDigits = option.code.replace(/\D/g, "");
        return codeDigits.includes(normalizedQuery) || option.description.toLowerCase().includes(query);
      })
      .slice(0, 8);
  }, [input.hsCode, ncmOptions]);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    setQuotes(stored ? JSON.parse(stored) : []);
  }, [storageKey]);

  useEffect(() => {
    fetch("/data/ncm.json")
      .then((response) => response.json())
      .then((data: NcmOption[]) => setNcmOptions(data))
      .catch(() => setNcmOptions([]));
  }, []);

  function updateInput(key: keyof QuoteInput, value: string) {
    setInput((current) => ({
      ...current,
      [key]: key === "productName" || key === "hsCode" ? value : Number(value)
    }));

    if (key === "hsCode") {
      setSelectedNcm(null);
    }

    setCalculatedResult(null);
    setValidationMessage("");
  }

  function selectNcm(option: NcmOption) {
    setInput((current) => ({
      ...current,
      hsCode: option.code
    }));
    setSelectedNcm(option);
    setCalculatedResult(null);
    setValidationMessage("");
  }

  function updateSupplierField(
    setter: Dispatch<SetStateAction<string>>,
    value: string
  ) {
    setter(value);
    setCalculatedResult(null);
    setValidationMessage("");
  }

  function validateBeforeCalculation() {
    if (!input.productName.trim() || !input.hsCode.trim()) {
      return "Informe o nome do produto e o HS Code ou NCM sugerido.";
    }

    if (input.fobUnitUsd <= 0 || input.quantity <= 0) {
      return "Informe valores maiores que zero para FOB e quantidade.";
    }

    const hasSupplierDetails =
      supplierName.trim() && supplierEmail.trim() && supplierPhone.trim();
    const hasSupplierCard = supplierContactImageNames.length > 0;

    if (!hasSupplierDetails && !hasSupplierCard) {
      return "Informe nome, e-mail e telefone do fornecedor ou anexe uma foto do cartão de visitas.";
    }

    if (hasSupplierDetails && !/^\S+@\S+\.\S+$/.test(supplierEmail.trim())) {
      return "Informe um e-mail válido para o fornecedor.";
    }

    return "";
  }

  async function runCalculation() {
    const message = validateBeforeCalculation();

    if (message) {
      setCalculatedResult(null);
      setValidationMessage(message);
      return;
    }

    setValidationMessage("");
    setIsLoadingExchangeRate(true);

    try {
      const response = await fetch("/api/exchange-rate", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Exchange rate unavailable");
      }

      const data = (await response.json()) as { rate?: number };

      if (typeof data.rate !== "number" || data.rate <= 0) {
        throw new Error("Invalid exchange rate");
      }

      const calculationInput = { ...input, usedDollar: data.rate };
      setInput(calculationInput);
      setIsCollapsing(true);
      window.setTimeout(() => {
        setCalculatedResult(calculateQuote(calculationInput));
        setIsCollapsing(false);
      }, 180);
    } catch {
      setValidationMessage(
        "Não foi possível atualizar os parâmetros da cotação. Tente novamente em instantes."
      );
    } finally {
      setIsLoadingExchangeRate(false);
    }
  }

  function redoCalculation() {
    setIsCollapsing(true);
    window.setTimeout(() => {
      setCalculatedResult(null);
      setValidationMessage("");
      setIsCollapsing(false);
    }, 180);
  }

  function saveQuote() {
    if (!calculatedResult) {
      return;
    }

    const record: QuoteRecord = {
      ...input,
      ...calculatedResult,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "submitted",
      images: imageNames,
      supplierContactImages: supplierContactImageNames,
      supplierName: supplierName.trim(),
      supplierEmail: supplierEmail.trim(),
      supplierPhone: supplierPhone.trim()
    };
    const nextQuotes = [record, ...quotes];
    setQuotes(nextQuotes);
    window.localStorage.setItem(storageKey, JSON.stringify(nextQuotes));
    setSelectedQuote(record);
    setActiveTab("history");
  }

  function duplicateQuote(quote: QuoteRecord) {
    setInput({
      productName: quote.productName,
      hsCode: quote.hsCode,
      fobUnitUsd: quote.fobUnitUsd,
      quantity: quote.quantity,
      usedDollar: quote.usedDollar,
      rpxFactor: quote.rpxFactor,
      directImportFactor: quote.directImportFactor
    });
    setImageNames(quote.images);
    setSupplierContactImageNames(quote.supplierContactImages ?? []);
    setSupplierName(quote.supplierName ?? "");
    setSupplierEmail(quote.supplierEmail ?? "");
    setSupplierPhone(quote.supplierPhone ?? "");
    setCalculatedResult(null);
    setValidationMessage("");
    setActiveTab("new");
  }

  function copyQuote(quote: QuoteRecord) {
    const summary = [
      `Produto: ${quote.productName}`,
      `HS/NCM: ${quote.hsCode}`,
      `FOB unitário: ${formatUsd(quote.fobUnitUsd)}`,
      `Quantidade: ${quote.quantity}`,
      `FOB total: ${formatUsd(quote.fobTotalUsd)}`,
      `Fornecedor: ${quote.supplierName || "Cartão de visitas anexado"}`,
      quote.supplierEmail ? `E-mail do fornecedor: ${quote.supplierEmail}` : "",
      quote.supplierPhone ? `Telefone do fornecedor: ${quote.supplierPhone}` : "",
      "",
      `Custo estimado unitário via RPX: ${formatBrl(quote.unitCostRpxBrl)}`,
      `Custo estimado total via RPX: ${formatBrl(quote.totalCostRpxBrl)}`,
      `Valor importação direta: ${formatBrl(quote.totalCostDirectBrl)}`,
      `Valor fazendo via RPX: ${formatBrl(quote.totalCostRpxBrl)}`,
      `Diferença estimada fazendo via RPX: ${formatBrl(quote.savingsBrl)} (${formatPercent(quote.savingsPercent)})`,
      "",
      "Estimativa preliminar sujeita à validação fiscal, logística e operacional."
    ].join("\n");

    navigator.clipboard.writeText(summary);
  }

  const columns: DataTableColumn<QuoteRecord>[] = [
    {
      key: "createdAt",
      header: "Data",
      render: (quote) => new Date(quote.createdAt).toLocaleDateString("pt-BR")
    },
    { key: "productName", header: "Produto" },
    { key: "hsCode", header: "HS/NCM" },
    {
      key: "fobTotalUsd",
      header: "FOB total",
      render: (quote) => formatUsd(quote.fobTotalUsd)
    },
    {
      key: "totalCostRpxBrl",
      header: "Via RPX",
      render: (quote) => formatBrl(quote.totalCostRpxBrl)
    },
    {
      key: "savingsBrl",
      header: "Economia",
      render: (quote) => formatBrl(quote.savingsBrl)
    },
    {
      key: "actions",
      header: "Ações",
      render: (quote) => (
        <div className="flex flex-wrap gap-2">
          <button className="font-semibold text-rpx-blue" onClick={() => setSelectedQuote(quote)}>
            Abrir
          </button>
          <button className="font-semibold text-rpx-blue" onClick={() => duplicateQuote(quote)}>
            Duplicar
          </button>
          <button className="font-semibold text-rpx-blue" onClick={() => copyQuote(quote)}>
            Copiar
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-soft">
        {[
          ["new", "Nova cotação"],
          ["history", "Histórico"]
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as "new" | "history")}
            className={`min-h-10 rounded-md px-4 text-sm font-bold transition ${
              activeTab === key ? "bg-rpx-blue text-white" : "text-slate-600 hover:bg-rpx-sky hover:text-rpx-blue"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "new" ? (
        <div className="grid min-w-0 gap-6">
          {!calculatedResult ? (
            <section className={`${isCollapsing ? "rpx-slide-up" : "rpx-slide-down"} rounded-lg border border-slate-200 bg-white p-5 shadow-soft`}>
              <div className="mb-5 border-b border-slate-200 pb-4">
                <p className="text-xs font-bold uppercase text-rpx-red">Etapa 1</p>
                <h2 className="mt-1 text-xl font-bold text-rpx-ink">Produto e fornecedor</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Nome do produto">
                <TextInput value={input.productName} onChange={(event) => updateInput("productName", event.target.value)} placeholder="Ex: Garrafa térmica inox" />
              </FormField>
              <FormField label="HS Code ou NCM sugerido" help="Classificação preliminar, sujeita a validação fiscal.">
                <TextInput value={input.hsCode} onChange={(event) => updateInput("hsCode", event.target.value)} placeholder="Ex: 9617.00.10" />
                {ncmSuggestions.length > 0 ? (
                  <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
                    {ncmSuggestions.map((option) => (
                      <button
                        key={option.code}
                        className="block w-full border-b border-slate-100 px-3 py-3 text-left text-sm last:border-b-0 hover:bg-rpx-sky"
                        onClick={() => selectNcm(option)}
                        type="button"
                      >
                        <span className="font-bold text-rpx-blue">{option.code}</span>
                        <span className="ml-2 text-slate-600">{option.description}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {selectedNcm ? (
                  <div className="rounded-md bg-rpx-sky px-3 py-2 text-xs leading-5 text-rpx-blue">
                    {selectedNcm.description}
                  </div>
                ) : null}
              </FormField>
              <FormField label="FOB unitário em dólar">
                <NumberInput value={input.fobUnitUsd} onChange={(event) => updateInput("fobUnitUsd", event.target.value)} />
              </FormField>
              <FormField label="Quantidade">
                <NumberInput step="1" value={input.quantity} onChange={(event) => updateInput("quantity", event.target.value)} />
              </FormField>
              <FormField label="Nome do fornecedor">
                <TextInput
                  value={supplierName}
                  onChange={(event) => updateSupplierField(setSupplierName, event.target.value)}
                  placeholder="Ex: Shenzhen ABC Trading"
                />
              </FormField>
              <FormField label="E-mail do fornecedor">
                <TextInput
                  type="email"
                  value={supplierEmail}
                  onChange={(event) => updateSupplierField(setSupplierEmail, event.target.value)}
                  placeholder="contato@fornecedor.com"
                />
              </FormField>
              <FormField label="Telefone do fornecedor">
                <TextInput
                  type="tel"
                  value={supplierPhone}
                  onChange={(event) => updateSupplierField(setSupplierPhone, event.target.value)}
                  placeholder="+86 138 0000 0000"
                />
              </FormField>
              <FormField label="Imagens do produto" help="Você pode selecionar até 5 imagens para compor a cotação.">
                <input
                  className="w-full min-w-0 text-sm text-slate-600 file:mr-3 file:min-h-10 file:rounded-md file:border-0 file:bg-rpx-sky file:px-3 file:text-sm file:font-bold file:text-rpx-blue"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={(event) => {
                    setImageNames(Array.from(event.target.files ?? []).slice(0, 5).map((file) => file.name));
                    setCalculatedResult(null);
                  }}
                />
              </FormField>
              <FormField
                label="Foto do cartão ou contato do fornecedor"
                help="Anexe o cartão de visita, anotação ou outra referência de contato recebida do fornecedor."
              >
                <input
                  className="w-full min-w-0 text-sm text-slate-600 file:mr-3 file:min-h-10 file:rounded-md file:border-0 file:bg-rpx-sky file:px-3 file:text-sm file:font-bold file:text-rpx-blue"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={(event) => {
                    setSupplierContactImageNames(
                      Array.from(event.target.files ?? [])
                        .slice(0, 3)
                        .map((file) => file.name)
                    );
                    setCalculatedResult(null);
                    setValidationMessage("");
                  }}
                />
              </FormField>
              </div>
              {imageNames.length > 0 || supplierContactImageNames.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                {imageNames.map((name) => (
                  <span key={name} className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                    Produto: {name}
                  </span>
                ))}
                {supplierContactImageNames.map((name) => (
                  <span key={name} className="rounded-md bg-rpx-sky px-3 py-2 text-xs font-semibold text-rpx-blue">
                    Fornecedor: {name}
                  </span>
                ))}
                </div>
              ) : null}
              <div className="mt-6 rounded-md border border-rpx-blue/15 bg-rpx-sky p-4 text-sm leading-6 text-rpx-blue">
                Para identificar o fornecedor, preencha nome, e-mail e telefone ou anexe uma foto do cartão de visitas.
              </div>
              {validationMessage ? (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {validationMessage}
                </div>
              ) : null}
              <div className="mt-5 flex justify-end">
              <Button type="button" onClick={runCalculation} disabled={isCollapsing || isLoadingExchangeRate}>
                {isLoadingExchangeRate ? "Atualizando cotação..." : "Fazer cálculo"}
                </Button>
              </div>
            </section>
          ) : null}

          {calculatedResult ? (
            <section className={`${isCollapsing ? "rpx-slide-up" : "rpx-slide-down"} grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft`}>
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase text-rpx-red">Etapa 2</p>
                  <h2 className="mt-1 text-xl font-bold text-rpx-ink">Resultado da cotação</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={redoCalculation}>
                    Refazer cálculo
                  </Button>
                  <Button onClick={saveQuote}>Salvar cotação</Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                  <p className="text-xs font-bold uppercase text-slate-500">Estimativa com a RPX</p>
                  <p className="mt-3 text-2xl font-black text-rpx-ink">
                    {formatBrl(calculatedResult.totalCostRpxBrl)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Custo unitário estimado: {formatBrl(calculatedResult.unitCostRpxBrl)}
                  </p>
                </section>
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                  <p className="text-xs font-bold uppercase text-slate-500">Referência de importação direta</p>
                  <p className="mt-3 text-2xl font-black text-rpx-ink">
                    {formatBrl(calculatedResult.totalCostDirectBrl)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Custo unitário estimado: {formatBrl(calculatedResult.unitCostDirectBrl)}
                  </p>
                </section>
                <section
                  className={`rounded-lg border p-5 ${
                    calculatedResult.savingsBrl > 0
                      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                      : "border-slate-200 bg-white text-rpx-ink"
                  }`}
                >
                  <h2 className={`text-xs font-bold uppercase ${calculatedResult.savingsBrl > 0 ? "text-emerald-700" : "text-slate-500"}`}>
                    Diferença estimada com a RPX
                  </h2>
                  <p className="mt-3 text-2xl font-black">{formatBrl(calculatedResult.savingsBrl)}</p>
                  <p className={`mt-2 text-sm leading-6 ${calculatedResult.savingsBrl > 0 ? "text-emerald-800" : "text-slate-600"}`}>
                    {calculatedResult.savingsBrl > 0
                      ? `Economia estimada de ${formatPercent(calculatedResult.savingsPercent)} em relação à referência direta.`
                      : "Resultado neutro. Validar condições comerciais antes de apresentar benefício."}
                  </p>
                </section>
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                  <p className="text-xs font-bold uppercase text-slate-500">Valor FOB informado</p>
                  <p className="mt-3 text-2xl font-black text-rpx-ink">
                    {formatUsd(calculatedResult.fobTotalUsd)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Base utilizada para esta estimativa preliminar.</p>
                </section>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                Estimativa preliminar sujeita à validação fiscal, logística e operacional.
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <section className="grid gap-5">
          {quotes.length === 0 ? (
            <EmptyState title="Nenhuma cotação salva para este usuário" description="Salve uma cotação para ver o histórico separado por cliente." />
          ) : (
            <DataTable columns={columns} rows={quotes} />
          )}
          {selectedQuote ? (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="text-xl font-bold text-rpx-ink">Detalhe da cotação</h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <p>
                  <b>Produto:</b> {selectedQuote.productName}
                </p>
                <p>
                  <b>HS/NCM:</b> {selectedQuote.hsCode}
                </p>
                <p>
                  <b>FOB unitário:</b> {formatUsd(selectedQuote.fobUnitUsd)}
                </p>
                <p>
                  <b>Quantidade:</b> {selectedQuote.quantity}
                </p>
                <p>
                  <b>Valor fazendo via RPX:</b> {formatBrl(selectedQuote.totalCostRpxBrl)}
                </p>
                <p>
                  <b>Valor importação direta:</b> {formatBrl(selectedQuote.totalCostDirectBrl)}
                </p>
                <p>
                  <b>Diferença via RPX:</b> {formatBrl(selectedQuote.savingsBrl)} ({formatPercent(selectedQuote.savingsPercent)})
                </p>
                <p>
                  <b>Imagens do produto:</b> {selectedQuote.images.length ? selectedQuote.images.join(", ") : "Nenhuma"}
                </p>
                <p>
                  <b>Contato do fornecedor:</b>{" "}
                  {selectedQuote.supplierContactImages?.length ? selectedQuote.supplierContactImages.join(", ") : "Nenhum"}
                </p>
                <p>
                  <b>Fornecedor:</b> {selectedQuote.supplierName || "Identificado por cartão anexado"}
                </p>
                <p>
                  <b>E-mail:</b> {selectedQuote.supplierEmail || "-"}
                </p>
                <p>
                  <b>Telefone:</b> {selectedQuote.supplierPhone || "-"}
                </p>
              </div>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
