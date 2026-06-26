import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "../outputs/db_design_review";
const outputPath = `${outputDir}/DB設計_改良版.xlsx`;
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();

const cols = [
  "No",
  "属性名",
  "属性名（日本語）",
  "型",
  "長さ",
  "小数",
  "必須",
  "Default",
  "コメント",
  "主キー",
  "一意",
  "採番",
  "説明",
];

const idxCols = ["No", "名称", "キー属性名", "タイプ", "参照スキーマ名", "参照テーブル名", "参照属性名", "説明"];

const audit = [
  ["registered_at", "登録日時", "datetime", "", "", "Y", "CURRENT_TIMESTAMP", "", "", "", "", "システム登録日時"],
  ["registered_by", "登録者", "varchar", "128", "", "Y", "", "", "", "", "", "登録ユーザーID/名"],
  ["updated_at", "更新日時", "datetime", "", "", "Y", "CURRENT_TIMESTAMP", "", "", "", "", "システム更新日時"],
  ["updated_by", "更新者", "varchar", "128", "", "Y", "", "", "", "", "", "更新ユーザーID/名"],
];

const def = (no, name, jp, type, len = "", scale = "", req = "", defVal = "", comment = "", pk = "", uniq = "", auto = "", desc = "") =>
  [no, name, jp, type, len, scale, req, defVal, comment, pk, uniq, auto, desc];

