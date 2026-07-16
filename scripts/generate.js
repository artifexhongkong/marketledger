// 市集記賬本 App 商業企劃書（香港為重點、放眼全球）— docx generator
// Output: /home/z/my-project/download/市集記賬本App企劃書.docx

const {
  Document, Packer, Paragraph, TextRun, Header, Footer, PageBreak,
  AlignmentType, HeadingLevel, PageNumber, NumberFormat, SectionType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  TableLayoutType, TableOfContents,
} = require("/home/z/my-project/node_modules/docx");
const fs = require("fs");
const path = require("path");

// =============================================================
// 1. PALETTE — Deep Sea Blue-Gold (Premium / Global Business)
// =============================================================
const P = {
  bg: "0F2027",
  titleColor: "FFFFFF",
  subtitleColor: "D4AF37",
  metaColor: "B8C5D1",
  accent: "D4AF37",
  footerColor: "8A98A6",
  primary: "0F2027",
  body: "1A2B40",
  secondary: "4A6575",
  surface: "F5F7FA",
};

// =============================================================
// 2. HELPERS
// =============================================================
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB,
                       insideHorizontal: NB, insideVertical: NB };

function safeText(v, ph) {
  if (v === undefined || v === null || v === "" || String(v) === "NaN" || String(v) === "undefined") {
    return ph || "【請填寫】";
  }
  return String(v);
}

function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([
    ..."，。、；：！？", ..."的與和及之在於為", ..."-_—–·/", ..." \t",
  ]);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
    }
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
      }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines;
}

function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 20;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    const cpl = charsPerLine(minPt);
    lines = splitTitleLines(title, cpl);
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}

function calcCoverSpacing(params) {
  const {
    titleLineCount = 1, titlePt = 36, hasSubtitle = false,
    hasEnglishLabel = false, metaLineCount = 0,
    fixedHeight = 800, pageHeight = 16838,
    marginTop = 0, marginBottom = 0,
  } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const englishLabelHeight = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;
  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight +
                        metaHeight + fixedHeight + implicitParaHeight;
  const remainingSpace = usableHeight - contentHeight;
  const safeRemaining = Math.max(remainingSpace, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  const midSpacing = Math.max(safeRemaining - topSpacing - bottomSpacing, 0);
  return { topSpacing, midSpacing, bottomSpacing };
}

// =============================================================
// 3. COVER — Recipe R1
// =============================================================
function buildCoverR1(config) {
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length,
    fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const children = [];

  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));

  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
      children: [new TextRun({
        text: config.englishLabel.split("").join("  "),
        size: 18, color: P.accent,
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
        characterSpacing: 40,
      })],
    }));
  }

  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: {
        after: i < titleLines.length - 1 ? 100 : 300,
        line: Math.ceil(titlePt * 23), lineRule: "atLeast",
      },
      children: [new TextRun({
        text: titleLines[i], size: titleSize, bold: true,
        color: P.titleColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" },
      })],
    }));
  }

  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({
        text: config.subtitle, size: 24, color: P.subtitleColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" },
      })],
    }));
  }

  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({
        text: line, size: 24, color: P.metaColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" },
      })],
    }));
  }

  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));

  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } }),
    ],
  }));

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg },
        borders: noBorders,
        children,
      })],
    })],
  })];
}

// =============================================================
// 4. BODY BUILDERS
// =============================================================
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    children: [new TextRun({
      text, bold: true, size: 32, color: P.primary,
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
    })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({
      text, bold: true, size: 28, color: P.primary,
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
    })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({
      text, bold: true, size: 26, color: P.primary,
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
    })],
  });
}
function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({
      text, size: 24, color: P.body,
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
    })],
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    spacing: { line: 312, after: 60 },
    indent: { left: 480 + level * 360, hanging: 240 },
    children: [
      new TextRun({ text: (level === 0 ? "● " : "○ "), size: 24, color: P.accent,
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } }),
      new TextRun({ text, size: 24, color: P.body,
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } }),
    ],
  });
}
function bulletMixed(parts, level = 0) {
  const children = [new TextRun({ text: (level === 0 ? "● " : "○ "), size: 24, color: P.accent,
    font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })];
  for (const p of parts) {
    children.push(new TextRun({
      text: p.text, bold: !!p.bold, size: 24,
      color: p.bold ? P.primary : P.body,
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
    }));
  }
  return new Paragraph({
    spacing: { line: 312, after: 60 },
    indent: { left: 480 + level * 360, hanging: 240 },
    children,
  });
}
function cell(text, opts = {}) {
  const isHeader = opts.header;
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: isHeader
      ? { type: ShadingType.CLEAR, fill: P.primary }
      : (opts.zebra ? { type: ShadingType.CLEAR, fill: P.surface } : undefined),
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      spacing: { line: 280 },
      children: [new TextRun({
        text: safeText(text, ""),
        bold: !!isHeader || !!opts.bold,
        size: 22,
        color: isHeader ? "FFFFFF" : P.body,
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      })],
    })],
  });
}
function makeTable(headers, rows, colWidths) {
  const widths = colWidths || headers.map(() => Math.floor(100 / headers.length));
  const headerRow = new TableRow({
    tableHeader: true, cantSplit: true,
    children: headers.map((h, i) => cell(h, { header: true, width: widths[i], align: AlignmentType.CENTER })),
  });
  const dataRows = rows.map((r, idx) => new TableRow({
    cantSplit: true,
    children: r.map((c, i) => cell(c, { width: widths[i], zebra: idx % 2 === 1 })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: P.primary },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: P.primary },
      left: { style: BorderStyle.SINGLE, size: 2, color: P.secondary },
      right: { style: BorderStyle.SINGLE, size: 2, color: P.secondary },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "D0D7DE" },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "D0D7DE" },
    },
    rows: [headerRow, ...dataRows],
  });
}
function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 240 },
    children: [new TextRun({
      text, italics: true, size: 20, color: P.secondary,
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
    })],
  });
}

// =============================================================
// 5. CONTENT — Hong Kong focus, global vision
// =============================================================
const bodyChildren = [];

// ----- Chapter 1: 執行摘要 -----
bodyChildren.push(h1("一、執行摘要"));
bodyChildren.push(body(
  "本企劃書針對一款名為「市集記賬本」（產品代號 MarketLedger）的行動應用程式提出完整的全球商業規劃，並以香港作為首發市場與策略樞紐。產品核心定位是「為市集攤商、夜市業者、流動攤販與小型市集主辦方而設的極簡營業記賬工具」，解決攤商在營業現場無法快速記錄每筆交易、收攤後難以掌握當日營業額與熱銷商品的痛點。產品以「3 秒記一筆、收攤即結算」為核心價值主張，搭配離線優先、雲端同步、多幣種、多市集切換與多語系等特色，瞄準全球超過 1,000 萬名攤商所構成的長尾市場。"
));
bodyChildren.push(body(
  "香港作為首發市場具有獨特戰略意義。香港每年舉辦超過 300 場市集活動，涵蓋年宵花市（全港 15 個地點、超過 3,000 個攤位）、農墟（漁護署認可的有機農墟約 15 個）、文創市集（PMQ 元創方、D2 Place、JFFLUX、好東西市集等每月 20 至 30 場）、商場 Pop-up 市集與傳統墟市等多元形態，活躍攤商約 2 至 3 萬名。香港作為國際化程度極高的城市，是測試產品在多語系、多幣種、多支付場景下運作的最佳試點。一旦在香港驗證產品市場契合度（PMF），將快速複製至台灣、泰國、馬來西亞、新加坡、澳門等亞洲市集市場，最終擴展至歐美文創市集與拉丁美洲傳統市集。"
));
bodyChildren.push(body(
  "市場層面，全球目前沒有任何一款專為市集攤商設計的記賬工具。香港市場現有競品如 iCHEF HK、Eats365、gini 等餐飲 POS 系統過於重型且收費偏高（月費 HK$ 300 至 1,200），八達通商戶端、PayMe for Business 等支付工具僅解決收款而缺乏銷售分析，記賬類 App 則完全缺乏商品銷售管理能力。東南亞市場的 StoreHub、Moka、Qashier 同樣以固定店面為主。本產品切入「輕量、專注、現場感、跨國可複製」的市場缺口，預估首年香港市場可觸及 8,000 付費用戶、創造約 HK$ 150 萬元年營收，第三年擴張至 5 個市場、年營收達 HK$ 1,200 萬元。"
));
bodyChildren.push(body(
  "商業模式採用 Freemium 訂閱制為主、加值功能與 B2B 授權為輔的混合變現策略。免費版提供基本記帳與當日結算功能，進階版以每月 HK$ 38 或每年 HK$ 380 提供雲端備份、多裝置同步、報表匯出、報稅協助與進階數據分析等進階能力。同時規劃與市集主辦方合作的 B2B 白標授權方案，將整套系統客製化提供給大型市集（如香港年宵市場、JFFLUX、台灣簡單生活節、泰國 Chatuchak 週末市集等）作為官方指定記賬工具，開闢企業級營收來源。"
));
bodyChildren.push(body(
  "技術開發以 React Native 跨平台框架為核心，後端採用 Node.js 搭配 PostgreSQL，雲端部署於 AWS（首選香港與新加坡節點），整合香港主流行動支付（八達通、PayMe、AlipayHK、WeChat Pay HK、FPS 轉數快）。MVP 開發時程為 3 個月，初期開發成本約 HK$ 60 至 80 萬元。團隊編制建議為 1 名產品經理、2 名全端工程師、1 名行動端工程師、1 名兼職後端工程師、1 名兼職行銷地推，前 9 個月總資金需求約 HK$ 220 萬元。資金來源建議為創辦人自有資金 30%、香港天使投資人與大灣區微型創投 70%，預計於第 18 個月達到損益兩平。"
));
bodyChildren.push(body(
  "核心競爭優勢在於「市集現場情境的深度理解」、「極簡操作體驗」與「跨國可複製架構」。產品設計將圍繞攤商在收銀、補貨、收攤三個關鍵場景的實際工作流程，搭配大字體、單手操作、語音輸入、條碼掃描、多語系介面（繁中、簡中、英文、泰文、馬來文）等針對戶外與跨文化用戶友善的設計。預期透過市集現場地推、與各國市集主辦方合作、口碑推薦三大策略，在第三年達到 25 萬下載、6 萬付費用戶的規模，成為全球市集記賬領域的領導品牌。"
));

// ----- Chapter 2: 市場與競品分析 -----
bodyChildren.push(h1("二、市場與競品分析"));

