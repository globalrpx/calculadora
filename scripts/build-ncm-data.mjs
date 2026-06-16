import fs from "node:fs";

const sourcePath = "data/ncm-oficial.json";
const targetPath = "public/data/ncm.json";

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const rows = source.Nomenclaturas ?? [];

const normalized = rows
  .filter((row) => String(row.Codigo ?? "").replace(/\D/g, "").length === 8)
  .map((row) => {
    const digits = String(row.Codigo).replace(/\D/g, "");
    return {
      code: `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`,
      description: String(row.Descricao ?? "").trim().replace(/\s+/g, " ")
    };
  })
  .sort((a, b) => a.code.localeCompare(b.code));

fs.writeFileSync(targetPath, JSON.stringify(normalized));
console.log(`Generated ${targetPath} with ${normalized.length} NCM codes.`);