const tables = [
  {
    name: "m_customers",
    alias: "取引先情報",
    notes: "取引先は契約前でも案件候補に紐づくため、案件側 customer_id は NULL 許可。",
    fields: [
      def(1, "company_id", "取引先ID", "varchar", "36", "", "Y", "", "", "○", "", "○", "UUID等"),
      def(2, "company_name", "取引先企業名", "varchar", "256", "", "Y"),
      def(3, "company_name_kana", "取引先企業名かな", "varchar", "256"),
      def(4, "representative_name", "法人代表", "varchar", "128"),
      def(5, "postal_code", "郵便番号", "varchar", "8", "", "", "", "ハイフンあり想定"),
      def(6, "address", "住所", "varchar", "256"),
      def(7, "building_name", "ビル名", "varchar", "256"),
      def(8, "phone_number", "電話番号", "varchar", "24"),
      def(9, "fax_number", "FAX番号", "varchar", "24"),
      def(10, "invoice_no", "適格請求書発行事業者登録番号", "varchar", "14", "", "", "", "T + 13桁"),
      def(11, "site_url", "会社URL", "varchar", "512"),
      def(12, "proposal_category_code", "提案区分コード", "varchar", "32", "", "Y", "", "m_codes.code_type='PROPOSAL_CATEGORY'"),
      def(13, "importance_code", "重要度コード", "varchar", "32", "", "", "", "m_codes.code_type='IMPORTANCE'"),
      def(14, "scheduled_contract_start_date", "契約開始予定日", "date"),
      def(15, "contract_conclusion_date", "契約日", "date"),
      def(16, "scheduled_contract_end_date", "契約終了予定日", "date"),
      def(17, "contract_end_date", "契約終了日", "date"),
      def(18, "primary_sales", "自社営業担当（主担当）", "varchar", "128", "", "Y"),
      def(19, "secondary_sales", "自社営業担当（副担当）", "varchar", "128"),
      def(20, "remarks", "備考", "varchar", "4000"),
      ...audit.map((r, i) => def(21 + i, ...r)),
    ],
    indexes: [
      [1, "pk_m_customers", "company_id", "PK", "dbo", "m_customers", "", "主キー"],
      [2, "idx_m_customers_company_name", "company_name", "IDX", "dbo", "m_customers", "", "取引先名検索用"],
      [3, "uk_m_customers_invoice_no", "invoice_no", "UK", "dbo", "m_customers", "", "登録番号重複防止（NULLは許可）"],
    ],
  },
  {
    name: "m_projects",
    alias: "案件情報",
    notes: "職種は複数選択のため t_project_job_categories に分離。商流は m_codes 参照。",
    fields: [
      def(1, "project_id", "案件ID", "varchar", "36", "", "Y", "", "", "○", "", "○", "UUID等"),
      def(2, "project_name", "案件名", "varchar", "256", "", "Y"),
      def(3, "project_overview", "案件概要", "varchar", "4000", "", "Y"),
      def(4, "project_detail", "案件詳細", "varchar", "8000"),
      def(5, "skills", "必要スキル", "varchar", "4000"),
      def(6, "age_from", "年齢From", "number", "2"),
      def(7, "age_to", "年齢To", "number", "2"),
      def(8, "foreign_acceptance_code", "外国籍可否コード", "varchar", "32", "", "", "ACCEPTABLE", "m_codes.code_type='FOREIGN_ACCEPTANCE'"),
      def(9, "billing_rate", "請求単価", "number", "", "0"),
      def(10, "unit_payment_price", "支払単価", "number", "", "0"),
      def(11, "number_of_interviews", "面談回数", "number", "1", "", "", "1"),
      def(12, "commercial_flow_code", "商流コード", "varchar", "32", "", "Y", "", "m_codes.code_type='COMMERCIAL_FLOW'"),
      def(13, "station", "最寄駅", "varchar", "128"),
      def(14, "begin_date", "期間From", "date", "", "", "Y"),
      def(15, "end_date", "期間To", "date"),
      def(16, "representative_sales_name", "担当営業", "varchar", "128"),
      def(17, "customer_id", "取引先ID", "varchar", "36", "", "", "", "m_customers.company_id", "", "", "", "契約未締結の場合はNULL"),
      def(18, "remarks", "備考", "varchar", "4000"),
      ...audit.map((r, i) => def(19 + i, ...r)),
    ],
    indexes: [
      [1, "pk_m_projects", "project_id", "PK", "dbo", "m_projects", "", "主キー"],
      [2, "idx_m_projects_customer_id", "customer_id", "IDX", "dbo", "m_projects", "", "取引先別案件検索用"],
      [3, "fk_m_projects_customer", "customer_id", "FK", "dbo", "m_customers", "company_id", "取引先への外部キー（NULL許可）"],
      [4, "fk_m_projects_commercial_flow", "commercial_flow_code", "FK", "dbo", "m_codes", "code", "code_type='COMMERCIAL_FLOW'"],
    ],
  },
  {
    name: "m_personnel",
    alias: "要員情報",
    notes: "案件所属は t_project_personnel で管理し、要員マスタは要員そのものの属性に限定。",
    fields: [
      def(1, "personnel_id", "要員ID", "varchar", "36", "", "Y", "", "", "○", "", "○", "UUID等"),
      def(2, "personnel_name", "要員名", "varchar", "256", "", "Y"),
      def(3, "personnel_name_kana", "要員名かな", "varchar", "256"),
      def(4, "personnel_name_display", "要員表示名", "varchar", "256"),
      def(5, "contract_type_code", "契約形態コード", "varchar", "32", "", "Y", "", "m_codes.code_type='CONTRACT_TYPE'"),
      def(6, "affiliation", "所属先", "varchar", "256", "", "", "", "BPの場合の所属会社名など"),
      def(7, "skills", "保有スキル", "varchar", "4000", "", "Y"),
      def(8, "birth_date", "誕生日", "date", "", "", "Y", "", "", "", "", "", "元のbirthday(number)をdateへ修正"),
      def(9, "sex_code", "性別コード", "varchar", "32", "", "Y", "", "m_codes.code_type='SEX'"),
      def(10, "nationality_code", "国籍区分コード", "varchar", "32", "", "", "JAPANESE", "m_codes.code_type='NATIONALITY_TYPE'"),
      def(11, "price", "単価", "number", "", "0", "Y"),
      def(12, "station", "最寄駅", "varchar", "128"),
      def(13, "start_date", "稼働開始日", "date"),
      def(14, "representative_sales_name", "担当営業", "varchar", "128"),
      def(15, "availability_code", "アサイン可否コード", "varchar", "32", "", "", "AVAILABLE", "m_codes.code_type='ASSIGNMENT_AVAILABILITY'"),
      def(16, "remarks", "備考", "varchar", "4000"),
      ...audit.map((r, i) => def(17 + i, ...r)),
    ],
    indexes: [
      [1, "pk_m_personnel", "personnel_id", "PK", "dbo", "m_personnel", "", "主キー"],
      [2, "idx_m_personnel_name", "personnel_name", "IDX", "dbo", "m_personnel", "", "要員名検索用"],
      [3, "fk_m_personnel_contract_type", "contract_type_code", "FK", "dbo", "m_codes", "code", "code_type='CONTRACT_TYPE'"],
    ],
  },
  {
    name: "m_codes",
    alias: "管理コード",
    notes: "商流、契約形態、提案区分、性別など単一選択の値を一元管理。職種も値はここで管理し、選択結果は中間表へ保存。",
    fields: [
      def(1, "code_type", "コード種別", "varchar", "64", "", "Y", "", "例: COMMERCIAL_FLOW, CONTRACT_TYPE, JOB_CATEGORY", "○"),
      def(2, "code", "コード", "varchar", "64", "", "Y", "", "例: PRIME, BP, PM", "○"),
      def(3, "code_value", "表示値", "varchar", "256", "", "Y"),
      def(4, "code_value_kana", "表示値かな", "varchar", "256"),
      def(5, "display_order", "表示順", "number", "4", "", "Y", "0"),
      def(6, "is_active", "有効フラグ", "boolean", "", "", "Y", "TRUE"),
      def(7, "remarks", "備考", "varchar", "1000"),
      ...audit.map((r, i) => def(8 + i, ...r)),
    ],
    indexes: [
      [1, "pk_m_codes", "code_type, code", "PK", "dbo", "m_codes", "", "種別内コードを一意にする"],
      [2, "idx_m_codes_type_order", "code_type, display_order", "IDX", "dbo", "m_codes", "", "プルダウン表示用"],
    ],
  },
  {
    name: "t_project_personnel",
    alias: "案件要員アサイン",
    notes: "案件と要員の多対多を管理。要員が案件未参加の場合、この表に行が存在しない。",
    fields: [
      def(1, "project_personnel_id", "案件要員ID", "varchar", "36", "", "Y", "", "", "○", "", "○", "UUID等"),
      def(2, "project_id", "案件ID", "varchar", "36", "", "Y", "", "m_projects.project_id"),
      def(3, "personnel_id", "要員ID", "varchar", "36", "", "Y", "", "m_personnel.personnel_id"),
      def(4, "assignment_status_code", "アサイン状態コード", "varchar", "32", "", "Y", "PROPOSED", "m_codes.code_type='ASSIGNMENT_STATUS'"),
      def(5, "assigned_from", "アサイン開始日", "date"),
      def(6, "assigned_to", "アサイン終了日", "date"),
      def(7, "billing_rate", "請求単価", "number", "", "0"),
      def(8, "payment_price", "支払単価", "number", "", "0"),
      def(9, "remarks", "備考", "varchar", "4000"),
      ...audit.map((r, i) => def(10 + i, ...r)),
    ],
    indexes: [
      [1, "pk_t_project_personnel", "project_personnel_id", "PK", "dbo", "t_project_personnel", "", "主キー"],
      [2, "uk_t_project_personnel_current", "project_id, personnel_id, assigned_from", "UK", "dbo", "t_project_personnel", "", "同一開始日の重複防止"],
      [3, "fk_t_project_personnel_project", "project_id", "FK", "dbo", "m_projects", "project_id", "案件への外部キー"],
      [4, "fk_t_project_personnel_personnel", "personnel_id", "FK", "dbo", "m_personnel", "personnel_id", "要員への外部キー"],
    ],
  },
  {
    name: "t_project_job_categories",
    alias: "案件職種",
    notes: "案件が求める職種を複数保存する中間表。",
    fields: [
      def(1, "project_id", "案件ID", "varchar", "36", "", "Y", "", "m_projects.project_id", "○"),
      def(2, "job_category_code", "職種コード", "varchar", "64", "", "Y", "", "m_codes.code_type='JOB_CATEGORY'", "○"),
      def(3, "remarks", "備考", "varchar", "1000"),
    ],
    indexes: [
      [1, "pk_t_project_job_categories", "project_id, job_category_code", "PK", "dbo", "t_project_job_categories", "", "複合主キー"],
      [2, "fk_t_project_job_categories_project", "project_id", "FK", "dbo", "m_projects", "project_id", "案件への外部キー"],
      [3, "fk_t_project_job_categories_code", "job_category_code", "FK", "dbo", "m_codes", "code", "code_type='JOB_CATEGORY'"],
    ],
  },
  {
    name: "t_personnel_job_categories",
    alias: "要員職種",
    notes: "要員が対応可能な職種を複数保存する中間表。",
    fields: [
      def(1, "personnel_id", "要員ID", "varchar", "36", "", "Y", "", "m_personnel.personnel_id", "○"),
      def(2, "job_category_code", "職種コード", "varchar", "64", "", "Y", "", "m_codes.code_type='JOB_CATEGORY'", "○"),
      def(3, "remarks", "備考", "varchar", "1000"),
    ],
    indexes: [
      [1, "pk_t_personnel_job_categories", "personnel_id, job_category_code", "PK", "dbo", "t_personnel_job_categories", "", "複合主キー"],
      [2, "fk_t_personnel_job_categories_personnel", "personnel_id", "FK", "dbo", "m_personnel", "personnel_id", "要員への外部キー"],
      [3, "fk_t_personnel_job_categories_code", "job_category_code", "FK", "dbo", "m_codes", "code", "code_type='JOB_CATEGORY'"],
    ],
  },
];