bodyChildren.push(h2("2.1 全球市集經濟規模與區域差異"));
bodyChildren.push(body(
  "市集與攤商經濟是全球零售業中被長期低估的龐大板塊。根據聯合國貿易暨發展會議（UNCTAD）與各國零售業統計推估，全球透過市集、夜市、墟市、流動攤販銷售的商品與服務年營業額超過 5,000 億美元，活躍攤商人數超過 1,000 萬名。這個市場橫跨亞洲夜市文化圈（台灣、泰國、馬來西亞、印尼、越南）、歐美文創市集與農夫市集（英國、德國、美國）、拉丁美洲傳統市集（墨西哥、秘魯、哥倫比亞）、非洲露天市集，以及中東的 Souk 文化。各地市集雖形態各異，但攤商面臨的「記錄困難、盤點耗時、缺乏數據」三大痛點高度一致，這正是本產品全球可複製性的基礎。"
));
bodyChildren.push(body(
  "亞洲是市集經濟最活躍的區域。台灣擁有超過 30 萬名攤商（夜市、傳統市場、文創市集合計），年營業額超過新台幣 4,000 億元。泰國的 Chatuchak 週末市集、清邁夜市、華欣 Cicada 市集合計吸引超過 50 萬名攤商，曼谷與各府的夜市文化更為普及。馬來西亞的 Pasar Malam（夜市）與 Pasar Pagi（早市）遍布全國，活躍攤商超過 30 萬名。印尼的傳統市場（Pasar）與文創市集估計有 100 萬攤商。越南的傳統市場與新興文創市集亦快速發展。新加坡雖市場較小，但週末市集（如 M.A.D Market、Public Garden）與小販中心文化仍是不可忽視的板塊。整個亞洲市集攤商總數估計超過 300 萬名，是本產品的首要目標區域。"
));
bodyChildren.push(body(
  "歐美市集雖規模較小但客單價較高。英國的 Christmas Market、Food Festival、Craft Market 每年吸引約 8,000 個常態攤商；德國的 Christmas Market 與 Wochenmarkt（週市場）攤商約 5 萬名；美國的 Farmers Market 全國超過 8,700 個，參與攤商估計 15 萬名。歐美攤商客單價高（平均 15 至 30 美元）、對數位工具接受度高、願意付費訂閱，是高 ARPU（每用戶平均收入）市場，但對軟體本地化、支付方式（Stripe、Square、PayPal）與法規（GDPR、sales tax）有較高要求。本產品長期規劃在第 36 個月後進軍歐美市場。"
));

bodyChildren.push(h2("2.2 香港市場深度分析"));
bodyChildren.push(body(
  "香港是本產品的首發市場與策略樞紐。香港市集生態多元且國際化程度高，是測試跨國產品的最佳起點。香港市集可分為五大類型，每類型有其獨特的營運模式與用戶樣貌。第一類是年宵市場，由食物環境衞生署（FEHD）主辦，每年農曆新年前 7 天在全港 15 個地點舉行，攤位以公開競投方式租出，總攤位數超過 3,000 個，吸引花農、年貨商、創意攤商參與，是香港最具規模的市集活動。第二類是農墟與有機市集，由漁農自然護理署（AFCD）認可或民間團體主辦，包括大埔農墟、荔枝窩農墟、中環農墟等約 15 個，每週或雙週營業，攤商以本地農民與手作業者為主。"
));
bodyChildren.push(body(
  "第三類是文創市集與 Pop-up 市集，包括 PMQ 元創方的週末市集、D2 Place 的手作市集、JFFLUX、好東西市集、赤柱市集、廟街夜市等，每月全港約 20 至 30 場，攤商以 25 至 40 歲的設計師、手作創業者為主，客單價較高且對數位工具接受度高。第四類是傳統墟市與街市，如聯和墟、石湖墟等歷史墟市仍保留部分攤商活動，食環署轄下的公眾街市亦有部分流動攤位。第五類是商場與品牌活動的 Pop-up 市集，如太古坊、K11、新世界發展等發展商常在節慶或活動期間舉辦臨時市集，吸引品牌攤商參與。整體而言，香港活躍攤商約 2 至 3 萬名，年營業額估計超過 HK$ 30 億元。"
));
bodyChildren.push(body(
  "香港目標用戶樣貌可分為三類。第一類是「年宵與節慶攤商」，季節性參與年宵、中秋、聖誕等節慶市集，年齡層廣泛，對數位工具接受度中等，但對單次活動的營業額極度敏感。第二類是「文創與手作攤商」，常態性參與各類文創市集，年齡集中於 25 至 40 歲，學歷較高、對數位工具高度接受、願意付費訂閱，是付費轉換率最高的客群。第三類是「農墟與本地農產攤商」，年齡偏長但近年有年輕新農人加入，需求集中在庫存管理與客戶經營。第四類是「市集主辦方與場地方」，包括市集策劃公司、商場發展商、政府部門，需要管理多個攤位的申請、收費與營業數據，是 B2B 授權的主要目標。"
));
bodyChildren.push(body(
  "香港攤商面臨的痛點與全球攤商高度一致，但有其本地化特色。第一是「現場記錄困難」，香港市集人流量極大（如年宵市場單日人流可達 10 萬），尖峰時段每分鐘成交 5 至 8 筆，傳統紙本或試算表根本無法即時記錄。第二是「多支付方式對帳困難」，香港支付生態極度多元，一個攤位可能同時接受現金、八達通、PayMe、AlipayHK、WeChat Pay HK、FPS 轉數快、信用卡，收攤後對帳極為耗時。第三是「稅務申報複雜」，香港利得稅雖僅 8.25%（首 200 萬）至 16.5%，但攤商多為小規模經營，缺乏會計知識，難以整理符合稅務局（IRD）要求的帳目。第四是「缺乏數據分析能力」，攤商無法知道哪個市集最賺錢、哪個商品最暢銷、哪個季節最佳，進貨與擺攤決策只能憑直覺。"
));

bodyChildren.push(h2("2.3 全球與本地競品分析"));
bodyChildren.push(body(
  "全球與本產品有競爭或替代關係的 App 可分為四大類。第一類是「餐飲 POS 系統」，包括香港的 iCHEF HK、Eats365、gini，台灣的微碧 POS，新加坡的 StoreHub，馬來西亞的 Moka（已被 Gojek 收購），以及全球性的 Square、Shopify POS。這類系統月費約 HK$ 300 至 1,200（或當地等值），需要專用硬體，對攤商而言過於重型且成本過高。iCHEF HK 主打精緻餐飲與連鎖品牌，月費由 HK$ 599 起；Eats365 是新加坡起家的 POS，已擴展至馬來西亞與香港，主打快速餐飲；StoreHub 總部在吉隆坡，服務東南亞 5,000 家以上小店，月費由 RM 99 起。這些 POS 系統都未針對移動式攤商最佳化。"
));
bodyChildren.push(body(
  "第二類是「支付業者的商戶端 App」，包括香港的八達通商戶端（O!ePay）、PayMe for Business、AlipayHK 商戶端、WeChat Pay HK 商戶端、FPS 商戶端，以及全球性的 Stripe、PayPal、Square。這類工具的優勢是直接串接支付，但功能僅限於「收款 + 基本對帳」，完全缺乏商品管理、庫存追蹤、銷售分析、報稅協助等攤商所需的核心功能。八達通商戶端需租用實體接收器（HK$ 800 至 1,500 一次性 + 月費），且僅支援八達通一種支付；PayMe for Business 雖免月費但需交易手續費 1.5%。這類工具是本產品的「補充」而非「替代」，本產品計畫透過 API 串接整合這些支付。"
));
bodyChildren.push(body(
  "第三類是「個人記帳理財 App」，包括全球性的 MoneyWiz、YNAB、Mint，香港本地較缺乏專門的個人記帳 App（多用 Excel 或銀行 App 內建功能），台灣的記帳城市、AndroMoney，中國的隨手記、挖財。這類 App 以個人收支為核心，將記帳遊戲化或強調分類統計與預算管理，但根本問題是「設計給消費者記個人支出，不是給營業者記商品銷售」，缺乏商品庫存管理、多市集切換、營業時段分析、進銷項計算等攤商必需功能。第四類是「通用進銷存與小店管理 App」，包括台灣的店家記帳、小店長，中國的企業幫、秦絲進銷存，東南亞的 Bookkeeper 等。這類工具較貼近小店需求，但設計仍以固定店面為主，缺乏對「移動攤商」場景的最佳化。"
));
bodyChildren.push(body(
  "整體而言，全球目前沒有任何一款 App 是「專為市集攤商設計、跨國可複製、支援多支付多幣種的極簡記賬工具」。這正是本產品的全球市場切入機會。下表整理主要競品與本產品在關鍵維度的比較，可清楚看出市場缺口所在。"
));

bodyChildren.push(makeTable(
  ["比較維度", "iCHEF HK / Eats365", "PayMe / 八達通商戶端", "StoreHub / Moka", "MoneyWiz / 記帳城市", "本產品 MarketLedger"],
  [
    ["目標用戶", "固定餐飲店面", "支付收款商戶", "東南亞固定小店", "個人理財", "市集攤商 / 移動營業"],
    ["月費", "HK$ 599-1,200", "免月費+1.5%手續費", "RM 99-299", "US$ 0-12", "HK$ 0-98"],
    ["快速結帳", "需點餐流程", "僅收款", "中等", "無", "極快（3 秒/筆）"],
    ["商品庫存", "完整", "無", "有", "無", "有（簡化版）"],
    ["多市集切換", "無", "無", "無", "無", "核心功能"],
    ["離線優先", "部分", "否", "部分", "是", "是"],
    ["多支付整合", "部分", "單一支付", "部分", "無", "全部（5+）"],
    ["多幣種", "否", "否", "部分", "是", "是"],
    ["多語系", "中英", "中英", "多語", "多語", "5+ 語系"],
    ["硬體需求", "平板+出單機", "支付終端", "平板+出單機", "無", "無（手機即可）"],
    ["現場感設計", "低", "低", "低", "低", "高"],
  ],
  [14, 18, 17, 17, 17, 17]
));
bodyChildren.push(tableCaption("表 1：本產品與全球主要競品功能比較表"));

bodyChildren.push(body(
  "從競品比較可歸納出三個全球市場缺口。第一是「場景缺口」：所有競品都不是為市集現場設計的，本產品是唯一針對戶外、移動、零碎時間操作最佳化的工具。第二是「價格缺口」：餐飲 POS 過貴、支付工具僅解決收款、記帳 App 過輕，本產品落在每月 HK$ 38 至 98 的甜蜜點，比 POS 便宜 10 倍但比記帳 App 多 10 倍攤商專屬功能。第三是「資料缺口」：目前沒有任何產品能聚合全球市集攤商的銷售數據，本產品有機會成為市集經濟的數據基礎設施，長期價值遠超 App 本身。"
));

// ----- Chapter 3: 產品定位與差異化優勢 -----
bodyChildren.push(h1("三、產品定位與差異化優勢"));

