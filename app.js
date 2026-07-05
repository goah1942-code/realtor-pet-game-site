const LEGACY_STORAGE_KEY = "realtor-pet-game-v1";
const PROFILE = readEntryProfile();
const STORAGE_KEY = `${LEGACY_STORAGE_KEY}:${PROFILE.userKey}`;

let PETS = [
  {
    pet_id: "area-001",
    storyline_id: "area_map",
    name: "社區星芽",
    rarity: "N",
    base_form: "初生型",
    available_forms: ["初生型", "成長型", "王牌型"],
    is_storyline_ultra_rare: false,
    can_be_drawn: true,
    can_be_ultimate: false,
    work_behavior_tags: ["AREA_ACTIVITY"],
    required_awaken_materials: {},
    required_ultimate_materials: {},
    card_effect_summary: "商圈活動給牠經驗，升級後會點亮更多社區星點。",
    line_title: "社區星芽",
    line_subtitle: "今天多跑一個社區，牠就多亮一格。",
    palette: ["#50a37b", "#f0c866", "#203555"],
  },
  {
    pet_id: "dev-001",
    storyline_id: "development",
    name: "開發幼龍",
    rarity: "R",
    base_form: "初生型",
    available_forms: ["初生型", "成長型", "王牌型", "覺醒型", "究極型"],
    is_storyline_ultra_rare: false,
    can_be_drawn: true,
    can_be_ultimate: true,
    work_behavior_tags: ["DEVELOPMENT", "CALL_COUNT"],
    required_awaken_materials: { listing_core: 1, offer_core: 1 },
    required_ultimate_materials: { contract_core: 2, development_core: 20 },
    card_effect_summary: "開發與電話量會讓牠快速成長。",
    line_title: "開發幼龍",
    line_subtitle: "電話多一點，龍翼就更有力。",
    palette: ["#d45f45", "#f2a65a", "#203555"],
  },
  {
    pet_id: "neg-001",
    storyline_id: "negotiation",
    name: "價格小匠",
    rarity: "R",
    base_form: "初生型",
    available_forms: ["初生型", "成長型", "王牌型", "覺醒型"],
    is_storyline_ultra_rare: false,
    can_be_drawn: true,
    can_be_ultimate: false,
    work_behavior_tags: ["NEGOTIATION", "PRICE_REVISION"],
    required_awaken_materials: { negotiation_core: 2 },
    required_ultimate_materials: {},
    card_effect_summary: "議價與改附表會鍛造牠的星鐵槌。",
    line_title: "價格小匠",
    line_subtitle: "每次改價，都是一次鍛造。",
    palette: ["#6657a6", "#b88217", "#263447"],
  },
  {
    pet_id: "show-001",
    storyline_id: "showing",
    name: "帶看雲馬",
    rarity: "SR",
    base_form: "初生型",
    available_forms: ["初生型", "成長型", "王牌型", "覺醒型"],
    is_storyline_ultra_rare: false,
    can_be_drawn: true,
    can_be_ultimate: false,
    work_behavior_tags: ["SHOWING", "CLIENT_MEETING"],
    required_awaken_materials: { meeting_core: 2 },
    required_ultimate_materials: {},
    card_effect_summary: "帶看與見面談會讓牠留下導覽軌跡。",
    line_title: "帶看雲馬",
    line_subtitle: "多一次見面，雲馬就多一段路線。",
    palette: ["#247f96", "#f7df8a", "#203555"],
  },
  {
    pet_id: "listing-001",
    storyline_id: "listing",
    name: "信任麒麟",
    rarity: "SR",
    base_form: "初生型",
    available_forms: ["初生型", "成長型", "王牌型", "覺醒型"],
    is_storyline_ultra_rare: false,
    can_be_drawn: true,
    can_be_ultimate: false,
    work_behavior_tags: ["LISTING_SIGNED"],
    required_awaken_materials: { listing_core: 3 },
    required_ultimate_materials: {},
    card_effect_summary: "簽到委託會讓牠的契約角發光。",
    line_title: "信任麒麟",
    line_subtitle: "屋主信任會變成牠頭上的光。",
    palette: ["#16845a", "#f6d365", "#203555"],
  },
  {
    pet_id: "offer-001",
    storyline_id: "offer",
    name: "斡旋紅線龍",
    rarity: "SSR",
    base_form: "初生型",
    available_forms: ["初生型", "成長型", "王牌型", "覺醒型", "究極型"],
    is_storyline_ultra_rare: true,
    can_be_drawn: true,
    can_be_ultimate: true,
    work_behavior_tags: ["OFFER_RECEIVED"],
    required_awaken_materials: { offer_core: 3, negotiation_core: 1 },
    required_ultimate_materials: { contract_core: 2, offer_core: 12 },
    card_effect_summary: "收到斡旋後，牠會把條件線牽近一點。",
    line_title: "SSR 斡旋紅線龍",
    line_subtitle: "很難抽，也能靠成果慢慢合出來。",
    palette: ["#c2415d", "#f0c866", "#203555"],
  },
  {
    pet_id: "contract-001",
    storyline_id: "contract",
    name: "成交神獸",
    rarity: "SSR",
    base_form: "初生型",
    available_forms: ["初生型", "成長型", "王牌型", "覺醒型", "究極型"],
    is_storyline_ultra_rare: true,
    can_be_drawn: true,
    can_be_ultimate: true,
    work_behavior_tags: ["CONTRACT_SIGNED"],
    required_awaken_materials: { contract_core: 1, listing_core: 1, offer_core: 1 },
    required_ultimate_materials: { contract_core: 3, team_core: 8 },
    card_effect_summary: "簽約會留下金鑰印記，推進究極合成。",
    line_title: "SSR 成交神獸",
    line_subtitle: "簽約不是終點，是究極型的核心。",
    palette: ["#b88217", "#d45f45", "#203555"],
  },
  {
    pet_id: "team-001",
    storyline_id: "team_guard",
    name: "分店守護龍",
    rarity: "UR",
    base_form: "究極型",
    available_forms: ["究極型"],
    is_storyline_ultra_rare: true,
    can_be_drawn: false,
    can_be_ultimate: true,
    work_behavior_tags: ["TEAM_GOAL"],
    required_awaken_materials: {},
    required_ultimate_materials: { contract_core: 5, team_core: 20 },
    card_effect_summary: "只能透過長期團隊任務與合成取得。",
    line_title: "UR 分店守護龍",
    line_subtitle: "不在卡池中，只能養成合成。",
    palette: ["#203555", "#16845a", "#f0c866"],
  },
];

let STORYLINES = [];
let activeCollectionStorylineId = "";
let svgRenderCount = 0;

const MATERIAL_ALIASES = {
  星圖碎片: "area_core",
  商圈記憶光: "area_core",
  遠征徽章: "development_core",
  開發火種: "development_core",
  信號晶片: "call_core",
  回訪回聲: "call_core",
  價格星鐵: "negotiation_core",
  議價火花: "negotiation_core",
  導覽羽毛: "showing_core",
  見面談微光: "meeting_core",
  信任種子: "listing_core",
  委託印記: "listing_core",
  紅線結晶: "offer_core",
  斡旋火花: "offer_core",
  金鑰印記: "contract_core",
  簽約核心: "contract_core",
  團隊星核: "team_core",
};

const MATERIAL_LABELS = {
  area_core: "商圈記憶光",
  development_core: "開發火種",
  call_core: "回訪回聲",
  negotiation_core: "議價火花",
  showing_core: "導覽羽毛",
  meeting_core: "見面談微光",
  listing_core: "委託印記",
  offer_core: "斡旋火花",
  contract_core: "簽約核心",
  team_core: "團隊星核",
};

const MATERIAL_DISPLAY_ORDER = [
  "contract_core",
  "team_core",
  "offer_core",
  "listing_core",
  "negotiation_core",
  "meeting_core",
  "development_core",
  "showing_core",
  "area_core",
  "call_core",
];

const POOLS = [
  {
    key: "general",
    name: "一般行程池",
    ticketName: "一般券",
    source: "電話、商圈、開發",
    odds: { N: 74, R: 26 },
  },
  {
    key: "boosted",
    name: "強化行程池",
    ticketName: "強化行程券",
    source: "A/B/C/D 達標",
    odds: { N: 55, R: 37, SR: 8 },
  },
  {
    key: "result",
    name: "成果池",
    ticketName: "成果券",
    source: "委託、斡旋、改價、見面談",
    odds: { R: 65, SR: 33, SSR: 2 },
  },
  {
    key: "blessing",
    name: "簽約祝福池",
    ticketName: "簽約祝福券",
    source: "簽約",
    odds: { SR: 95, SSR: 5 },
  },
];

const RARITY_ORDER = ["N", "R", "SR", "SSR", "UR"];
const FORM_ASSIST_BOOST = {
  初生型: 1,
  成長型: 2,
  王牌型: 3,
  覺醒型: 5,
  究極型: 8,
};
const RARITY_ASSIST_BOOST = { N: 0, R: 0, SR: 1, SSR: 2, UR: 3 };

const PET_WISH_RULES = [
  {
    key: "area",
    tags: ["AREA_ACTIVITY"],
    title: "社區星願",
    target: 1,
    current: (metrics) => Number(metrics.area || 0),
    unit: "次 A 商圈",
    message: "今天先點亮一個社區線索。",
    doneMessage: "社區線索已點亮，主寵多一點期待。",
    bonus: { exp: 30, general: 1 },
  },
  {
    key: "development",
    tags: ["DEVELOPMENT"],
    title: "開發遠征",
    target: 2,
    current: (metrics) => Number(metrics.development || 0),
    unit: "次 B 開發",
    message: "今天補兩段開發路線。",
    doneMessage: "開發路線已展開，主寵準備遠征。",
    bonus: { exp: 30, general: 1 },
  },
  {
    key: "call",
    tags: ["CALL_COUNT"],
    title: "回訪信號",
    target: 20,
    current: (metrics) => Number(metrics.calls || 0),
    unit: "通電話",
    message: "電話量到 20，信號就會亮起。",
    doneMessage: "回訪信號已點亮。",
    bonus: { exp: 30, general: 1 },
  },
  {
    key: "negotiation",
    tags: ["NEGOTIATION", "PRICE_REVISION"],
    title: "價格鍛造",
    target: 1,
    current: (metrics) => Number(metrics.negotiation || 0) + Number(metrics.price || 0),
    unit: "次議價/改附表",
    message: "今天完成一次價格推進。",
    doneMessage: "價格火花已鍛造。",
    bonus: { exp: 30, boosted: 1 },
  },
  {
    key: "showing",
    tags: ["SHOWING", "CLIENT_MEETING"],
    title: "帶看路線",
    target: 1,
    current: (metrics) => Number(metrics.showing || 0) + Number(metrics.meeting || 0),
    unit: "次帶看/見面談",
    message: "今天完成一次面對面路線。",
    doneMessage: "帶看路線已留下足跡。",
    bonus: { exp: 30, boosted: 1 },
  },
  {
    key: "listing",
    tags: ["LISTING_SIGNED"],
    title: "委託信任",
    target: 1,
    current: (metrics) => Number(metrics.listing || 0),
    unit: "件委託",
    message: "今天拿到一顆信任種子。",
    doneMessage: "信任種子已發芽。",
    bonus: { exp: 30, result: 1 },
  },
  {
    key: "offer",
    tags: ["OFFER_RECEIVED"],
    title: "斡旋紅線",
    target: 1,
    current: (metrics) => Number(metrics.offer || 0),
    unit: "件斡旋",
    message: "今天牽起一條條件紅線。",
    doneMessage: "紅線已牽近成交距離。",
    bonus: { exp: 30, result: 1 },
  },
  {
    key: "contract",
    tags: ["CONTRACT_SIGNED"],
    title: "成交金鑰",
    target: 1,
    current: (metrics) => Number(metrics.contract || 0),
    unit: "件簽約",
    message: "簽約會喚醒金鑰感應。",
    doneMessage: "成交金鑰已入手。",
    bonus: { exp: 50, blessing: 1, materials: { team_core: 1 } },
  },
];

const STREAK_MILESTONE_REWARDS = [
  {
    count: 3,
    title: "三日開工寶箱",
    bonus: { exp: 60, general: 2, result: 1, materials: { team_core: 1 } },
  },
  {
    count: 7,
    title: "七日熱手寶箱",
    bonus: { exp: 120, general: 3, boosted: 1, result: 2, materials: { team_core: 2 } },
  },
  {
    count: 14,
    title: "十四日王牌寶箱",
    bonus: { exp: 240, boosted: 2, result: 3, blessing: 1, materials: { team_core: 3, contract_core: 1 } },
  },
  {
    count: 30,
    title: "三十日店鋪守護寶箱",
    bonus: { exp: 500, boosted: 3, result: 5, blessing: 2, materials: { team_core: 8, contract_core: 2 } },
  },
];

const GAME_SOURCE_METRICS = [
  ["area", "A 商圈"],
  ["development", "B 開發"],
  ["negotiation", "C 議價"],
  ["showing", "D 帶看"],
  ["calls", "電話量"],
  ["momentum", "前置信號"],
  ["listing", "委託"],
  ["offer", "斡旋"],
  ["price", "改附表"],
  ["meeting", "見面談"],
  ["contract", "簽約"],
];

const METRIC_LABELS = GAME_SOURCE_METRICS;
const GAME_SOURCE_METRIC_KEYS = GAME_SOURCE_METRICS.map(([key]) => key);
const REPORT_VALID_WEIGHT = 1;
const REPORT_TOTAL_ONLY_WEIGHT = 0.4;
const GAME_SOURCE_POLICY = {
  source: "每日行程/成果報表",
  rule: "遊戲獎勵只採計每日行程/成果報表的 A/B/C/D、電話量、前置信號與成果欄位；試營運追蹤、心得、圖片、外部報表不進入經驗、券、素材或團隊貢獻計算。",
  excludedExamples: ["opened", "settled", "shared_daily", "drew_card", "shared_draw", "wants_to_continue", "best_hook", "blocker"],
};