const codeSamples = [
  ["COMMERCIAL_FLOW", "END_DIRECT", "エンド直", 10, true],
  ["COMMERCIAL_FLOW", "PRIME", "元請け", 20, true],
  ["COMMERCIAL_FLOW", "FIRST_SUB", "一次請け", 30, true],
  ["COMMERCIAL_FLOW", "SECOND_OR_MORE", "二次請け以下", 40, true],
  ["CONTRACT_TYPE", "EMPLOYEE", "正社員", 10, true],
  ["CONTRACT_TYPE", "CONTRACT_EMPLOYEE", "契約社員", 20, true],
  ["CONTRACT_TYPE", "BP", "BP", 30, true],
  ["JOB_CATEGORY", "CONSULTANT", "コンサルタント", 10, true],
  ["JOB_CATEGORY", "PM", "PM", 20, true],
  ["JOB_CATEGORY", "PL", "PL", 30, true],
  ["JOB_CATEGORY", "PMO", "PMO", 40, true],
  ["JOB_CATEGORY", "SE", "SE", 50, true],
  ["JOB_CATEGORY", "PG", "PG", 60, true],
  ["JOB_CATEGORY", "TESTER", "テスター", 70, true],
  ["JOB_CATEGORY", "SERVER_ENGINEER", "サーバエンジニア", 80, true],
  ["JOB_CATEGORY", "NETWORK_ENGINEER", "ネットワークエンジニア", 90, true],
  ["JOB_CATEGORY", "WEB_DESIGNER", "WEBデザイナー", 100, true],
  ["JOB_CATEGORY", "WEB_DIRECTOR", "WEBディレクター", 110, true],
  ["JOB_CATEGORY", "HELPDESK_KITTING", "ヘルプデスク・キッティング", 120, true],
  ["JOB_CATEGORY", "OTHER", "その他", 999, true],
  ["PROPOSAL_CATEGORY", "PROJECT", "案件", 10, true],
  ["PROPOSAL_CATEGORY", "PERSONNEL", "人材", 20, true],
  ["IMPORTANCE", "HIGH", "高", 10, true],
  ["IMPORTANCE", "MIDDLE", "中", 20, true],
  ["IMPORTANCE", "LOW", "低", 30, true],
  ["SEX", "MALE", "男性", 10, true],
  ["SEX", "FEMALE", "女性", 20, true],
  ["NATIONALITY_TYPE", "JAPANESE", "日本人", 10, true],
  ["NATIONALITY_TYPE", "FOREIGN", "外国籍", 20, true],
  ["FOREIGN_ACCEPTANCE", "ACCEPTABLE", "外国籍可", 10, true],
  ["FOREIGN_ACCEPTANCE", "NOT_ACCEPTABLE", "外国籍不可", 20, true],
  ["ASSIGNMENT_AVAILABILITY", "AVAILABLE", "可", 10, true],
  ["ASSIGNMENT_AVAILABILITY", "UNAVAILABLE", "不可", 20, true],
  ["ASSIGNMENT_STATUS", "PROPOSED", "提案中", 10, true],
  ["ASSIGNMENT_STATUS", "ASSIGNED", "アサイン済", 20, true],
  ["ASSIGNMENT_STATUS", "ENDED", "終了", 30, true],
];