bodyChildren.push(h2("3.1 產品定位與價值主張"));
bodyChildren.push(body(
  "本產品 MarketLedger 的核心定位是「市集攤商的隨身營業助理，從香港出發、服務全球」。產品不追求功能的大而全，而是聚焦於三個核心場景：營業中快速記帳、收攤後當日結算、休息時回顧分析。這個定位明確將產品與餐飲 POS、支付商戶端、個人記帳、進銷存軟體區隔開來，避免陷入「功能軍備競賽」的紅海競爭。產品的價值主張可濃縮為三句話：「3 秒記一筆，比計算機更快；收攤即結算，比盤點更準；週末看報表，比直覺更聰明」。"
));
bodyChildren.push(body(
  "這個定位背後的核心信念是「攤商不需要更多功能，他們需要更少的步驟」。多數競品開發者坐在辦公室設計功能，沒有實際在市集擺過攤。實際上市集攤商的營業環境極度惡劣：陽光直射螢幕看不清楚、手指沾油容易誤觸、客人催促不容許點選多層選單、網路訊號不穩無法依賴雲端、跨境擺攤需要切換語言與幣種。本產品的每一個設計決策都必須通過「在香港年宵市場、台灣士林夜市、泰國 Chatuchak、馬來西亞 Pasar Malam 現場實測可用」這個標準，這是競品無法輕易複製的護城河。"
));
bodyChildren.push(body(
  "全球擴張策略採取「香港試點 → 亞洲擴張 → 全球佈局」三階段路徑。香港作為首發市場的優勢在於：第一，香港市集生態國際化程度高，可同時驗證繁中、簡中、英文三語介面；第二，香港支付生態多元（八達通、PayMe、AlipayHK、WeChat Pay HK、FPS），可驗證多支付整合能力；第三，香港毗鄰大灣區與東南亞，便於快速擴張至下一個市場；第四，香港投資人與創投生態成熟，便於融資。預計在香港驗證 PMF 後，第 9 至 12 個月擴張至台灣（同文同種、市場規模大），第 13 至 18 個月擴張至泰國與馬來西亞（市集文化興盛），第 24 個月後進軍新加坡與歐美。"
));

bodyChildren.push(h2("3.2 SWOT 分析"));
bodyChildren.push(body(
  "以下透過 SWOT 架構系統性分析本產品的內部優勢、劣勢與外部機會、威脅，作為後續戰略決策的基礎。本分析兼顧香港本地與全球市場兩個層面。"
));

bodyChildren.push(makeTable(
  ["維度", "內容"],
  [
    ["優勢 Strengths", "1. 場景專注度：全球唯一針對市集攤商設計的產品，每個功能都經現場實測。\n2. 跨國可複製架構：多幣種、多語系、多支付整合設計，一套系統服務全球。\n3. 操作極簡：3 秒記一筆的速度優勢，遠超所有競品。\n4. 離線優先架構：適應市集網路不穩環境，資料不會遺失。\n5. 香港樞紐位置：以香港為試點，便於快速擴張至亞洲各市場。"],
    ["劣勢 Weaknesses", "1. 品牌知名度為零：新創產品缺乏市場聲量，初期獲客成本較高。\n2. 香港市場規模較小：僅 2 至 3 萬活躍攤商，需快速擴張才能規模化。\n3. 團隊規模小：初期僅 5 至 6 人團隊，跨國營運能量有限。\n4. 資金有限：初期資金約 HK$ 220 萬，僅能支撐 9 至 12 個月營運。\n5. 缺乏本地化深度：擴張至新市場需重新建立當地市集主辦方關係。"],
    ["機會 Opportunities", "1. 全球市集經濟復甦：後疫情時代戶外市集與文創市集蓬勃發展。\n2. 東南亞數位化浪潮：泰國、馬來西亞、印尼的數位支付快速普及。\n3. 香港政府推動墟市發展：食環署簡化墟市牌照申請，鼓勵社區市集。\n4. 跨境電商與小販經濟：攤商跨國擺攤需求增加，多幣種工具稀缺。\n5. 市集主辦方數位化需求：主辦方需要攤位管理與數據分析工具，B2B 商機浮現。"],
    ["威脅 Threats", "1. 餐飲 POS 廠商向下延伸：iCHEF、StoreHub 等大廠可能推出輕量版搶市。\n2. 支付業者競爭：PayMe、AlipayHK 可能擴充商家銷售分析功能。\n3. 各國法規差異：稅務、支付、個資法規各國不同，合規成本高。\n4. 本地競品崛起：泰國、馬來西亞本地新創可能推出相似產品。\n5. 經濟景氣：景氣衰退可能影響攤商付費意願與續訂率。"],
  ],
  [18, 82]
));
bodyChildren.push(tableCaption("表 2：MarketLedger 全球化 SWOT 分析"));

bodyChildren.push(h2("3.3 差異化策略與護城河建立"));
bodyChildren.push(body(
  "基於上述 SWOT 分析，本產品採取「SO 策略（優勢×機會）」為主、「ST 策略（優勢×威脅）」為輔的戰略組合。SO 策略方面，運用跨國可複製架構與東南亞數位化浪潮，以香港為試點快速擴張至 5 個亞洲市場；運用場景專注度與市集主辦方數位化需求，開發 B2B 白標授權市場。ST 策略方面，面對餐飲 POS 廠商向下延伸的威脅，本產品將持續深化「極簡」、「移動」、「跨國」三個維度的差異，避免與 POS 廠商正面交鋒；面對支付業者的競爭，本產品將與之合作而非對抗（從 API 串接手續費分潤），聚焦支付業者不會做的「記賬 + 報表 + 報稅」整合。"
));
bodyChildren.push(body(
  "護城河的建立是長期競爭力的關鍵。本產品計畫從四個層面建立護城河：第一是「資料護城河」，隨著用戶累積銷售資料，轉換成本提高，且聚合資料將成為全球市集經濟情報的獨家來源；第二是「網絡效應護城河」，當多個市集主辦方採用本系統，攤商為了配合主辦方也會被拉入生態，形成 B2B2C 的拉力；第三是「品牌護城河」，透過長期在各大市集現場的露出與口碑，建立「市集記賬 = MarketLedger」的品牌連結；第四是「跨國網絡護城河」，當本產品同時覆蓋香港、台灣、泰國、馬來西亞市場，攤商跨國擺攤時可無縫切換，這是單一市場競品無法複製的優勢。"
));

// ----- Chapter 4: 產品功能規格 -----
bodyChildren.push(h1("四、產品功能規格"));

bodyChildren.push(h2("4.1 MVP 核心功能（第一版）"));
bodyChildren.push(body(
  "MVP（最小可行產品）聚焦於解決攤商最迫切的三個痛點：現場記錄困難、收攤盤點耗時、缺乏營業額數據。MVP 開發時程為 3 個月，預計上線時包含以下八大核心功能模組。每個功能都必須通過「在香港年宵市場、PMQ 文創市集、大埔農墟現場實測可用」的測試標準，否則不納入 MVP 範圍。"
));

bodyChildren.push(bulletMixed([{text: "快速記帳模組：", bold: true}, {text: "首頁即為記帳介面，預設顯示常用商品（按銷售頻率排序），點一下即記錄一筆銷售。支援數量調整、客製化金額、備註。目標是「3 秒記一筆」，比傳統計算機更快。"}]));
bodyChildren.push(bulletMixed([{text: "商品管理模組：", bold: true}, {text: "新增、編輯、刪除商品，可設定商品名稱、預設售價、成本、庫存數量、商品分類。支援商品照片。每個商品可標記「常售」以便快速記帳。"}]));
bodyChildren.push(bulletMixed([{text: "當日結算模組：", bold: true}, {text: "收攤時一鍵結算當日營業，顯示總營業額、交易筆數、各商品銷售數量與金額、庫存消耗、預估利潤。可手動修正盤點差異。結算後自動歸檔為「歷史營業日」。"}]));
bodyChildren.push(bulletMixed([{text: "多市集切換模組：", bold: true}, {text: "支援建立多個「市集設定」（如：維多利亞公園年宵、PMQ 週末市集、大埔農墟），每個市集可獨立記帳與結算。切換市集時自動載入該市集的商品組合。"}]));
bodyChildren.push(bulletMixed([{text: "多幣種支援：", bold: true}, {text: "支援 HK$、NT$、THB、MYR、SGD、US$ 等主要貨幣，每個市集可設定不同幣別。匯率可手動或自動更新。跨境擺攤必備功能。"}]));
bodyChildren.push(bulletMixed([{text: "離線優先架構：", bold: true}, {text: "所有記帳操作在本地完成，無需網路連線。網路恢復後自動同步至雲端。採用衝突解決機制（最後寫入優先）避免資料遺失。適應市集網路不穩環境。"}]));
bodyChildren.push(bulletMixed([{text: "歷史報表模組：", bold: true}, {text: "查看過去任意日期區間的營業額、商品銷售排行、市集比較、時段分析。提供日、週、月、年四種檢視粒度。"}]));
bodyChildren.push(bulletMixed([{text: "資料備份與還原：", bold: true}, {text: "免費版提供本地備份（匯出 JSON 檔），付費版提供雲端自動備份與多裝置同步。支援資料還原至任一時間點。"}]));

bodyChildren.push(h2("4.2 V2 進階功能（上線後 6 個月）"));
bodyChildren.push(body(
  "V2 版本聚焦於深化數據分析能力、拓展商業應用場景與整合支付體系。在 MVP 確立用戶基礎後，V2 導入香港主流支付整合、報稅協助與進階報表等功能，提升付費轉換率與 ARPU。V2 預計於 MVP 上線後第 4 至 6 個月開發完成。"
));

bodyChildren.push(bulletMixed([{text: "香港支付整合：", bold: true}, {text: "串接八達通 O!ePay、PayMe for Business、AlipayHK、WeChat Pay HK、FPS 轉數快等香港主流支付，自動記錄電子支付交易。整合後可自動對帳，大幅減少手動輸入。"}]));
bodyChildren.push(bulletMixed([{text: "報稅協助模組：", bold: true}, {text: "依據香港稅務局（IRD）利得稅規範，自動計算應納稅額、匯出符合 IRD 格式的銷售明細表。支援現金與電子支付銷售分開統計。亦支援台灣營業稅、泰國 VAT 等各國稅制。"}]));
bodyChildren.push(bulletMixed([{text: "進階數據分析：", bold: true}, {text: "商品關聯分析（哪些商品常一起被買）、時段熱度圖、市集坪效比較、庫存週轉率、毛利率分析。提供視覺化圖表與洞察建議。"}]));
bodyChildren.push(bulletMixed([{text: "團隊協作功能：", bold: true}, {text: "支援多位攤位人員同時記帳，老闆可即時查看營業狀況。權限分級（老闆、員工、會計）。"}]));
bodyChildren.push(bulletMixed([{text: "商品條碼掃描：", bold: true}, {text: "支援手機相機掃描商品條碼（EAN-13、QR Code）快速記帳，適用於包裝商品。可建立商品條碼資料庫。"}]));
bodyChildren.push(bulletMixed([{text: "語音記帳：", bold: true}, {text: "整合語音辨識 API，支援「賣了兩杯咖啡 80 蚊」這類口語化輸入，自動解析為交易記錄。支援粵語、普通話、英語、泰語。"}]));
bodyChildren.push(bulletMixed([{text: "多語系介面：", bold: true}, {text: "支援繁體中文、簡體中文、英文、泰文、馬來文五種語系，用戶可自由切換。配合各市場擴張進度上線。"}]));

