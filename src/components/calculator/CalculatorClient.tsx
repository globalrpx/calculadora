"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import imageCompression from "browser-image-compression";
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
import { uploadClientQuoteFile } from "@/lib/uploads/actions";

type NcmOption = {
  code: string;
  description: string;
};

type QuoteUploadDraft = {
  id: string;
  file: File;
  originalName: string;
  displayName: string;
  sizeBytes: number;
};

type QuoteUploadKind = "product" | "supplier";

const maxQuoteUploadFiles = 5;
const maxQuoteUploadFileSizeBytes = 6 * 1024 * 1024;
const quoteUploadAllowedExtensions = new Set(["pdf", "jpg", "jpeg", "png", "webp", "gif"]);
const quoteUploadDangerousExtensions = new Set(["exe", "bat", "cmd", "sh", "js", "php", "html", "htm", "svg", "msi", "scr", "zip", "doc", "docx", "xls", "xlsx"]);
const quoteUploadAllowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"]);

const productSearchStopWords = new Set([
  "com",
  "das",
  "dos",
  "para",
  "por",
  "sem",
  "uma",
  "uns",
  "produto",
  "produtos",
  "item",
  "itens",
  "kit",
  "peca",
  "pecas",
  "unidade",
  "unidades"
]);

const initialInput: QuoteInput = {
  productName: "",
  hsCode: "",
  fobUnitUsd: 12,
  quantity: 1000,
  usedDollar: 0,
  rpxFactor: 1.8,
  directImportFactor: 2.2
};

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getProductSearchTerms(value: string) {
  return normalizeSearchText(value)
    .split(/\s+/)
    .filter((term) => term.length >= 3 && !productSearchStopWords.has(term));
}

function isGenericNcmOption(option: NcmOption) {
  const description = normalizeSearchText(option.description);
  return /\boutros?\b/.test(description);
}

