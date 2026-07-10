export const finalSimulationStatusValues = [
  "draft",
  "in_review",
  "needs_adjustment",
  "approved",
  "sent_to_customer",
  "archived"
] as const;

export type FinalSimulationStatus = (typeof finalSimulationStatusValues)[number];

export const editableFinalSimulationStatusValues = ["draft", "in_review", "needs_adjustment"] as const;

export type EditableFinalSimulationStatus = (typeof editableFinalSimulationStatusValues)[number];

export const finalSimulationImportModalityValues = ["propria", "conta_e_ordem", "encomenda"] as const;

export type FinalSimulationImportModality = (typeof finalSimulationImportModalityValues)[number];

export const finalSimulationTransportModeValues = ["maritimo", "aereo", "rodoviario"] as const;

export type FinalSimulationTransportMode = (typeof finalSimulationTransportModeValues)[number];

export const expenseModalityValues = ["tax", "expense", "calculation_base"] as const;

export type ExpenseModality = (typeof expenseModalityValues)[number];

export const expenseAllocationTypeValues = ["value", "net_weight", "cif", "gross_weight"] as const;

export type ExpenseAllocationType = (typeof expenseAllocationTypeValues)[number];

export const expenseCalculationTypeValues = ["parameters", "fob", "freight", "insurance", "cif", "ii", "ipi", "icms"] as const;

export type ExpenseCalculationType = (typeof expenseCalculationTypeValues)[number];

export const expenseBehaviorValues = [
  "accessory_expense",
  "tax_base",
  "icms_base",
  "not_applicable",
  "product_cost_only",
  "icms_base_courier_fine",
  "ipi_base"
] as const;

export type ExpenseBehavior = (typeof expenseBehaviorValues)[number];

export const expensePresetTransportModeValues = finalSimulationTransportModeValues;

export type ExpensePresetTransportMode = (typeof expensePresetTransportModeValues)[number];