bodyChildren.push(h2("4.3 V3 生態擴展功能（上線後 12 個月）"));
bodyChildren.push(body(
  "V3 版本目標是從單一工具升級為全球市集生態平台，引入市集主辦方、攤商、供應商三方互動。V3 將開發 B2B 後台、跨國攤位媒合、進貨採購等功能，建構網絡效應護城河。此階段需要較大資金與團隊擴張，預計於 A 輪融資後啟動。"
));

bodyChildren.push(bulletMixed([{text: "市集主辦方後台（B2B）：", bold: true}, {text: "提供主辦方管理多個市集、攤位申請審核、攤位費收取、營業數據聚合分析、攤商評價等功能。白標授權給大型市集主辦單位。"}]));
bodyChildren.push(bulletMixed([{text: "跨國攤位媒合平台：", bold: true}, {text: "攤商可瀏覽全球市集活動（香港年宵、台灣簡單生活節、泰國 Chatuchak、馬來西亞 Pasar Malam）、線上申請攤位、追蹤審核狀態。主辦方可透過系統篩選合適攤商。"}]));
bodyChildren.push(bulletMixed([{text: "進貨採購市集：", bold: true}, {text: "整合原物料供應商，攤商可於系統內直接下單補貨，享受團購優惠。從交易手續費分潤。"}]));
bodyChildren.push(bulletMixed([{text: "全球市集情報訂閱：", bold: true}, {text: "提供付費訂閱的全球市集情報報告，包含各城市市集營業額排行、熱銷品類、淡旺季分析、跨國比較，作為攤商選市集的決策依據。"}]));

bodyChildren.push(h2("4.4 關鍵用戶流程"));
bodyChildren.push(body(
  "本產品的核心用戶流程分為三大場景，每個場景的設計目標是「最少步驟完成任務」。以下描述每個場景的典型用戶旅程，作為 UI/UX 設計的基礎。所有流程均通過「在香港維多利亞公園年宵、PMQ 週末市集、大埔農墟實測」的驗證。"
));

bodyChildren.push(h3("場景一：營業中快速記帳"));
bodyChildren.push(body(
  "攤商抵達市集後開啟 App，首頁即為記帳介面，顯示常用商品按鈕（依銷售頻率自動排序）。當客人購買時，攤商點選對應商品按鈕（例如「絲襪奶茶 25」），即記錄一筆 HK$ 25 的奶茶銷售，按鈕閃爍綠色確認並播放震動回饋。若客人買多件，可連續點選或長按調整數量。若客人以 PayMe 或八達通付款，可在記帳時順手標記支付方式，後續對帳更輕鬆。若客人購買非預設商品，可滑動至「其他」分類手動輸入。整個流程從開啟 App 到完成記帳不超過 3 秒，遠快於傳統計算機或紙本記錄。"
));

bodyChildren.push(h3("場景二：收攤後當日結算"));
bodyChildren.push(body(
  "營業結束時，攤商點選首頁底部的「結算」按鈕，App 自動彙整當日所有交易，顯示結算頁面。結算頁面分為五個區塊：第一是營業額總覽（總營業額、交易筆數、平均客單價），第二是支付方式分析（現金、八達通、PayMe、AlipayHK 等各佔多少），第三是商品銷售明細（每個商品的銷售數量、單價、總金額），第四是庫存消耗（每個商品的庫存變化、剩餘數量），第五是預估利潤（營業額扣除成本）。攤商可手動修正盤點差異（如損耗、自用），確認後點選「歸檔」即完成結算，歷史營業日自動儲存至報表模組。整個流程從點選結算到完成歸檔不超過 2 分鐘。"
));

bodyChildren.push(h3("場景三：休息時回顧分析"));
bodyChildren.push(body(
  "攤商在家休息時可開啟「報表」模組回顧歷史營業狀況。報表模組提供日、週、月、年四種檢視粒度，可切換不同市集比較。關鍵報表包括：營業額趨勢圖（看出淡旺季，如年宵前後營業額高峰）、商品銷售排行（找出明星商品與滯銷品）、市集比較表（哪個市集最賺錢，如 PMQ vs 大埔農墟）、支付方式分佈（現金 vs 電子支付比例變化）、時段分析（哪個時段最忙）。進階版提供洞察建議，如「您的手作飾品在 PMK 週末市集銷售最佳，建議下次備貨量增加 30%」、「您的電子支付佔比已達 65%，可考慮停用八達通實體接收器節省成本」。這些分析幫助攤商優化進貨與擺攤策略。"
));

// ----- Chapter 5: 軟件製作準備與技術選型 -----
bodyChildren.push(h1("五、軟件製作準備與技術選型"));

bodyChildren.push(h2("5.1 技術棧選擇與理由"));
bodyChildren.push(body(
  "技術棧選擇的核心原則是「快速開發、跨平台支援、離線優先、跨國可擴展、可控成本」。考量攤商同時使用 iOS 與 Android 手機、且需支援多國語系與多支付整合，採用跨平台框架是必然選擇。後端與資料庫選擇則以「成熟穩定、社群活躍、雲端原生支援、便於跨國部署」為標準。以下是各層技術選擇與詳細理由。"
));

bodyChildren.push(makeTable(
  ["技術層", "選擇方案", "理由與替代方案"],
  [
    ["前端框架", "React Native 0.74+", "跨平台（iOS + Android）一套程式碼；社群活躍、生態完整；團隊可共用 JS 技能。替代方案：Flutter（Dart 學習曲線較陡）、原生開發（成本過高）。"],
    ["狀態管理", "Zustand + React Query", "Zustand 輕量易學；React Query 處理伺服器狀態與快取。替代方案：Redux（過重）、MobX（學習成本高）。"],
    ["離線資料庫", "SQLite (via WatermelonDB)", "支援離線優先架構與複雜查詢；WatermelonDB 針對大量資料最佳化。替代方案：Realm（已停止維護）、AsyncStorage（功能不足）。"],
    ["雲端同步", "自建同步引擎 + AWS AppSync", "自建可控；AppSync 支援 GraphQL 自動同步。替代方案：Firebase Realtime DB（被供應商鎖定）、Supabase Realtime（較新）。"],
    ["後端框架", "Node.js + Express + TypeScript", "團隊 JS 技能共用；效能足夠；生態成熟。替代方案：Python FastAPI（團隊不熟）、Go（學習成本高）。"],
    ["主資料庫", "PostgreSQL 15", "關聯式適合交易資料；JSON 支援彈性欄位；免費開源。替代方案：MySQL（功能相近）、MongoDB（交易一致性較弱）。"],
    ["快取層", "Redis", "處理 session、限流、熱門報表快取。替代方案：Memcached（功能較少）。"],
    ["雲端平台", "AWS（香港 + 新加坡節點）", "服務完整；香港節點服務港台、新加坡節點服務東南亞。替代方案：GCP（功能相近）、阿里雲（中國市場考量）。"],
    ["身分驗證", "JWT + Firebase Auth", "Firebase Auth 支援 Google、Facebook、Apple 登入；JWT 無狀態適合分散式。替代方案：Auth0（收費偏高）。"],
    ["支付串接", "八達通 O!ePay + PayMe + AlipayHK + WeChat Pay HK + FPS + LINE Pay + TrueMoney + Touch'n Go + Stripe", "分階段整合：香港 5 大支付優先（V2），東南亞支付於擴張時整合（V3），全球 Stripe 整合於進軍歐美時。"],
    ["推播服務", "Firebase Cloud Messaging", "免費、跨平台。"],
    ["數據分析", "Mixpanel + Amplitude", "Mixpanel 做事件分析；Amplitude 做留存分析。"],
    ["多語系框架", "i18next + react-i18next", "成熟穩定；支援 5+ 語系；可動態切換。"],
  ],
  [12, 28, 60]
));
bodyChildren.push(tableCaption("表 3：MarketLedger 全球化技術棧一覽"));

bodyChildren.push(h2("5.2 開發工具與環境準備"));
bodyChildren.push(body(
  "除了核心技術棧，開發團隊還需要準備完整的開發工具鏈與協作環境。工具選擇以「提升團隊協作效率、確保程式碼品質、加速跨國迭代」為原則。以下是必要的開發工具清單與用途說明，建議在 MVP 啟動前兩週完成全部環境建置。"
));

bodyChildren.push(bulletMixed([{text: "版本控制：", bold: true}, {text: "GitHub（私有倉庫），搭配 GitHub Actions 做 CI/CD 自動化測試與部署。分支策略採 Git Flow（main/develop/feature/release/hotfix）。"}]));
bodyChildren.push(bulletMixed([{text: "專案管理：", bold: true}, {text: "Linear 進行任務管理與衝刺規劃。搭配 Notion 作為文件與會議記錄中心，支援多市場並行專案。"}]));
bodyChildren.push(bulletMixed([{text: "UI/UX 設計：", bold: true}, {text: "Figma 進行介面設計與原型製作。建立設計系統（Design System）確保多語系介面一致性。"}]));
bodyChildren.push(bulletMixed([{text: "通訊協作：", bold: true}, {text: "Slack 作為團隊日常溝通；Zoom 或 Google Meet 進行遠端會議；Loom 錄製功能展示影片。"}]));
bodyChildren.push(bulletMixed([{text: "開發環境：", bold: true}, {text: "VS Code（前端、後端）、Xcode（iOS build）、Android Studio（Android build）。統一使用 ESLint + Prettier 強制程式碼風格。"}]));
bodyChildren.push(bulletMixed([{text: "測試工具：", bold: true}, {text: "Jest（單元測試）、React Native Testing Library（元件測試）、Detox（E2E 測試）、Postman（API 測試）。MVP 目標測試覆蓋率 70% 以上。"}]));
bodyChildren.push(bulletMixed([{text: "監控與日誌：", bold: true}, {text: "Sentry（錯誤追蹤）、LogRocket（用戶行為錄製）、CloudWatch（AWS 服務監控）、Datadog（APM 效能監控）。"}]));
bodyChildren.push(bulletMixed([{text: "Beta 測試：", bold: true}, {text: "TestFlight（iOS）、Google Play Console 內部測試軌道（Android）。招募 30 至 50 位香港攤商進行封閉測試。"}]));

bodyChildren.push(h2("5.3 開發團隊人力配置"));
bodyChildren.push(body(
  "初期團隊規劃 5 至 6 人編制，以「精簡高效、技能互補、跨國準備」為原則。所有成員建議全職，並透過股權或選擇權激勵綁定。前 6 個月的核心任務是 MVP 開發與香港市場上線，第 7 至 12 個月則聚焦用戶增長、V2 開發與台灣市場擴張準備。"
));

