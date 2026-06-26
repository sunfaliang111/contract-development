import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "/Users/sunfaliang/Downloads/DB設計 1.xlsx";
const outputDir = "../outputs/db_design_review";
await fs.mkdir(outputDir, { recursive: true });

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const summary = await workbook.inspect({
  kind: "workbook,sheet,table,region",
  maxChars: 20000,
  tableMaxRows: 30,
  tableMaxCols: 20,
  tableMaxCellChars: 120,
});
await fs.writeFile(`${outputDir}/inspect.ndjson`, summary.ndjson, "utf8");

const sheets = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 12000 });
await fs.writeFile(`${outputDir}/sheets.ndjson`, sheets.ndjson, "utf8");

for (const line of sheets.ndjson.trim().split("\n")) {
  if (!line.trim()) continue;
  const obj = JSON.parse(line);
  const name = obj.name;
  if (!name) continue;
  try {
    const region = await workbook.inspect({
      kind: "region",
      sheetId: name,
      range: "A1:Z80",
      maxChars: 24000,
      tableMaxRows: 80,
      tableMaxCols: 26,
      tableMaxCellChars: 150,
    });
    await fs.writeFile(`${outputDir}/region_${name.replace(/[\\/:*?"<>|]/g, "_")}.ndjson`, region.ndjson, "utf8");
    const styles = await workbook.inspect({
      kind: "computedStyle",
      sheetId: name,
      range: "A1:Z20",
      maxChars: 12000,
    });
    await fs.writeFile(`${outputDir}/styles_${name.replace(/[\\/:*?"<>|]/g, "_")}.ndjson`, styles.ndjson, "utf8");
    const preview = await workbook.render({ sheetName: name, autoCrop: "all", scale: 1, format: "png" });
    await fs.writeFile(`${outputDir}/preview_${name.replace(/[\\/:*?"<>|]/g, "_")}.png`, new Uint8Array(await preview.arrayBuffer()));
  } catch (err) {
    await fs.writeFile(`${outputDir}/error_${name.replace(/[\\/:*?"<>|]/g, "_")}.txt`, String(err?.stack || err), "utf8");
  }
}