export type FinalSimulationRow = {
  id: string;
  code: string | null;
  number: number | null;
  status: FinalSimulationStatus;
  customer_id: string | null;
  customer_name: string | null;
  supplier_id: string | null;
  supplier_name: string | null;
  branch_id: string | null;
  branch_name: string | null;
  created_by: string | null;
  updated_by: string | null;
  assigned_to: string | null;
  approved_by: string | null;
  approved_at: string | null;
  reopened_by: string | null;
  reopened_at: string | null;
  reopen_reason: string | null;
  quote_date: string | null;
  valid_until: string | null;
  operation_type: string | null;
  import_modality: FinalSimulationImportModality | null;
  goods_application: string | null;
  transport_mode: FinalSimulationTransportMode | null;
  origin: string | null;
  destination: string | null;
  final_destination: string | null;
  destination_state: string | null;
  destination_city: string | null;
  country: string | null;
  packaging: string | null;
  transit_time: string | null;
  requires_import_license: boolean;
  notes: string | null;
  incoterm: string | null;
  currency: string | null;
  exchange_rate: number;
  exchange_rate_source: string | null;
  exchange_rate_date: string | null;
  freight_rate: number;
  dollar_parity: number;
  total_products_usd: number;
  international_freight_usd: number;
  international_insurance_usd: number;
  customs_value_usd: number;
  customs_value_brl: number;
  total_taxes_brl: number;
  total_expenses_brl: number;
  total_cost_brl: number;
  total_cost_per_unit_brl: number;
  gross_weight: number;
  net_weight: number;
  volume_cbm: number;
  container_20_qty: number;
  container_40_qty: number;
  container_lcl_qty: number;
  container_other_qty: number;
  container_load_type: string | null;
  has_national_freight: boolean;
  national_freight_brl: number;
  calculation_snapshot: Record<string, unknown>;
  public_snapshot: Record<string, unknown>;
  internal_snapshot: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type FinalSimulationListRow = Pick<
  FinalSimulationRow,
  | "id"
  | "code"
  | "number"
  | "status"
  | "customer_id"
  | "customer_name"
  | "supplier_name"
  | "quote_date"
  | "origin"
  | "destination"
  | "import_modality"
  | "valid_until"
  | "total_products_usd"
  | "total_cost_brl"
  | "created_at"
  | "updated_at"
>;

export type FinalSimulationItemRow = {
  id: string;
  simulation_id: string;
  product_name: string | null;
  product_description: string;
  hs_code: string | null;
  ncm: string;
  ncm_official_description: string | null;
  ncm_source: string | null;
  ncm_source_updated_at: string | null;
  ncm_tax_snapshot: Record<string, unknown>;
  ncm_validated: boolean;
  ncm_validated_by: string | null;
  ncm_validated_at: string | null;
  ncm_validation_notes: string | null;
  ii_rate: number;
  ipi_rate: number;
  pis_rate: number;
  cofins_rate: number;
  icms_rate: number;
  internal_consumption: boolean;
  fiscal_exception: string | null;
  reduced_base_rate: number;
  unit: string | null;
  quantity: number;
  unit_price: number;
  currency: string | null;
  total_price: number;
  unit_net_weight: number;
  unit_gross_weight: number;
  total_net_weight: number;
  total_gross_weight: number;
  fob_total: number;
  cif_total: number;
  allocated_expenses_total: number;
  taxes_total: number;
  unit_cost_without_taxes_brl: number;
  unit_cost_with_taxes_brl: number;
  unit_cost_without_taxes_usd: number;
  unit_cost_with_taxes_usd: number;
  total_cost: number;
  antidumping_calculation_type: string | null;
  antidumping_factor: number;
  antidumping_amount: number;
  antidumping_snapshot: Record<string, unknown>;
  special_regime: string | null;
  special_regime_snapshot: Record<string, unknown>;
  purchase_order_id: string | null;
  purchase_order_item_id: string | null;
  purchase_order_snapshot: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type NcmCodeRow = {
  id: string;
  code: string;
  description: string;
  hierarchical_description: string | null;
  legal_act: string | null;
  source: string | null;
  source_updated_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type NcmTaxProfileRow = {
  id: string;
  ncm_code: string;
  country_code: string | null;
  operation_type: string | null;
  effective_date: string | null;
  ii_rate: number;
  ipi_rate: number;
  pis_rate: number;
  cofins_rate: number;
  icms_rate: number;
  antidumping_info: Record<string, unknown>;
  ex_tariff_info: Record<string, unknown>;
  legal_basis_snapshot: Record<string, unknown>;
  source: string | null;
  source_updated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FinalSimulationMainDataValues = {
  simulationId?: string;
  customerId?: string;
  customerName?: string;
  supplierName?: string;
  branchName?: string;
  quoteDate?: string;
  validUntil?: string;
  operationType?: string;
  importModality?: string;
  goodsApplication?: string;
  transportMode?: string;
  origin?: string;
  destination?: string;
  finalDestination?: string;
  destinationState?: string;
  destinationCity?: string;
  country?: string;
  packaging?: string;
  transitTime?: string;
  requiresImportLicense?: boolean;
  notes?: string;
  incoterm?: string;
  currency?: string;
  exchangeRate?: number;
};

export type FinalSimulationItemValues = {
  itemId?: string;
  simulationId: string;
  productName?: string;
  productDescription: string;
  hsCode?: string;
  ncm: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  currency?: string;
  unitNetWeight: number;
  unitGrossWeight: number;
  iiRate?: number;
  ipiRate?: number;
  pisRate?: number;
  cofinsRate?: number;
  internalConsumption?: boolean;
  fiscalException?: string;
  reducedBaseRate?: number;
};

export type FinalSimulationActionState<TValues = Record<string, unknown>> = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof TValues | "form", string>>;
  values?: Partial<TValues>;
  id?: string;
};

export type FinalSimulationListFilters = {
  status?: string;
  customer?: string;
  code?: string;
  number?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type FinalSimulationPagination = {
  page?: number;
  perPage?: number;
};

export type FinalSimulationClientOption = {
  id: string;
  label: string;
};

export type ExpenseType = {
  id: string;
  code: string | null;
  description: string;
  key: string | null;
  print_order: number;
  expense_modality: ExpenseModality;
  expense_modality_label: string | null;
  allocation_type: ExpenseAllocationType;
  allocation_type_label: string | null;
  expense_calculation_type: ExpenseCalculationType;
  expense_calculation_label: string | null;
  own_import_behavior: ExpenseBehavior;
  own_import_behavior_label: string | null;
  order_account_behavior: ExpenseBehavior;
  order_account_behavior_label: string | null;
  encomenda_behavior: ExpenseBehavior;
  encomenda_behavior_label: string | null;
  expense_resulting: string | null;
  siscomex_addition_id: string | null;
  expense_group_id: string | null;
  expense_group_name: string | null;
  considers_container: boolean;
  considers_icms_entry_invoice: boolean;
  composes_service_invoice: boolean;
  title_type_id: string | null;
  title_type_name: string | null;
  service_id: string | null;
  service_name: string | null;
  bank_account_id: string | null;
  bank_account_name: string | null;
  erp_key: string | null;
  paid_by_cash_own_import: boolean;
  paid_by_cash_encomenda: boolean;
  paid_by_cash_order_account: boolean;
  paid_by_cash_direct_export: boolean;
  paid_by_cash_indirect_export: boolean;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpensePreset = {
  id: string;
  name: string;
  description: string | null;
  transport_mode: ExpensePresetTransportMode;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpensePresetItem = {
  id: string;
  preset_id: string;
  expense_type_id: string;
  expense_code_snapshot: string | null;
  expense_description_snapshot: string | null;
  default_amount_brl: number;
  default_amount_usd: number;
  default_currency: string | null;
  override_calculation_type: ExpenseCalculationType | null;
  override_allocation_type: ExpenseAllocationType | null;
  override_behavior: ExpenseBehavior | null;
  is_editable: boolean;
  sort_order: number;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpenseTypeValues = {
  expenseTypeId?: string;
  code?: string;
  description: string;
  key?: string;
  printOrder?: number;
  expenseModality?: string;
  expenseModalityLabel?: string;
  allocationType?: string;
  allocationTypeLabel?: string;
  expenseCalculationType?: string;
  expenseCalculationLabel?: string;
  ownImportBehavior?: string;
  ownImportBehaviorLabel?: string;
  orderAccountBehavior?: string;
  orderAccountBehaviorLabel?: string;
  encomendaBehavior?: string;
  encomendaBehaviorLabel?: string;
  expenseResulting?: string;
  siscomexAdditionId?: string;
  expenseGroupId?: string;
  expenseGroupName?: string;
  considersContainer?: boolean;
  considersIcmsEntryInvoice?: boolean;
  composesServiceInvoice?: boolean;
  titleTypeId?: string;
  titleTypeName?: string;
  serviceId?: string;
  serviceName?: string;
  bankAccountId?: string;
  bankAccountName?: string;
  erpKey?: string;
  paidByCashOwnImport?: boolean;
  paidByCashEncomenda?: boolean;
  paidByCashOrderAccount?: boolean;
  paidByCashDirectExport?: boolean;
  paidByCashIndirectExport?: boolean;
  isActive?: boolean;
};

export type ExpensePresetValues = {
  expensePresetId?: string;
  name: string;
  description?: string;
  transportMode?: string;
  isActive?: boolean;
};

export type ExpensePresetItemValues = {
  expensePresetItemId?: string;
  presetId: string;
  expenseTypeId: string;
  defaultAmountBrl?: number;
  defaultAmountUsd?: number;
  defaultCurrency?: string;
  overrideCalculationType?: string;
  overrideAllocationType?: string;
  overrideBehavior?: string;
  isEditable?: boolean;
  sortOrder?: number;
  notes?: string;
};