bodyChildren.push(makeTable(
  ["職位", "人數", "月薪範圍 (HK$)", "主要職責"],
  [
    ["產品經理 / 創辦人", "1", "30,000-45,000", "產品策略、用戶研究、UI/UX 設計、與市集主辦方洽談、營運決策"],
    ["全端工程師", "2", "30,000-45,000", "前後端開發、API 設計、資料庫架構、雲端部署、CI/CD"],
    ["行動端工程師", "1", "30,000-45,000", "React Native 開發、離線資料庫、推播、相機條碼掃描"],
    ["後端工程師（兼職）", "1", "20,000-28,000", "後端 API、雲端同步引擎、支付串接、報表計算"],
    ["行銷 / 地推（兼職）", "1", "15,000-22,000", "香港市集現場地推、社群經營、KOL 合作、市集主辦方接觸"],
  ],
  [22, 8, 18, 52]
));
bodyChildren.push(tableCaption("表 4：初期團隊人力配置與月薪範圍（港幣）"));

bodyChildren.push(h2("5.4 開發成本估算"));
bodyChildren.push(body(
  "開發成本分為一次性開發成本與月營運成本。一次性開發成本涵蓋 MVP 開發期間（3 個月）的所有支出；月營運成本則涵蓋上線後的持續支出。以下是詳細估算，所有數字均以港幣（HK$）為單位。"
));

bodyChildren.push(makeTable(
  ["成本項目", "MVP 開發期（3 個月）HK$", "上線後月營運 HK$", "備註"],
  [
    ["人事成本", "270,000-330,000", "100,000-130,000", "5 人團隊，含強積金與獎金"],
    ["雲端服務費", "5,000-8,000", "5,000-12,000", "AWS 香港+新加坡節點，依用戶數成長"],
    ["第三方服務費", "3,000-5,000", "3,000-8,000", "Mixpanel、Sentry、Firebase 等"],
    ["開發者帳號", "1,500", "500", "Apple Developer US$99/年、Google Play US$25 一次性"],
    ["設備與軟體", "20,000-30,000", "2,000", "測試機（iPhone + Android）、MacBook、軟體授權"],
    ["辦公空間", "15,000-22,000", "5,000-8,000", "共享辦公空間（如 The Wave、Metta）"],
    ["行銷推廣", "20,000-40,000", "20,000-30,000", "市集現場推廣、社群廣告、KOL 合作"],
    ["雜項與預備金", "15,000-25,000", "3,000-5,000", "法務、會計、雜支"],
    ["合計", "350,000-460,000", "138,000-195,000", ""],
  ],
  [22, 26, 22, 30]
));
bodyChildren.push(tableCaption("表 5：開發與營運成本估算（港幣）"));

bodyChildren.push(body(
  "從成本結構可看出，人事成本佔總成本約 70% 至 75%，是最大的支出項目。香港工程師薪資較高（資深全端工程師月薪 HK$ 35,000 至 50,000），是團隊規劃僅 5 人的主因。雲端與第三方服務費佔比約 5% 至 8%，隨用戶數成長會逐步上升但佔比仍低。建議創辦人準備至少 12 個月的營運資金（約 HK$ 220 至 280 萬元），以確保有充足時間驗證產品市場契合度、擴張至第二個市場（台灣）並完成 A 輪融資。"
));

// ----- Chapter 6: 獲利模式分析 -----
bodyChildren.push(h1("六、獲利模式分析"));

bodyChildren.push(h2("6.1 Freemium 訂閱制（核心變現）"));
bodyChildren.push(body(
  "Freemium（免費增值）是本產品的核心變現模式。免費版提供基本記帳與當日結算功能，足以讓攤商完成日常工作流程；付費版則提供雲端備份、多裝置同步、報表匯出、報稅協助與進階數據分析等進階能力。訂閱方案分為月費與年費兩種，年費提供約 17% 折扣以鼓勵長期訂閱。定價策略採「價值導向定價」，反映付費版為攤商創造的價值（節省時間、增加營業額、降低報稅成本）而非單純成本加成。定價以港幣為基準，其他市場依當地購買力調整。"
));

bodyChildren.push(makeTable(
  ["方案", "月費", "年費", "目標用戶", "核心功能"],
  [
    ["免費版 Free", "HK$ 0", "HK$ 0", "新手、偶爾擺攤者", "基本記賬、當日結算、本地備份、單市集、7 天歷史報表"],
    ["進階版 Pro", "HK$ 38", "HK$ 380", "常態攤商", "雲端備份、多裝置同步、無限歷史報表、報表匯出、多市集切換、多幣種、進階數據分析"],
    ["專業版 Business", "HK$ 98", "HK$ 980", "連鎖攤商、市集主辦方", "Pro 全功能 + 報稅協助 + 團隊協作 + 全支付整合 + 優先客服"],
  ],
  [18, 12, 14, 24, 32]
));
bodyChildren.push(tableCaption("表 6：MarketLedger 訂閱方案與定價（港幣）"));

bodyChildren.push(body(
  "定價邏輯說明：免費版 intentionally 限制 7 天歷史報表，目的是讓用戶體驗核心價值後產生「想要看更長歷史」的付費動機。Pro 版月費 HK$ 38 定價參考香港一杯中價咖啡的價格（HK$ 35 至 45），降低付費心理門檻；同時考量攤商每月營業額（平均 HK$ 8,000 至 30,000），HK$ 38 僅佔月營業額 0.1% 至 0.5%，負擔極輕。Business 版 HK$ 98 則針對有員工或多攤位的進階攤商，提供團隊功能與報稅協助。海外市場定價依當地購買力調整：台灣 NT$ 149/月、泰國 THB 199/月、馬來西亞 RM 19/月、新加坡 SG$ 8/月，皆為當地一杯咖啡的等值價格。"
));

bodyChildren.push(h2("6.2 加值功能單次付費"));
bodyChildren.push(body(
  "除了訂閱制，本產品還提供加值功能的單次付費選項，滿足不願訂閱但有特定需求的用戶。加值功能定位為「一次性需求」或「特殊場景」，不與訂閱功能重複。這條變現線預估貢獻總營收 10% 至 15%。"
));

bodyChildren.push(bulletMixed([{text: "報稅套件：", bold: true}, {text: "單次 HK$ 199，提供完整年度銷售報表匯出、報稅格式轉換（香港利得稅、台灣營業稅、泰國 VAT）、稅務顧問諮詢一次。每年 4 月香港報稅季前後銷售。"}]));
bodyChildren.push(bulletMixed([{text: "市集情報報告：", bold: true}, {text: "單次 HK$ 99，提供指定市集的詳細情報報告（人流、客單價、熱銷品類、淡旺季、跨國比較）。每月更新。"}]));
bodyChildren.push(bulletMixed([{text: "客製化報表：", bold: true}, {text: "單次 HK$ 69，依用戶指定維度生成客製化報表（如某商品跨市集比較、跨年度趨勢）。"}]));
bodyChildren.push(bulletMixed([{text: "專屬客服支援：", bold: true}, {text: "單次 HK$ 199，提供 1 對 1 視訊教學與顧問服務，協助設定商品與優化流程。支援粵語、普通話、英語。"}]));

bodyChildren.push(h2("6.3 B2B 白標授權"));
bodyChildren.push(body(
  "B2B 白標授權是中期最具成長潛力的變現模式。目標客戶是大型市集主辦方（如香港年宵市場策劃單位、JFFLUX、PMQ 元創方、台灣簡單生活節、泰國 Chatuchak 管理局、馬來西亞各類市集協會），提供客製化的「市集管理後台 + 攤商 App」整體方案。主辦方可透過系統管理攤位申請、收取攤位費、聚合營業數據、發送活動訊息。授權方案採年費制，依攤位數量分級定價。"
));

bodyChildren.push(makeTable(
  ["方案", "適用規模", "年費 (HK$)", "包含項目"],
  [
    ["小型方案", "50 攤位以下", "12,000", "白標 App、後台管理、技術支援、5 小時教育訓練"],
    ["中型方案", "50-200 攤位", "38,000", "小型方案全功能 + 客製化品牌 + 進階數據分析 + 優先支援"],
    ["大型方案", "200 攤位以上", "80,000-150,000", "中型方案全功能 + API 串接 + 專屬客戶經理 + 年度策略顧問"],
  ],
  [16, 22, 18, 44]
));
bodyChildren.push(tableCaption("表 7：B2B 白標授權方案定價（港幣）"));

bodyChildren.push(body(
  "B2B 模式的優勢在於「客單價高、客戶黏著度強、口碑效應大」。一個大型市集主辦方採用後，旗下所有攤商（可能數百至數千個）都會被拉入生態，等於一次獲得多個 C 端用戶。預估第二年可簽下 5 至 8 個中型主辦方、2 至 3 個大型主辦方，貢獻年營收約 HK$ 50 至 90 萬元。第三年隨跨國擴張，B2B 營收可達 HK$ 200 至 350 萬元。"
));

bodyChildren.push(h2("6.4 其他潛在變現模式"));
bodyChildren.push(body(
  "除了上述三條主要變現線，本產品還有三個長期可探索的變現機會。這些模式需在用戶規模達一定基礎（10 萬以上用戶）後才適合啟動，目前僅作為長期規劃參考。"
));

bodyChildren.push(bulletMixed([{text: "進貨採購市集分潤：", bold: true}, {text: "整合原物料供應商，攤商透過系統下單採購，從交易金額抽 3% 至 5% 分潤。需 V3 階段啟動。"}]));
bodyChildren.push(bulletMixed([{text: "全球數據情報訂閱：", bold: true}, {text: "將聚合的去識別化市集銷售數據，整理為跨國情報報告，訂閱給投資人、媒體、研究機構、品牌方。年費 HK$ 5,000 至 30,000。"}]));
bodyChildren.push(bulletMixed([{text: "支付手續費分潤：", bold: true}, {text: "與 PayMe、AlipayHK、八達通等合作推薦攤商使用，從手續費分潤 0.1% 至 0.3%。需規模化後才有議價能力。"}]));

bodyChildren.push(h2("6.5 推薦變現組合與營收預估"));
bodyChildren.push(body(
  "綜合考量市場成熟度、團隊資源與用戶接受度，建議採「三階段變現策略」。第一階段（第 1 至 6 個月）以 Freemium 訂閱為主，專注建立香港用戶基礎與驗證付費意願；第二階段（第 7 至 12 個月）加入加值功能與 B2B 授權，並啟動台灣市場；第三階段（第 13 個月起）擴張至泰國、馬來西亞，啟動進貨採購與數據情報等生態型變現。各階段營收佔比預估如下表。"
));

bodyChildren.push(makeTable(
  ["變現模式", "第一年佔比", "第二年佔比", "第三年佔比"],
  [
    ["Freemium 訂閱", "85%", "65%", "50%"],
    ["加值功能單次", "10%", "12%", "10%"],
    ["B2B 白標授權", "5%", "18%", "25%"],
    ["進貨採購分潤", "0%", "3%", "8%"],
    ["數據情報訂閱", "0%", "2%", "7%"],
    ["合計年營收 (HK$)", "約 150 萬", "約 480 萬", "約 1,200 萬"],
  ],
  [30, 22, 24, 24]
));
bodyChildren.push(tableCaption("表 8：各變現模式營收佔比與預估（港幣）"));

