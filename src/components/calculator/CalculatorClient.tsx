"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField, NumberInput, TextInput } from "@/components/ui/FormField";
import {
  duplicateClientQuoteAction,
  requestFullSimulationAction,
  saveClientQuoteAction
} from "@/lib/actions/client-quotes";
import { calculateQuote, formatBrl, formatPercent, formatUsd, type QuoteInput, type QuoteResult } from "@/lib/calculator/calculate-quote";
import type { ClientQuoteRecord } from "@/lib/client/types";

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

export function CalculatorClient({
  initialQuotes
}: {
  initialQuotes: ClientQuoteRecord[];
}) {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [input, setInput] = useState<QuoteInput>(initialInput);
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [supplierContactImageNames, setSupplierContactImageNames] = useState<string[]>([]);
  const [calculatedResult, setCalculatedResult] = useState<QuoteResult | null>(null);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [fullSimulationModalOpen, setFullSimulationModalOpen] = useState(false);
  const [simulationModalMessage, setSimulationModalMessage] = useState(
    "O time da Global RPX vai entrar em contato para explicar como funciona a simulação completa, validar as informações da cotação e orientar os próximos passos."
  );
  const [isRequestingSimulation, setIsRequestingSimulation] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [quotes, setQuotes] = useState<ClientQuoteRecord[]>(initialQuotes);
  const [detailQuote, setDetailQuote] = useState<ClientQuoteRecord | null>(null);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [ncmOptions, setNcmOptions] = useState<NcmOption[]>([]);
  const [selectedNcm, setSelectedNcm] = useState<NcmOption | null>(null);
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(false);

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
      const result = calculateQuote(calculationInput);
      const savedQuote = await saveClientQuoteAction({
        ...calculationInput,
        ...result,
        id: editingQuoteId ?? undefined,
        images: imageNames,
        supplierContactImages: supplierContactImageNames,
        supplierName: supplierName.trim(),
        supplierEmail: supplierEmail.trim(),
        supplierPhone: supplierPhone.trim()
      });

      setQuotes((currentQuotes) => {
        const withoutSaved = currentQuotes.filter((quote) => quote.id !== savedQuote.id);
        return [savedQuote, ...withoutSaved];
      });
      setEditingQuoteId(savedQuote.id);
      setCalculatedResult(result);
    } catch {
      setValidationMessage(
        "Não foi possível salvar ou atualizar os parâmetros da cotação. Tente novamente em instantes."
      );
    } finally {
      setIsCollapsing(false);
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

  function cancelQuoteEditing() {
    setInput(initialInput);
    setSupplierName("");
    setSupplierEmail("");
    setSupplierPhone("");
    setImageNames([]);
    setSupplierContactImageNames([]);
    setCalculatedResult(null);
    setEditingQuoteId(null);
    setSelectedNcm(null);
    setValidationMessage("");
    setActiveTab("history");
  }

  function loadQuoteToForm(quote: ClientQuoteRecord, quoteId: string | null) {
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
    setEditingQuoteId(quoteId);
    setValidationMessage("");
    setActiveTab("new");
  }

  async function duplicateQuote(quote: ClientQuoteRecord) {
    try {
      const duplicatedQuote = await duplicateClientQuoteAction(quote.id);
      setQuotes((currentQuotes) => [duplicatedQuote, ...currentQuotes]);
      loadQuoteToForm(duplicatedQuote, duplicatedQuote.id);
    } catch {
      setValidationMessage("Não foi possível duplicar a cotação. Tente novamente em instantes.");
    }
  }

  async function requestFullSimulation() {
    if (!editingQuoteId) {
      setSimulationModalMessage("Faça o cálculo e salve a cotação antes de solicitar a simulação completa.");
      setFullSimulationModalOpen(true);
      return;
    }

    setIsRequestingSimulation(true);

    try {
      const response = await requestFullSimulationAction(editingQuoteId);
      const message = response.alreadyExists
        ? "Já existe uma solicitação de simulação completa em andamento para esta cotação. O time da Global RPX entrará em contato assim que avançar na análise."
        : "Solicitação recebida. O time da Global RPX vai entrar em contato para explicar como funciona a simulação completa, validar as informações da cotação e orientar os próximos passos.";

      setSimulationModalMessage(message);
      setQuotes((currentQuotes) =>
        currentQuotes.map((quote) =>
          quote.id === editingQuoteId
            ? {
                ...quote,
                status: "simulation_requested",
                hasSimulationRequest: true
              }
            : quote
        )
      );
      setFullSimulationModalOpen(true);
    } catch {
      setSimulationModalMessage("Não foi possível solicitar a simulação completa agora. Tente novamente em instantes.");
      setFullSimulationModalOpen(true);
    } finally {
      setIsRequestingSimulation(false);
    }
  }

  const columns: DataTableColumn<ClientQuoteRecord>[] = [
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
          <button className="font-semibold text-rpx-blue" onClick={() => setDetailQuote(quote)}>
            Abrir
          </button>
          <button className="font-semibold text-rpx-blue" onClick={() => loadQuoteToForm(quote, quote.id)}>
            Refazer
          </button>
          <button className="font-semibold text-rpx-blue" onClick={() => duplicateQuote(quote)}>
            Duplicar
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
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                {editingQuoteId ? (
                  <Button type="button" variant="secondary" onClick={cancelQuoteEditing}>
                    Cancelar
                  </Button>
                ) : null}
                <Button type="button" onClick={runCalculation} disabled={isCollapsing || isLoadingExchangeRate}>
                  {isLoadingExchangeRate ? "Atualizando cotação..." : "Fazer cálculo"}
                </Button>
              </div>
            </section>
          ) : null}

          {calculatedResult ? (
            <section className={`${isCollapsing ? "rpx-slide-up" : "rpx-slide-down"} grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft`}>
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-rpx-red">Resultado da cotação</p>
                  <p className="mt-1 max-w-3xl break-words text-base font-semibold leading-6 text-rpx-ink">
                    Produto: {input.productName.trim()} - NCM: {input.hsCode.trim()} - Qtde: {input.quantity}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                  <Button type="button" variant="secondary" onClick={redoCalculation}>
                    Refazer cálculo
                  </Button>
                  <Button type="button" onClick={requestFullSimulation} disabled={isRequestingSimulation}>
                    {isRequestingSimulation ? "Solicitando..." : "Solicitar simulação completa"}
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                  <p className="text-xs font-bold uppercase text-slate-500">Estimativa com a RPX</p>
                  <p className="mt-3 text-2xl font-black text-rpx-blue">
                    {formatBrl(calculatedResult.totalCostRpxBrl)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Custo unitário estimado: {formatBrl(calculatedResult.unitCostRpxBrl)}
                  </p>
                </section>
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                  <p className="text-xs font-bold uppercase text-slate-500">Referência de importação direta</p>
                  <p className="mt-3 text-2xl font-black text-orange-600">
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
              {fullSimulationModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
                  <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                    <p className="text-xs font-bold uppercase text-rpx-red">Simulação completa</p>
                    <h2 className="mt-2 text-xl font-bold text-rpx-ink">Nosso time vai entrar em contato</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {simulationModalMessage}
                    </p>
                    <div className="mt-5 flex justify-end">
                      <Button type="button" onClick={() => setFullSimulationModalOpen(false)}>
                        Entendi
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
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
          {detailQuote ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
              <div className="max-h-full w-full max-w-5xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-rpx-red">Detalhe da cotação</p>
                    <p className="mt-1 max-w-3xl break-words text-base font-semibold leading-6 text-rpx-ink">
                      Produto: {detailQuote.productName} - NCM: {detailQuote.hsCode} - Qtde: {detailQuote.quantity}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Criada em {new Date(detailQuote.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setDetailQuote(null);
                        loadQuoteToForm(detailQuote, detailQuote.id);
                      }}
                    >
                      Refazer cálculo
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setDetailQuote(null)}>
                      Fechar
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                    <p className="text-xs font-bold uppercase text-slate-500">Estimativa com a RPX</p>
                    <p className="mt-3 text-2xl font-black text-rpx-blue">
                      {formatBrl(detailQuote.totalCostRpxBrl)}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Custo unitário estimado: {formatBrl(detailQuote.unitCostRpxBrl)}
                    </p>
                  </section>
                  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                    <p className="text-xs font-bold uppercase text-slate-500">Referência de importação direta</p>
                    <p className="mt-3 text-2xl font-black text-orange-600">
                      {formatBrl(detailQuote.totalCostDirectBrl)}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Custo unitário estimado: {formatBrl(detailQuote.unitCostDirectBrl)}
                    </p>
                  </section>
                  <section
                    className={`rounded-lg border p-5 ${
                      detailQuote.savingsBrl > 0
                        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                        : "border-slate-200 bg-white text-rpx-ink"
                    }`}
                  >
                    <p className={`text-xs font-bold uppercase ${detailQuote.savingsBrl > 0 ? "text-emerald-700" : "text-slate-500"}`}>
                      Diferença estimada com a RPX
                    </p>
                    <p className="mt-3 text-2xl font-black">{formatBrl(detailQuote.savingsBrl)}</p>
                    <p className={`mt-2 text-sm leading-6 ${detailQuote.savingsBrl > 0 ? "text-emerald-800" : "text-slate-600"}`}>
                      {detailQuote.savingsBrl > 0
                        ? `Economia estimada de ${formatPercent(detailQuote.savingsPercent)} em relação à referência direta.`
                        : "Resultado neutro. Validar condições comerciais antes de apresentar benefício."}
                    </p>
                  </section>
                  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                    <p className="text-xs font-bold uppercase text-slate-500">Valor FOB informado</p>
                    <p className="mt-3 text-2xl font-black text-rpx-ink">
                      {formatUsd(detailQuote.fobTotalUsd)}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      FOB unitário: {formatUsd(detailQuote.fobUnitUsd)}
                    </p>
                  </section>
                </div>

                <div className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-2">
                  <p>
                    <b className="text-rpx-ink">Fornecedor:</b> {detailQuote.supplierName || "Identificado por cartão anexado"}
                  </p>
                  <p>
                    <b className="text-rpx-ink">E-mail:</b> {detailQuote.supplierEmail || "-"}
                  </p>
                  <p>
                    <b className="text-rpx-ink">Telefone:</b> {detailQuote.supplierPhone || "-"}
                  </p>
                  <p>
                    <b className="text-rpx-ink">Imagens do produto:</b> {detailQuote.images.length ? detailQuote.images.join(", ") : "Nenhuma"}
                  </p>
                  <p className="md:col-span-2">
                    <b className="text-rpx-ink">Contato do fornecedor:</b>{" "}
                    {detailQuote.supplierContactImages?.length ? detailQuote.supplierContactImages.join(", ") : "Nenhum"}
                  </p>
                </div>

                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  Estimativa preliminar sujeita à validação fiscal, logística e operacional.
                </div>
              </div>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