function styleDefinitionSheet(sheet, fieldRows, indexRows) {
  sheet.showGridLines = false;
  sheet.getRange("A1:M1").merge();
  sheet.getRange("A1").format = { fill: "#1F2937", font: { bold: true, color: "#FFFFFF", size: 14 } };
  sheet.getRange("A3:C4").format.borders = { preset: "all", style: "thin", color: "#6B7280" };
  sheet.getRange("A6:M6").format = { fill: "#111827", font: { bold: true, color: "#FFFFFF" } };
  sheet.getRange(`A6:M${6 + fieldRows}`).format.borders = { preset: "all", style: "thin", color: "#9CA3AF" };
  sheet.getRange(`A7:M${6 + fieldRows}`).format.wrapText = true;
  sheet.getRange(`A${9 + fieldRows}:H${9 + fieldRows}`).format = { fill: "#111827", font: { bold: true, color: "#FFFFFF" } };
  sheet.getRange(`A${9 + fieldRows}:H${9 + fieldRows + indexRows}`).format.borders = { preset: "all", style: "thin", color: "#9CA3AF" };
  sheet.getRange(`A${10 + fieldRows}:H${9 + fieldRows + indexRows}`).format.wrapText = true;
  sheet.getRange("A:A").format.columnWidthPx = 48;
  sheet.getRange("A:A").format.columnWidthPx = 78;
  sheet.getRange("B:B").format.columnWidthPx = 230;
  sheet.getRange("C:C").format.columnWidthPx = 250;
  sheet.getRange("D:D").format.columnWidthPx = 100;
  sheet.getRange("E:E").format.columnWidthPx = 90;
  sheet.getRange("F:G").format.columnWidthPx = 130;
  sheet.getRange("H:H").format.columnWidthPx = 210;
  sheet.getRange("I:I").format.columnWidthPx = 360;
  sheet.getRange("J:L").format.columnWidthPx = 70;
  sheet.getRange("M:M").format.columnWidthPx = 420;
  sheet.getUsedRange().format.autofitRows();
  sheet.freezePanes.freezeRows(6);
}