// ----- Chapter 7: 行銷與推廣策略 -----
bodyChildren.push(h1("七、行銷與推廣策略"));

bodyChildren.push(h2("7.1 ASO 與應用商店優化"));
bodyChildren.push(body(
  "應用商店優化（App Store Optimization, ASO）是獲客成本最低的管道，必須在 App 上線前就完成基礎優化。關鍵字研究顯示，香港用戶搜尋記賬相關 App 時最常使用的關鍵字包括「記帳」、「記帳 App」、「攤商記帳」、「市集」、「小店記帳」、「營業額計算」、「墟市」、「年宵」等。為了同時覆蓋香港、台灣、東南亞市場，App 名稱建議為「MarketLedger 市集記賬本」，副標題為「攤商專用 3 秒記帳」，兼顧品牌辨識與關鍵字覆蓋。"
));
bodyChildren.push(body(
  "ASO 優化重點還包括：App 描述前 3 行必須清楚傳達核心價值主張；截圖需呈現「3 秒記帳」、「當日結算」、「商品排行」三大核心場景，並製作繁中、簡中、英文、泰文、馬來文五種語系截圖；評分與評論需透過主動邀請滿意用戶評分來維持 4.5 星以上；定期更新版本與發布說明以提升搜尋排名。各市場 App Store 與 Google Play 的關鍵字熱度不同，需分別優化。預估 ASO 可貢獻自然下載量約佔總下載 40% 至 50%。"
));

bodyChildren.push(h2("7.2 市集現場地推"));
bodyChildren.push(body(
  "市集現場地推是本產品最獨特且最有效的獲客管道。團隊成員實際走訪各大市集，在現場向攤商介紹 App、協助下載安裝、提供首次使用教學。地推的優勢在於「直接接觸目標用戶、可現場示範、建立信任感」，是任何數位廣告都無法比擬的。香港方面建議每週至少參加 1 至 2 個市集（如 PMQ 週末市集、大埔農墟、JFFLUX、年宵市場），每月觸及 80 至 120 個攤商。台灣、泰國、馬來西亞市場擴張後，地推團隊亦需同步建立。"
));
bodyChildren.push(body(
  "地推的執行細節包括：準備簡易宣傳單與 QR Code 立牌，攤商掃碼即可下載；提供首次下載的攤商專屬優惠（如免費試用 Pro 版 3 個月）；選擇非營業尖峰時段（如開市前 1 小時或收攤前 30 分鐘）接觸攤商，避免打擾做生意；過程中拍攝見證影片，作為後續社群行銷素材。地推的成本主要是人力與交通，預估每獲取一個下載用戶成本約 HK$ 25 至 40，遠低於數位廣告（HK$ 80 至 150）。"
));

bodyChildren.push(h2("7.3 社群經營與內容行銷"));
bodyChildren.push(body(
  "社群經營以 Facebook、Instagram、WhatsApp Business、LINE 官方帳號（台灣市場）、YouTube 頻道為主。各市場合適的社群平台不同：香港以 WhatsApp Business 與 Instagram 為主，台灣以 LINE 官方帳號與 Facebook 為主，泰國以 LINE 與 Facebook 為主，馬來西亞以 WhatsApp 與 Facebook 為主。內容策略聚焦於「攤商日常」、「市集情報」、「記賬教學」三大主題。每週發布 3 至 5 篇貼文，內容包括：攤商成功故事、市集營業額排行、報稅教學、擺攤技巧等。"
));
bodyChildren.push(body(
  "內容行銷的長期資產是「全球市集情報部落格」。每週發布 1 至 2 篇深度文章，例如「2026 年全球 10 大必逛市集」、「香港年宵市場攤商生存指南」、「泰國 Chatuchak 擺攤全攻略」、「擺攤必備 10 樣工具」、「各國市集報稅比較」等，透過 SEO 吸引長尾搜尋流量。內容需提供繁中、簡中、英文三種版本以覆蓋最大流量。預估 6 個月內可累積 50 篇以上文章，每月自然搜尋流量可達 2 至 4 萬人次，轉換為 App 下載的比例約 3% 至 5%。"
));

bodyChildren.push(h2("7.4 KOL 與媒體合作"));
bodyChildren.push(body(
  "KOL 合作聚焦於「市集擺攤」、「創業」、「副業」、「手作」主題的 YouTuber 與 Instagram 網紅。香港方面建議合作名單包括：香港手作 YouTuber（如「手作MAMA」類型創作者）、創業型 KOL（如「Success</p>」雜誌網紅）、文創市集型網紅（如「香港手作市集」Facebook 群組管理員）。台灣方面包括擺攤系 YouTuber、創業型 KOL。泰國方面包括 Bangkok夜市 YouTuber。合作方式包括：產品開箱影片（付費 HK$ 3,000 至 10,000）、聯名貼文（HK$ 1,500 至 5,000）、長期代言（每月 HK$ 8,000 至 15,000）。每支 KOL 影片預估可帶來 300 至 1,500 次下載。"
));
bodyChildren.push(body(
  "媒體合作以香港科技與創業媒體為主，包括 HK01、Unwire.hk、e-zone、Jetso、新假期、BossMind、Hong Kong Economic Times 等；台灣方面包括數位時代、INSIDE、Meet 群眾觀點；東南亞方面包括 Tech in Asia、e27、KrAsia 等區域科技媒體。建議在 MVP 上線時發布新聞稿、於第 3 個月與第 6 個月發布里程碑新聞（如「用戶破萬」、「與 XX 市集合作」）、定期接受媒體專訪。媒體報導不僅帶來下載，更是建立品牌公信力與吸引投資人的關鍵。"
));

bodyChildren.push(h2("7.5 與市集主辦方策略合作"));
bodyChildren.push(body(
  "與市集主辦方合作是「B2B2C 雙向獲客」的高效策略。一方面主辦方成為 B2B 客戶，另一方面旗下攤商被拉入生態成為 C 端用戶。建議從中型市集主辦方切入（每場 50 至 200 攤位），因為這類主辦方有數位化需求但預算有限，本產品的中小型方案定價（年費 HK$ 38,000）正好符合需求。香港方面目標包括 PMQ 元創方、D2 Place、JFFLUX、好東西市集、各區民政事務處推動的社區市集等。"
));
bodyChildren.push(body(
  "合作模式包括：成為主辦方的「官方指定記賬工具」，所有攤商使用本系統報名與記賬；主辦方在活動文宣中露出本產品品牌；攤商使用本系統享專屬優惠（如 Pro 版 3 個月免費）；活動後提供主辦方詳細營業數據報告，作為下次活動招商依據。預估第一年可簽下 3 至 5 個香港中型主辦方，觸及 500 至 1,000 個攤商。第二年擴張至台灣、泰國、馬來西亞後，B2B 合作數量預估可達 15 至 20 個。"
));

bodyChildren.push(h2("7.6 分階段全球推廣計畫"));
bodyChildren.push(body(
  "整體行銷推廣分為三個階段，每個階段對應一個市場擴張節點。階段一聚焦「香港試點驗證」、階段二聚焦「台灣擴張驗證跨國複製」、階段三聚焦「東南亞規模化」。每個階段約 4 至 6 個月。"
));

bodyChildren.push(makeTable(
  ["階段", "時間", "目標市場", "主要策略", "預期下載量"],
  [
    ["一、香港試點", "1-3 月", "香港", "地推為主、ASO 基礎、年宵市場借勢", "2,000-3,500"],
    ["二、台灣擴張", "4-9 月", "香港+台灣", "KOL 合作、社群經營、媒體曝光、第一波 B2B", "12,000-20,000"],
    ["三、東南亞佈局", "10-18 月", "香港+台灣+泰國+馬來西亞", "B2B 加速、進貨採購、市集情報訂閱、新加坡試點", "60,000-100,000"],
    ["四、全球擴張", "19-36 月", "東南亞+歐美試點", "歐美 Farmers Market、品牌國際化、IPO 準備", "250,000+"],
  ],
  [16, 10, 22, 36, 16]
));
bodyChildren.push(tableCaption("表 9：分階段全球推廣計畫與預期成效"));

// ----- Chapter 8: 財務預估與損益分析 -----
bodyChildren.push(h1("八、財務預估與損益分析"));

bodyChildren.push(h2("8.1 營收預估（三情境分析）"));
bodyChildren.push(body(
  "營收預估採「保守、基準、樂觀」三情境分析，反映跨國擴張的不確定性。基準情境假設香港下載量符合預期、付費轉換率達 8%、B2B 簽約進度符合規劃、台灣於第 7 個月擴張成功；保守情境假設下載量為基準的 60%、付費轉換率 5%、B2B 簽約延遲、台灣擴張延後 3 個月；樂觀情境假設下載量為基準的 130%、付費轉換率 12%、B2B 超額簽約、東南亞擴張提前。以下為三年預估。"
));

bodyChildren.push(makeTable(
  ["年度", "保守情境", "基準情境", "樂觀情境"],
  [
    ["第一年（香港）", "下載 3,000 / HK$ 60 萬", "下載 6,500 / HK$ 150 萬", "下載 10,000 / HK$ 220 萬"],
    ["第二年（港+台）", "下載 18,000 / HK$ 280 萬", "下載 35,000 / HK$ 480 萬", "下載 55,000 / HK$ 720 萬"],
    ["第三年（港台泰馬）", "下載 50,000 / HK$ 650 萬", "下載 110,000 / HK$ 1,200 萬", "下載 180,000 / HK$ 1,800 萬"],
  ],
  [22, 26, 26, 26]
));
bodyChildren.push(tableCaption("表 10：三年營收預估（下載量 / 年營收 HK$）"));

bodyChildren.push(body(
  "營收預估基於以下假設：第一年付費轉換率 6% 至 10%（業界 Freemium 平均 5% 至 15%）、ARPU（每付費用戶平均收入）每年 HK$ 380 至 580（混合月費與年費）、B2B 客戶第一年簽 3 至 5 家、第二年 8 至 12 家、第三年 15 至 20 家。各市場 ARPU 不同：香港 HK$ 580、台灣 HK$ 480（NT$ 1,800）、泰國 HK$ 280（THB 1,200）、馬來西亞 HK$ 250（RM 140）。這些假設略高於業界平均，反映市集場景的獨特優勢（用戶黏著度高、B2B 客單價高），但仍有跨國擴張不確定性。"
));