function formatFileSize(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : "";
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function validateQuoteUploadFile(file: File) {
  const extension = getFileExtension(file.name);
  const mimeType = file.type.trim().toLowerCase();

  if (!extension || !quoteUploadAllowedExtensions.has(extension) || quoteUploadDangerousExtensions.has(extension)) {
    return "Tipo de arquivo não permitido. Envie imagem ou PDF.";
  }

  if (mimeType && !quoteUploadAllowedMimeTypes.has(mimeType)) {
    return "Tipo de arquivo não permitido. Envie imagem ou PDF.";
  }

  if (file.size > maxQuoteUploadFileSizeBytes) {
    return "Cada arquivo deve ter no máximo 6MB.";
  }

  return "";
}

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
  const [productFiles, setProductFiles] = useState<QuoteUploadDraft[]>([]);
  const [supplierContactFiles, setSupplierContactFiles] = useState<QuoteUploadDraft[]>([]);
  const [calculatedResult, setCalculatedResult] = useState<QuoteResult | null>(null);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [fullSimulationModalOpen, setFullSimulationModalOpen] = useState(false);
  const [simulationModalMessage, setSimulationModalMessage] = useState(
    "O time da Global RPX vai entrar em contato para explicar como funciona a simulação completa, validar as informações da cotação e orientar os próximos passos."
  );
  const [isRequestingSimulation, setIsRequestingSimulation] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [uploadStatusMessage, setUploadStatusMessage] = useState("");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [submissionStep, setSubmissionStep] = useState("");
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

  const productNcmSuggestions = useMemo(() => {
    const query = normalizeSearchText(input.productName);
    const terms = getProductSearchTerms(input.productName);

    if (query.length < 3 || terms.length === 0) {
      return [];
    }

    const scoredSuggestions = ncmOptions
      .map((option) => {
        const description = normalizeSearchText(option.description);
        const matchedTerms = terms.filter((term) => description.includes(term));
        const hasExactPhrase = query.length >= 5 && description.includes(query);
        const generic = isGenericNcmOption(option);
        const firstMatchIndex = matchedTerms.length > 0
          ? Math.min(...matchedTerms.map((term) => description.indexOf(term)))
          : -1;
        const earlyMatchScore = firstMatchIndex >= 0
          ? Math.max(0, 20 - Math.floor(firstMatchIndex / 4))
          : 0;

        return {
          option,
          score:
            matchedTerms.length * 10 +
            earlyMatchScore +
            (hasExactPhrase ? 30 : 0) +
            (generic ? 1 : 0)
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.option.code.localeCompare(b.option.code);
      });

    if (scoredSuggestions.length > 0) {
      return scoredSuggestions.slice(0, 5).map((item) => item.option);
    }

    return ncmOptions.filter(isGenericNcmOption).slice(0, 5);
  }, [input.productName, ncmOptions]);

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

    if (key === "productName") {
      setSelectedNcm(null);
    }

    setCalculatedResult(null);
    setValidationMessage("");
  }

  function selectNcm(option: NcmOption, options: { updateProductName?: boolean } = {}) {
    setInput((current) => ({
      ...current,
      productName: options.updateProductName ? option.description : current.productName,
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

  async function prepareQuoteUploadFile(file: File): Promise<QuoteUploadDraft> {
    const initialError = validateQuoteUploadFile(file);

    if (initialError) {
      throw new Error(initialError);
    }

    let finalFile = file;

    if (isImageFile(file)) {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 4.5,
          maxWidthOrHeight: 2400,
          initialQuality: 0.85,
          useWebWorker: true,
          preserveExif: false,
          fileType: file.type
        });
        finalFile = new File([compressedFile], file.name, {
          type: file.type,
          lastModified: file.lastModified
        });
      } catch {
        throw new Error("Não foi possível comprimir a imagem. Tente outra imagem ou reduza o arquivo.");
      }
    }

    const finalError = validateQuoteUploadFile(finalFile);

    if (finalError) {
      throw new Error(finalError);
    }

    return {
      id: crypto.randomUUID(),
      file: finalFile,
      originalName: file.name,
      displayName: finalFile.name || file.name,
      sizeBytes: finalFile.size
    };
  }

  async function handleQuoteUploadSelection(files: FileList | null, kind: QuoteUploadKind) {
    if (!files?.length) {
      return;
    }

    const currentFiles = kind === "product" ? productFiles : supplierContactFiles;
    const availableSlots = maxQuoteUploadFiles - currentFiles.length;

    if (availableSlots <= 0) {
      setValidationMessage("Você pode selecionar até 5 arquivos.");
      return;
    }

    const selectedFiles = Array.from(files);

    if (selectedFiles.length > availableSlots) {
      setValidationMessage("Você pode selecionar até 5 arquivos.");
    } else {
      setValidationMessage("");
    }

    try {
      const preparedFiles: QuoteUploadDraft[] = [];

      for (const file of selectedFiles.slice(0, availableSlots)) {
        preparedFiles.push(await prepareQuoteUploadFile(file));
      }

      if (kind === "product") {
        setProductFiles((current) => [...current, ...preparedFiles]);
      } else {
        setSupplierContactFiles((current) => [...current, ...preparedFiles]);
      }

      setCalculatedResult(null);
    } catch (error) {
      setValidationMessage(error instanceof Error ? error.message : "Tipo de arquivo não permitido. Envie imagem ou PDF.");
    }
  }

  function removeQuoteUploadFile(kind: QuoteUploadKind, fileId: string) {
    if (kind === "product") {
      setProductFiles((current) => current.filter((file) => file.id !== fileId));
    } else {
      setSupplierContactFiles((current) => current.filter((file) => file.id !== fileId));
    }

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
    const hasSupplierCard = supplierContactFiles.length > 0;

    if (!hasSupplierDetails && !hasSupplierCard) {
      return "Informe nome, e-mail e telefone do fornecedor ou anexe ao menos uma foto/cartão de contato do fornecedor.";
    }

    if (hasSupplierDetails && !/^\S+@\S+\.\S+$/.test(supplierEmail.trim())) {
      return "Informe um e-mail válido para o fornecedor.";
    }

    return "";
  }

  async function runCalculation() {
    if (isSubmittingQuote) {
      return;
    }

    const message = validateBeforeCalculation();

    if (message) {
      setCalculatedResult(null);
      setValidationMessage(message);
      return;
    }

    setValidationMessage("");
    setUploadStatusMessage("");
    setSubmissionStep("Atualizando parâmetros...");
    setIsLoadingExchangeRate(true);
    setIsSubmittingQuote(true);

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
      setSubmissionStep("Criando cotação...");
      const savedQuote = await saveClientQuoteAction({
        ...calculationInput,
        ...calculateQuote(calculationInput),
        id: editingQuoteId ?? undefined,
        images: [],
        supplierContactImages: [],
        supplierName: supplierName.trim(),
        supplierEmail: supplierEmail.trim(),
        supplierPhone: supplierPhone.trim()
      });

      const filesToUpload = [
        ...productFiles.map((file) => ({ ...file, context: "quote_product_images" as const })),
        ...supplierContactFiles.map((file) => ({ ...file, context: "quote_supplier_contact" as const }))
      ];
      const failedUploads: string[] = [];

      if (filesToUpload.length > 0) {
        setSubmissionStep("Enviando arquivos...");
        setUploadStatusMessage("Enviando arquivos...");
      }

      for (const upload of filesToUpload) {
        const uploadResult = await uploadClientQuoteFile(savedQuote.id, upload.file, upload.context);

        if (!uploadResult.success) {
          failedUploads.push(`${upload.originalName} (${uploadResult.message})`);
        }
      }

      setQuotes((currentQuotes) => {
        const withoutSaved = currentQuotes.filter((quote) => quote.id !== savedQuote.id);
        return [savedQuote, ...withoutSaved];
      });
      setEditingQuoteId(savedQuote.id);
      setInput((currentInput) => ({
        ...currentInput,
        usedDollar: savedQuote.usedDollar,
        rpxFactor: savedQuote.rpxFactor,
        directImportFactor: savedQuote.directImportFactor
      }));
      setCalculatedResult({
        fobTotalUsd: savedQuote.fobTotalUsd,
        unitCostRpxBrl: savedQuote.unitCostRpxBrl,
        totalCostRpxBrl: savedQuote.totalCostRpxBrl,
        unitCostDirectBrl: savedQuote.unitCostDirectBrl,
        totalCostDirectBrl: savedQuote.totalCostDirectBrl,
        savingsBrl: savedQuote.savingsBrl,
        savingsPercent: savedQuote.savingsPercent
      });

      if (failedUploads.length > 0) {
        setUploadStatusMessage(
          `Cotação criada, mas alguns arquivos não foram enviados: ${failedUploads.join(", ")}.`
        );
      } else if (filesToUpload.length > 0) {
        setUploadStatusMessage("Cotação criada e arquivos enviados com sucesso.");
      }
    } catch {
      setValidationMessage(
        "Não foi possível salvar ou atualizar os parâmetros da cotação. Tente novamente em instantes."
      );
    } finally {
      setIsCollapsing(false);
      setIsLoadingExchangeRate(false);
      setIsSubmittingQuote(false);
      setSubmissionStep("");
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

  function resetQuoteForm(nextTab: "new" | "history" = "new") {
    setInput(initialInput);
    setSupplierName("");
    setSupplierEmail("");
    setSupplierPhone("");
    setProductFiles([]);
    setSupplierContactFiles([]);
    setCalculatedResult(null);
    setEditingQuoteId(null);
    setSelectedNcm(null);
    setValidationMessage("");
    setUploadStatusMessage("");
    setSubmissionStep("");
    setIsCollapsing(false);
    setFullSimulationModalOpen(false);
    setActiveTab(nextTab);
  }

  function cancelQuoteEditing() {
    resetQuoteForm("history");
  }

  function handleTabChange(nextTab: "new" | "history") {
    if (nextTab === "new") {
      resetQuoteForm("new");
      return;
    }

    setActiveTab(nextTab);
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
    setProductFiles([]);
    setSupplierContactFiles([]);
    setSupplierName(quote.supplierName ?? "");
    setSupplierEmail(quote.supplierEmail ?? "");
    setSupplierPhone(quote.supplierPhone ?? "");
    setCalculatedResult(null);
    setEditingQuoteId(quoteId);
    setValidationMessage("");
    setUploadStatusMessage("");
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
            onClick={() => handleTabChange(key as "new" | "history")}
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
                {productNcmSuggestions.length > 0 && !selectedNcm ? (
                  <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
                    <div className="border-b border-slate-100 bg-rpx-sky px-3 py-2 text-xs font-semibold text-rpx-blue">
                      Sugestões preliminares de NCM
                    </div>
                    {productNcmSuggestions.map((option) => (
                      <button
                        key={`product-${option.code}`}
                        className="block w-full border-b border-slate-100 px-3 py-3 text-left text-sm last:border-b-0 hover:bg-rpx-sky"
                        onClick={() => selectNcm(option, { updateProductName: true })}
                        type="button"
                      >
                        <span className="font-bold text-rpx-blue">{option.code}</span>
                        <span className="ml-2 text-slate-600">{option.description}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
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
              <FormField label="Imagens do produto" help="Você pode selecionar até 5 imagens ou PDFs para compor a cotação. Imagens serão otimizadas antes do envio.">
                <input
                  className="w-full min-w-0 text-sm text-slate-600 file:mr-3 file:min-h-10 file:rounded-md file:border-0 file:bg-rpx-sky file:px-3 file:text-sm file:font-bold file:text-rpx-blue"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                  multiple
                  onChange={(event) => {
                    void handleQuoteUploadSelection(event.target.files, "product");
                    event.target.value = "";
                  }}
                />
                {productFiles.length > 0 ? (
                  <ul className="mt-3 grid gap-2">
                    {productFiles.map((file) => (
                      <li key={file.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                        <span className="min-w-0 truncate font-semibold text-slate-700" title={file.originalName}>
                          {file.originalName} · {formatFileSize(file.sizeBytes)}
                        </span>
                        <button
                          type="button"
                          className="shrink-0 font-semibold text-red-600 hover:text-red-700"
                          onClick={() => removeQuoteUploadFile("product", file.id)}
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </FormField>
              <FormField
                label="Foto do cartão ou contato do fornecedor"
                help="Anexe cartão de visita, foto do estande ou outra referência de contato do fornecedor. Até 5 arquivos."
              >
                <input
                  className="w-full min-w-0 text-sm text-slate-600 file:mr-3 file:min-h-10 file:rounded-md file:border-0 file:bg-rpx-sky file:px-3 file:text-sm file:font-bold file:text-rpx-blue"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                  multiple
                  onChange={(event) => {
                    void handleQuoteUploadSelection(event.target.files, "supplier");
                    event.target.value = "";
                  }}
                />
                {supplierContactFiles.length > 0 ? (
                  <ul className="mt-3 grid gap-2">
                    {supplierContactFiles.map((file) => (
                      <li key={file.id} className="flex items-center justify-between gap-3 rounded-md border border-rpx-blue/15 bg-rpx-sky px-3 py-2 text-xs">
                        <span className="min-w-0 truncate font-semibold text-rpx-blue" title={file.originalName}>
                          {file.originalName} · {formatFileSize(file.sizeBytes)}
                        </span>
                        <button
                          type="button"
                          className="shrink-0 font-semibold text-red-600 hover:text-red-700"
                          onClick={() => removeQuoteUploadFile("supplier", file.id)}
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </FormField>
              </div>
              {productFiles.length > 0 || supplierContactFiles.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                {productFiles.map((file) => (
                  <span key={file.id} className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                    Produto: {file.originalName}
                  </span>
                ))}
                {supplierContactFiles.map((file) => (
                  <span key={file.id} className="rounded-md bg-rpx-sky px-3 py-2 text-xs font-semibold text-rpx-blue">
                    Fornecedor: {file.originalName}
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
              {uploadStatusMessage ? (
                <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {uploadStatusMessage}
                </div>
              ) : null}
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                {editingQuoteId ? (
                  <Button type="button" variant="secondary" onClick={cancelQuoteEditing}>
                    Cancelar
                  </Button>
                ) : null}
                <Button type="button" onClick={runCalculation} disabled={isCollapsing || isLoadingExchangeRate || isSubmittingQuote}>
                  {isSubmittingQuote
                    ? uploadStatusMessage === "Enviando arquivos..."
                      ? "Enviando arquivos..."
                      : "Criando cotação..."
                    : isLoadingExchangeRate
                      ? "Atualizando cotação..."
                      : "Fazer cálculo"}
                </Button>
              </div>
            </section>
          ) : null}

          {!calculatedResult && isSubmittingQuote ? (
            <section className="rounded-lg border border-rpx-blue/15 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-rpx-blue/20 border-t-rpx-blue" />
                <div>
                  <p className="text-sm font-bold text-rpx-ink">{submissionStep || "Processando cotação..."}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Aguarde enquanto salvamos a cotação e preparamos os arquivos.
                  </p>
                </div>
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
              {uploadStatusMessage ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {uploadStatusMessage}
                </div>
              ) : null}
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