const SAMPLE_METRICS = {
  area: 2,
  development: 4,
  negotiation: 1,
  showing: 2,
  calls: 36,
  momentum: 2,
  listing: 1,
  offer: 1,
  price: 1,
  meeting: 2,
  contract: 0,
};

const TEAM_GOALS = [
  { key: "showing", name: "店內帶看累積", current: 0, target: 30, reward: "團隊星核 +2" },
  { key: "development", name: "店內開發累積", current: 0, target: 60, reward: "強化行程券 +1" },
  { key: "listing", name: "店內成果累積", current: 0, target: 8, reward: "信任素材 +2" },
];

const DAILY_ACHIEVEMENTS = [
  {
    key: "settle",
    title: "開工點火",
    detail: "完成今日結算",
    check: () => true,
  },
  {
    key: "activity",
    title: "行程推進",
    detail: "行程量換成抽卡補給",
    check: ({ metrics }) => metrics.area + metrics.development + metrics.showing + metrics.momentum + Math.floor(metrics.calls / 15) >= 2,
  },
  {
    key: "call",
    title: "電話信號",
    detail: "電話量累積成回訪回聲",
    check: ({ metrics }) => metrics.calls >= 20,
  },
  {
    key: "result",
    title: "成果種子",
    detail: "成果事件推進覺醒素材",
    check: ({ metrics }) => rewardCount(metrics.listing) + rewardCount(metrics.offer) + rewardCount(metrics.price) + rewardCount(metrics.meeting) >= 1,
  },
  {
    key: "listing",
    title: "委託信任",
    detail: "拿到委託印記",
    check: ({ metrics }) => rewardCount(metrics.listing) > 0,
  },
  {
    key: "offer",
    title: "斡旋紅線",
    detail: "拿到斡旋火花",
    check: ({ metrics }) => rewardCount(metrics.offer) > 0,
  },
  {
    key: "price",
    title: "價格鍛造",
    detail: "議價或改附表有推進",
    check: ({ metrics }) => metrics.negotiation + metrics.price > 0,
  },
  {
    key: "showing",
    title: "帶看路線",
    detail: "帶看或見面談有推進",
    check: ({ metrics }) => metrics.showing + metrics.meeting > 0,
  },
  {
    key: "contract",
    title: "簽約祝福",
    detail: "簽約核心已入手",
    check: ({ metrics }) => rewardCount(metrics.contract) > 0,
  },
  {
    key: "streak3",
    title: "連續火種",
    detail: "連續結算 3 天",
    check: ({ streak }) => (streak?.count || 0) >= 3,
  },
];

const state = loadState();

function readEntryProfile() {
  const fallback = {
    branch: "樹林店",
    agent: "示範同仁",
    userKey: "demo",
  };
  const search = typeof location === "object" && typeof location.search === "string" ? location.search : "";
  const params = typeof URLSearchParams === "function" ? new URLSearchParams(search) : null;
  if (!params) return fallback;
  const hasPersonalParams = ["branch", "agent", "name", "uid", "user", "agentId"].some((key) => params.has(key));
  if (!hasPersonalParams) return fallback;

  const branch = cleanProfileText(params.get("branch"), fallback.branch, 18);
  const agent = cleanProfileText(params.get("agent") || params.get("name"), fallback.agent, 18);
  const rawKey = cleanProfileText(params.get("uid") || params.get("user") || params.get("agentId"), "", 40);
  const userKey = rawKey ? stableProfileKey(rawKey) : stableProfileKey(`${branch}-${agent}`);
  return { branch, agent, userKey: userKey || fallback.userKey };
}