function addDefinitionSheet(t) {
  const sheet = workbook.worksheets.add(t.name);
  sheet.getRange("A1:M1").values = [[`テーブル定義: ${t.name}（${t.alias}）`]];
  sheet.getRange("A3:C3").values = [["テーブル名", "テーブル名（別名）", "データベース名"]];
  sheet.getRange("A4:C4").values = [[t.name, t.alias, "condev"]];
  sheet.getRange("A6:M6").values = [cols];
  sheet.getRangeByIndexes(6, 0, t.fields.length, cols.length).values = t.fields;
  const idxStart = 8 + t.fields.length;
  sheet.getRange(`A${idxStart}:H${idxStart}`).values = [["索引と制約", "", "", "", "", "", "", ""]];
  sheet.getRange(`A${idxStart + 1}:H${idxStart + 1}`).values = [idxCols];
  sheet.getRangeByIndexes(idxStart + 1, 0, t.indexes.length, idxCols.length).values = t.indexes;
  sheet.getRange(`J${idxStart}:M${idxStart + 4}`).merge();
  sheet.getRange(`J${idxStart}`).values = [[`設計メモ:\n${t.notes}`]];
  sheet.getRange(`J${idxStart}`).format = {
    fill: "#ECFEFF",
    font: { color: "#164E63" },
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: "#67E8F9" },
  };
  styleDefinitionSheet(sheet, t.fields.length, t.indexes.length);
}