bodyChildren.push(h2("8.2 成本結構與損益兩平分析"));
bodyChildren.push(body(
  "成本結構分為固定成本與變動成本。固定成本包括人事、辦公室、基本雲端服務費，每月約 HK$ 13 至 18 萬元；變動成本包括行銷推廣、客服、雲端增量、第三方服務費、跨國稅務與法務，約佔營收 25% 至 35%。損益兩平點的計算公式為：固定成本 ÷（1 - 變動成本率），即每月 HK$ 18 萬 ÷（1 - 30%）= HK$ 25.7 萬元月營收。換算為用戶規模約為：1.5 萬付費用戶 + 3 個中型 B2B 客戶。"
));

bodyChildren.push(makeTable(
  ["項目", "第一年 (HK$)", "第二年 (HK$)", "第三年 (HK$)"],
  [
    ["總營收（基準）", "150 萬", "480 萬", "1,200 萬"],
    ["人事成本", "180 萬", "300 萬", "480 萬"],
    ["雲端與技術", "10 萬", "35 萬", "100 萬"],
    ["行銷推廣", "35 萬", "80 萬", "130 萬"],
    ["辦公與雜項", "15 萬", "28 萬", "50 萬"],
    ["跨國法務與稅務", "5 萬", "20 萬", "40 萬"],
    ["總成本", "245 萬", "463 萬", "800 萬"],
    ["淨損益", "-95 萬", "+17 萬", "+400 萬"],
    ["現金流累計", "-335 萬", "-318 萬", "+82 萬"],
  ],
  [22, 26, 26, 26]
));
bodyChildren.push(tableCaption("表 11：三年損益預估（基準情境，港幣）"));

bodyChildren.push(body(
  "從損益預估可看出，第一年為虧損期（淨損 HK$ 95 萬），需準備充足資金；第二年達損益兩平並微利（淨利 HK$ 17 萬）；第三年進入獲利期（淨利 HK$ 400 萬）。現金流方面，第一年底累計現金缺口約 HK$ 335 萬（含初期開發成本 HK$ 40 萬 + 營運虧損 HK$ 95 萬 + 預備金），需在第一年底前完成 A 輪融資約 HK$ 500 至 800 萬以支應第二年擴張與跨國佈局。第三年起可自給自足，並啟動更大規模的全球擴張。"
));

bodyChildren.push(h2("8.3 資金需求與融資規劃"));
bodyChildren.push(body(
  "基於上述財務預估，建議分兩階段融資。種子輪（Seed）於產品開發前完成，目標募集 HK$ 220 至 350 萬元，用於 MVP 開發與第一年香港營運，資金來源為創辦人自有資金、香港天使投資人（如 AngelHub 系統、香港天使投資脈絡）、大灣區微型創投（如 Gobi Partners 大灣區基金、Mindworks 創投）。A 輪於第一年底或第二年初完成，目標募集 HK$ 800 至 1,500 萬元，用於第二年台灣擴張、團隊擴編、東南亞佈局與 B2B 業務加速，目標投資人為亞洲早期創投（如 SOSV、500 Global、AppWorks、Jungle Ventures、Cento Ventures）。"
));
bodyChildren.push(body(
  "股權規劃建議：種子輪釋出 15% 至 20% 股權，A 輪釋出 20% 至 25%，創辦人與團隊保留 55% 至 65%。建議設立員工選擇權池（ESOP）10%，用於招募與留才。估值方面，種子輪 Pre-money 估值建議 HK$ 800 萬至 1,500 萬（依團隊背景與產品成熟度），A 輪 Pre-money 估值建議 HK$ 3,000 萬至 6,000 萬（依第一年用戶數、營收與跨國擴張進度）。可考慮申請香港數碼港培育計劃（Cyberport Incubation Programme）或香港科技園（HKSTP）的資助，分別可獲得 HK$ 50 萬與 HK$ 130 萬的資助。"
));

// ----- Chapter 9: 開發時程與里程碑 -----
bodyChildren.push(h1("九、開發時程與里程碑"));

bodyChildren.push(h2("9.1 MVP 開發時程（第 1-3 個月）"));
bodyChildren.push(body(
  "MVP 開發採敏捷開發模式，每兩週一個衝刺（Sprint），共 6 個衝刺。每個衝刺結束時進行 Demo 與回顧，確保進度與品質。開發順序依「用戶價值優先級」排列，先完成最核心的記賬與結算功能，再補充周邊功能。"
));

bodyChildren.push(makeTable(
  ["階段", "時程", "主要任務", "交付成果"],
  [
    ["準備期", "第 0 週", "團隊組建、環境建置、設計系統、技術選型確認", "開發環境就緒、設計稿完成"],
    ["衝刺 1", "第 1-2 週", "商品管理、快速記帳 UI、本地 SQLite", "可在單市集記帳與查看當日紀錄"],
    ["衝刺 2", "第 3-4 週", "當日結算、歷史報表、報表 UI", "可結算與查看 7 天歷史"],
    ["衝刺 3", "第 5-6 週", "多市集切換、商品分類、設定頁、多幣種", "可切換市集與管理多幣別"],
    ["衝刺 4", "第 7-8 週", "雲端同步、使用者註冊登入、付費方案", "可雲端備份與付費訂閱"],
    ["衝刺 5", "第 9-10 週", "離線衝突解決、錯誤修復、效能優化", "穩定度達 Beta 標準"],
    ["衝刺 6", "第 11-12 週", "Beta 測試、ASO 準備、上架審核", "TestFlight 與 Play Console 上架"],
  ],
  [12, 14, 36, 38]
));
bodyChildren.push(tableCaption("表 12：MVP 12 週開發衝刺規劃"));

bodyChildren.push(h2("9.2 Beta 測試計畫"));
bodyChildren.push(body(
  "Beta 測試於衝刺 5 啟動，分為封閉測試與公開測試兩階段。封閉測試招募 30 至 50 位真實攤商（以香港為主，少量台灣攤商驗證跨市場相容性），提供 TestFlight 與 Play Console 內部測試連結，請他們實際在市集使用並回饋。每位測試者需完成問卷與 30 分鐘訪談，回饋內容包括：操作流暢度、功能完整性、錯誤狀況、改善建議、跨語系/跨幣別體驗。封閉測試期程為 3 週，結束後進行修正再進入公開測試。"
));
bodyChildren.push(body(
  "公開測試透過社群與地推招募 200 至 500 位用戶，提供 Pro 版免費 3 個月作為回饋。公開測試目標是驗證大規模使用下的穩定性、收集多樣化使用場景、累積首批口碑見證。公開測試期程為 4 週，結束後正式上架 App Store 與 Google Play。Beta 測試期間發現的所有錯誤與建議都記錄在 Linear 系統，依優先級處理。"
));

bodyChildren.push(h2("9.3 後續版本規劃"));
bodyChildren.push(body(
  "MVP 上線後的版本規劃依「用戶回饋優先級」與「跨國擴張優先級」雙軌進行。每個月發布一個小版本（修復與小功能），每季發布一個大版本（新功能模組或新市場支援）。版本規劃如下表，實際內容依用戶回饋與市場擴張進度動態調整。"
));

bodyChildren.push(makeTable(
  ["版本", "時程", "核心功能", "商業目標"],
  [
    ["V1.0 MVP", "第 3 個月", "記帳、結算、報表、多市集、多幣種", "驗證香港 PMF、累積 3,000 用戶"],
    ["V1.5", "第 5 個月", "條碼掃描、語音記帳、UI 優化、繁簡英三語", "提升留存、降低 churn"],
    ["V2.0", "第 7 個月", "香港 5 大支付整合、報稅協助、進階報表、台灣市場上線", "提升付費轉換至 10%、台灣擴張"],
    ["V2.5", "第 9 個月", "團隊協作、客製化報表、泰文介面、泰國市場上線", "提升 ARPU 與泰國試點"],
    ["V3.0", "第 13 個月", "市集主辦方後台、攤位媒合、馬來西亞上線", "啟動生態與東南亞規模化"],
    ["V3.5", "第 18 個月", "進貨採購市集、新加坡上線、英文介面優化", "拓展營收來源與歐美準備"],
    ["V4.0", "第 24 個月", "歐美試點、Square/Stripe 整合、多語系擴充", "進軍歐美 Farmers Market"],
  ],
  [14, 14, 36, 36]
));
bodyChildren.push(tableCaption("表 13：後續版本規劃與跨國擴張進度"));

// ----- Chapter 10: 風險評估與應對策略 -----
bodyChildren.push(h1("十、風險評估與應對策略"));

bodyChildren.push(h2("10.1 市場風險"));
bodyChildren.push(body(
  "市場風險主要來自三方面。第一是「香港市場規模較小」：香港活躍攤商僅 2 至 3 萬名，付費市場可能僅 3,000 至 5,000，需快速擴張至其他市場才能規模化。應對策略是香港試點期程壓縮至 6 個月，第 7 個月即啟動台灣擴張；同時積極開發 B2B 客戶以彌補 C 端規模不足。第二是「各市場數位化程度差異」：泰國、馬來西亞攤商數位化程度較低，可能影響下載與留存。應對策略是設計極簡介面、與當地市集主辦方深度合作、提供當地語系與支付方式、與當地創投或加速器合作（如泰國 KBank 轉投資、馬來西亞 Cradle Fund）。第三是「跨國付費意願差異」：東南亞攤商付費意願可能低於香港。應對策略是依當地購買力調整定價、強化免費版功能以擴大用戶基礎、透過 B2B 與加值服務彌補訂閱收入。"
));

bodyChildren.push(h2("10.2 技術風險"));
bodyChildren.push(body(
  "技術風險主要包括三項。第一是「離線同步衝突」：多用戶多裝置同步時可能發生資料衝突，跨國時區差異更增加複雜度。應對策略是採用「最後寫入優先 + 欄位級合併」演算法、提供衝突解決 UI、定期備份可還原。第二是「多支付整合延遲」：八達通、PayMe、AlipayHK 等 API 串接與審核流程可能延遲，各國支付 API 文件品質參差不齊。應對策略是 V2 階段才啟動支付整合、預留 2 個月緩衝、準備替代方案（如手動輸入）、優先整合文件完整的支付（PayMe、FPS）。第三是「跨平台與多語系相容性」：React Native 在 iOS 與 Android 可有效能差異，多語系介面可能造成佈局錯亂（特別是泰文、馬來文）。應對策略是優先測試主流機型、使用原生模組處理效能瓶頸、為每種語系設計彈性佈局、定期升級框架版本。"
));

bodyChildren.push(h2("10.3 競爭風險"));
bodyChildren.push(body(
  "競爭風險主要來自大型廠商的進入。第一是「餐飲 POS 廠商向下延伸」：iCHEF HK、Eats365、StoreHub 可能推出輕量版搶市。應對策略是深化「市集場景」差異化（多市集、離線、移動、多幣種）、建立 B2B 客戶黏著度、加速用戶規模化、建立跨國網絡效應。第二是「支付業者擴充功能」：PayMe、AlipayHK、八達通可能擴充商家銷售分析功能。應對策略是與之合作而非對抗（從手續費分潤）、聚焦他們不會做的「記賬 + 報表 + 報稅 + 跨國」整合。第三是「本地競品崛起」：泰國、馬來西亞本地新創可能推出相似產品。應對策略是快速進入市場建立先發優勢、與當地市集主辦方建立獨家合作、收購或投資潛在競品。第四是「全球科技巨頭進入」：Google、Square 等可能推出相似功能。應對策略是聚焦利基市場、建立深度整合與品牌忠誠度、避免正面競爭。"
));