function cleanProfileText(value, fallback, maxLength) {
  const text = String(value || "").trim().replace(/[<>"'`]/g, "");
  return (text || fallback).slice(0, maxLength);
}

function stableProfileKey(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return encodeURIComponent(text).replace(/%/g, "").slice(0, 48);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildLineShareUrl(text) {
  return `https://line.me/R/share?text=${encodeURIComponent(String(text || ""))}`;
}

function normalizeMetricValue(value) {
  const number = Number(String(value ?? 0).replace(/,/g, ""));
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.round(number * 10) / 10);
}

function rewardCount(value) {
  const number = Number(value || 0);
  return Math.max(0, Math.floor(Number.isFinite(number) ? number : 0));
}

function formatMetricValue(value) {
  const number = normalizeMetricValue(value);
  return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, "");
}

function normalizeGameMetrics(metrics = {}) {
  return Object.fromEntries(GAME_SOURCE_METRIC_KEYS.map((key) => [key, normalizeMetricValue(metrics[key])]));
}

function currentPeriodKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function normalizeReportPeriodKey(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const iso = text.match(/(?:^|[^\d])(20\d{2})[-/](0?[1-9]|1[0-2])(?:[-/]\d{1,2})?(?=$|[^\d])/);
  if (iso) return `${iso[1]}-${String(Number(iso[2])).padStart(2, "0")}`;
  const westernMonth = text.match(/(20\d{2})\s*年\s*(\d{1,2})\s*月/);
  if (westernMonth) return `${westernMonth[1]}-${String(Number(westernMonth[2])).padStart(2, "0")}`;
  const roc = text.match(/(\d{2,3})\s*年\s*(\d{1,2})\s*月/);
  if (roc) return `${Number(roc[1]) + 1911}-${String(Number(roc[2])).padStart(2, "0")}`;
  const rocSlash = text.match(/(?:^|[^\d])(\d{2,3})[/-](\d{1,2})(?:[/-]\d{1,2})?(?=$|[^\d])/);
  if (rocSlash) return `${Number(rocSlash[1]) + 1911}-${String(Number(rocSlash[2])).padStart(2, "0")}`;
  return "";
}

function reportPeriodKeyFromMetrics(metrics = {}) {
  return normalizeReportPeriodKey(metrics.__periodKey || metrics.period || metrics.month || metrics.report_month) || currentPeriodKey();
}

function diffGameMetrics(sourceMetrics, awardedMetrics) {
  const source = normalizeGameMetrics(sourceMetrics);
  const awarded = normalizeGameMetrics(awardedMetrics);
  return Object.fromEntries(GAME_SOURCE_METRIC_KEYS.map((key) => [key, Math.max(0, normalizeMetricValue(source[key] - awarded[key]))]));
}

function maxGameMetrics(leftMetrics, rightMetrics) {
  const left = normalizeGameMetrics(leftMetrics);
  const right = normalizeGameMetrics(rightMetrics);
  return Object.fromEntries(GAME_SOURCE_METRIC_KEYS.map((key) => [key, Math.max(left[key], right[key])]));
}

function hasMetricIncrease(metrics = {}) {
  const normalized = normalizeGameMetrics(metrics);
  return GAME_SOURCE_METRIC_KEYS.some((key) => normalized[key] > 0);
}

function createSourceLedger() {
  return {
    activePeriod: currentPeriodKey(),
    periods: {},
    snapshots: [],
  };
}

function normalizeSourceLedger(sourceLedger) {
  const ledger = isPlainObject(sourceLedger) ? sourceLedger : {};
  const periods = {};
  Object.entries(isPlainObject(ledger.periods) ? ledger.periods : {}).forEach(([periodKey, period]) => {
    if (!isPlainObject(period)) return;
    periods[periodKey] = {
      awardedMetrics: normalizeGameMetrics(period.awardedMetrics),
      lastSourceMetrics: normalizeGameMetrics(period.lastSourceMetrics),
      lastImportedAt: period.lastImportedAt || "",
    };
  });
  return {
    activePeriod: normalizeReportPeriodKey(ledger.activePeriod) || currentPeriodKey(),
    periods,
    snapshots: Array.isArray(ledger.snapshots) ? ledger.snapshots.slice(0, 20) : [],
  };
}

function ensureSourcePeriod(periodKey) {
  state.sourceLedger = normalizeSourceLedger(state.sourceLedger);
  const key = normalizeReportPeriodKey(periodKey) || currentPeriodKey();
  state.sourceLedger.activePeriod = key;
  state.sourceLedger.periods[key] = state.sourceLedger.periods[key] || {
    awardedMetrics: normalizeGameMetrics(),
    lastSourceMetrics: normalizeGameMetrics(),
    lastImportedAt: "",
  };
  return state.sourceLedger.periods[key];
}

function gameSourceMetricSummary() {
  return GAME_SOURCE_METRICS.map(([, label]) => label).join("、");
}

function createInitialState() {
  return {
    activePetId: "dev-001",
    tickets: { general: 3, boosted: 1, result: 1, blessing: 0 },
    materials: {
      listing_core: 1,
      offer_core: 1,
      negotiation_core: 1,
      meeting_core: 0,
      contract_core: 0,
      development_core: 6,
      area_core: 2,
      call_core: 1,
      showing_core: 0,
      team_core: 0,
    },
    metrics: normalizeGameMetrics(SAMPLE_METRICS),
    sourceLedger: createSourceLedger(),
    settlementStreak: {
      count: 0,
      best: 0,
      lastDate: "",
    },
    lastRewards: {
      exp: 0,
      general: 0,
      boosted: 0,
      result: 0,
      blessing: 0,
      materials: {},
      materialReport: null,
      streakReward: null,
    },
    lastAchievements: [],
    dailySettlements: {},
    collection: {
      "dev-001": {
        user_id: PROFILE.userKey,
        pet_id: "dev-001",
        level: 3,
        exp: 42,
        star: 2,
        current_form: "初生型",
        duplicate_fragments: 4,
        owned_count: 1,
        first_acquired_at: new Date().toISOString(),
        last_upgraded_at: new Date().toISOString(),
        awakened: false,
        ultimate: false,
      },
    },
    history: [],
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const legacyRaw = PROFILE.userKey === "demo" ? localStorage.getItem(LEGACY_STORAGE_KEY) : null;
  const source = raw || legacyRaw;
  if (!source) return createInitialState();
  try {
    return normalizeImportedState(JSON.parse(source));
  } catch {
    return createInitialState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function buildProgressBackup() {
  return {
    app: "房仲精靈",
    version: LEGACY_STORAGE_KEY,
    exported_at: new Date().toISOString(),
    profile: { ...PROFILE },
    storage_key: STORAGE_KEY,
    state: JSON.parse(JSON.stringify(state)),
  };
}

function downloadProgressBackup() {
  const backup = buildProgressBackup();
  const filename = `realtor-pet-${PROFILE.userKey}-${todayKey()}.json`;
  const text = JSON.stringify(backup, null, 2);
  const urlApi = typeof window === "object" ? window.URL || window.webkitURL : null;
  const canDownload =
    typeof Blob === "function" &&
    urlApi &&
    typeof urlApi.createObjectURL === "function" &&
    typeof document.createElement === "function";

  if (!canDownload) {
    if (typeof console === "object" && typeof console.log === "function") console.log(text);
    return backup;
  }

  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const objectUrl = urlApi.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  if (document.body) document.body.appendChild(link);
  link.click();
  if (typeof link.remove === "function") link.remove();
  urlApi.revokeObjectURL(objectUrl);
  return backup;
}

function setBackupStatus(message, tone = "") {
  const element = document.getElementById("backupStatus");
  if (!element) return;
  element.textContent = message || "";
  element.classList.toggle("is-good", tone === "good");
  element.classList.toggle("is-bad", tone === "bad");
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateProgressBackup(backup) {
  if (!isPlainObject(backup)) return { ok: false, message: "備份格式無法讀取" };
  if (backup.app !== "房仲精靈") return { ok: false, message: "這不是房仲精靈的進度備份" };
  if (backup.version !== LEGACY_STORAGE_KEY) return { ok: false, message: "備份版本不符合目前遊戲版本" };
  if (!isPlainObject(backup.state)) return { ok: false, message: "備份內沒有可還原的進度資料" };
  return { ok: true, message: "" };
}

function mergeObject(defaultValue, importedValue) {
  return isPlainObject(importedValue) ? { ...defaultValue, ...importedValue } : { ...defaultValue };
}

function normalizeImportedState(importedState) {
  const initial = createInitialState();
  const source = isPlainObject(importedState) ? importedState : {};
  return {
    ...initial,
    ...source,
    tickets: mergeObject(initial.tickets, source.tickets),
    materials: mergeObject(initial.materials, source.materials),
    metrics: normalizeGameMetrics(source.metrics || initial.metrics),
    sourceLedger: normalizeSourceLedger(source.sourceLedger || initial.sourceLedger),
    settlementStreak: mergeObject(initial.settlementStreak, source.settlementStreak),
    lastRewards: {
      ...initial.lastRewards,
      ...(isPlainObject(source.lastRewards) ? source.lastRewards : {}),
      materials: mergeObject(initial.lastRewards.materials, source.lastRewards?.materials),
    },
    lastAchievements: Array.isArray(source.lastAchievements) ? [...source.lastAchievements] : [...initial.lastAchievements],
    dailySettlements: isPlainObject(source.dailySettlements) ? { ...source.dailySettlements } : {},
    collection: isPlainObject(source.collection) ? { ...source.collection } : {},
    history: Array.isArray(source.history) ? [...source.history] : [],
  };
}

function backupProfileLabel(profile) {
  if (!isPlainObject(profile)) return "未知同仁";
  return [profile.branch, profile.agent, profile.userKey].filter(Boolean).join(" · ") || "未知同仁";
}

function backupProfileMatchesCurrent(backup) {
  const userKey = backup.profile?.userKey || "";
  const storageKey = backup.storage_key || "";
  return (!userKey || userKey === PROFILE.userKey) && (!storageKey || storageKey === STORAGE_KEY);
}

function replaceState(nextState) {
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, nextState);
}

function restoreProgressBackup(backup) {
  const validation = validateProgressBackup(backup);
  if (!validation.ok) {
    setBackupStatus(validation.message, "bad");
    return false;
  }

  if (!backupProfileMatchesCurrent(backup)) {
    const shouldRestore =
      typeof window !== "object" ||
      typeof window.confirm !== "function" ||
      window.confirm(`這份備份屬於 ${backupProfileLabel(backup.profile)}。要還原到目前的 ${backupProfileLabel(PROFILE)} 入口嗎？`);
    if (!shouldRestore) {
      setBackupStatus("已取消匯入進度備份", "");
      return false;
    }
  }

  replaceState(normalizeImportedState(backup.state));
  ensureStarterPet();
  ensureCollectionStoryline();
  saveState();
  render();
  setBackupStatus(`已還原 ${backupProfileLabel(backup.profile)} 的進度備份`, "good");
  return true;
}

function restoreProgressBackupText(text) {
  try {
    return restoreProgressBackup(JSON.parse(text));
  } catch {
    setBackupStatus("備份 JSON 無法解析", "bad");
    return false;
  }
}

function registerServiceWorker() {
  const canRegister =
    typeof navigator === "object" &&
    navigator.serviceWorker &&
    typeof navigator.serviceWorker.register === "function" &&
    typeof location === "object" &&
    /^https?:$/.test(location.protocol || "");

  if (!canRegister) return false;
  navigator.serviceWorker.register("./sw.js").catch(() => {});
  return true;
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  if (PROFILE.userKey === "demo") localStorage.removeItem(LEGACY_STORAGE_KEY);
  replaceState(createInitialState());
  ensureStarterPet();
  ensureCollectionStoryline();
  saveState();
  render();
}

function requestResetProgress() {
  const shouldReset =
    typeof window !== "object" ||
    typeof window.confirm !== "function" ||
    window.confirm(`重置 ${PROFILE.agent} 的示範進度？目前寵物、券、素材與今日結算紀錄都會清除。`);
  if (!shouldReset) return false;
  resetProgress();
  return true;
}

function getPet(petId) {
  return PETS.find((pet) => pet.pet_id === petId);
}

function getOwned(petId) {
  return state.collection[petId];
}

function getActivePet() {
  return getPet(state.activePetId) || PETS[0];
}

function getStorylines() {
  if (STORYLINES.length) return STORYLINES;
  const seen = new Set();
  return PETS.reduce((items, pet) => {
    if (seen.has(pet.storyline_id)) return items;
    seen.add(pet.storyline_id);
    items.push({ storyline_id: pet.storyline_id, name: fallbackStorylineName(pet.storyline_id) });
    return items;
  }, []);
}

function fallbackStorylineName(storylineId) {
  const names = {
    area_map: "商圈星圖",
    development: "開發遠征",
    negotiation: "議價鍛造",
    showing: "帶看小旅行",
    listing: "委託種子",
    offer: "斡旋迷宮",
    contract: "成交神殿",
    team_guard: "店鋪守護",
  };
  return names[storylineId] || storylineId;
}

function ensureCollectionStoryline() {
  const storylines = getStorylines();
  if (!storylines.length) return;
  const exists = storylines.some((storyline) => storyline.storyline_id === activeCollectionStorylineId);
  if (!exists) activeCollectionStorylineId = storylines[0].storyline_id;
}

function currentPetIds() {
  return new Set(PETS.map((pet) => pet.pet_id));
}

function ownedCurrentPetCount() {
  const ids = currentPetIds();
  return Object.keys(state.collection).filter((petId) => ids.has(petId)).length;
}

function isViewActive(view) {
  return document.getElementById(`view-${view}`)?.classList.contains("is-active");
}

function ensureStarterPet() {
  const activeExists = PETS.some((pet) => pet.pet_id === state.activePetId);
  const starter = PETS.find((pet) => pet.can_be_drawn && pet.rarity === "N") || PETS.find((pet) => pet.can_be_drawn) || PETS[0];
  if (!activeExists && starter) state.activePetId = starter.pet_id;
  if (starter && !state.collection[starter.pet_id]) {
    state.collection[starter.pet_id] = {
      user_id: PROFILE.userKey,
      pet_id: starter.pet_id,
      level: 1,
      exp: 0,
      star: 1,
      current_form: starter.base_form,
      duplicate_fragments: 0,
      owned_count: 1,
      first_acquired_at: new Date().toISOString(),
      last_upgraded_at: new Date().toISOString(),
      awakened: false,
      ultimate: false,
    };
  }
}

async function loadExternalContent() {
  if (typeof fetch !== "function") return;
  try {
    const response = await fetch("./pet_content_manifest.json", { cache: "no-store" });
    if (!response.ok) return;
    const manifest = await response.json();
    if (!Array.isArray(manifest.pets) || manifest.pets.length === 0) return;
    PETS = manifest.pets.map(normalizeExternalPet);
    STORYLINES = normalizeStorylines(manifest.storylines);
    ensureStarterPet();
    ensureCollectionStoryline();
    saveState();
    render();
  } catch {
    // The static file can still run directly from disk with built-in demo pets.
  }
}

function normalizeStorylines(storylines) {
  if (!Array.isArray(storylines)) return [];
  return storylines.map((storyline) => ({
    storyline_id: storyline.storyline_id,
    name: storyline.name || storyline.storyline_id,
  }));
}

function normalizeExternalPet(pet) {
  return {
    pet_id: pet.pet_id,
    storyline_id: pet.storyline_id,
    name: pet.name,
    rarity: pet.rarity,
    base_form: pet.base_form || "初生型",
    available_forms: Array.isArray(pet.available_forms) ? pet.available_forms : ["初生型"],
    is_storyline_ultra_rare: Boolean(pet.is_storyline_ultra_rare),
    can_be_drawn: pet.can_be_drawn !== false,
    can_be_ultimate: Boolean(pet.can_be_ultimate),
    work_behavior_tags: Array.isArray(pet.work_behavior_tags) ? pet.work_behavior_tags : [],
    required_awaken_materials: materialListToObject(pet.required_awaken_materials, 1),
    required_ultimate_materials: materialListToObject(pet.required_ultimate_materials, 1),
    ultimate_fragment_cost: parseUltimateFragmentCost(pet.required_ultimate_materials, pet.ultimate_fragment_cost || 80),
    card_effect_summary: pet.card_effect_summary || "",
    image_url: normalizePetAssetUrl(pet.image_url || pet.image_asset),
    thumbnail_url: normalizePetAssetUrl(pet.thumbnail_url || pet.thumbnail_asset || pet.image_url || pet.image_asset),
    line_title: pet.line_title || pet.name,
    line_subtitle: pet.line_subtitle || "",
    palette: Array.isArray(pet.palette) ? pet.palette : ["#64748b", "#f0c866", "#203555"],
  };
}

function normalizePetAssetUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\/[^\s"'<>]+$/i.test(url)) return url;
  if (/^\.?\/?assets\/pets\/[A-Za-z0-9._/-]+\.(png|jpe?g|webp|avif|svg)$/i.test(url) && !url.includes("..")) {
    return url.replace(/^\//, "");
  }
  return "";
}

function materialListToObject(value, defaultAmount) {
  if (!Array.isArray(value)) return value && typeof value === "object" ? value : {};
  return value.reduce((acc, item) => {
    const parsed = parseMaterialToken(item);
    if (!parsed.key) return acc;
    acc[parsed.key] = (acc[parsed.key] || 0) + (parsed.amount || defaultAmount);
    return acc;
  }, {});
}

function parseUltimateFragmentCost(value, fallback) {
  if (Array.isArray(value)) {
    const token = value.find((item) => String(item).trim().startsWith("同名碎片"));
    const match = token ? String(token).match(/x(\d+)/i) : null;
    if (match) return Number(match[1]);
  }
  return Number(fallback) || 80;
}

function parseMaterialToken(raw) {
  const text = String(raw).trim();
  if (text.startsWith("同名碎片")) return { key: "", amount: 0 };
  const match = text.match(/^(.+?)\s*x(\d+)$/i);
  const label = (match ? match[1] : text).trim();
  return {
    key: MATERIAL_ALIASES[label] || "",
    amount: match ? Number(match[2]) : 1,
  };
}

function materialLabel(key) {
  return MATERIAL_LABELS[key] || key;
}

function materialProgressText(required) {
  const entries = Object.entries(required || {});
  if (!entries.length) return "無素材需求";
  return entries.map(([key, target]) => `${materialLabel(key)} ${state.materials[key] || 0}/${target}`).join(" · ");
}

function ultimateFragmentCost(pet) {
  return Number(pet?.ultimate_fragment_cost) || 80;
}

function expNeeded(level) {
  return 80 + level * 28;
}

function currentForm(pet, owned) {
  if (!owned) return pet.base_form;
  if (owned.ultimate) return "究極型";
  if (owned.awakened) return "覺醒型";
  if (owned.star >= 5) return "王牌型";
  if (owned.level >= 6 && pet.available_forms.includes("成長型")) return "成長型";
  return pet.base_form;
}

function buildActivePetGrowthGoals(pet, owned) {
  if (!pet || !owned) return [];
  const goals = [];
  const levelNeed = Math.max(0, expNeeded(owned.level) - owned.exp);

  goals.push({
    title: "下一級",
    detail: `再 ${levelNeed} 經驗到 Lv.${owned.level + 1}`,
    done: false,
  });

  if (pet.available_forms.includes("成長型")) {
    goals.push({
      title: "成長型",
      detail: owned.level >= 6 ? "已解鎖" : `Lv.${owned.level}/6，行程量會補經驗`,
      done: owned.level >= 6,
    });
  }

  if (pet.available_forms.includes("王牌型")) {
    const nextStar = Math.min(5, owned.star + 1);
    const cost = starCost(nextStar);
    goals.push({
      title: "王牌型",
      detail: owned.star >= 5 ? "已達 5 星" : `星級 ${owned.star}/5，碎片 ${owned.duplicate_fragments}/${cost} 升 ${nextStar} 星`,
      done: owned.star >= 5,
    });
  }

  if (pet.available_forms.includes("覺醒型")) {
    const ready = canAwaken(pet, owned);
    goals.push({
      title: "覺醒型",
      detail: owned.awakened
        ? "已覺醒"
        : owned.star < 5
          ? `先升到 5 星，素材 ${materialProgressText(pet.required_awaken_materials)}`
          : ready
            ? "素材已足夠，可覺醒"
            : `素材 ${materialProgressText(pet.required_awaken_materials)}`,
      done: owned.awakened,
    });
  }

  if (pet.can_be_ultimate || pet.available_forms.includes("究極型")) {
    const materialText = materialProgressText(pet.required_ultimate_materials);
    const fragmentCost = ultimateFragmentCost(pet);
    goals.push({
      title: "究極型",
      detail: owned.ultimate
        ? "究極型已完成"
        : !owned.awakened
          ? "先完成覺醒，再合成究極"
          : `碎片 ${owned.duplicate_fragments}/${fragmentCost}，素材 ${materialText}`,
      done: owned.ultimate,
    });
  }

  return goals;
}

function addExp(petId, amount) {
  const owned = getOwned(petId);
  const pet = getPet(petId);
  if (!owned || !pet) return null;
  const fromLevel = owned.level || 1;
  const fromForm = currentForm(pet, owned);
  owned.exp += amount;
  while (owned.exp >= expNeeded(owned.level)) {
    owned.exp -= expNeeded(owned.level);
    owned.level += 1;
  }
  const toForm = currentForm(pet, owned);
  owned.current_form = toForm;
  owned.last_upgraded_at = new Date().toISOString();
  return {
    petId,
    petName: pet.name,
    exp: amount,
    fromLevel,
    toLevel: owned.level,
    fromForm,
    toForm,
    leveled: owned.level > fromLevel,
    formChanged: toForm !== fromForm,
  };
}

function petGrowthSummary(growth) {
  if (!growth) return "";
  const parts = [];
  if (growth.leveled) parts.push(`Lv.${growth.fromLevel} -> Lv.${growth.toLevel}`);
  if (growth.formChanged) parts.push(`${growth.fromForm} -> ${growth.toForm}`);
  if (!parts.length) parts.push(`經驗 +${growth.exp}`);
  return `${growth.petName} ${parts.join(" · ")}`;
}

function materialGainEntries(materials = {}) {
  const seen = new Set();
  const ordered = MATERIAL_DISPLAY_ORDER
    .map((key) => [key, Number(materials?.[key] || 0)])
    .filter(([, value]) => value > 0);
  ordered.forEach(([key]) => seen.add(key));
  Object.entries(materials || {}).forEach(([key, value]) => {
    const amount = Number(value || 0);
    if (!seen.has(key) && amount > 0) ordered.push([key, amount]);
  });
  return ordered;
}

function buildMaterialReport(rewards, pet = getActivePet()) {
  const required = pet?.required_awaken_materials || {};
  const requiredKeys = new Set(Object.keys(required || {}));
  const gains = materialGainEntries(rewards?.materials)
    .sort(([left], [right]) => Number(requiredKeys.has(right)) - Number(requiredKeys.has(left)))
    .map(([key, amount]) => ({
      key,
      label: materialLabel(key),
      amount,
    }));
  const owned = pet ? getOwned(pet.pet_id) : null;
  const progress = Object.entries(required)
    .filter(([, target]) => Number(target || 0) > 0)
    .map(([key, target]) => {
      const current = Number(state.materials[key] || 0);
      return {
        key,
        label: materialLabel(key),
        current,
        target: Number(target || 0),
        gained: Number(rewards?.materials?.[key] || 0),
        done: current >= Number(target || 0),
      };
    });
  if (!gains.length && !progress.length) return null;
  const materialReady = progress.length > 0 && progress.every((item) => item.done);
  const awakenable = Boolean(pet && owned && canAwaken(pet, owned));
  return {
    petId: pet?.pet_id || "",
    petName: pet?.name || "主寵",
    gains,
    gainText: gains.map((item) => `${item.label} +${item.amount}`).join("、"),
    progress,
    progressText: progress.map((item) => `${item.label} ${item.current}/${item.target}`).join(" · "),
    materialReady,
    awakenable,
    starLocked: Boolean(owned && owned.star < 5 && pet?.available_forms?.includes("覺醒型")),
  };
}

function materialReportSummary(report) {
  if (!report) return "";
  const parts = [];
  if (report.gainText) parts.push(`取得 ${report.gainText}`);
  if (report.progressText) {
    if (report.awakenable) parts.push(`${report.petName} 可覺醒`);
    else if (report.materialReady && report.starLocked) parts.push(`${report.petName} 覺醒素材已足，先升到 5 星`);
    else if (report.materialReady) parts.push(`${report.petName} 覺醒素材已足`);
    else parts.push(`${report.petName} 覺醒 ${report.progressText}`);
  }
  return parts.join("；");
}

function buildRewardNextStep(rewards = state.lastRewards) {
  const materialReport = rewards?.materialReport;
  if (materialReport?.awakenable) {
    return {
      text: `${materialReport.petName} 已達覺醒條件，可以到卡片庫覺醒。`,
      view: "collection",
      label: "去覺醒",
    };
  }
  if (materialReport?.materialReady && materialReport?.starLocked) {
    return {
      text: `${materialReport.petName} 覺醒素材已足，下一步收碎片升到 5 星。`,
      view: "collection",
      label: "去升星",
    };
  }
  if (rewards?.petGrowth?.formChanged) {
    return {
      text: `${petGrowthSummary(rewards.petGrowth)}，到卡片庫看新型態。`,
      view: "collection",
      label: "看新型態",
    };
  }
  if (rewards?.petGrowth?.leveled) {
    return {
      text: `${rewards.petGrowth.petName} 升到 Lv.${rewards.petGrowth.toLevel}，到卡片庫看養成進度。`,
      view: "collection",
      label: "看主寵",
    };
  }
  return null;
}

function rewardNextStepMarkup(nextStep) {
  if (!nextStep) return { text: "", button: "" };
  return {
    text: `<span class="next-step-text">下一步：${escapeHtml(nextStep.text)}</span>`,
    button: `<button class="secondary-button" type="button" data-view="${escapeHtml(nextStep.view)}">${escapeHtml(nextStep.label)}</button>`,
  };
}

function addMaterials(items) {
  Object.entries(items).forEach(([key, value]) => {
    state.materials[key] = (state.materials[key] || 0) + value;
  });
}

function totalTickets() {
  return Object.values(state.tickets).reduce((sum, value) => sum + value, 0);
}

function activePetAssistBoost(pet = getActivePet(), owned = pet ? getOwned(pet.pet_id) : null) {
  if (!pet || !owned) return 0;
  const form = currentForm(pet, owned);
  const formBoost = FORM_ASSIST_BOOST[form] || 0;
  const rarityBoost = RARITY_ASSIST_BOOST[pet.rarity] || 0;
  return Math.min(9, Math.max(0, formBoost + rarityBoost));
}

function poolOddsWithAssist(pool, pet = getActivePet(), owned = pet ? getOwned(pet.pet_id) : null) {
  const odds = { ...(pool?.odds || {}) };
  const poolRarities = RARITY_ORDER.filter((rarity) => Object.prototype.hasOwnProperty.call(odds, rarity));
  if (poolRarities.length < 2) return { odds, boost: 0, topRarity: poolRarities[0] || "", pet, owned };
  const boost = activePetAssistBoost(pet, owned);
  const topRarity = poolRarities.at(-1);
  const bottomRarity = poolRarities[0];
  const shift = Math.min(boost, Math.max(0, Number(odds[bottomRarity] || 0) - 1));
  if (shift > 0) {
    odds[bottomRarity] -= shift;
    odds[topRarity] = Number(odds[topRarity] || 0) + shift;
  }
  return { odds, boost: shift, topRarity, pet, owned };
}

function assistTextFromAdjustment(adjustment) {
  if (!adjustment?.boost) return "";
  return `主寵助力：${adjustment.pet.name} ${currentForm(adjustment.pet, adjustment.owned)}，${adjustment.topRarity} 稀有感應 +${adjustment.boost}%`;
}

function activePetAssistText(pet = getActivePet(), owned = pet ? getOwned(pet.pet_id) : null) {
  const boost = activePetAssistBoost(pet, owned);
  return boost > 0 ? `主寵助力：稀有感應 +${boost}%` : "主寵助力：取得主寵後開啟";
}

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function previousDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return todayKey(date);
}

function updateSettlementStreak(dateKey) {
  state.settlementStreak = state.settlementStreak || { count: 0, best: 0, lastDate: "" };
  const streak = state.settlementStreak;
  if (streak.lastDate === dateKey) return streak;
  const count = streak.lastDate === previousDateKey(dateKey) ? (streak.count || 0) + 1 : 1;
  streak.count = count;
  streak.best = Math.max(streak.best || 0, count);
  streak.lastDate = dateKey;
  return streak;
}

function nextStreakGoal(count) {
  return [3, 7, 14, 30].find((goal) => count < goal) || count + 10;
}

function nextStreakRewardPreview(count = state.settlementStreak?.count || 0) {
  const nextCount = STREAK_MILESTONE_REWARDS.find((item) => count < item.count)?.count || nextStreakGoal(count);
  const reward = STREAK_MILESTONE_REWARDS.find((item) => item.count === nextCount) ||
    STREAK_MILESTONE_REWARDS[STREAK_MILESTONE_REWARDS.length - 1];
  return {
    count: nextCount,
    remaining: Math.max(0, nextCount - count),
    title: reward.title,
    rewardText: wishRewardText(reward.bonus),
  };
}

function streakMessage() {
  const streak = state.settlementStreak || { count: 0, best: 0 };
  const count = streak.count || 0;
  if (!count) return "今日結算後開啟連續紀錄";
  const nextGoal = nextStreakGoal(count);
  return `連續 ${count} 天 · 最高 ${streak.best || count} 天 · 距離 ${nextGoal} 天還差 ${nextGoal - count}`;
}

function emptyRewards(blocked = false) {
  return {
    exp: 0,
    general: 0,
    boosted: 0,
    result: 0,
    blessing: 0,
    materials: {},
    wish: null,
    materialReport: null,
    petGrowth: null,
    streakReward: null,
    blocked,
  };
}

function calculateRewards(rawMetrics, pet = getActivePet(), includeWish = true) {
  const metrics = normalizeGameMetrics(rawMetrics);
  const resultScore =
    rewardCount(metrics.listing) +
    rewardCount(metrics.offer) +
    rewardCount(metrics.price) +
    rewardCount(metrics.meeting);
  const contractCount = rewardCount(metrics.contract);
  const activityScore =
    metrics.area * 20 +
    metrics.development * 34 +
    metrics.negotiation * 42 +
    metrics.showing * 46 +
    metrics.calls * 2 +
    metrics.momentum * 18;
  const baseRewards = {
    exp: Math.round(activityScore),
    general: Math.max(1, Math.floor((metrics.area + metrics.development + metrics.showing + metrics.momentum + metrics.calls / 15) / 2)),
    boosted: metrics.negotiation + metrics.showing + Math.floor(metrics.momentum / 2) >= 3 ? 1 : 0,
    result: resultScore,
    blessing: contractCount,
    materials: {
      listing_core: rewardCount(metrics.listing),
      offer_core: rewardCount(metrics.offer),
      negotiation_core: rewardCount(metrics.price) + rewardCount(metrics.negotiation),
      meeting_core: rewardCount(metrics.meeting),
      contract_core: contractCount,
      development_core: Math.floor((metrics.development + metrics.momentum * 0.5 + metrics.calls / 20) * 2),
      area_core: rewardCount(metrics.area),
      call_core: Math.floor(metrics.calls / 15),
      showing_core: rewardCount(metrics.showing),
      team_core: contractCount > 0 ? 2 : 0,
    },
  };
  if (!includeWish) return { ...baseRewards, wish: null };
  const wish = buildPetWish(metrics, pet);
  return wish.done ? applyPetWishBonus(baseRewards, wish) : { ...baseRewards, wish: null };
}

function petWishRule(pet = getActivePet()) {
  const tags = Array.isArray(pet?.work_behavior_tags) ? pet.work_behavior_tags : [];
  return PET_WISH_RULES.find((rule) => rule.tags.some((tag) => tags.includes(tag))) || PET_WISH_RULES[0];
}

function buildPetWish(rawMetrics = state.metrics, pet = getActivePet()) {
  const metrics = normalizeGameMetrics(rawMetrics);
  const rule = petWishRule(pet);
  const current = Math.max(0, Math.floor(rule.current(metrics || {})));
  const target = rule.target;
  const done = current >= target;
  const progress = Math.min(100, Math.round((current / target) * 100));
  return {
    key: rule.key,
    title: rule.title,
    petName: pet?.name || "主寵",
    current,
    target,
    unit: rule.unit,
    done,
    progress,
    message: done ? rule.doneMessage : rule.message,
    bonus: rule.bonus,
    rewardText: wishRewardText(rule.bonus),
  };
}

function applyRewardBonus(rewards, bonus = {}) {
  return {
    ...rewards,
    exp: Number(rewards.exp || 0) + Number(bonus.exp || 0),
    general: Number(rewards.general || 0) + Number(bonus.general || 0),
    boosted: Number(rewards.boosted || 0) + Number(bonus.boosted || 0),
    result: Number(rewards.result || 0) + Number(bonus.result || 0),
    blessing: Number(rewards.blessing || 0) + Number(bonus.blessing || 0),
    materials: {
      ...(rewards.materials || {}),
      ...Object.fromEntries(Object.entries(bonus.materials || {}).map(([key, value]) => [
        key,
        Number(rewards.materials?.[key] || 0) + Number(value || 0),
      ])),
    },
  };
}

function applyPetWishBonus(rewards, wish) {
  return {
    ...applyRewardBonus(rewards, wish?.bonus),
    wish: {
      key: wish.key,
      title: wish.title,
      petName: wish.petName,
      rewardText: wish.rewardText,
    },
  };
}

function buildStreakReward(streakCount) {
  const milestone = STREAK_MILESTONE_REWARDS.find((item) => item.count === streakCount);
  if (!milestone) return null;
  return {
    count: milestone.count,
    title: milestone.title,
    rewardText: wishRewardText(milestone.bonus),
  };
}

function applyStreakRewardBonus(rewards, streakReward) {
  if (!streakReward) return rewards;
  const milestone = STREAK_MILESTONE_REWARDS.find((item) => item.count === streakReward.count);
  return {
    ...applyRewardBonus(rewards, milestone?.bonus),
    streakReward,
  };
}

function wishRewardText(bonus = {}) {
  const parts = [];
  if (bonus.exp) parts.push(`經驗 +${bonus.exp}`);
  [
    ["general", "一般券"],
    ["boosted", "強化券"],
    ["result", "成果券"],
    ["blessing", "祝福券"],
  ].forEach(([key, label]) => {
    if (bonus[key]) parts.push(`${label} +${bonus[key]}`);
  });
  Object.entries(bonus.materials || {}).forEach(([key, value]) => {
    if (value) parts.push(`${materialLabel(key)} +${value}`);
  });
  return parts.join("、");
}

function wishSummaryText(wish = state.lastRewards?.wish) {
  return wish ? `${wish.petName}完成「${wish.title}」：${wish.rewardText}` : "";
}

function buildDailyQuests(rawMetrics) {
  const metrics = normalizeGameMetrics(rawMetrics);
  const rewards = calculateRewards(metrics, getActivePet(), false);
  const activityUnits = metrics.area + metrics.development + metrics.showing + metrics.momentum + Math.floor(metrics.calls / 15);
  const nextGeneralNeed = activityUnits % 2 === 0 ? 2 : 1;
  const boostedProgress = metrics.negotiation + metrics.showing + Math.floor(metrics.momentum / 2);
  const resultProgress =
    rewardCount(metrics.listing) +
    rewardCount(metrics.offer) +
    rewardCount(metrics.price) +
    rewardCount(metrics.meeting);
  const contractCount = rewardCount(metrics.contract);

  return [
    {
      key: "activity",
      title: "行程補給",
      reward: `一般券 +${rewards.general}`,
      current: activityUnits,
      target: 2,
      done: activityUnits >= 2,
      message: activityUnits >= 2 ? `再補 ${nextGeneralNeed} 點行程量，衝下一張一般券` : `還差 ${2 - activityUnits} 點行程量`,
    },
    {
      key: "boosted",
      title: "強化衝刺",
      reward: "強化券 +1",
      current: boostedProgress,
      target: 3,
      done: boostedProgress >= 3,
      message: boostedProgress >= 3 ? "今日已達強化池門檻" : `C 議價或 D 帶看再 ${3 - boostedProgress} 次`,
    },
    {
      key: "result",
      title: "成果覺醒",
      reward: `成果券 +${rewards.result}`,
      current: resultProgress,
      target: 1,
      done: resultProgress >= 1,
      message: resultProgress >= 1 ? "每多 1 件成果，多 1 張成果券與素材" : "先拿 1 件委託、斡旋、改價或面談",
    },
    {
      key: "contract",
      title: "簽約祝福",
      reward: `祝福券 +${rewards.blessing}`,
      current: contractCount,
      target: 1,
      done: contractCount >= 1,
      message: contractCount >= 1 ? "已拿到簽約祝福與團隊星核" : "簽約後開啟祝福池與究極素材",
    },
  ];
}

function buildDailyAchievements(rawMetrics, rewards = calculateRewards(rawMetrics), streak = state.settlementStreak) {
  const metrics = normalizeGameMetrics(rawMetrics);
  return DAILY_ACHIEVEMENTS
    .filter((achievement) => achievement.check({ metrics, rewards, streak }))
    .map(({ key, title, detail }) => ({ key, title, detail }));
}

function hasSettledToday() {
  return Boolean(state.dailySettlements?.[todayKey()]);
}

function settleMetrics(rawMetrics) {
  const sourceMetrics = normalizeGameMetrics(rawMetrics);
  const periodKey = reportPeriodKeyFromMetrics(rawMetrics);
  const period = ensureSourcePeriod(periodKey);
  const previousAwardedMetrics = normalizeGameMetrics(period.awardedMetrics);
  const deltaMetrics = diffGameMetrics(sourceMetrics, previousAwardedMetrics);
  const hasIncrease = hasMetricIncrease(deltaMetrics);
  state.metrics = { ...deltaMetrics };
  state.dailySettlements = state.dailySettlements || {};
  const dateKey = todayKey();
  const importedAt = new Date().toISOString();
  period.lastSourceMetrics = { ...sourceMetrics };
  period.lastImportedAt = importedAt;
  state.sourceLedger.snapshots.unshift({
    period: periodKey,
    at: importedAt,
    sourceMetrics: { ...sourceMetrics },
    previousAwardedMetrics,
    deltaMetrics: { ...deltaMetrics },
  });
  state.sourceLedger.snapshots = state.sourceLedger.snapshots.slice(0, 20);

  if (!hasIncrease) {
    const noDeltaAchievements = buildDailyAchievements(deltaMetrics, calculateRewards(deltaMetrics), state.settlementStreak);
    state.lastRewards = emptyRewards(true);
    state.lastAchievements = noDeltaAchievements;
    state.dailySettlements[dateKey] = {
      ...(state.dailySettlements[dateKey] || {}),
      awarded: Boolean(state.dailySettlements[dateKey]?.awarded),
      period: periodKey,
      sourceMetrics: { ...sourceMetrics },
      previousAwardedMetrics,
      metrics: { ...deltaMetrics },
      deltaMetrics: { ...deltaMetrics },
      achievements: noDeltaAchievements,
      imported_at: importedAt,
    };
    state.history.unshift({
      type: "settle",
      at: importedAt,
      text: `${periodKey} 累積資料已記錄，沒有新增差額`,
    });
    state.history = state.history.slice(0, 12);
    saveState();
    render();
    return false;
  }

  let rewards = calculateRewards(deltaMetrics);
  const streak = updateSettlementStreak(dateKey);
  rewards = applyStreakRewardBonus(rewards, buildStreakReward(streak.count));
  const achievements = buildDailyAchievements(deltaMetrics, rewards, state.settlementStreak);
  Object.entries(rewards).forEach(([key, value]) => {
    if (key in state.tickets) state.tickets[key] += value;
  });
  addMaterials(rewards.materials);
  rewards.materialReport = buildMaterialReport(rewards);
  const petGrowth = addExp(state.activePetId, rewards.exp);
  rewards.petGrowth = petGrowth && (petGrowth.leveled || petGrowth.formChanged) ? petGrowth : null;
  period.awardedMetrics = maxGameMetrics(previousAwardedMetrics, sourceMetrics);
  state.lastRewards = rewards;
  state.lastAchievements = achievements;
  state.dailySettlements[dateKey] = {
    awarded: true,
    period: periodKey,
    sourceMetrics: { ...sourceMetrics },
    previousAwardedMetrics,
    metrics: { ...deltaMetrics },
    deltaMetrics: { ...deltaMetrics },
    rewards,
    achievements,
    settled_at: importedAt,
  };
  state.history.unshift({
    type: "settle",
    at: importedAt,
    text: `${periodKey} 新增差額：經驗 +${rewards.exp}，成果券 +${rewards.result}${rewards.streakReward ? `，${rewards.streakReward.title}` : ""}${rewards.petGrowth ? `，${petGrowthSummary(rewards.petGrowth)}` : ""}`,
  });
  state.history = state.history.slice(0, 12);
  saveState();
  render();
  return true;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const periodKey = normalizeReportPeriodKey(text) || currentPeriodKey();
  if (!lines.length) return { ...normalizeGameMetrics(SAMPLE_METRICS), __periodKey: periodKey };
  const headerIndex = lines.findIndex((line) => splitCsvLine(line).some((item) => headerToMetricKey(item.trim())));
  if (headerIndex < 0) return { ...normalizeGameMetrics(SAMPLE_METRICS), __periodKey: periodKey };
  const headers = splitCsvLine(lines[headerIndex]).map((item) => item.trim());
  const sums = normalizeGameMetrics();
  lines.slice(headerIndex + 1).forEach((line) => {
    const cells = splitCsvLine(line);
    headers.forEach((header, index) => {
      const key = headerToMetricKey(header);
      if (!key) return;
      sums[key] += parseReportMetricAmount(cells[index]);
    });
  });
  return { ...normalizeGameMetrics(sums), __periodKey: periodKey };
}

function readManualMetrics(form) {
  return {
    ...normalizeGameMetrics(Object.fromEntries(METRIC_LABELS.map(([key]) => [key, form.elements[key]?.value || 0]))),
    __periodKey: form.elements.period?.value || currentPeriodKey(),
  };
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const REPORT_HEADER_RULES = [
  ["momentum", ["d1行程", "d1面訪行程", "募轉追", "出租募集線追蹤線", "出租募集線", "出租追蹤線", "潛承租", "租賃收定幹見面談", "租賃收定見面談", "租賃見面談"]],
  ["showing", ["帶看成交買承租", "帶看", "成交買承租", "銷售合計", "銷售"]],
  ["contract", ["租賃成件簽約金", "成件簽約金", "簽約金", "簽約", "成件", "成交"]],
  ["price", ["二附以上", "二附", "改附表", "改價格", "價格"]],
  ["meeting", ["收定幹見面談", "收定見面談", "見面談", "面談"]],
  ["offer", ["斡旋", "收定"]],
  ["development", ["募集線追蹤線", "募集線", "追蹤線", "潛買", "開發合計", "開發", "賣已租拜訪委託件數", "已租拜訪", "賣方拜訪", "拜訪委託件數"]],
  ["listing", ["出租專任委託", "專任委託", "出租專任", "專任", "委託", "委托"]],
  ["negotiation", ["塑議合計", "塑議", "庫存回報庫存數", "庫存回報", "庫存數", "議價"]],
  ["area", ["家戶經營合計", "家戶經營", "拜訪社區店家", "拜訪社區", "店家", "op含定點派報", "op", "定點派報", "住戶服務", "社區活動", "其他派報廣宣", "派報廣宣", "商圈", "社區"]],
  ["calls", ["電話合計", "電話量", "電話", "call"]],
];

const EXACT_REPORT_HEADERS = {
  a: "area",
  b: "development",
  c: "negotiation",
  d: "showing",
};

function normalizeReportHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[（）()]/g, "")
    .replace(/[\/／\\|、,，:：\s]+/g, "");
}

function parseReportMetricAmount(value) {
  const text = String(value ?? "").replace(/,/g, "").trim();
  if (!text) return 0;
  const numbers = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number).filter(Number.isFinite) || [];
  if (!numbers.length) return 0;
  if ((text.includes("/") || text.includes("／")) && numbers.length >= 2) {
    const valid = Math.max(0, numbers[0]);
    const total = Math.max(valid, numbers[1]);
    return valid * REPORT_VALID_WEIGHT + Math.max(0, total - valid) * REPORT_TOTAL_ONLY_WEIGHT;
  }
  return Math.max(0, numbers[0]);
}

function headerToMetricKey(header) {
  const normalized = normalizeReportHeader(header);
  if (EXACT_REPORT_HEADERS[normalized]) return EXACT_REPORT_HEADERS[normalized];
  return REPORT_HEADER_RULES.find(([, aliases]) => aliases.some((alias) => normalized.includes(alias)))?.[0];
}

function draw(poolKey) {
  const pool = POOLS.find((item) => item.key === poolKey);
  if (!pool || state.tickets[poolKey] <= 0) return;
  state.tickets[poolKey] -= 1;
  const assistAdjustment = poolOddsWithAssist(pool);
  const rarity = rollRarity(assistAdjustment.odds);
  const candidates = PETS.filter((pet) => pet.can_be_drawn && pet.rarity === rarity);
  const fallback = PETS.filter((pet) => pet.can_be_drawn && pet.rarity !== "UR");
  const pet = randomFrom(candidates.length ? candidates : fallback);
  const existing = getOwned(pet.pet_id);
  let resultText = "";
  if (existing) {
    const gained = duplicateFragments(pet.rarity);
    existing.duplicate_fragments += gained;
    existing.owned_count += 1;
    resultText = `重複轉成碎片 +${gained}`;
  } else {
    state.collection[pet.pet_id] = {
      user_id: PROFILE.userKey,
      pet_id: pet.pet_id,
      level: 1,
      exp: 0,
      star: 1,
      current_form: pet.base_form,
      duplicate_fragments: 0,
      owned_count: 1,
      first_acquired_at: new Date().toISOString(),
      last_upgraded_at: new Date().toISOString(),
      awakened: false,
      ultimate: false,
    };
    resultText = "新寵物加入卡片庫";
  }
  state.activePetId = pet.pet_id;
  state.history.unshift({
    type: "draw",
    at: new Date().toISOString(),
    petId: pet.pet_id,
    text: `${pool.name} 抽到 ${pet.name}，${resultText}`,
    assistText: assistTextFromAdjustment(assistAdjustment),
  });
  state.history = state.history.slice(0, 12);
  saveState();
  render();
}

function rollRarity(odds) {
  const entries = Object.entries(odds);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  let cursor = Math.random() * total;
  for (const [rarity, value] of entries) {
    cursor -= value;
    if (cursor <= 0) return rarity;
  }
  return entries.at(-1)[0];
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function duplicateFragments(rarity) {
  return { N: 1, R: 3, SR: 10, SSR: 25, UR: 50 }[rarity] || 1;
}

function starCost(nextStar) {
  return { 2: 3, 3: 8, 4: 15, 5: 30 }[nextStar] || 0;
}

function upgradeStar(petId) {
  const pet = getPet(petId);
  const owned = getOwned(petId);
  if (!pet || !owned || owned.star >= 5) return;
  const cost = starCost(owned.star + 1);
  if (owned.duplicate_fragments < cost) return;
  owned.duplicate_fragments -= cost;
  owned.star += 1;
  owned.current_form = currentForm(pet, owned);
  owned.last_upgraded_at = new Date().toISOString();
  saveState();
  render();
}

function canAwaken(pet, owned) {
  if (!owned || owned.star < 5 || owned.awakened || !pet.available_forms.includes("覺醒型")) return false;
  return hasMaterials(pet.required_awaken_materials);
}

function awakenPet(petId) {
  const pet = getPet(petId);
  const owned = getOwned(petId);
  if (!pet || !canAwaken(pet, owned)) return;
  spendMaterials(pet.required_awaken_materials);
  owned.awakened = true;
  owned.current_form = "覺醒型";
  owned.last_upgraded_at = new Date().toISOString();
  saveState();
  render();
}

function canUltimate(pet, owned) {
  if (!owned || !owned.awakened || owned.ultimate || !pet.can_be_ultimate) return false;
  return hasMaterials(pet.required_ultimate_materials) && owned.duplicate_fragments >= ultimateFragmentCost(pet);
}

function ultimatePet(petId) {
  const pet = getPet(petId);
  const owned = getOwned(petId);
  if (!pet || !canUltimate(pet, owned)) return;
  spendMaterials(pet.required_ultimate_materials);
  owned.duplicate_fragments -= ultimateFragmentCost(pet);
  owned.ultimate = true;
  owned.current_form = "究極型";
  owned.last_upgraded_at = new Date().toISOString();
  saveState();
  render();
}

function hasMaterials(required) {
  return Object.entries(required || {}).every(([key, value]) => (state.materials[key] || 0) >= value);
}

function spendMaterials(required) {
  Object.entries(required || {}).forEach(([key, value]) => {
    state.materials[key] = Math.max(0, (state.materials[key] || 0) - value);
  });
}

function render() {
  renderProfile();
  renderReportPeriodInput();
  renderActivePet();
  renderEntrySummon();
  renderDailyStatus();
  renderPetWish();
  renderDailyQuests();
  renderMetrics();
  renderRewards();
  renderDailyAchievements();
  renderRewardAction();
  renderPools();
  renderDrawResult();
  renderCollectionSummary();
  if (isViewActive("collection")) renderCollection();
  renderTeam();
}

function renderReportPeriodInput() {
  const form = document.getElementById("manualReportForm");
  const input = form?.elements?.period || null;
  if (!input) return;
  const period = normalizeReportPeriodKey(input.value) || normalizeSourceLedger(state.sourceLedger).activePeriod || currentPeriodKey();
  input.value = period;
}

function renderDailyStatus() {
  const status = document.getElementById("dailyStatus");
  const settled = state.dailySettlements?.[todayKey()];
  const periodText = settled?.period || normalizeSourceLedger(state.sourceLedger).activePeriod || currentPeriodKey();
  const nextStreak = nextStreakRewardPreview();
  const nextStreakText = `下個寶箱 ${nextStreak.count}天：${nextStreak.title}`;
  if (status) {
    const periodStatus = settled
      ? settled.awarded
        ? `<span class="material-pill">${escapeHtml(periodText)} 差額已入帳</span><span class="soft-pill">新累積會補差額</span>`
        : `<span class="soft-pill">${escapeHtml(periodText)} 已記錄，沒有新增差額</span><span class="soft-pill">新累積會補差額</span>`
      : `<span class="soft-pill">${escapeHtml(periodText)} 尚未入帳新增差額</span>`;
    status.innerHTML = `${periodStatus}<span class="soft-pill">${escapeHtml(streakMessage())}</span><span class="soft-pill">${escapeHtml(nextStreakText)}</span>`;
  }
  const manualButton = document.getElementById("manualSubmitBtn");
  if (manualButton) manualButton.textContent = settled ? "同步累積" : "結算差額";
  const sampleButton = document.getElementById("sampleReportBtn");
  if (sampleButton) sampleButton.disabled = false;
}

function renderProfile() {
  const branchLabel = document.getElementById("branchLabel");
  if (branchLabel) branchLabel.textContent = `${PROFILE.branch} · ${PROFILE.agent}`;
}

function renderActivePet() {
  const pet = getActivePet();
  const owned = getOwned(pet.pet_id);
  const expMax = expNeeded(owned?.level || 1);
  const expPercent = Math.min(100, (((owned?.exp || 0) / expMax) * 100).toFixed(1));
  document.getElementById("activePetStage").innerHTML = petVisual(pet, owned, "large");
  document.getElementById("activePetStatus").innerHTML = `
    <div class="pet-name-row">
      <h2>${pet.name}</h2>
      <span class="rarity-badge rarity-${pet.rarity}">${pet.rarity}</span>
      <span class="soft-pill">${escapeHtml(PROFILE.agent)}的夥伴</span>
      <span class="soft-pill">${currentForm(pet, owned)}</span>
    </div>
    <p class="small-text">${pet.card_effect_summary}</p>
    <p class="assist-line">${escapeHtml(activePetAssistText(pet, owned))}</p>
    <div class="stat-line">
      <div class="team-topline"><span>Lv.${owned?.level || 1}</span><span>${owned?.exp || 0}/${expMax}</span></div>
      <div class="bar"><span style="width:${expPercent}%"></span></div>
    </div>
    <div class="pool-meta">
      <span class="material-pill">${"★".repeat(owned?.star || 1)}${"☆".repeat(5 - (owned?.star || 1))}</span>
      <span class="material-pill">碎片 ${owned?.duplicate_fragments || 0}</span>
    </div>
    ${renderActiveGrowthGoals(pet, owned)}
  `;
}

function renderActiveGrowthGoals(pet, owned) {
  const goals = buildActivePetGrowthGoals(pet, owned);
  if (!goals.length) return "";
  return `
    <div class="growth-goals" aria-label="養成目標">
      <p class="growth-title">養成目標</p>
      ${goals.map((goal) => `
        <div class="growth-goal ${goal.done ? "is-done" : ""}">
          <strong>${escapeHtml(goal.title)}</strong>
          <span>${escapeHtml(goal.detail)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderEntrySummon() {
  const summon = document.getElementById("entrySummon");
  if (!summon) return;
  const pet = getActivePet();
  const owned = getOwned(pet.pet_id);
  const settled = Boolean(state.dailySettlements?.[todayKey()]?.awarded);
  const tickets = totalTickets();
  const streak = state.settlementStreak?.count || 0;
  const primaryAction = settled && tickets > 0
    ? `<button class="primary-button" type="button" data-view="gacha">去抽卡</button>`
    : `<button class="primary-button" type="button" data-view="today">${settled ? "更新今日" : "結算今日"}</button>`;
  summon.innerHTML = `
    <div class="summon-copy">
      <span class="summon-kicker">今日召喚</span>
      <strong>${escapeHtml(PROFILE.agent)}，${settled ? "今天的夥伴已醒來" : "先喚醒你的房仲精靈"}</strong>
      <p>行程多一點讓 ${escapeHtml(pet.name)} 升級；委託 / 斡旋 / 簽約拿稀有素材。</p>
    </div>
    <div class="summon-status">
      <span class="material-pill">${settled ? "今日已結算" : "待結算"}</span>
      <span class="soft-pill">可抽 ${tickets} 次</span>
      <span class="soft-pill">連續 ${streak} 天</span>
      <span class="soft-pill">${escapeHtml(currentForm(pet, owned))} Lv.${owned?.level || 1}</span>
      <span class="soft-pill">${escapeHtml(activePetAssistText(pet, owned).replace("主寵助力：", ""))}</span>
    </div>
    <div class="summon-actions">
      ${primaryAction}
      <button class="secondary-button" type="button" data-view="collection">看卡片庫</button>
    </div>
  `;
}

function renderMetrics() {
  document.getElementById("metricsGrid").innerHTML = METRIC_LABELS.map(([key, label]) => `
    <div class="metric-tile">
      <strong>${formatMetricValue(state.metrics[key] || 0)}</strong>
      <span>${label}</span>
    </div>
  `).join("");
}

function renderPetWish() {
  const target = document.getElementById("petWish");
  if (!target) return;
  const pet = getActivePet();
  const wish = buildPetWish(state.metrics, pet);
  target.innerHTML = `
    <article class="pet-wish-card ${wish.done ? "is-done" : ""}" data-wish="${escapeHtml(wish.key)}">
      <div class="team-topline">
        <div>
          <span class="summon-kicker">主寵今日心願</span>
          <strong>${escapeHtml(wish.petName)}想要：${escapeHtml(wish.title)}</strong>
        </div>
        <span class="soft-pill">${wish.current}/${wish.target} ${escapeHtml(wish.unit)}</span>
      </div>
      <div class="bar"><span style="width:${wish.progress}%"></span></div>
      <p>${escapeHtml(wish.message)}</p>
      <p class="small-text">完成心願：${escapeHtml(wish.rewardText)}</p>
    </article>
  `;
}

function renderDailyQuests() {
  const target = document.getElementById("dailyQuestList");
  if (!target) return;
  target.innerHTML = buildDailyQuests(state.metrics).map((quest) => {
    const progress = Math.min(100, Math.round((quest.current / quest.target) * 100));
    return `
      <article class="quest-card ${quest.done ? "is-done" : ""}" data-quest="${quest.key}">
        <div class="team-topline">
          <strong>${escapeHtml(quest.title)}</strong>
          <span class="soft-pill">${escapeHtml(quest.reward)}</span>
        </div>
        <div class="bar"><span style="width:${progress}%"></span></div>
        <p>${escapeHtml(quest.message)}</p>
      </article>
    `;
  }).join("");
}

function renderRewards() {
  const rewards = state.lastRewards;
  const rewardItems = [
    ["經驗", `+${rewards.exp || 0}`],
    ["一般券", `+${rewards.general || 0}`],
    ["成果券", `+${rewards.result || 0}`],
    ["簽約核心", `+${rewards.materials?.contract_core || 0}`],
  ];
  if (rewards.wish) rewardItems.push(["心願", "完成"]);
  if (rewards.streakReward) rewardItems.push(["連續", `${rewards.streakReward.count}天`]);
  if (rewards.materialReport?.gains?.length) rewardItems.push(["素材", `${rewards.materialReport.gains.length} 種`]);
  if (rewards.petGrowth) rewardItems.push(["成長", `Lv.${rewards.petGrowth.toLevel}`]);
  document.getElementById("rewardStrip").innerHTML = rewardItems.map(([label, value]) => `
    <div class="reward-item">
      <strong>${value}</strong>
      <span>${label}</span>
    </div>
  `).join("");
}

function todayAchievements() {
  const settlement = state.dailySettlements?.[todayKey()];
  if (!settlement?.awarded) return [];
  if (Array.isArray(settlement.achievements)) return settlement.achievements;
  return buildDailyAchievements(
    settlement.metrics || state.metrics,
    settlement.rewards || calculateRewards(settlement.metrics || state.metrics),
    state.settlementStreak,
  );
}

function achievementSummaryText(achievements = todayAchievements()) {
  return achievements.length ? achievements.map((achievement) => achievement.title).join("、") : "";
}

function renderDailyAchievements() {
  const target = document.getElementById("dailyAchievementList");
  if (!target) return;
  const achievements = todayAchievements();
  if (!achievements.length) {
    target.innerHTML = "";
    return;
  }
  target.innerHTML = achievements.map((achievement) => `
    <article class="achievement-card" data-achievement="${escapeHtml(achievement.key)}">
      <strong>${escapeHtml(achievement.title)}</strong>
      <span>${escapeHtml(achievement.detail)}</span>
    </article>
  `).join("");
}

function renderRewardAction() {
  const target = document.getElementById("rewardActionBar");
  if (!target) return;
  const tickets = totalTickets();
  const rewards = state.lastRewards;
  const settlementRewards = state.dailySettlements?.[todayKey()]?.rewards || null;
  const nextStep = buildRewardNextStep(rewards.blocked ? settlementRewards || rewards : rewards);
  const nextStepUi = rewardNextStepMarkup(nextStep);
  const shareButton = hasSettledToday()
    ? `
      <button class="secondary-button" type="button" data-share-daily="1">分享今日</button>
      <a class="secondary-button line-share-link" href="${escapeHtml(buildLineShareUrl(buildDailyShareText()))}" target="_blank" rel="noopener" data-line-share-daily="1">LINE分享</a>
    `
    : "";
  if (rewards.blocked) {
    target.innerHTML = `
      <div class="reward-action-card">
        <div>
          <strong>累積資料已記錄</strong>
          <span>目前沒有新增差額，所以不重複加券或素材。</span>
          ${nextStepUi.text}
        </div>
        <div class="reward-action-buttons">
          ${nextStepUi.button}
          ${shareButton}
          <span id="dailyShareStatus" class="small-text"></span>
        </div>
      </div>
    `;
    return;
  }
  target.innerHTML = `
    <div class="reward-action-card">
      <div>
        <strong>目前可抽 ${tickets} 次</strong>
        <span>${tickets > 0 ? "把今天的券換成新夥伴。" : "完成今日推進目標後會累積抽卡券。"}</span>
        ${nextStepUi.text}
      </div>
      <div class="reward-action-buttons">
        <button class="primary-button" type="button" data-view="gacha" ${tickets <= 0 ? "disabled" : ""}>去抽卡</button>
        ${nextStepUi.button}
        ${shareButton}
        <span id="dailyShareStatus" class="small-text"></span>
      </div>
    </div>
  `;
}

function renderPools() {
  document.getElementById("ticketSummary").textContent = `券 ${totalTickets()}`;
  document.getElementById("poolGrid").innerHTML = POOLS.map((pool) => {
    const assistAdjustment = poolOddsWithAssist(pool);
    return `
      <article class="pool-card">
        <div class="team-topline">
          <h3>${pool.name}</h3>
          <span>${state.tickets[pool.key] || 0} 張</span>
        </div>
        <p class="small-text">${pool.source}</p>
        ${assistAdjustment.boost ? `<p class="assist-line">${escapeHtml(assistTextFromAdjustment(assistAdjustment))}</p>` : ""}
        <div class="pool-meta">
          ${Object.entries(assistAdjustment.odds).map(([rarity, value]) => `<span class="rarity-badge rarity-${rarity}">${rarity} ${value}%</span>`).join("")}
        </div>
        <button class="primary-button" type="button" data-draw="${pool.key}" ${state.tickets[pool.key] <= 0 ? "disabled" : ""}>抽一次</button>
      </article>
    `;
  }).join("");
}

function renderDrawResult() {
  const lastDraw = state.history.find((item) => item.type === "draw");
  const target = document.getElementById("drawResult");
  if (!lastDraw) {
    target.innerHTML = "";
    return;
  }
  const pet = getPet(lastDraw.petId);
  const flavor = petFlavorText(pet);
  target.innerHTML = `
    <article class="draw-result-card">
      <div class="mini-pet">${petVisual(pet, getOwned(pet.pet_id), "small")}</div>
      <div>
        <div class="pet-name-row">
          <h3>${pet.name}</h3>
          <span class="rarity-badge rarity-${pet.rarity}">${pet.rarity}</span>
        </div>
        ${flavor ? `<p class="pet-flavor">「${escapeHtml(flavor)}」</p>` : ""}
        <p class="small-text">${lastDraw.text}</p>
        ${lastDraw.assistText ? `<p class="assist-line">${escapeHtml(lastDraw.assistText)}</p>` : ""}
        <div class="draw-share-row">
          <button class="secondary-button" type="button" data-view="collection">看卡片庫</button>
          <button class="secondary-button" type="button" data-share-draw="1">分享結果</button>
          <a class="secondary-button line-share-link" href="${escapeHtml(buildLineShareUrl(buildDrawShareText(lastDraw)))}" target="_blank" rel="noopener" data-line-share-draw="1">LINE分享</a>
          <span id="drawShareStatus" class="small-text"></span>
        </div>
      </div>
    </article>
  `;
}

function petFlavorText(pet) {
  if (!pet) return "";
  return pet.line_subtitle || pet.card_effect_summary || "";
}

function buildDrawShareText(draw = state.history.find((item) => item.type === "draw")) {
  if (!draw) return "";
  const pet = getPet(draw.petId);
  const petText = pet ? `${pet.rarity} ${pet.name}` : "新夥伴";
  const subtitle = pet?.line_subtitle || pet?.card_effect_summary || "行程養寵物，成果拿覺醒素材。";
  return [
    `${PROFILE.branch} ${PROFILE.agent} 在房仲精靈抽到 ${petText}！`,
    subtitle,
    draw.assistText || "",
    "行程讓寵物升級，委託/斡旋/簽約拿稀有素材。",
  ].filter(Boolean).join("\n");
}

function setShareStatus(elementId, message) {
  const status = document.getElementById(elementId);
  if (status) status.textContent = message;
}

async function shareTextPayload({ title, text, statusTargetId, openedMessage = "已開啟分享", copiedMessage = "已複製，可貼到 LINE" }) {
  if (!text) return false;
  const nav = typeof navigator === "object" ? navigator : null;
  try {
    if (nav?.share) {
      await nav.share({ title, text });
      setShareStatus(statusTargetId, openedMessage);
      return true;
    }
    if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(text);
      setShareStatus(statusTargetId, copiedMessage);
      return true;
    }
  } catch {
    setShareStatus(statusTargetId, "分享未完成");
    return false;
  }
  if (typeof console === "object" && typeof console.log === "function") console.log(text);
  setShareStatus(statusTargetId, "已產生分享文字");
  return false;
}

async function shareLastDraw() {
  return shareTextPayload({
    title: "房仲精靈抽卡結果",
    text: buildDrawShareText(),
    statusTargetId: "drawShareStatus",
  });
}

function metricSummaryText(metrics = state.metrics) {
  const sourceMetrics = normalizeGameMetrics(metrics);
  const items = METRIC_LABELS
    .map(([key, label]) => [label, Number(sourceMetrics[key] || 0)])
    .filter(([, value]) => value > 0);
  if (!items.length) return "今日先累積紀錄";
  return items.map(([label, value]) => `${label} ${formatMetricValue(value)}`).join("、");
}

function rewardSummaryText(rewards = state.lastRewards) {
  const parts = [];
  const ticketLabels = [
    ["general", "一般券"],
    ["boosted", "強化券"],
    ["result", "成果券"],
    ["blessing", "祝福券"],
  ];
  if (rewards?.exp) parts.push(`經驗 +${rewards.exp}`);
  ticketLabels.forEach(([key, label]) => {
    const value = Number(rewards?.[key] || 0);
    if (value > 0) parts.push(`${label} +${value}`);
  });
  if (!rewards?.materialReport) {
    materialGainEntries(rewards?.materials)
      .slice(0, 4)
      .forEach(([key, value]) => parts.push(`${materialLabel(key)} +${value}`));
  }
  if (rewards?.wish) parts.push(`心願完成：${rewards.wish.rewardText}`);
  if (rewards?.streakReward) parts.push(`連續寶箱：${rewards.streakReward.title}（${rewards.streakReward.rewardText}）`);
  if (rewards?.materialReport) parts.push(`覺醒素材：${materialReportSummary(rewards.materialReport)}`);
  if (rewards?.petGrowth) parts.push(`寵物成長：${petGrowthSummary(rewards.petGrowth)}`);
  return parts.length ? parts.join("、") : "今日以數據更新為主";
}

function currentContributionMetrics() {
  return normalizeGameMetrics(state.dailySettlements?.[todayKey()]?.metrics || state.metrics || {});
}

function buildDailyShareText() {
  const settlement = state.dailySettlements?.[todayKey()];
  const metrics = settlement?.metrics || state.metrics;
  const rewards = settlement?.rewards || state.lastRewards || emptyRewards();
  const pet = getActivePet();
  const owned = pet ? getOwned(pet.pet_id) : null;
  const petLine = pet && owned
    ? `${pet.name} ${currentForm(pet, owned)} Lv.${owned.level}`
    : "尚未選擇主寵";
  const achievementLine = achievementSummaryText(settlement?.achievements || state.lastAchievements || []);
  const lines = [
    `${PROFILE.branch} ${PROFILE.agent} 今日房仲精靈戰報`,
    streakMessage(),
    `今日成果：${metricSummaryText(metrics)}`,
    `今日獎勵：${rewardSummaryText(rewards)}`,
    achievementLine ? `今日成就：${achievementLine}` : "",
    rewards.wish ? `主寵心願：${wishSummaryText(rewards.wish)}` : "",
    `夥伴：${petLine}`,
    pet && owned ? activePetAssistText(pet, owned) : "",
  ].filter(Boolean);
  if (state.lastRewards?.blocked) lines.push("累積資料已記錄，目前沒有新增差額。");
  lines.push("行程讓寵物升級，委託/斡旋/簽約拿稀有素材。");
  return lines.join("\n");
}

async function shareDailyReport() {
  return shareTextPayload({
    title: "今日房仲精靈戰報",
    text: buildDailyShareText(),
    statusTargetId: "dailyShareStatus",
  });
}

function teamGoalContribution(goal, metrics = currentContributionMetrics()) {
  const sourceMetrics = normalizeGameMetrics(metrics);
  if (goal.key === "showing") return Number(sourceMetrics.showing || 0) + Number(sourceMetrics.meeting || 0);
  if (goal.key === "development") return Number(sourceMetrics.development || 0) + Number(sourceMetrics.momentum || 0) + Math.floor(Number(sourceMetrics.calls || 0) / 20);
  if (goal.key === "listing") return Number(sourceMetrics.listing || 0) + Number(sourceMetrics.offer || 0) + Number(sourceMetrics.contract || 0);
  return Number(sourceMetrics[goal.key] || 0);
}

function teamGoalCurrent(goal, metrics = currentContributionMetrics()) {
  return Number(goal.current || 0) + teamGoalContribution(goal, metrics);
}

function buildTeamShareText() {
  const metrics = currentContributionMetrics();
  const activityTotal =
    Number(metrics.area || 0) +
    Number(metrics.development || 0) +
    Number(metrics.negotiation || 0) +
    Number(metrics.showing || 0) +
    Number(metrics.momentum || 0);
  const resultTotal =
    Number(metrics.listing || 0) +
    Number(metrics.offer || 0) +
    Number(metrics.price || 0) +
    Number(metrics.meeting || 0) +
    Number(metrics.contract || 0);
  const goalLine = TEAM_GOALS
    .map((goal) => `${goal.name} +${formatMetricValue(teamGoalContribution(goal, metrics))}（${formatMetricValue(teamGoalCurrent(goal, metrics))}/${goal.target}）`)
    .join("、");
  return [
    `${PROFILE.branch} ${PROFILE.agent} 今日團隊貢獻`,
    hasSettledToday() ? "今日已結算" : "今日尚未結算",
    `行程：A${formatMetricValue(metrics.area)} / B${formatMetricValue(metrics.development)} / C${formatMetricValue(metrics.negotiation)} / D${formatMetricValue(metrics.showing)}，前置信號 ${formatMetricValue(metrics.momentum)}，電話 ${formatMetricValue(metrics.calls)}`,
    `成果：委託 ${formatMetricValue(metrics.listing)}、斡旋 ${formatMetricValue(metrics.offer)}、改附表 ${formatMetricValue(metrics.price)}、見面談 ${formatMetricValue(metrics.meeting)}、簽約 ${formatMetricValue(metrics.contract)}`,
    `今日合計：行程 ${formatMetricValue(activityTotal)}、成果 ${formatMetricValue(resultTotal)}`,
    `店內任務：${goalLine}`,
    "行程讓寵物升級，委託/斡旋/簽約拿稀有素材。",
  ].join("\n");
}

async function shareTeamContribution() {
  return shareTextPayload({
    title: "今日團隊貢獻",
    text: buildTeamShareText(),
    statusTargetId: "teamShareStatus",
  });
}

function renderCollectionSummary() {
  const ownedCount = ownedCurrentPetCount();
  document.getElementById("collectionSummary").textContent = `${ownedCount}/${PETS.length}`;
}

function renderStorylineFilter() {
  ensureCollectionStoryline();
  const storylines = getStorylines();
  document.getElementById("storylineFilter").innerHTML = storylines.map((storyline) => {
    const pets = PETS.filter((pet) => pet.storyline_id === storyline.storyline_id);
    const owned = pets.filter((pet) => getOwned(pet.pet_id)).length;
    return `
      <button class="storyline-button ${activeCollectionStorylineId === storyline.storyline_id ? "is-active" : ""}" type="button" data-storyline="${storyline.storyline_id}">
        ${storyline.name} ${owned}/${pets.length}
      </button>
    `;
  }).join("");
}

function collectionActionState(pet, owned = getOwned(pet.pet_id)) {
  if (!owned) return { badges: [], score: 0 };
  const nextCost = owned.star < 5 ? starCost(owned.star + 1) : 0;
  const canStar = owned.star < 5 && owned.duplicate_fragments >= nextCost;
  const awakenReady = canAwaken(pet, owned);
  const materialReady = !owned.awakened &&
    pet.available_forms.includes("覺醒型") &&
    Object.keys(pet.required_awaken_materials || {}).length > 0 &&
    hasMaterials(pet.required_awaken_materials);
  const ultimateReady = canUltimate(pet, owned);
  const badges = [];
  if (pet.pet_id === state.activePetId) badges.push({ label: "主寵", tone: "focus" });
  if (canStar) badges.push({ label: "可升星", tone: "ready" });
  if (awakenReady) badges.push({ label: "可覺醒", tone: "ready" });
  else if (materialReady) badges.push({ label: "素材已足", tone: "soft" });
  if (ultimateReady) badges.push({ label: "可究極", tone: "ready" });
  return {
    badges,
    score:
      (pet.pet_id === state.activePetId ? 100 : 0) +
      (awakenReady ? 80 : 0) +
      (ultimateReady ? 70 : 0) +
      (canStar ? 60 : 0) +
      (materialReady ? 40 : 0) +
      (owned ? 10 : 0),
  };
}

function renderCollectionBadges(badges) {
  if (!badges?.length) return "";
  return `
    <div class="collection-badges">
      ${badges.map((badge) => `<span class="collection-badge is-${escapeHtml(badge.tone)}">${escapeHtml(badge.label)}</span>`).join("")}
    </div>
  `;
}

function renderCollection() {
  ensureCollectionStoryline();
  renderCollectionSummary();
  renderStorylineFilter();
  const visiblePets = PETS
    .filter((pet) => pet.storyline_id === activeCollectionStorylineId)
    .map((pet, index) => ({ pet, index, action: collectionActionState(pet) }))
    .sort((left, right) => right.action.score - left.action.score || left.index - right.index);
  document.getElementById("collectionGrid").innerHTML = visiblePets.map((item) => {
    const { pet, action } = item;
    const owned = getOwned(pet.pet_id);
    const locked = !owned;
    const nextCost = owned && owned.star < 5 ? starCost(owned.star + 1) : 0;
    const flavor = petFlavorText(pet);
    return `
      <article class="pet-card ${locked ? "is-locked" : ""}">
        <div class="mini-pet">${petVisual(pet, owned, "small")}</div>
        <div class="pet-name-row">
          <h3>${pet.name}</h3>
          <span class="rarity-badge rarity-${pet.rarity}">${pet.rarity}</span>
        </div>
        ${renderCollectionBadges(action.badges)}
        <p class="small-text">${locked ? "尚未取得" : `${currentForm(pet, owned)} · Lv.${owned.level} · ${owned.star}星 · 碎片 ${owned.duplicate_fragments}`}</p>
        ${flavor ? `<p class="pet-flavor">「${escapeHtml(flavor)}」</p>` : ""}
        <p class="small-text">${escapeHtml(pet.card_effect_summary || "")}</p>
        <div class="pet-card-actions">
          <button class="secondary-button" type="button" data-active="${pet.pet_id}" ${locked ? "disabled" : ""}>設為夥伴</button>
          <button class="secondary-button" type="button" data-star="${pet.pet_id}" ${!owned || owned.star >= 5 || owned.duplicate_fragments < nextCost ? "disabled" : ""}>升星 ${nextCost ? `-${nextCost}` : ""}</button>
          <button class="secondary-button" type="button" data-awaken="${pet.pet_id}" ${canAwaken(pet, owned) ? "" : "disabled"}>覺醒</button>
          <button class="secondary-button" type="button" data-ultimate="${pet.pet_id}" ${canUltimate(pet, owned) ? "" : "disabled"}>究極合成</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderTeam() {
  renderTeamContribution();
  document.getElementById("teamList").innerHTML = TEAM_GOALS.map((goal) => {
    const metrics = currentContributionMetrics();
    const contribution = teamGoalContribution(goal, metrics);
    const current = teamGoalCurrent(goal, metrics);
    const percent = Math.min(100, Math.round((current / goal.target) * 100));
    return `
      <article class="team-row">
        <div class="team-topline"><span>${goal.name}</span><span>${formatMetricValue(current)}/${goal.target}</span></div>
        <div class="bar"><span style="width:${percent}%"></span></div>
        <p class="small-text">${contribution > 0 ? `你的今日 +${formatMetricValue(contribution)} · ` : ""}${goal.reward}</p>
      </article>
    `;
  }).join("");
}

function renderTeamContribution() {
  const target = document.getElementById("teamContribution");
  if (!target) return;
  const metrics = currentContributionMetrics();
  const activityTotal =
    Number(metrics.area || 0) +
    Number(metrics.development || 0) +
    Number(metrics.negotiation || 0) +
    Number(metrics.showing || 0) +
    Number(metrics.momentum || 0);
  const resultTotal =
    Number(metrics.listing || 0) +
    Number(metrics.offer || 0) +
    Number(metrics.price || 0) +
    Number(metrics.meeting || 0) +
    Number(metrics.contract || 0);
  target.innerHTML = `
    <article class="team-contribution-card">
      <div class="team-contribution-copy">
        <span class="summon-kicker">今日團隊貢獻</span>
        <strong>${escapeHtml(PROFILE.agent)} · ${hasSettledToday() ? "已結算" : "待結算"}</strong>
      </div>
      <div class="team-contribution-stats">
        <span class="material-pill">行程 ${formatMetricValue(activityTotal)}</span>
        <span class="material-pill">電話 ${formatMetricValue(metrics.calls)}</span>
        <span class="material-pill">成果 ${formatMetricValue(resultTotal)}</span>
        <span class="material-pill">簽約 ${formatMetricValue(metrics.contract)}</span>
      </div>
      <div class="team-contribution-actions">
        <button class="secondary-button" type="button" data-share-team="1">分享貢獻</button>
        <a class="secondary-button line-share-link" href="${escapeHtml(buildLineShareUrl(buildTeamShareText()))}" target="_blank" rel="noopener" data-line-share-team="1">LINE分享</a>
        <span id="teamShareStatus" class="small-text"></span>
      </div>
    </article>
  `;
}

function hasPetTag(pet, tag) {
  return Array.isArray(pet.work_behavior_tags) && pet.work_behavior_tags.includes(tag);
}

function petVisualTrait(pet) {
  const storylineId = pet.storyline_id || "";
  if (storylineId.includes("area") || hasPetTag(pet, "AREA_ACTIVITY")) return { key: "area", label: "商圈" };
  if (storylineId.includes("development") || hasPetTag(pet, "DEVELOPMENT")) return { key: "development", label: "開發" };
  if (storylineId.includes("call") || hasPetTag(pet, "CALL_COUNT")) return { key: "call", label: "電話" };
  if (storylineId.includes("negotiation") || hasPetTag(pet, "NEGOTIATION") || hasPetTag(pet, "PRICE_REVISION")) return { key: "negotiation", label: "議價" };
  if (storylineId.includes("showing") || hasPetTag(pet, "SHOWING") || hasPetTag(pet, "CLIENT_MEETING")) return { key: "showing", label: "帶看" };
  if (storylineId.includes("listing") || hasPetTag(pet, "LISTING_SIGNED")) return { key: "listing", label: "委託" };
  if (storylineId.includes("offer") || hasPetTag(pet, "OFFER_RECEIVED")) return { key: "offer", label: "斡旋" };
  if (storylineId.includes("contract") || hasPetTag(pet, "CONTRACT_SIGNED") || hasPetTag(pet, "TEAM_MISSION")) return { key: "contract", label: "簽約" };
  return { key: "general", label: "精靈" };
}

function safeSvgId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "-");
}

function petBodySvg(trait, gradientId, dark) {
  const stroke = `stroke="${dark}" stroke-width="4"`;
  if (trait.key === "development") {
    return `<path d="M32 82 C32 50 50 36 68 39 C90 43 103 59 99 86 C96 113 78 125 58 121 C40 117 31 101 32 82 Z" fill="url(#${gradientId})" ${stroke}/>`;
  }
  if (trait.key === "call") {
    return `<ellipse cx="64" cy="80" rx="32" ry="39" fill="url(#${gradientId})" ${stroke}/>`;
  }
  if (trait.key === "negotiation") {
    return `<path d="M25 82 C32 54 50 42 72 45 C94 48 107 67 100 92 C94 114 74 125 50 119 C31 115 20 101 25 82 Z" fill="url(#${gradientId})" ${stroke}/>`;
  }
  if (trait.key === "showing") {
    return `<path d="M35 83 C36 55 51 39 68 42 C86 45 99 63 96 88 C94 111 78 124 58 121 C42 118 34 103 35 83 Z" fill="url(#${gradientId})" ${stroke}/>`;
  }
  if (trait.key === "listing") {
    return `<path d="M64 36 C88 52 99 70 94 94 C90 115 76 125 59 121 C41 117 31 101 34 82 C37 62 48 47 64 36 Z" fill="url(#${gradientId})" ${stroke}/>`;
  }
  if (trait.key === "offer") {
    return `<path d="M31 86 C25 58 43 42 64 43 C88 44 104 62 99 90 C95 114 76 125 54 119 C40 115 34 104 31 86 Z" fill="url(#${gradientId})" ${stroke}/>`;
  }
  if (trait.key === "contract") {
    return `<path d="M29 82 C29 53 46 38 64 38 C85 38 101 55 101 84 C101 113 82 126 64 126 C45 126 29 111 29 82 Z" fill="url(#${gradientId})" ${stroke}/>`;
  }
  return `<ellipse cx="64" cy="78" rx="36" ry="42" fill="url(#${gradientId})" ${stroke}/>`;
}

function petTailSvg(trait, primary, accent, dark) {
  if (trait.key === "area") return `<path class="tail-sway" d="M31 88 C9 78 13 55 34 61" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>`;
  if (trait.key === "development") return `<path class="tail-sway" d="M92 91 C119 84 111 56 91 67" fill="none" stroke="${primary}" stroke-width="10" stroke-linecap="round"/>`;
  if (trait.key === "call") return `<path class="tail-sway" d="M39 103 C17 114 18 86 39 91" fill="none" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>`;
  if (trait.key === "negotiation") return `<path d="M92 95 L112 91 L98 107 Z" fill="${accent}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>`;
  if (trait.key === "showing") return `<path class="tail-sway" d="M91 82 C112 75 115 98 95 103" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`;
  if (trait.key === "listing") return `<path d="M93 90 C111 80 111 105 95 109" fill="${accent}" stroke="${dark}" stroke-width="3"/>`;
  if (trait.key === "offer") return `<path class="thread-line" d="M30 101 C16 83 33 72 46 87 C60 103 75 77 96 93" fill="none" stroke="#c2415d" stroke-width="5" stroke-linecap="round"/>`;
  if (trait.key === "contract") return `<path class="tail-sway" d="M94 91 C119 83 114 114 92 109" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>`;
  return "";
}

function petHeadpieceSvg(trait, accent, dark) {
  if (trait.key === "area") {
    return `
      <path d="M43 48 C28 29 44 22 53 42 Z" fill="${accent}" stroke="${dark}" stroke-width="3"/>
      <path d="M85 48 C100 29 84 22 75 42 Z" fill="${accent}" stroke="${dark}" stroke-width="3"/>
    `;
  }
  if (trait.key === "development") {
    return `
      <path d="M48 45 C37 18 52 12 61 39 Z" fill="${accent}" stroke="${dark}" stroke-width="3"/>
      <path d="M80 45 C91 18 76 12 67 39 Z" fill="${accent}" stroke="${dark}" stroke-width="3"/>
    `;
  }
  if (trait.key === "call") {
    return `
      <path d="M53 39 L45 18" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>
      <path d="M75 39 L83 18" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="44" cy="15" r="5" fill="${accent}" stroke="${dark}" stroke-width="3"/>
      <circle cx="84" cy="15" r="5" fill="${accent}" stroke="${dark}" stroke-width="3"/>
    `;
  }
  if (trait.key === "negotiation") {
    return `<path d="M48 38 L64 18 L80 38" fill="none" stroke="${accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (trait.key === "showing") {
    return `<path d="M49 40 C58 20 72 20 80 40" fill="${accent}" stroke="${dark}" stroke-width="3"/>`;
  }
  if (trait.key === "listing") {
    return `
      <path d="M50 42 C43 24 52 17 63 35" fill="${accent}" stroke="${dark}" stroke-width="3"/>
      <path d="M78 42 C85 24 76 17 65 35" fill="${accent}" stroke="${dark}" stroke-width="3"/>
      <circle cx="64" cy="30" r="5" fill="#ffffff" opacity=".85"/>
    `;
  }
  if (trait.key === "offer") {
    return `
      <path d="M47 39 L55 20 L63 39" fill="${accent}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M65 39 L73 20 L81 39" fill="${accent}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
    `;
  }
  if (trait.key === "contract") {
    return `<path d="M44 38 L57 19 L64 35 L72 19 L84 38" fill="${accent}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  return `<path d="M55 31 L62 17 L69 31 Z" fill="${accent}"/>`;
}

function petAccessorySvg(trait, accent, dark) {
  if (trait.key === "area") {
    return `
      <path d="M39 93 C52 100 75 100 89 93" fill="none" stroke="${dark}" stroke-width="8" stroke-linecap="round" opacity=".82"/>
      <path d="M48 93 L63 101 L75 94" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
    `;
  }
  if (trait.key === "development") {
    return `
      <circle class="badge-pulse" cx="64" cy="98" r="12" fill="#ffffff" opacity=".86" stroke="${dark}" stroke-width="3"/>
      <path d="M59 103 L64 91 L70 103 Z" fill="${accent}" stroke="${dark}" stroke-width="2" stroke-linejoin="round"/>
    `;
  }
  if (trait.key === "call") {
    return `
      <path class="signal-wave" d="M31 47 C22 57 22 72 31 82" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      <path class="signal-wave" d="M97 47 C106 57 106 72 97 82" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      <rect x="55" y="92" width="18" height="25" rx="5" fill="#ffffff" opacity=".86" stroke="${dark}" stroke-width="3"/>
      <circle cx="64" cy="111" r="2" fill="${dark}"/>
    `;
  }
  if (trait.key === "negotiation") {
    return `
      <path d="M47 101 L82 88" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>
      <path d="M78 82 L93 91 L84 106 L69 97 Z" fill="${accent}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M45 86 H83" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
    `;
  }
  if (trait.key === "showing") {
    return `
      <path class="route-line" d="M42 105 C54 92 74 111 88 95" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="42" cy="105" r="4" fill="#ffffff" stroke="${dark}" stroke-width="2"/>
      <circle cx="88" cy="95" r="4" fill="#ffffff" stroke="${dark}" stroke-width="2"/>
      <path d="M83 55 H101 V72 H83 Z" fill="#ffffff" opacity=".75" stroke="${dark}" stroke-width="3"/>
    `;
  }
  if (trait.key === "listing") {
    return `
      <path d="M59 98 C59 88 69 86 72 96 C73 104 66 111 64 116 C61 110 59 105 59 98 Z" fill="${accent}" stroke="${dark}" stroke-width="3"/>
      <path d="M73 94 H88 M84 94 V101" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>
      <path d="M54 101 C44 91 54 82 64 91" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".75"/>
    `;
  }
  if (trait.key === "offer") {
    return `
      <path class="thread-line" d="M39 92 C53 78 71 109 89 89" fill="none" stroke="#c2415d" stroke-width="5" stroke-linecap="round"/>
      <circle cx="39" cy="92" r="5" fill="#ffffff" stroke="${dark}" stroke-width="2"/>
      <circle cx="89" cy="89" r="5" fill="#ffffff" stroke="${dark}" stroke-width="2"/>
    `;
  }
  if (trait.key === "contract") {
    return `
      <path d="M55 100 H80" stroke="${dark}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="53" cy="100" r="7" fill="${accent}" stroke="${dark}" stroke-width="3"/>
      <path d="M80 94 L90 100 L80 106 Z" fill="${accent}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M47 55 L51 63 L60 64 L53 70 L55 79 L47 74 L39 79 L41 70 L34 64 L43 63 Z" fill="#ffffff" opacity=".72"/>
    `;
  }
  return "";
}

function petImageUrl(pet, size) {
  if (!pet) return "";
  const preferred = size === "small" ? pet.thumbnail_url || pet.image_url : pet.image_url || pet.thumbnail_url;
  return normalizePetAssetUrl(preferred);
}

function petVisual(pet, owned, size) {
  const assetUrl = petImageUrl(pet, size);
  if (!assetUrl) return petSvg(pet, owned, size);
  const trait = petVisualTrait(pet);
  const opacity = owned ? 1 : 0.45;
  const alt = `${pet.name} ${trait.label}`;
  return `
    <div class="pet-art-frame pet-art-${size}" data-visual="${trait.key}" style="opacity:${opacity}">
      <img class="pet-art-image" src="${escapeHtml(assetUrl)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">
    </div>
  `;
}

function petSvg(pet, owned, size) {
  const [primary, accent, dark] = pet.palette;
  const form = currentForm(pet, owned);
  const trait = petVisualTrait(pet);
  const gradientId = `body-${safeSvgId(pet.pet_id)}-${size}-${trait.key}-${svgRenderCount += 1}`;
  const crown = form === "究極型" || pet.rarity === "UR";
  const awakened = form === "覺醒型" || form === "究極型" || pet.rarity === "SSR";
  const opacity = owned ? 1 : 0.45;
  const spark = awakened
    ? `<circle class="spark" cx="36" cy="26" r="4" fill="${accent}"/><circle class="spark" cx="97" cy="35" r="3" fill="${accent}"/><circle class="spark" cx="107" cy="82" r="4" fill="${accent}"/>`
    : "";
  const horn = pet.rarity === "SSR" || pet.rarity === "UR"
    ? `<path d="M54 31 L63 8 L72 31 Z" fill="${accent}"/>`
    : `<path d="M55 31 L62 17 L69 31 Z" fill="${accent}"/>`;
  const crownShape = crown
    ? `<path d="M43 25 L54 10 L64 25 L76 10 L87 25 L82 38 L48 38 Z" fill="${accent}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>`
    : "";
  const wings = size === "large" || awakened
    ? `
      <path class="wing-left" d="M45 75 C10 58 14 106 46 100 C32 92 32 78 45 75 Z" fill="${accent}" opacity=".72"/>
      <path class="wing-right" d="M83 75 C118 58 114 106 82 100 C96 92 96 78 83 75 Z" fill="${accent}" opacity=".72"/>
    `
    : "";
  return `
    <svg class="pet-svg" data-visual="${trait.key}" viewBox="0 0 128 140" role="img" aria-label="${pet.name} ${trait.label}" style="opacity:${opacity}">
      <defs>
        <linearGradient id="${gradientId}" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${primary}"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      ${spark}
      ${wings}
      ${petTailSvg(trait, primary, accent, dark)}
      ${petHeadpieceSvg(trait, accent, dark)}
      ${petBodySvg(trait, gradientId, dark)}
      ${crownShape || (awakened ? horn : "")}
      ${petAccessorySvg(trait, accent, dark)}
      <circle cx="49" cy="70" r="6" fill="${dark}"/>
      <circle cx="79" cy="70" r="6" fill="${dark}"/>
      <circle cx="51" cy="68" r="2" fill="#fff"/>
      <circle cx="81" cy="68" r="2" fill="#fff"/>
      <path d="M55 88 Q64 96 73 88" fill="none" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>
      <path d="M37 111 C45 127 83 127 91 111" fill="${dark}" opacity=".14"/>
      <circle cx="38" cy="86" r="5" fill="#fff" opacity=".55"/>
    </svg>
  `;
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  const view = target.dataset.view;
  if (view) {
    document.querySelectorAll(".tab-button").forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));
    document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.toggle("is-active", panel.id === `view-${view}`));
    if (view === "collection") renderCollection();
  }
  if (target.id === "sampleReportBtn") settleMetrics(SAMPLE_METRICS);
  if (target.id === "backupBtn") downloadProgressBackup();
  if (target.id === "restoreBtn") document.getElementById("backupInput")?.click();
  if (target.id === "resetBtn") requestResetProgress();
  if (target.dataset.shareDraw) shareLastDraw();
  if (target.dataset.shareDaily) shareDailyReport();
  if (target.dataset.shareTeam) shareTeamContribution();
  if (target.dataset.draw) draw(target.dataset.draw);
  if (target.dataset.active) {
    state.activePetId = target.dataset.active;
    saveState();
    render();
  }
  if (target.dataset.star) upgradeStar(target.dataset.star);
  if (target.dataset.awaken) awakenPet(target.dataset.awaken);
  if (target.dataset.ultimate) ultimatePet(target.dataset.ultimate);
  if (target.dataset.storyline) {
    activeCollectionStorylineId = target.dataset.storyline;
    renderCollection();
  }
});

document.getElementById("csvInput").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    settleMetrics(parseCsv(String(reader.result || "")));
    event.target.value = "";
  });
  reader.readAsText(file);
});

document.getElementById("backupInput").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    restoreProgressBackupText(String(reader.result || ""));
    event.target.value = "";
  });
  reader.addEventListener("error", () => {
    setBackupStatus("無法讀取進度備份檔", "bad");
    event.target.value = "";
  });
  reader.readAsText(file);
});

document.getElementById("manualReportForm").addEventListener("submit", (event) => {
  event.preventDefault();
  settleMetrics(readManualMetrics(event.currentTarget));
});

ensureStarterPet();
ensureCollectionStoryline();
render();
loadExternalContent();
registerServiceWorker();