function addOverview() {
  const sheet = workbook.worksheets.add("overview");
  sheet.showGridLines = false;
  sheet.getRange("A1:H1").merge();
  sheet.getRange("A1").values = [["DB設計レビュー・改良ポイント"]];
  sheet.getRange("A1").format = { fill: "#1F2937", font: { bold: true, color: "#FFFFFF", size: 15 } };
  const rows = [
    ["分類", "内容"],
    ["コード管理", "商流、契約形態、性別、提案区分、重要度など単一選択値は m_codes に集約。追加・無効化をデータで管理可能。"],
    ["職種", "職種は複数選択のため、m_projects/m_personnel の単一カラムを廃止し、t_project_job_categories / t_personnel_job_categories で管理。職種候補値は m_codes(code_type='JOB_CATEGORY')。"],
    ["案件と要員", "案件1件に複数要員、要員1名が複数案件履歴を持つ可能性に備え、t_project_personnel を追加。未アサイン要員はこの表に行を持たない。"],
    ["主キー/索引", "元ファイルの pk_m_customers/id などコピー残りを、各テーブルの正しい主キー列へ修正。"],
    ["型の見直し", "birthday(number) は birth_date(date) に修正。age は保存せず画面/API側で計算推奨。"],
    ["外部キー", "customer_id は契約未締結案件を許容するため NULL 可のまま m_customers.company_id 参照。"],
    ["監査項目", "registered_at/updated_at には CURRENT_TIMESTAMP、registered_by/updated_by はユーザー情報を保存する前提に整理。"],
  ];
  sheet.getRangeByIndexes(2, 0, rows.length, 2).values = rows;
  sheet.getRange("A3:B3").format = { fill: "#111827", font: { bold: true, color: "#FFFFFF" } };
  sheet.getRange(`A3:B${2 + rows.length}`).format.borders = { preset: "all", style: "thin", color: "#9CA3AF" };
  sheet.getRange(`A4:B${2 + rows.length}`).format.wrapText = true;
  sheet.getRange("A:A").format.columnWidthPx = 160;
  sheet.getRange("B:B").format.columnWidthPx = 900;
  sheet.freezePanes.freezeRows(3);
}

function addCodeSamples() {
  const sheet = workbook.worksheets.add("コード初期値例");
  sheet.showGridLines = false;
  sheet.getRange("A1:E1").merge();
  sheet.getRange("A1").values = [["m_codes 初期値例"]];
  sheet.getRange("A1").format = { fill: "#1F2937", font: { bold: true, color: "#FFFFFF", size: 15 } };
  sheet.getRange("A3:E3").values = [["code_type", "code", "code_value", "display_order", "is_active"]];
  sheet.getRangeByIndexes(3, 0, codeSamples.length, 5).values = codeSamples;
  sheet.getRange(`A3:E${3 + codeSamples.length}`).format.borders = { preset: "all", style: "thin", color: "#9CA3AF" };
  sheet.getRange("A3:E3").format = { fill: "#111827", font: { bold: true, color: "#FFFFFF" } };
  sheet.getRange("A:A").format.columnWidthPx = 210;
  sheet.getRange("B:B").format.columnWidthPx = 220;
  sheet.getRange("C:C").format.columnWidthPx = 260;
  sheet.getRange("D:E").format.columnWidthPx = 110;
  sheet.freezePanes.freezeRows(3);
}

addOverview();
for (const t of tables) addDefinitionSheet(t);
addCodeSamples();

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
await fs.writeFile(`${outputDir}/final_error_scan.ndjson`, errors.ndjson, "utf8");

for (const sheetName of ["overview", ...tables.map((t) => t.name), "コード初期値例"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(`${outputDir}/final_preview_${sheetName.replace(/[\\/:*?"<>|]/g, "_")}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);