bodyChildren.push(h2("10.4 法規與合規風險"));
bodyChildren.push(body(
  "跨國營運的法規風險顯著高於單一市場。第一是「稅務法規差異」：香港利得稅 8.25%/16.5%、台灣營業稅 5%/營所稅 20%、泰國 VAT 7%/企業所得稅 20%、馬來西亞 SST 6%/8%、新加坡 GST 9%/企業所得稅 17%，各國稅制差異大且年年變動。應對策略是與各國會計師事務所合作定期審核、聲明「報表僅供參考實際申報請諮詢專業」、報稅模組設計為可配置式以適應各國規範、避免提供具體稅務建議。第二是「個人資料保護」：香港《個人資料（私隱）條例》（PDPO）、台灣《個人資料保護法》、泰國 PDPA、馬來西亞 PDPA、新加坡 PDPA、歐盟 GDPR 等各國個資法規不同。應對策略是制定統一的隱私權政策並依各國法規補充、取得用戶同意、最小化收集資料、提供資料刪除功能、資料儲存於符合當地法規的雲端節點。第三是「支付與金融監管」：香港金管局（HKMA）、泰國央行（BOT）、馬來西亞國家銀行（BNM）對支付服務有不同監管要求。應對策略是不直接持有用戶資金（僅透過 API 串接支付）、與持牌支付機構合作、必要時申請支付服務提供者牌照。"
));

bodyChildren.push(h2("10.5 資金與營運風險"));
bodyChildren.push(body(
  "資金風險主要在於融資進度延遲或營收不如預期。第一是「A 輪融資失敗」：若第一年營收未達基準情境，A 輪融資可能困難，跨國擴張將被迫延後。應對策略是保守控制現金消耗（保留至少 9 個月現金）、準備 Bridge Round（過橋貸款）方案、積極申請香港與各國政府補助（數碼港、科技園、數位發展局 ODI）、調整擴張節奏。第二是「現金流斷裂」：跨國營運增加現金流複雜度，各國應收帳款時差與匯率波動可能造成壓力。應對策略是 B2B 採預收年費制、維持 9 個月以上現金緩衝、與銀行建立額度備用、適度使用外匯避險工具。第三是「團隊流失與跨國管理」：核心成員離職或跨國團隊管理失當將嚴重影響營運。應對策略是提供具競爭力的薪資與股權、建立知識文件降低單點依賴、培養接班人、採用異步協作工具（Notion、Linear、Loom）降低時區協作摩擦、定期舉辦全員實體聚會。"
));

// ----- Chapter 11: 結論與下一步行動 -----
bodyChildren.push(h1("十一、結論與下一步行動"));

bodyChildren.push(h2("11.1 企劃核心結論"));
bodyChildren.push(body(
  "本企劃書的核心結論是：全球市集記賬市場存在明確缺口，本產品 MarketLedger 透過「場景專注、極簡操作、離線優先、跨國可複製」四大差異化定位，以香港為策略樞紐，有機會在 36 個月內成為全球市集記賬領域的領導品牌。產品切入時機正確（全球市集經濟復甦、東南亞數位化浪潮、跨境擺攤需求浮現）、技術選型合理（跨平台 + 雲端原生 + 多支付多幣種）、商業模式清晰（Freemium + B2B + 加值服務）、財務規劃可行（18 個月達損益兩平、三年營收 HK$ 1,200 萬）。"
));
bodyChildren.push(body(
  "從全球市場規模來看，全球超過 1,000 萬攤商的長尾市場足夠支撐一家專注的跨國新創公司，且亞洲市集文化圈（香港、台灣、泰國、馬來西亞、印尼、越南）合計超過 300 萬攤商，是本產品的首要目標區域。從競爭態勢來看，目前全球沒有直接競品，現有競品（餐飲 POS、支付商戶端、記帳 App、進銷存軟體）各自有明確的市場定位限制，短期內不會大幅轉向。從香港樞紐優勢來看，香港作為國際化程度極高的城市，是測試產品在多語系、多幣種、多支付場景下運作的最佳試點，且毗鄰大灣區與東南亞，便於快速擴張。"
));

bodyChildren.push(h2("11.2 立即可執行的下一步"));
bodyChildren.push(body(
  "基於本企劃書的規劃，建議創辦人在接下來 4 週內完成以下五項關鍵行動。這些行動是後續所有工作的基礎，必須優先完成。"
));

bodyChildren.push(bulletMixed([{text: "第 1 週：", bold: true}, {text: "完成種子輪融資簡報與財務模型，接觸 5 至 8 位香港天使投資人與大灣區微型創投，目標 4 週內取得 2 至 3 個投資意向。同時註冊香港公司（股份有限公司）、開立銀行帳戶、向稅務局申請商業登記（BR）。申請數碼港或科技園培育計劃。"}]));
bodyChildren.push(bulletMixed([{text: "第 2 週：", bold: true}, {text: "啟動團隊招募，優先尋找 2 名全端工程師與 1 名行動端工程師。從香港工程師社群（如 LinkedIn、HK Golden、Programmer 群組、HKTVjobs）招募，目標 6 週內完成核心團隊組建。"}]));
bodyChildren.push(bulletMixed([{text: "第 3 週：", bold: true}, {text: "進行 20 位香港攤商深度訪談（涵蓋年宵、農墟、文創市集三類），驗證產品假設與功能優先級。同時走訪 5 至 8 個市集現場，建立與 PMQ、JFFLUX、大埔農墟等主辦方的初步關係。"}]));
bodyChildren.push(bulletMixed([{text: "第 4 週：", bold: true}, {text: "完成 Figma 設計稿與產品需求文件（PRD），啟動 MVP 第一個衝刺。同時申請 Apple Developer 與 Google Play 開發者帳號、註冊 AWS 帳號並申請 AWS Activate 新創方案（US$ 10,000 額度）。"}]));
bodyChildren.push(bulletMixed([{text: "持續進行：", bold: true}, {text: "建立 Notion 工作區與文件體系、設定 GitHub 私有倉庫與 CI/CD、研究八達通 O!ePay 與 PayMe for Business API 串接文件、關注香港年宵市場攤位競投時間表（通常 10 至 11 月舉行）。"}]));

bodyChildren.push(h2("11.3 長期願景"));
bodyChildren.push(body(
  "本產品的長期願景不只是做一個記賬 App，而是成為「全球市集經濟的數位基礎設施」。當產品在香港與亞洲市場站穩領導地位後，將逐步擴展至三個方向：第一是「地理擴張」，從亞洲市集文化圈延伸至歐美文創市集與農夫市集、拉丁美洲傳統市集、非洲露天市集，最終成為覆蓋 50+ 國家的全球平台；第二是「業態擴張」，從市集攤商延伸至行動餐車、快閃店、宅配經濟、直播帶貨、節慶攤位等「移動式營業」場景；第三是「生態擴張」，建立全球市集情報、跨國進貨採購、國際攤位媒合、攤商保險服務、跨境支付等周邊生態，成為攤商經營的全套解決方案。"
));
bodyChildren.push(body(
  "三年目標是成為香港市集記賬領域絕對領導品牌（市佔率 60% 以上）、亞洲市集市場前三品牌（覆蓋香港、台灣、泰國、馬來西亞、新加坡五個市場）、年營收超過 HK$ 1,200 萬元、團隊規模擴張至 25 至 30 人。五年目標是完成 B 輪融資（HK$ 3,000 至 5,000 萬）、登全球市集科技第一品牌、覆蓋 15+ 國家、年營收突破 HK$ 5,000 萬、探索 IPO 或策略性併購的可能性。十年目標是成為「全球市集經濟的作業系統」，服務 100 萬+ 攤商、覆蓋 50+ 國家、年交易量超過 US$ 10 億。這個願景需要強大的團隊、充裕的資金、精準的跨國執行，但全球市集經濟的機會明確、時機成熟、香港樞紐優勢獨特，正是創業的最佳時點與最佳起點。"
));

// =============================================================
// 6. ASSEMBLE DOCUMENT
// =============================================================
const coverConfig = {
  title: "市集記賬本 App 商業企劃書",
  subtitle: "MarketLedger Global Business Plan — 香港為樞紐 · 全球市集為舞台",
  englishLabel: "MARKETLEDGER",
  metaLines: [
    "產品代號：MarketLedger",
    "首發市場：香港（樞紐）→ 台灣 → 東南亞 → 全球",
    "文件版本：V2.0（全球化版本）",
    "撰寫日期：2026 年 7 月",
  ],
  footerLeft: "CONFIDENTIAL",
  footerRight: "GLOBAL BUSINESS PLAN 2026",
};

const frontMatter = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 480, after: 360 },
    children: [new TextRun({
      text: "目  錄",
      bold: true, size: 32, color: P.primary,
      font: { eastAsia: "Microsoft YaHei", ascii: "Calibri" },
    })],
  }),
  new TableOfContents("Table of Contents", {
    hyperlink: true,
    headingStyleRange: "1-3",
  }),
  new Paragraph({
    spacing: { before: 200 },
    children: [new TextRun({
      text: "Note: This Table of Contents is generated via field codes. To ensure page number accuracy after editing, please right-click the TOC and select \"Update Field.\"",
      italics: true, size: 18, color: "888888",
      font: { eastAsia: "Microsoft YaHei", ascii: "Calibri" },
    })],
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

function pageNumFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        children: [PageNumber.CURRENT], size: 18, color: P.secondary,
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      })],
    })],
  });
}

function headerStrip() {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: P.accent, space: 4 } },
      children: [new TextRun({
        text: "MarketLedger 市集記賬本 App 全球商業企劃書",
        size: 18, color: P.secondary,
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      })],
    })],
  });
}

const doc = new Document({
  creator: "MarketLedger Team",
  title: "市集記賬本 App 全球商業企劃書",
  description: "MarketLedger Global Business Plan",
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 24, color: P.body },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 32, bold: true, color: P.primary },
        paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 },
      },
      heading2: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 28, bold: true, color: P.primary },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 },
      },
      heading3: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 26, bold: true, color: P.primary },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: buildCoverR1(coverConfig),
    },
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
        },
      },
      headers: { default: headerStrip() },
      footers: { default: pageNumFooter() },
      children: frontMatter,
    },
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: { default: headerStrip() },
      footers: { default: pageNumFooter() },
      children: bodyChildren,
    },
  ],
});

const outDir = "/home/z/my-project/download";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "市集記賬本App企劃書.docx");

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf);
  console.log("OK ->", outPath);
  console.log("Body elements:", bodyChildren.length);
}).catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
