const LEGACY_STORAGE_KEY = "realtor-pet-game-v1";
const EMPLOYEE_LOGIN_KEY = `${LEGACY_STORAGE_KEY}:employee-login`;
const CLOUD_MANAGER_KEY_STORAGE = `${LEGACY_STORAGE_KEY}:manager-key`;
const MANAGER_MODE = readManagerMode();
const ACTIVE_STORYLINE_IDS = new Set([
  "development",
  "sl_development_expedition",
  "call",
  "sl_call_signal_tower",
  "showing",
  "sl_showing_route",
  "listing",
  "sl_listing_seed_garden",
  "contract",
  "sl_contract_team_sanctum",
]);
const CONTRACT_TEMPLE_STORYLINE_IDS = new Set(["contract", "sl_contract_team_sanctum"]);
const PROFILE = readEntryProfile();
const STORAGE_KEY = `${LEGACY_STORAGE_KEY}:${PROFILE.userKey}`;
const CLOUD_API_BASE_URL = readCloudApiBaseUrl();
captureCloudManagerKeyFromUrl();

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
    name: "探索補給池",
    ticketName: "一般券",
    source: "E 累積、電話信號",
    unlockText: "登入即可累積，E 全部越高越容易開更多池",
    allowedStorylines: ["sl_development_expedition", "sl_call_signal_tower", "sl_showing_route", "sl_listing_seed_garden", "development", "call", "showing", "listing"],
    rarityBands: ["N", "R"],
  },
  {
    key: "boosted",
    name: "高價值行動池",
    ticketName: "強化行程券",
    source: "B+C+D 有效組數推進",
    unlockText: "B+C+D 有效 > 4 後應有更明顯的解鎖感",
    allowedStorylines: ["sl_development_expedition", "sl_showing_route", "sl_listing_seed_garden", "development", "showing", "listing"],
    rarityBands: ["N", "R", "SR"],
  },
  {
    key: "result",
    name: "成果種子池",
    ticketName: "成果券",
    source: "委託、見面談、簽約",
    unlockText: "成交神殿只吃委託 / 見面談 / 簽約，不吃一般行程",
    allowedStorylines: ["sl_listing_seed_garden", "sl_contract_team_sanctum", "listing", "contract"],
    rarityBands: ["R", "SR", "SSR"],
  },
  {
    key: "blessing",
    name: "成交神殿池",
    ticketName: "簽約祝福券",
    source: "委託、見面談、簽約核心進度",
    unlockText: "只從成交神殿成果來源開啟，倍率待後端設定",
    allowedStorylines: ["sl_contract_team_sanctum", "contract"],
    rarityBands: ["SR", "SSR"],
  },
];

const RARITY_ORDER = ["N", "R", "SR", "SSR", "UR"];
const GACHA_CONFIG_INTERFACE = {
  dropRates: "由後端提供，例如 { general: { N: 70, R: 30 } }；未提供時 UI 不顯示精確掉落率。",
  assistRules: "由後端提供主寵助力倍率或稀有感應規則；未提供時只顯示已開啟狀態。",
  poolUnlocks: "由後端提供各池解鎖門檻；前端第一版只呈現進度與 placeholder。",
};

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

PETS = filterRuntimePets(PETS);
STORYLINES = filterRuntimeStorylines(STORYLINES);

const state = loadState();

function readManagerMode() {
  const search = typeof location === "object" && typeof location.search === "string" ? location.search : "";
  const params = typeof URLSearchParams === "function" ? new URLSearchParams(search) : null;
  if (!params) return false;
  return params.get("role") === "manager" || params.get("mode") === "manager" || params.get("manager") === "1";
}

function readCloudApiBaseUrl() {
  const search = typeof location === "object" && typeof location.search === "string" ? location.search : "";
  const params = typeof URLSearchParams === "function" ? new URLSearchParams(search) : null;
  if (!params) return "";
  const raw = String(params.get("api") || params.get("cloudApi") || "").trim();
  if (!raw) return "";
  if (raw === "mock") return "mock";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "";
    return url.href.replace(/[?#].*$/, "").replace(/\/$/, "");
  } catch {
    return "";
  }
}

function readStoredEmployeeLogin() {
  try {
    const raw = localStorage.getItem(EMPLOYEE_LOGIN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const employeeId = cleanEmployeeId(parsed.employeeId || parsed.userKey || "");
    if (!employeeId) return null;
    return {
      branch: cleanProfileText(parsed.branch, "樹林店", 18),
      agent: cleanProfileText(parsed.agent, `員編 ${employeeId}`, 18),
      userKey: stableProfileKey(employeeId),
      employeeId,
      loginRequired: false,
    };
  } catch {
    return null;
  }
}

function writeEmployeeLogin({ employeeId, branch = "樹林店", agent = "" }) {
  const cleanId = cleanEmployeeId(employeeId);
  if (!cleanId) return false;
  const profile = {
    employeeId: cleanId,
    branch: cleanProfileText(branch, "樹林店", 18),
    agent: cleanProfileText(agent || `員編 ${cleanId}`, `員編 ${cleanId}`, 18),
  };
  localStorage.setItem(EMPLOYEE_LOGIN_KEY, JSON.stringify(profile));
  return true;
}

function clearEmployeeLogin() {
  localStorage.removeItem(EMPLOYEE_LOGIN_KEY);
}

function cleanEmployeeId(value) {
  return String(value || "").trim().replace(/[^0-9A-Za-z_-]/g, "").slice(0, 40);
}

function isFirstReleaseStoryline(storylineId) {
  return ACTIVE_STORYLINE_IDS.has(String(storylineId || ""));
}

function isContractTempleStoryline(storylineId) {
  return CONTRACT_TEMPLE_STORYLINE_IDS.has(String(storylineId || ""));
}

function filterRuntimePets(pets) {
  return (Array.isArray(pets) ? pets : []).filter((pet) => isFirstReleaseStoryline(pet.storyline_id));
}

function filterRuntimeStorylines(storylines) {
  return (Array.isArray(storylines) ? storylines : []).filter((storyline) => isFirstReleaseStoryline(storyline.storyline_id));
}

function activeStorylineLabel(storylineId) {
  return fallbackStorylineName(storylineId);
}

function readEntryProfile() {
  const fallback = {
    branch: "樹林店",
    agent: "示範同仁",
    userKey: "demo",
    employeeId: "",
    loginRequired: true,
  };
  if (MANAGER_MODE) {
    return {
      branch: "樹林店",
      agent: "店長儀表板",
      userKey: "manager",
      employeeId: "manager",
      loginRequired: false,
      role: "manager",
    };
  }
  const storedLogin = readStoredEmployeeLogin();
  if (storedLogin) return storedLogin;

  const search = typeof location === "object" && typeof location.search === "string" ? location.search : "";
  const params = typeof URLSearchParams === "function" ? new URLSearchParams(search) : null;
  if (!params) return fallback;
  const hasPersonalParams = ["branch", "agent", "name", "uid", "user", "agentId"].some((key) => params.has(key));
  if (!hasPersonalParams) return fallback;

  const branch = cleanProfileText(params.get("branch"), fallback.branch, 18);
  const agent = cleanProfileText(params.get("agent") || params.get("name"), fallback.agent, 18);
  const rawKey = cleanEmployeeId(params.get("uid") || params.get("user") || params.get("agentId"));
  const userKey = rawKey ? stableProfileKey(rawKey) : stableProfileKey(`${branch}-${agent}`);
  if (rawKey) writeEmployeeLogin({ employeeId: rawKey, branch, agent });
  return {
    branch,
    agent,
    userKey: userKey || fallback.userKey,
    employeeId: rawKey,
    loginRequired: !rawKey,
  };
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

function createReportGroups() {
  return Object.fromEntries(GAME_SOURCE_METRIC_KEYS.map((key) => [key, { effective: 0, total: 0 }]));
}

function normalizeReportGroups(rawMetrics = {}, sourceMetrics = normalizeGameMetrics(rawMetrics)) {
  const source = normalizeGameMetrics(sourceMetrics);
  const groups = createReportGroups();
  const rawGroups = isPlainObject(rawMetrics.__groups) ? rawMetrics.__groups : {};
  GAME_SOURCE_METRIC_KEYS.forEach((key) => {
    const rawGroup = isPlainObject(rawGroups[key]) ? rawGroups[key] : null;
    const effective = rawGroup ? normalizeMetricValue(rawGroup.effective) : normalizeMetricValue(source[key]);
    const total = rawGroup ? normalizeMetricValue(rawGroup.total) : effective;
    groups[key] = {
      effective,
      total: Math.max(effective, total),
    };
  });
  return groups;
}

function sumGroups(groups, keys, field) {
  return keys.reduce((sum, key) => sum + normalizeMetricValue(groups?.[key]?.[field] || 0), 0);
}

function buildProgressSnapshot(rawMetrics = state?.metrics || {}, sourceMetrics = normalizeGameMetrics(rawMetrics), deltaMetrics = normalizeGameMetrics(rawMetrics)) {
  const source = normalizeGameMetrics(sourceMetrics);
  const delta = normalizeGameMetrics(deltaMetrics);
  const groups = normalizeReportGroups(rawMetrics, source);
  const mainKeys = ["area", "development", "negotiation", "showing"];
  const highValueKeys = ["development", "negotiation", "showing"];
  const mainEffective = sumGroups(groups, mainKeys, "effective");
  const mainTotal = sumGroups(groups, mainKeys, "total");
  const highValueEffective = sumGroups(groups, highValueKeys, "effective");
  const monthlyMissionCurrent = normalizeMetricValue(groups.development.effective + groups.showing.total);
  const contractTempleCurrent = normalizeMetricValue(source.listing + source.meeting + source.contract);
  return {
    period: reportPeriodKeyFromMetrics(rawMetrics),
    updatedAt: new Date().toISOString(),
    sourceMetrics: source,
    deltaMetrics: delta,
    groups,
    main: {
      label: "合計(E)=A+B+C+D",
      effective: mainEffective,
      total: mainTotal,
      dreamTarget: 6,
      dreamDone: mainTotal >= 6,
    },
    highValue: {
      label: "B+C+D 有效組數",
      current: highValueEffective,
      target: 4,
      done: highValueEffective > 4,
    },
    phoneSignal: {
      label: "電話信號",
      calls: source.calls,
      note: "電話越多越好，作為信號加成，不蓋過 B+C+D 有效。",
    },
    monthlyMission: {
      label: "月任務：開發有效 + 帶看組數",
      current: monthlyMissionCurrent,
      target: 20,
      done: monthlyMissionCurrent >= 20,
    },
    contractTemple: {
      label: "成交神殿進度",
      current: contractTempleCurrent,
      sources: {
        listing: source.listing,
        meeting: source.meeting,
        contract: source.contract,
      },
      note: "只由委託、見面談、簽約推進。",
    },
  };
}

function normalizeProgressSnapshot(progress, sourceMetrics = normalizeGameMetrics(SAMPLE_METRICS)) {
  if (!isPlainObject(progress)) return buildProgressSnapshot(sourceMetrics, sourceMetrics, sourceMetrics);
  return {
    ...buildProgressSnapshot(progress.sourceMetrics || sourceMetrics, progress.sourceMetrics || sourceMetrics, progress.deltaMetrics || sourceMetrics),
    ...progress,
    groups: normalizeReportGroups({ __groups: progress.groups }, progress.sourceMetrics || sourceMetrics),
  };
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

function readCloudManagerKey() {
  try {
    return cleanProfileText(sessionStorage.getItem(CLOUD_MANAGER_KEY_STORAGE) || "", "", 160);
  } catch {
    return "";
  }
}

function captureCloudManagerKeyFromUrl() {
  if (!MANAGER_MODE || typeof URLSearchParams !== "function" || typeof location !== "object") return "";
  const search = typeof location.search === "string" ? location.search : "";
  const params = new URLSearchParams(search);
  const key = cleanProfileText(params.get("manager_key") || params.get("key") || "", "", 160);
  if (!key) return "";
  writeCloudManagerKey(key);
  params.delete("manager_key");
  params.delete("key");
  if (typeof history === "object" && typeof history.replaceState === "function") {
    const query = params.toString();
    const nextUrl = `${location.pathname || "/"}${query ? `?${query}` : ""}${location.hash || ""}`;
    history.replaceState(null, "", nextUrl);
  }
  return key;
}

function writeCloudManagerKey(value) {
  const key = cleanProfileText(value, "", 160);
  try {
    if (key) sessionStorage.setItem(CLOUD_MANAGER_KEY_STORAGE, key);
    else sessionStorage.removeItem(CLOUD_MANAGER_KEY_STORAGE);
  } catch {
    return false;
  }
  return true;
}

function getCloudManagerKey() {
  return readCloudManagerKey();
}

function cloudManagerKeyRequired() {
  return MANAGER_MODE && CLOUD_API_BASE_URL && CLOUD_API_BASE_URL !== "mock" && !getCloudManagerKey();
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
    progress: buildProgressSnapshot(SAMPLE_METRICS, normalizeGameMetrics(SAMPLE_METRICS), normalizeGameMetrics(SAMPLE_METRICS)),
    sourceLedger: createSourceLedger(),
    manager: {
      teamMissionStarted: false,
      bonusEnabled: false,
      bonusStatus: "placeholder",
      temporaryTaskStarted: false,
      lastImport: null,
      warnings: [],
      cloudStatus: "local",
      cloudDashboard: null,
      cloudImportPreview: null,
    },
    backendConfig: {
      dropRates: {},
      assistRules: {},
      poolUnlocks: {},
    },
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
    progress: normalizeProgressSnapshot(source.progress, source.progress?.sourceMetrics || source.metrics || initial.metrics),
    sourceLedger: normalizeSourceLedger(source.sourceLedger || initial.sourceLedger),
    manager: {
      ...initial.manager,
      ...(isPlainObject(source.manager) ? source.manager : {}),
      temporaryTaskStarted: Boolean(source.manager?.temporaryTaskStarted),
      warnings: Array.isArray(source.manager?.warnings) ? [...source.manager.warnings] : [...initial.manager.warnings],
      cloudStatus: typeof source.manager?.cloudStatus === "string" ? source.manager.cloudStatus : initial.manager.cloudStatus,
      cloudDashboard: isPlainObject(source.manager?.cloudDashboard) ? source.manager.cloudDashboard : initial.manager.cloudDashboard,
      cloudImportPreview: isPlainObject(source.manager?.cloudImportPreview) ? source.manager.cloudImportPreview : initial.manager.cloudImportPreview,
    },
    backendConfig: {
      ...initial.backendConfig,
      ...(isPlainObject(source.backendConfig) ? source.backendConfig : {}),
      dropRates: isPlainObject(source.backendConfig?.dropRates) ? { ...source.backendConfig.dropRates } : {},
      assistRules: isPlainObject(source.backendConfig?.assistRules) ? { ...source.backendConfig.assistRules } : {},
      poolUnlocks: isPlainObject(source.backendConfig?.poolUnlocks) ? { ...source.backendConfig.poolUnlocks } : {},
    },
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

function reloadWithoutQuery() {
  if (typeof window !== "object") return;
  const path = `${window.location?.origin || ""}${window.location?.pathname || ""}`;
  if (window.location && typeof window.location.assign === "function" && path) {
    window.location.assign(path);
    return;
  }
  if (window.location && typeof window.location.reload === "function") window.location.reload();
}

function handleEmployeeLogin(form) {
  const employeeId = cleanEmployeeId(form?.elements?.employeeId?.value || document.getElementById("employeeIdInput")?.value || "");
  const status = document.getElementById("loginStatus");
  if (!employeeId) {
    if (status) status.textContent = "請輸入員工編號";
    return false;
  }
  writeEmployeeLogin({ employeeId, branch: PROFILE.branch, agent: `員編 ${employeeId}` });
  reloadWithoutQuery();
  return true;
}

function switchEmployee() {
  clearEmployeeLogin();
  reloadWithoutQuery();
}

function applyBackendEmployeeSnapshot(snapshot = {}) {
  const metrics = normalizeGameMetrics(snapshot.metrics || snapshot.sourceMetrics || state.metrics);
  const sourceMetrics = normalizeGameMetrics(snapshot.sourceMetrics || metrics);
  const deltaMetrics = normalizeGameMetrics(snapshot.deltaMetrics || metrics);
  state.metrics = deltaMetrics;
  state.progress = buildProgressSnapshot(
    { ...sourceMetrics, __periodKey: snapshot.period || currentPeriodKey(), __groups: snapshot.groups || {} },
    sourceMetrics,
    deltaMetrics,
  );
  if (snapshot.replaceInventory) {
    if (isPlainObject(snapshot.tickets)) state.tickets = { ...snapshot.tickets };
    if (isPlainObject(snapshot.materials)) state.materials = { ...snapshot.materials };
    if (isPlainObject(snapshot.collection)) state.collection = { ...snapshot.collection };
  } else {
    if (isPlainObject(snapshot.tickets)) state.tickets = mergeObject(state.tickets, snapshot.tickets);
    if (isPlainObject(snapshot.materials)) state.materials = mergeObject(state.materials, snapshot.materials);
    if (isPlainObject(snapshot.collection)) state.collection = mergeObject(state.collection, snapshot.collection);
  }
  if (isPlainObject(snapshot.backendConfig)) {
    state.backendConfig = {
      ...state.backendConfig,
      ...snapshot.backendConfig,
      dropRates: isPlainObject(snapshot.backendConfig.dropRates) ? { ...snapshot.backendConfig.dropRates } : state.backendConfig.dropRates,
      assistRules: isPlainObject(snapshot.backendConfig.assistRules) ? { ...snapshot.backendConfig.assistRules } : state.backendConfig.assistRules,
      poolUnlocks: isPlainObject(snapshot.backendConfig.poolUnlocks) ? { ...snapshot.backendConfig.poolUnlocks } : state.backendConfig.poolUnlocks,
    };
  }
  saveState();
  render();
  return state.progress;
}

function collectionArrayToMap(items = []) {
  if (!Array.isArray(items)) return {};
  return items.reduce((acc, item) => {
    if (!isPlainObject(item) || !item.pet_id) return acc;
    acc[item.pet_id] = {
      user_id: PROFILE.userKey,
      pet_id: item.pet_id,
      level: rewardCount(item.level || 1) || 1,
      exp: rewardCount(item.exp || 0),
      star: rewardCount(item.star || 1) || 1,
      current_form: item.current_form || item.form || "初生型",
      duplicate_fragments: rewardCount(item.duplicate_fragments || item.fragments || 0),
      owned_count: rewardCount(item.owned_count || 1) || 1,
      first_acquired_at: item.first_acquired_at || new Date().toISOString(),
      last_upgraded_at: item.last_upgraded_at || new Date().toISOString(),
      awakened: Boolean(item.awakened),
      ultimate: Boolean(item.ultimate),
    };
    return acc;
  }, {});
}

function cloudResourcesToTickets(resources = {}) {
  const tickets = isPlainObject(resources.tickets) ? { ...resources.tickets } : {};
  const drawPoints = isPlainObject(resources.draw_points) ? resources.draw_points : {};
  const hasTicketBalance = Object.values(tickets).some((value) => Number(value || 0) > 0);
  if (!hasTicketBalance && Object.keys(drawPoints).length) {
    tickets.general = Number(drawPoints.report_points || 0) + Number(drawPoints.daily_free || 0);
    tickets.boosted = Number(drawPoints.boosted || 0);
    tickets.result = Number(drawPoints.result || 0);
    tickets.blessing = Number(drawPoints.blessing || 0) + Number(drawPoints.bonus_draw || 0);
  }
  return tickets;
}

function cloudPlayerStateToSnapshot(data = {}) {
  const resources = isPlainObject(data.resources) ? data.resources : {};
  const collection = isPlainObject(data.collection) ? data.collection : {};
  const ownedCollection = collectionArrayToMap(collection.owned || []);
  const snapshot = {
    period: data.period || currentPeriodKey(),
    sourceMetrics: data.source_metrics || data.sourceMetrics || {},
    deltaMetrics: data.latest_delta || data.delta_metrics || data.deltaMetrics || {},
    tickets: cloudResourcesToTickets(resources),
    materials: resources.materials || {},
    collection: ownedCollection,
    backendConfig: data.backend_config || data.backendConfig || {},
    replaceInventory: Boolean(data.reset_cleared || data.reset?.cleared),
  };
  if (data.active_pet?.pet_id) snapshot.activePetId = data.active_pet.pet_id;
  return snapshot;
}

function applyCloudPlayerState(data = {}) {
  if (isPlainObject(data.player)) {
    PROFILE.branch = cleanProfileText(data.player.branch, PROFILE.branch, 18);
    PROFILE.agent = cleanProfileText(data.player.agent_name || data.player.agent, PROFILE.agent, 18);
    PROFILE.employeeId = cleanEmployeeId(data.player.uid || PROFILE.employeeId);
    PROFILE.userKey = stableProfileKey(PROFILE.employeeId || PROFILE.userKey);
  }
  const snapshot = cloudPlayerStateToSnapshot(data);
  applyBackendEmployeeSnapshot(snapshot);
  if (snapshot.activePetId && getPet(snapshot.activePetId)) state.activePetId = snapshot.activePetId;
  state.manager.cloudStatus = CLOUD_API_BASE_URL === "mock" ? "mock-playerState" : "cloud-playerState";
  saveState();
  render();
  return true;
}

function applyCloudManagerDashboard(data = {}) {
  state.manager.cloudDashboard = data;
  state.manager.cloudStatus = CLOUD_API_BASE_URL === "mock" ? "mock-managerDashboard" : "cloud-managerDashboard";
  if (data.latest_import) {
    state.manager.lastImport = {
      at: data.latest_import.confirmed_at || data.latest_import.uploaded_at || new Date().toISOString(),
      period: data.period || currentPeriodKey(),
      source: data.latest_import.import_id || "cloud",
      rows: Array.isArray(data.players) ? data.players.length : 0,
    };
  }
  state.manager.warnings = Array.isArray(data.warnings) ? data.warnings.map((item) => item.message || String(item)) : [];
  saveState();
  render();
  return true;
}

function cloudEnvelopeData(envelope, action) {
  if (!isPlainObject(envelope) || envelope.ok !== true) return null;
  if (envelope.action && envelope.action !== action) return null;
  return isPlainObject(envelope.data) ? envelope.data : null;
}

function mockCloudEnvelope(action, payload = {}) {
  const period = currentPeriodKey();
  if (action === "playerState") {
    return {
      ok: true,
      action,
      server_time: new Date().toISOString(),
      data: {
        player: { uid: PROFILE.employeeId || PROFILE.userKey, branch: PROFILE.branch, agent_name: PROFILE.agent },
        period,
        latest_import: { import_id: "mock_import_001", published_at: new Date().toISOString() },
        source_metrics: SAMPLE_METRICS,
        awarded_metrics: SAMPLE_METRICS,
        latest_delta: { ...normalizeGameMetrics(SAMPLE_METRICS), calls: 5 },
        resources: {
          draw_points: { report_points: 8, daily_free: 3, bonus_draw: 0 },
          tickets: { general: 6, boosted: 2, result: 3, blessing: 0 },
          materials: { development_core: 12, listing_core: 2, meeting_core: 1, showing_core: 1, call_core: 2 },
        },
        reset: { available: true, warning: "重置會清空卡片庫、寵物、碎片、素材、抽卡紀錄、每日免費抽、月榜第一與加碼，只保留報表重新計算的抽卡點數" },
        active_pet: { pet_id: "pet_dev_001" },
        collection: {
          owned: [
            { pet_id: "pet_dev_001", level: 2, star: 1, current_form: "初生型", duplicate_fragments: 0 },
            { pet_id: "pet_call_003", level: 1, star: 1, current_form: "初生型", duplicate_fragments: 4 },
          ],
        },
        draw_pools: [],
      },
      warnings: [],
      errors: [],
    };
  }
  if (action === "managerDashboard") {
    return {
      ok: true,
      action,
      server_time: new Date().toISOString(),
      data: {
        period,
        latest_import: { import_id: "mock_import_001", status: "PUBLISHED", uploaded_at: new Date().toISOString(), confirmed_at: new Date().toISOString(), warning_count: 0 },
        raw_report_rotation: {
          latest: { file_name: `${period}_latest_行程質量統計.xlsx`, file_hash: "sha256:mock-latest" },
          previous: { file_name: `${period}_previous_行程質量統計.xlsx`, file_hash: "sha256:mock-previous" },
        },
        players: [
          { uid: "490326", agent_name: "蔡晉豪", event_basis: { monthly_policy_development_plus_showing: 6, bcd_valid: 7 }, source_metrics: SAMPLE_METRICS, draw_points_balance: 8, collection_count: 2, updated_at: new Date().toISOString() },
          { uid: "490101", agent_name: "示範同仁A", event_basis: { monthly_policy_development_plus_showing: 12, bcd_valid: 5 }, source_metrics: { ...SAMPLE_METRICS, listing: 2, contract: 1, showing: 5 }, draw_points_balance: 4, collection_count: 4, updated_at: new Date().toISOString() },
        ],
        collection_summary: {
          total_owned_kinds: 6,
          by_storyline: collectionCountsByStoryline().map((item) => ({ storyline_id: item.storyline.storyline_id, name: item.storyline.name, owned: item.owned, total: item.total })),
        },
        warnings: [],
      },
      warnings: [],
      errors: [],
    };
  }
  if (action === "uploadImport") {
    if (payload.mode === "commit") {
      return {
        ok: true,
        action,
        server_time: new Date().toISOString(),
        data: {
          mode: "commit",
          import_id: payload.import_id || "mock_import_001",
          status: "PUBLISHED",
          committed_rows: 2,
          skipped_rows: 0,
          updated_player_count: 2,
        },
        warnings: [],
        errors: [],
      };
    }
    return {
      ok: true,
      action,
      server_time: new Date().toISOString(),
      data: {
        mode: "preview",
        import_id: "mock_import_001",
        status: "PREVIEWED",
        preview_token: "mock_import_001",
        summary: { matched_active_players: 2, team_rows: 1, skipped_rows: 0, missing_active_players: 0, warning_count: 0 },
        player_previews: [
          { uid: "490326", report_name: "蔡晉豪", report_period: period, event_basis: { e_valid: 3, e_total: 4.2, bcd_valid: 5 }, reward_preview: { draw_points_delta: 3 }, row_status: "MATCHED" },
          { uid: "490101", report_name: "示範同仁A", report_period: period, event_basis: { e_valid: 2, e_total: 3, bcd_valid: 4 }, reward_preview: { draw_points_delta: 2 }, row_status: "MATCHED" },
        ],
        warnings: [],
      },
      warnings: [],
      errors: [],
    };
  }
  if (action === "draw") {
    const pool = payload.pool || "general";
    const pet = poolCandidates(POOLS.find((item) => item.key === pool) || POOLS[0])[0] || PETS[0];
    const playerState = mockCloudEnvelope("playerState").data;
    playerState.resources.tickets = { ...state.tickets, [pool]: Math.max(0, Number(state.tickets[pool] || 0) - 1) };
    playerState.collection.owned = [
      ...(playerState.collection.owned || []),
      { pet_id: pet.pet_id, level: 1, star: 1, current_form: pet.base_form, duplicate_fragments: 0, owned_count: 1 },
    ];
    playerState.active_pet = { pet_id: pet.pet_id };
    return {
      ok: true,
      action,
      server_time: new Date().toISOString(),
      data: {
        draw_event_id: `mock_draw_${Date.now()}`,
        uid: PROFILE.employeeId || PROFILE.userKey,
        pool,
        pet: { pet_id: pet.pet_id, name: pet.name, rarity: pet.rarity, storyline_id: pet.storyline_id },
        duplicate: false,
        fragments_added: 0,
        player_state: playerState,
      },
      warnings: [],
      errors: [],
    };
  }
  if (action === "resetPlayer") {
    const playerState = mockCloudEnvelope("playerState").data;
    playerState.resources = {
      draw_points: { report_points: 0, daily_free: 0, bonus_draw: 0 },
      tickets: { general: 0, boosted: 0, result: 0, blessing: 0 },
      materials: {},
      fragments: {},
    };
    playerState.collection = { owned: [], summary: { owned_kinds: 0, total_kinds: PETS.length, by_storyline: [] } };
    playerState.active_pet = {};
    playerState.reset_cleared = true;
    return {
      ok: true,
      action,
      server_time: new Date().toISOString(),
      data: {
        reset_id: `mock_reset_${Date.now()}`,
        uid: PROFILE.employeeId || PROFILE.userKey,
        player_state: playerState,
      },
      warnings: [],
      errors: [],
    };
  }
  return { ok: false, action, data: null, warnings: [], errors: [{ code: "MOCK_ACTION_NOT_FOUND", message: action }] };
}

async function fetchCloudEnvelope(action, params = {}) {
  if (!CLOUD_API_BASE_URL) return null;
  if (CLOUD_API_BASE_URL === "mock") return mockCloudEnvelope(action);
  if (typeof fetch !== "function") return null;
  const url = new URL(CLOUD_API_BASE_URL);
  url.searchParams.set("action", action);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  const response = await fetch(url.href, { cache: "no-store" });
  if (!response.ok) throw new Error(`Cloud API ${action} ${response.status}`);
  return response.json();
}

async function postCloudEnvelope(action, payload = {}) {
  if (!CLOUD_API_BASE_URL) return null;
  const body = {
    action,
    request_id: randomClientId("req"),
    ...payload,
  };
  if (CLOUD_API_BASE_URL === "mock") return mockCloudEnvelope(action, body);
  if (typeof fetch !== "function") return null;
  return fetchCloudEnvelope(action, body);
}

async function loadCloudState() {
  if (!CLOUD_API_BASE_URL) return false;
  try {
    const action = MANAGER_MODE ? "managerDashboard" : "playerState";
    const managerKey = MANAGER_MODE ? getCloudManagerKey() : "";
    if (cloudManagerKeyRequired()) {
      state.manager.cloudStatus = "manager-key-required";
      return false;
    }
    const params = MANAGER_MODE
      ? { period: currentPeriodKey(), manager_key: managerKey }
      : { uid: PROFILE.employeeId || PROFILE.userKey, period: currentPeriodKey() };
    if (!MANAGER_MODE && PROFILE.loginRequired) return false;
    const data = cloudEnvelopeData(await fetchCloudEnvelope(action, params), action);
    if (!data) return false;
    return MANAGER_MODE ? applyCloudManagerDashboard(data) : applyCloudPlayerState(data);
  } catch (error) {
    state.manager.cloudStatus = `cloud-error:${error.message || "unknown"}`;
    saveState();
    render();
    return false;
  }
}

function setCloudImportStatus(message, tone = "") {
  const element = document.getElementById("cloudImportStatus");
  if (!element) return;
  element.textContent = message || "";
  element.classList.toggle("is-good", tone === "good");
  element.classList.toggle("is-bad", tone === "bad");
}

function cloudImportSheetId() {
  return cleanProfileText(document.getElementById("cloudImportSheetId")?.value || "", "", 140);
}

const EXCEL_REPORT_COLUMNS = {
  d1_schedule: 4,
  d1_face_schedule: 5,
  buy_listing_line: 6,
  buy_listing_to_follow: 7,
  buy_prospect: 8,
  listing: 9,
  price_revision: 10,
  meeting_or_offer: 11,
  contract: 12,
  rent_listing_line: 13,
  rent_prospect: 14,
  rent_listing: 15,
  rent_meeting_or_offer: 16,
  rent_contract: 17,
  a_area_total: 23,
  b_development_total: 24,
  b_listing_visit: 25,
  c_negotiation_total: 26,
  c_inventory_total: 27,
  d_sales_total: 28,
  d_showing_group: 29,
  e_total_group: 30,
  calls: 32,
  schedule_total: 36,
};

const EXCEL_TEAM_ROWS = new Set(["樹林", "樹林店"]);
const EXCEL_MONTHS = {
  一月: 1,
  二月: 2,
  三月: 3,
  四月: 4,
  五月: 5,
  六月: 6,
  七月: 7,
  八月: 8,
  九月: 9,
  十月: 10,
  十一月: 11,
  十二月: 12,
};

async function previewCloudImport() {
  if (!CLOUD_API_BASE_URL) {
    setCloudImportStatus("尚未設定 ?api=<Apps Script Web App URL>", "bad");
    return false;
  }
  const managerKey = getCloudManagerKey();
  if (cloudManagerKeyRequired()) {
    setCloudImportStatus("管理網址缺少 manager_key，請使用店長專用入口", "bad");
    return false;
  }
  const spreadsheetId = cloudImportSheetId();
  if (!spreadsheetId) {
    setCloudImportStatus("請先貼上 Google Sheet ID", "bad");
    return false;
  }
  try {
    setCloudImportStatus("正在產生預覽...");
    const envelope = await postCloudEnvelope("uploadImport", {
      mode: "preview",
      manager_key: managerKey,
      operating_period: currentPeriodKey(),
      source_kind: "google_sheet_id",
      spreadsheet_id: spreadsheetId,
      file_name: "店長匯入 Google Sheet",
    });
    const data = cloudEnvelopeData(envelope, "uploadImport");
    if (!data || !data.import_id) throw new Error(envelope?.errors?.[0]?.message || "preview missing import_id");
    state.manager.cloudImportPreview = data;
    state.manager.cloudStatus = CLOUD_API_BASE_URL === "mock" ? "mock-uploadImport-preview" : "cloud-uploadImport-preview";
    saveState();
    render();
    setCloudImportStatus(`預覽完成：${data.summary?.matched_active_players || data.player_previews?.length || 0} 位同仁，import_id ${data.import_id}`, "good");
    return true;
  } catch (error) {
    state.manager.cloudStatus = `cloud-import-preview-error:${error.message || "unknown"}`;
    saveState();
    render();
    setCloudImportStatus(`預覽失敗：${error.message || "unknown"}`, "bad");
    return false;
  }
}

async function previewCloudExcelFile(file) {
  if (!CLOUD_API_BASE_URL || CLOUD_API_BASE_URL === "mock") {
    setCloudImportStatus("Excel 直接匯入需要正式雲端 API；mock 模式請用 CSV 或 Google Sheet ID。", "bad");
    return false;
  }
  const managerKey = getCloudManagerKey();
  if (cloudManagerKeyRequired()) {
    setCloudImportStatus("管理網址缺少 manager_key，請使用店長專用入口", "bad");
    return false;
  }
  try {
    setCloudImportStatus("正在讀取 Excel 第一個分頁...");
    const parsed = await parseXlsxFirstSheet(file);
    const importId = randomClientId("xlsx");
    await postCloudEnvelope("uploadParsedImport", {
      mode: "init",
      manager_key: managerKey,
      import_id: importId,
      file_name: parsed.fileName,
      period: parsed.period,
      warning_count: parsed.warnings.length,
    });
    const uploadRows = [...parsed.rows, ...parsed.teamRows];
    for (let index = 0; index < uploadRows.length; index += 1) {
      const row = uploadRows[index];
      setCloudImportStatus(`正在建立預覽 ${index + 1}/${uploadRows.length}...`);
      await postCloudEnvelope("uploadParsedImport", {
        mode: "row",
        manager_key: managerKey,
        import_id: importId,
        uid: row.uid,
        report_name: row.reportName,
        report_period: parsed.period,
        row_status: row.rowStatus,
        source_metrics_json: JSON.stringify(row.metrics),
        event_basis_json: JSON.stringify(row.eventBasis),
        warnings_json: JSON.stringify(row.warnings || []),
      });
    }
    const envelope = await postCloudEnvelope("uploadParsedImport", {
      mode: "finish",
      manager_key: managerKey,
      import_id: importId,
    });
    const data = cloudEnvelopeData(envelope, "uploadParsedImport");
    if (!data || !data.import_id) throw new Error(envelope?.errors?.[0]?.message || "Excel preview missing import_id");
    state.manager.cloudImportPreview = data;
    state.manager.cloudStatus = "cloud-uploadParsedImport-preview";
    state.manager.warnings = parsed.warnings;
    state.manager.lastImport = {
      at: new Date().toISOString(),
      period: parsed.period,
      source: parsed.fileName,
      rows: parsed.rows.length,
    };
    saveState();
    render();
    setCloudImportStatus(`Excel 預覽完成：${parsed.sheetName}，${parsed.rows.length} 位同仁，只讀第一個分頁`, "good");
    return true;
  } catch (error) {
    state.manager.cloudStatus = `cloud-excel-preview-error:${error.message || "unknown"}`;
    state.manager.warnings = [`Excel 預覽失敗：${error.message || "unknown"}`];
    saveState();
    render();
    setCloudImportStatus(`Excel 預覽失敗：${error.message || "unknown"}`, "bad");
    return false;
  }
}

async function parseXlsxFirstSheet(file) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
    return parseHtmlExcelFirstSheet(arrayBuffer, file.name || "Excel 匯入");
  }
  if (typeof DecompressionStream !== "function") {
    throw new Error("這個瀏覽器不支援 Excel 解壓縮，請改用 Google Sheet ID。");
  }
  const entries = await readZipEntries(arrayBuffer);
  const workbookXml = textEntry(entries, "xl/workbook.xml");
  const relsXml = textEntry(entries, "xl/_rels/workbook.xml.rels");
  const sharedStrings = entries["xl/sharedStrings.xml"] ? parseSharedStrings(textEntry(entries, "xl/sharedStrings.xml")) : [];
  const firstSheet = firstWorkbookSheet(workbookXml, relsXml);
  const sheetXml = textEntry(entries, firstSheet.path);
  const grid = worksheetToGrid(sheetXml, sharedStrings);
  return parseReportGrid(grid, {
    fileName: file.name || "Excel 匯入",
    sheetName: firstSheet.name,
  });
}

function parseHtmlExcelFirstSheet(arrayBuffer, fileName) {
  const bytes = new Uint8Array(arrayBuffer);
  if (bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) {
    throw new Error("舊式二進位 .xls 暫不支援，請另存成 .xlsx 後上傳；HTML 型 .xls 可直接讀第一張表。");
  }
  const html = decodeExcelText(bytes);
  if (!/<table[\s>]/i.test(html)) {
    throw new Error("這個 Excel 不是 .xlsx 或 HTML 型 .xls，請另存成 .xlsx 後上傳。");
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) throw new Error("HTML 型 Excel 找不到第一張表");
  return parseReportGrid(htmlTableToGrid(table), {
    fileName,
    sheetName: "第一張表",
  });
}

function decodeExcelText(bytes) {
  const decoderNames = ["utf-8", "big5"];
  for (const name of decoderNames) {
    try {
      const text = new TextDecoder(name).decode(bytes);
      if (/<table[\s>]/i.test(text) || /合計/.test(text)) return text;
    } catch (error) {
      // Some browsers do not expose every legacy decoder. Try the next one.
    }
  }
  return new TextDecoder().decode(bytes);
}

function htmlTableToGrid(table) {
  const grid = [];
  Array.from(table.rows).forEach((tr, rowIndex) => {
    if (!grid[rowIndex]) grid[rowIndex] = [];
    let columnIndex = 0;
    Array.from(tr.cells).forEach((cell) => {
      while (grid[rowIndex][columnIndex] !== undefined) columnIndex += 1;
      const value = cleanProfileText(cell.textContent || "", "", 400);
      const colspan = Math.max(1, Number(cell.getAttribute("colspan") || 1));
      const rowspan = Math.max(1, Number(cell.getAttribute("rowspan") || 1));
      for (let rowOffset = 0; rowOffset < rowspan; rowOffset += 1) {
        const targetRow = rowIndex + rowOffset;
        if (!grid[targetRow]) grid[targetRow] = [];
        for (let colOffset = 0; colOffset < colspan; colOffset += 1) {
          grid[targetRow][columnIndex + colOffset] = rowOffset === 0 && colOffset === 0 ? value : "";
        }
      }
      columnIndex += colspan;
    });
  });
  return grid;
}

async function readZipEntries(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  let eocd = -1;
  for (let offset = bytes.length - 22; offset >= 0; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      eocd = offset;
      break;
    }
  }
  if (eocd < 0) throw new Error("找不到 Excel zip 結尾");
  const totalEntries = view.getUint16(eocd + 10, true);
  let centralOffset = view.getUint32(eocd + 16, true);
  const entries = {};
  const decoder = new TextDecoder("utf-8");
  for (let index = 0; index < totalEntries; index += 1) {
    if (view.getUint32(centralOffset, true) !== 0x02014b50) throw new Error("Excel zip central directory 格式不符");
    const method = view.getUint16(centralOffset + 10, true);
    const compressedSize = view.getUint32(centralOffset + 20, true);
    const nameLength = view.getUint16(centralOffset + 28, true);
    const extraLength = view.getUint16(centralOffset + 30, true);
    const commentLength = view.getUint16(centralOffset + 32, true);
    const localOffset = view.getUint32(centralOffset + 42, true);
    const name = decoder.decode(bytes.slice(centralOffset + 46, centralOffset + 46 + nameLength));
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);
    entries[name] = method === 0 ? compressed : await inflateRaw(compressed);
    centralOffset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

async function inflateRaw(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function textEntry(entries, path) {
  const entry = entries[path];
  if (!entry) throw new Error(`Excel 缺少必要檔案：${path}`);
  return new TextDecoder("utf-8").decode(entry);
}

function parseXml(text) {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  const parserError = doc.querySelector("parsererror");
  if (parserError) throw new Error("Excel XML 解析失敗");
  return doc;
}

function parseSharedStrings(xmlText) {
  return Array.from(parseXml(xmlText).getElementsByTagName("si")).map((item) =>
    Array.from(item.getElementsByTagName("t")).map((node) => node.textContent || "").join("")
  );
}

function firstWorkbookSheet(workbookXml, relsXml) {
  const workbook = parseXml(workbookXml);
  const rels = parseXml(relsXml);
  const sheet = workbook.getElementsByTagName("sheet")[0];
  if (!sheet) throw new Error("Excel 找不到第一個分頁");
  const relId = sheet.getAttribute("r:id") || sheet.getAttribute("id");
  const relationship = Array.from(rels.getElementsByTagName("Relationship")).find((item) => item.getAttribute("Id") === relId);
  const target = relationship?.getAttribute("Target") || "worksheets/sheet1.xml";
  const path = target.startsWith("/") ? target.replace(/^\/+/, "") : `xl/${target.replace(/^\.?\//, "")}`;
  return { name: sheet.getAttribute("name") || "工作表1", path };
}

function worksheetToGrid(sheetXml, sharedStrings) {
  const doc = parseXml(sheetXml);
  const grid = [];
  Array.from(doc.getElementsByTagName("c")).forEach((cell) => {
    const ref = cell.getAttribute("r") || "";
    const match = ref.match(/^([A-Z]+)(\d+)$/);
    if (!match) return;
    const rowIndex = Number(match[2]) - 1;
    const columnIndex = excelColumnNumber(match[1]) - 1;
    const type = cell.getAttribute("t") || "";
    const valueNode = cell.getElementsByTagName("v")[0];
    let value = valueNode ? valueNode.textContent || "" : "";
    if (type === "s") value = sharedStrings[Number(value)] || "";
    if (type === "inlineStr") {
      value = Array.from(cell.getElementsByTagName("t")).map((node) => node.textContent || "").join("");
    }
    if (!grid[rowIndex]) grid[rowIndex] = [];
    grid[rowIndex][columnIndex] = value;
  });
  return grid;
}

function excelColumnNumber(letters) {
  return letters.split("").reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0);
}

function gridText(grid, row, column) {
  return cleanProfileText(grid[row - 1]?.[column - 1] ?? "", "", 200);
}

function gridNumber(grid, row, column) {
  const raw = grid[row - 1]?.[column - 1];
  if (raw === undefined || raw === null || raw === "" || raw === "/" || raw === "-") return 0;
  const number = Number(String(raw).replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function collectExcelVerticalName(grid, startRow) {
  const chars = [];
  for (let row = startRow; row <= grid.length; row += 1) {
    if (gridText(grid, row, 3) === "平均") break;
    const char = gridText(grid, row, 1);
    if (char) chars.push(char);
  }
  return chars.join("");
}

function inferExcelPeriod(grid, sheetName) {
  const sheetMonth = EXCEL_MONTHS[cleanProfileText(sheetName, "", 20)];
  const topText = grid.slice(0, 10).map((row) => (row || []).join(" ")).join(" ");
  const transfer = topText.match(/最新轉檔時間[:：]?\s*(\d{2,4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (transfer) {
    const year = Number(transfer[1]) < 1911 ? Number(transfer[1]) + 1911 : Number(transfer[1]);
    const month = sheetMonth || Number(transfer[2]);
    return {
      period: `${year}-${String(month).padStart(2, "0")}`,
      transferDate: `${year}-${String(Number(transfer[2])).padStart(2, "0")}-${String(Number(transfer[3])).padStart(2, "0")}`,
      warnings: sheetMonth && sheetMonth !== Number(transfer[2]) ? [`轉檔月份與分頁名稱不同，使用第一分頁名稱 ${sheetName}`] : [],
    };
  }
  return { period: currentPeriodKey(), transferDate: "", warnings: ["找不到轉檔日期，使用目前月份"] };
}

function excelMetricPair(grid, startRow, key) {
  const column = EXCEL_REPORT_COLUMNS[key];
  return {
    valid: gridNumber(grid, startRow, column),
    total: gridNumber(grid, startRow + 2, column),
  };
}

function excelEventBasis(metrics) {
  const valid = (key) => Number(metrics[key]?.valid || 0);
  const total = (key) => Number(metrics[key]?.total || valid(key));
  const bcdValid = valid("b_development_total") + valid("c_negotiation_total") + valid("d_sales_total");
  const eValid = valid("e_total_group");
  const eTotal = total("e_total_group");
  const monthlyPolicy = valid("b_development_total") + valid("d_showing_group");
  return {
    e_valid: eValid,
    e_total: eTotal,
    bcd_valid: bcdValid,
    bcd_valid_gt_4: bcdValid > 4,
    e_valid_progress_tier: eValid >= 4 ? 4 : eValid >= 3 ? 3 : 0,
    e_total_gte_6: eTotal >= 6,
    monthly_policy_development_plus_showing: monthlyPolicy,
    monthly_policy_development_plus_showing_gte_20: monthlyPolicy >= 20,
    calls: valid("calls"),
  };
}

function parseReportGrid(grid, { fileName, sheetName }) {
  const periodInfo = inferExcelPeriod(grid, sheetName);
  const rows = [];
  const teamRows = [];
  const warnings = [...periodInfo.warnings];
  for (let row = 1; row <= grid.length; row += 1) {
    if (gridText(grid, row, 3) !== "合計") continue;
    const reportName = collectExcelVerticalName(grid, row);
    if (!reportName) continue;
    const metrics = Object.fromEntries(Object.keys(EXCEL_REPORT_COLUMNS).map((key) => [key, excelMetricPair(grid, row, key)]));
    const parsedRow = {
      uid: reportName,
      reportName,
      rowStatus: EXCEL_TEAM_ROWS.has(reportName) ? "TEAM_SUMMARY" : "MATCHED",
      metrics,
      eventBasis: excelEventBasis(metrics),
      warnings: [],
    };
    if (parsedRow.rowStatus === "TEAM_SUMMARY") teamRows.push(parsedRow);
    else rows.push(parsedRow);
  }
  if (!rows.length) throw new Error("第一個分頁找不到同仁合計列");
  return {
    fileName,
    sheetName,
    period: periodInfo.period,
    transferDate: periodInfo.transferDate,
    rows,
    teamRows,
    warnings,
    summary: { matched_active_players: rows.length, team_rows: teamRows.length },
  };
}

async function commitCloudImport() {
  const preview = state.manager.cloudImportPreview;
  if (!preview?.import_id) {
    setCloudImportStatus("尚未有可確認的預覽", "bad");
    return false;
  }
  const managerKey = getCloudManagerKey();
  if (cloudManagerKeyRequired()) {
    setCloudImportStatus("管理網址缺少 manager_key，請使用店長專用入口", "bad");
    return false;
  }
  try {
    setCloudImportStatus("正在確認入帳...");
    const envelope = await postCloudEnvelope("uploadImport", {
      mode: "commit",
      manager_key: managerKey,
      import_id: preview.import_id,
      preview_token: preview.preview_token || preview.import_id,
      confirmed_by: "manager",
    });
    const data = cloudEnvelopeData(envelope, "uploadImport");
    if (!data || !data.status) throw new Error(envelope?.errors?.[0]?.message || "commit missing status");
    state.manager.cloudImportPreview = null;
    state.manager.cloudStatus = CLOUD_API_BASE_URL === "mock" ? "mock-uploadImport-commit" : "cloud-uploadImport-commit";
    state.manager.lastImport = {
      at: new Date().toISOString(),
      period: currentPeriodKey(),
      source: data.import_id || "cloud",
      rows: data.committed_rows || 0,
    };
    saveState();
    await loadCloudState();
    render();
    setCloudImportStatus(`入帳完成：${data.committed_rows || 0} 位同仁`, "good");
    return true;
  } catch (error) {
    state.manager.cloudStatus = `cloud-import-commit-error:${error.message || "unknown"}`;
    saveState();
    render();
    setCloudImportStatus(`入帳失敗：${error.message || "unknown"}`, "bad");
    return false;
  }
}

function randomClientId(prefix = "client") {
  const randomPart = typeof crypto === "object" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${randomPart}`;
}

function applyManagerImportText(text, source = "manager-upload") {
  const metrics = parseCsv(text);
  metrics.__source = source;
  metrics.__rows = Math.max(0, String(text || "").trim().split(/\r?\n/).filter(Boolean).length - 1);
  state.manager.warnings = [];
  settleMetrics(metrics);
  state.manager.lastImport = {
    at: new Date().toISOString(),
    period: reportPeriodKeyFromMetrics(metrics),
    source,
    rows: metrics.__rows,
  };
  saveState();
  render();
  return metrics;
}

function handleManagerFile(file) {
  if (!file) return false;
  const name = file.name || "匯入檔案";
  if (/\.(xlsx|xls)$/i.test(name)) {
    previewCloudExcelFile(file);
    return true;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => applyManagerImportText(String(reader.result || ""), name));
  reader.addEventListener("error", () => {
    state.manager.warnings = [`無法讀取 ${name}`];
    saveState();
    render();
  });
  reader.readAsText(file);
  return true;
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
    window.confirm(`全部重置 ${PROFILE.agent} 的進度？卡片庫、寵物、碎片、素材、抽卡紀錄、每日免費抽、月榜第一與加碼都會清除；只保留 A/B/C/D 行程與成果項重新計算出的抽卡點數。`);
  if (!shouldReset) return false;
  if (CLOUD_API_BASE_URL) {
    resetCloudProgress();
    return true;
  }
  resetProgress();
  return true;
}

async function resetCloudProgress() {
  try {
    const envelope = await postCloudEnvelope("resetPlayer", {
      uid: PROFILE.employeeId || PROFILE.userKey,
      period: currentPeriodKey(),
      reset_scope: "all_game_state",
      confirm_text: "我知道會清空卡片庫與加碼",
      client_request_id: randomClientId("reset"),
    });
    const data = cloudEnvelopeData(envelope, "resetPlayer");
    if (!data || !data.player_state) throw new Error("resetPlayer response missing player_state");
    applyCloudPlayerState(data.player_state);
    state.history.unshift({
      type: "system",
      at: new Date().toISOString(),
      text: "雲端重置完成，已依規則清空卡片庫、素材、碎片與加碼。",
    });
    state.manager.cloudStatus = CLOUD_API_BASE_URL === "mock" ? "mock-resetPlayer" : "cloud-resetPlayer";
    saveState();
    render();
    return true;
  } catch (error) {
    state.manager.cloudStatus = `cloud-reset-error:${error.message || "unknown"}`;
    saveState();
    render();
    return false;
  }
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
    development: "開發遠征隊",
    negotiation: "議價鍛造",
    showing: "帶看小旅行",
    listing: "委託種子",
    offer: "斡旋迷宮",
    contract: "成交神殿",
    team_guard: "店鋪守護",
    sl_area_star_map: "商圈星圖",
    sl_development_expedition: "開發遠征隊",
    sl_call_signal_tower: "電話信號塔",
    sl_negotiation_forge: "議價鍛造屋",
    sl_showing_route: "帶看小旅行",
    sl_listing_seed_garden: "委託種子園",
    sl_offer_maze: "斡旋迷宮",
    sl_contract_team_sanctum: "成交神殿",
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
    PETS = filterRuntimePets(manifest.pets.map(normalizeExternalPet));
    STORYLINES = filterRuntimeStorylines(normalizeStorylines(manifest.storylines));
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

function ticketEntries() {
  return Object.entries(state.tickets || {}).filter(([, value]) => Number(value || 0) > 0);
}

function missingMaterials(required = {}) {
  return Object.entries(required || {})
    .map(([key, target]) => ({
      key,
      label: materialLabel(key),
      target: Number(target || 0),
      current: Number(state.materials?.[key] || 0),
      missing: Math.max(0, Number(target || 0) - Number(state.materials?.[key] || 0)),
    }))
    .filter((item) => item.missing > 0);
}

function compactTicketText(entries = ticketEntries()) {
  if (!entries.length) return "目前沒有可抽券";
  return entries.map(([key, value]) => `${ticketLabel(key)} ${value}`).join(" · ");
}

function buildGrowthFocus(pet = getActivePet(), owned = pet ? getOwned(pet.pet_id) : null) {
  if (!pet || !owned) {
    return {
      title: "先取得主寵",
      detail: "抽到第一隻夥伴後，行程就會變成牠的經驗。",
      value: "待啟動",
      tone: "soft",
    };
  }
  const expMax = expNeeded(owned.level || 1);
  const need = Math.max(0, expMax - Number(owned.exp || 0));
  const nextForm = owned.level >= 6 ? currentForm(pet, owned) : "成長型";
  return {
    title: "行程升級線",
    detail: need > 0
      ? `再 ${need} 經驗，${pet.name} 就能升到 Lv.${(owned.level || 1) + 1}。`
      : `${pet.name} 已經準備升級。`,
    value: `Lv.${owned.level || 1}`,
    tone: nextForm === currentForm(pet, owned) ? "ready" : "growth",
  };
}

function buildAwakenFocus(pet = getActivePet(), owned = pet ? getOwned(pet.pet_id) : null) {
  if (!pet || !owned || !pet.available_forms?.includes("覺醒型")) {
    return {
      title: "成果覺醒線",
      detail: "這隻夥伴暫時沒有覺醒需求，先累積卡片庫。",
      value: "收藏",
      tone: "soft",
    };
  }
  if (owned.awakened) {
    return {
      title: "成果覺醒線",
      detail: `${pet.name} 已覺醒，下一步看成熟/究極合成素材。`,
      value: "已覺醒",
      tone: "ready",
    };
  }
  if (canAwaken(pet, owned)) {
    return {
      title: "成果覺醒線",
      detail: `${pet.name} 素材已足，可以到卡片庫覺醒。`,
      value: "可覺醒",
      tone: "hot",
    };
  }
  const missing = missingMaterials(pet.required_awaken_materials);
  if (owned.star < 5) {
    return {
      title: "成果覺醒線",
      detail: `素材先留著，還需要把星級升到 5 星。`,
      value: `${owned.star || 1}/5 星`,
      tone: "growth",
    };
  }
  return {
    title: "成果覺醒線",
    detail: missing.length
      ? `還缺 ${missing.slice(0, 2).map((item) => `${item.label} ${item.missing}`).join("、")}。`
      : "素材已接近完成，整理卡片庫看看下一步。",
    value: missing.length ? `缺 ${missing.length} 種` : "快完成",
    tone: missing.length <= 1 ? "hot" : "growth",
  };
}

function findFirstActionableCollection() {
  const ownedPets = PETS
    .map((pet) => ({ pet, owned: getOwned(pet.pet_id) }))
    .filter((item) => item.owned);
  const awaken = ownedPets.find(({ pet, owned }) => canAwaken(pet, owned));
  if (awaken) return { ...awaken, type: "awaken", label: "去覺醒", text: `${awaken.pet.name} 已達覺醒條件。` };
  const ultimate = ownedPets.find(({ pet, owned }) => canUltimate(pet, owned));
  if (ultimate) return { ...ultimate, type: "ultimate", label: "究極合成", text: `${ultimate.pet.name} 可以合成究極型。` };
  const star = ownedPets.find(({ owned }) => owned.star < 5 && owned.duplicate_fragments >= starCost(owned.star + 1));
  if (star) return { ...star, type: "star", label: "去升星", text: `${star.pet.name} 碎片已足，可以升星。` };
  const materialReady = ownedPets.find(({ pet, owned }) =>
    !owned.awakened &&
    owned.star < 5 &&
    pet.available_forms?.includes("覺醒型") &&
    !missingMaterials(pet.required_awaken_materials).length
  );
  if (materialReady) return { ...materialReady, type: "material-ready", label: "整理卡片庫", text: `${materialReady.pet.name} 素材已足，先補碎片升星。` };
  return null;
}

function buildEntryExperienceCue() {
  const pet = getActivePet();
  const owned = getOwned(pet.pet_id);
  const tickets = totalTickets();
  const settled = Boolean(state.dailySettlements?.[todayKey()]?.awarded);
  const action = findFirstActionableCollection();
  if (action) {
    return {
      kicker: "現在可操作",
      title: `${PROFILE.agent}，${action.text}`,
      detail: "先把已經到手的素材或碎片變成戰力，卡片庫會更有推進感。",
      view: "collection",
      label: action.label,
      tone: "hot",
    };
  }
  if (tickets > 0) {
    return {
      kicker: "今日可抽",
      title: `${PROFILE.agent}，現在有 ${tickets} 次抽卡機會。`,
      detail: `${compactTicketText()}。免費抽若已發放，今天沒用就不保留。`,
      view: "gacha",
      label: "去抽卡",
      tone: "hot",
    };
  }
  const wish = buildPetWish(state.metrics, pet);
  if (!wish.done) {
    return {
      kicker: "今日差一點",
      title: `${PROFILE.agent}，今天再推 ${Math.max(1, wish.target - wish.current)} ${wish.unit}，${pet.name} 會更接近升級。`,
      detail: wish.message,
      view: "today",
      label: settled ? "看成果累積" : "看今日進度",
      tone: "growth",
    };
  }
  const growth = buildGrowthFocus(pet, owned);
  return {
    kicker: "今日推進",
    title: `${PROFILE.agent}，${pet.name} 今天已經醒來。`,
    detail: `${growth.detail} 主寵稀有感應已開啟，倍率待設定。`,
    view: "today",
    label: "看成果累積",
    tone: "ready",
  };
}

function activePetAssistText(pet = getActivePet(), owned = pet ? getOwned(pet.pet_id) : null) {
  if (!pet || !owned) return "主寵助力：取得主寵後開啟";
  const rule = state.backendConfig?.assistRules?.[pet.storyline_id] || state.backendConfig?.assistRules?.default;
  if (rule?.label) return `主寵助力：${rule.label}`;
  return `主寵助力：${currentForm(pet, owned)} 感應已開啟，倍率待設定`;
}

function configuredDropRates(poolKey) {
  const rates = state.backendConfig?.dropRates?.[poolKey];
  if (!isPlainObject(rates)) return null;
  const normalized = {};
  Object.entries(rates).forEach(([rarity, value]) => {
    const amount = Number(value || 0);
    if (RARITY_ORDER.includes(rarity) && amount > 0) normalized[rarity] = amount;
  });
  return Object.keys(normalized).length ? normalized : null;
}

function rarityDisplayText(pool) {
  const rates = configuredDropRates(pool.key);
  if (rates) {
    return Object.entries(rates).map(([rarity, value]) => `<span class="rarity-badge rarity-${rarity}">${rarity} ${formatMetricValue(value)}%</span>`).join("");
  }
  return `<span class="soft-pill">掉落率待設定</span>${(pool.rarityBands || []).map((rarity) => `<span class="rarity-badge rarity-${rarity}">${rarity}</span>`).join("")}`;
}

function poolCandidates(pool) {
  const allowedStorylines = new Set(pool.allowedStorylines || []);
  const rarityBands = new Set(pool.rarityBands || RARITY_ORDER);
  return PETS.filter((pet) => {
    if (!pet.can_be_drawn || pet.rarity === "UR") return false;
    if (!allowedStorylines.has(pet.storyline_id)) return false;
    if (!rarityBands.has(pet.rarity)) return false;
    if ((pool.key === "general" || pool.key === "boosted") && isContractTempleStoryline(pet.storyline_id)) return false;
    return true;
  });
}

function drawCandidate(pool) {
  const rates = configuredDropRates(pool.key);
  const candidates = poolCandidates(pool);
  if (!candidates.length) return null;
  if (rates) {
    const rarity = rollRarity(rates);
    const rarityCandidates = candidates.filter((pet) => pet.rarity === rarity);
    if (rarityCandidates.length) return randomFrom(rarityCandidates);
  }
  return randomFrom(candidates);
}

function poolUnlocked(pool, progress = state.progress || buildProgressSnapshot()) {
  const backendUnlock = state.backendConfig?.poolUnlocks?.[pool.key];
  if (backendUnlock?.unlocked === false) return false;
  if (pool.key === "general") return true;
  if (pool.key === "boosted") return Boolean(progress.highValue?.done || (state.tickets.boosted || 0) > 0);
  if (pool.key === "result") return Boolean(progress.contractTemple?.current > 0 || (state.tickets.result || 0) > 0);
  if (pool.key === "blessing") return Boolean(Number(progress.contractTemple?.sources?.contract || 0) > 0 || (state.tickets.blessing || 0) > 0);
  return true;
}

function poolPriority(pool) {
  const tickets = Number(state.tickets?.[pool.key] || 0);
  const unlocked = poolUnlocked(pool);
  if (tickets > 0 && unlocked) return 100 + tickets;
  if (unlocked) return 40;
  return 0;
}

function poolExperienceCue(pool, candidates, unlocked) {
  const tickets = Number(state.tickets?.[pool.key] || 0);
  if (!unlocked) return "完成對應行程或成果後，這個卡池會亮起。";
  if (tickets > 0) {
    if (pool.key === "result") return "成果券最容易讓覺醒素材與高階夥伴有感。";
    if (pool.key === "blessing") return "成交神殿池只吃委託、見面談、簽約鏈條。";
    if (pool.key === "boosted") return "高價值行動已點亮，適合推進主寵養成。";
    return "先把可抽次數用掉，重複卡也會變碎片。";
  }
  return candidates.length ? "目前已解鎖，等下一筆差額或福利抽進來。" : "卡池候選卡待內容包接入。";
}

function poolDrawButtonLabel(pool) {
  if (pool.key === "general") return "抽補給";
  if (pool.key === "boosted") return "抽強化";
  if (pool.key === "result") return "抽成果種子";
  if (pool.key === "blessing") return "進入神殿";
  return "抽一次";
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
    rewardCount(metrics.meeting) +
    rewardCount(metrics.contract);
  const contractCount = rewardCount(metrics.contract);
  const activityScore =
    metrics.development * 34 +
    metrics.showing * 46 +
    metrics.calls * 2 +
    metrics.momentum * 18;
  const baseRewards = {
    exp: Math.round(activityScore),
    general: Math.max(1, Math.floor((metrics.development + metrics.showing + metrics.calls / 15) / 2)),
    boosted: metrics.development + metrics.negotiation + metrics.showing >= 4 ? 1 : 0,
    result: resultScore,
    blessing: contractCount,
    materials: {
      listing_core: rewardCount(metrics.listing),
      meeting_core: rewardCount(metrics.meeting),
      contract_core: contractCount,
      development_core: Math.floor((metrics.development + metrics.calls / 20) * 2),
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
    rewardCount(metrics.meeting) +
    rewardCount(metrics.contract);
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
      message: boostedProgress >= 3 ? "今日已達強化池門檻" : `B+C+D 有效再 ${3 - boostedProgress} 組`,
    },
    {
      key: "result",
      title: "成果覺醒",
      reward: `成果券 +${rewards.result}`,
      current: resultProgress,
      target: 1,
      done: resultProgress >= 1,
      message: resultProgress >= 1 ? "委託、見面談、簽約會推進成交神殿" : "先拿 1 件委託、見面談或簽約",
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
  const progress = buildProgressSnapshot(rawMetrics, sourceMetrics, deltaMetrics);
  const hasIncrease = hasMetricIncrease(deltaMetrics);
  state.metrics = { ...deltaMetrics };
  state.progress = progress;
  state.dailySettlements = state.dailySettlements || {};
  const dateKey = todayKey();
  const importedAt = new Date().toISOString();
  period.lastSourceMetrics = { ...sourceMetrics };
  period.lastImportedAt = importedAt;
  state.manager.lastImport = {
    at: importedAt,
    period: periodKey,
    source: rawMetrics.__source || "manual-or-csv",
    rows: Number(rawMetrics.__rows || 0),
  };
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
      progress,
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
    progress,
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
  const groups = createReportGroups();
  lines.slice(headerIndex + 1).forEach((line) => {
    const cells = splitCsvLine(line);
    headers.forEach((header, index) => {
      const key = headerToMetricKey(header);
      if (!key) return;
      const parsed = parseReportMetricCell(cells[index]);
      sums[key] += parsed.weighted;
      groups[key].effective += parsed.effective;
      groups[key].total += parsed.total;
    });
  });
  return { ...normalizeGameMetrics(sums), __periodKey: periodKey, __groups: normalizeReportGroups({ __groups: groups }, sums) };
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
  return parseReportMetricCell(value).weighted;
}

function parseReportMetricCell(value) {
  const text = String(value ?? "").replace(/,/g, "").trim();
  if (!text) return { effective: 0, total: 0, weighted: 0 };
  const numbers = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number).filter(Number.isFinite) || [];
  if (!numbers.length) return { effective: 0, total: 0, weighted: 0 };
  if ((text.includes("/") || text.includes("／")) && numbers.length >= 2) {
    const effective = Math.max(0, numbers[0]);
    const total = Math.max(effective, numbers[1]);
    return {
      effective,
      total,
      weighted: effective * REPORT_VALID_WEIGHT + Math.max(0, total - effective) * REPORT_TOTAL_ONLY_WEIGHT,
    };
  }
  const effective = Math.max(0, numbers[0]);
  return { effective, total: effective, weighted: effective };
}

function headerToMetricKey(header) {
  const normalized = normalizeReportHeader(header);
  if (EXACT_REPORT_HEADERS[normalized]) return EXACT_REPORT_HEADERS[normalized];
  return REPORT_HEADER_RULES.find(([, aliases]) => aliases.some((alias) => normalized.includes(alias)))?.[0];
}

async function draw(poolKey) {
  if (CLOUD_API_BASE_URL) {
    const cloudDrawn = await drawCloud(poolKey);
    if (cloudDrawn) return;
    return;
  }
  const pool = POOLS.find((item) => item.key === poolKey);
  if (!pool || state.tickets[poolKey] <= 0) return;
  const pet = drawCandidate(pool);
  if (!pet) return;
  state.tickets[poolKey] -= 1;
  const assistText = activePetAssistText();
  const existing = getOwned(pet.pet_id);
  let resultText = "";
  let duplicate = false;
  let fragmentsAdded = 0;
  if (existing) {
    const gained = duplicateFragments(pet.rarity);
    existing.duplicate_fragments += gained;
    existing.owned_count += 1;
    duplicate = true;
    fragmentsAdded = gained;
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
    assistText,
    poolKey,
    duplicate,
    fragmentsAdded,
    rateMode: configuredDropRates(pool.key) ? "backend-configured" : "prototype-unweighted",
  });
  state.history = state.history.slice(0, 12);
  saveState();
  render();
}

async function drawCloud(poolKey) {
  const pool = POOLS.find((item) => item.key === poolKey);
  if (!pool) return false;
  try {
    const envelope = await postCloudEnvelope("draw", {
      uid: PROFILE.employeeId || PROFILE.userKey,
      period: currentPeriodKey(),
      pool: poolKey,
      resource_type: "ticket",
      client_request_id: randomClientId("draw"),
    });
    const data = cloudEnvelopeData(envelope, "draw");
    if (!data || !data.pet || !data.player_state) throw new Error("draw response missing pet/player_state");
    applyCloudPlayerState(data.player_state);
    const pet = getPet(data.pet.pet_id) || data.pet;
    const resultText = data.duplicate ? `重複轉成碎片 +${rewardCount(data.fragments_added)}` : "新寵物加入卡片庫";
    state.history.unshift({
      type: "draw",
      at: new Date().toISOString(),
      petId: data.pet.pet_id,
      text: `${pool.name} 抽到 ${pet.name || data.pet.pet_id}，${resultText}`,
      assistText: activePetAssistText(),
      poolKey,
      duplicate: Boolean(data.duplicate),
      fragmentsAdded: rewardCount(data.fragments_added),
      rateMode: "cloud",
    });
    state.history = state.history.slice(0, 12);
    state.manager.cloudStatus = CLOUD_API_BASE_URL === "mock" ? "mock-draw" : "cloud-draw";
    saveState();
    render();
    return true;
  } catch (error) {
    state.manager.cloudStatus = `cloud-draw-error:${error.message || "unknown"}`;
    saveState();
    render();
    return false;
  }
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
  renderShellMode();
  renderProfile();
  renderReportPeriodInput();
  renderActivePet();
  renderEntrySummon();
  renderProgressDashboard();
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
  renderInventoryBag();
  if (isViewActive("collection")) renderCollection();
  renderTeam();
  renderCardGameBoard();
  renderManagerDashboard();
}

function renderShellMode() {
  const loginScreen = document.getElementById("loginScreen");
  const appShell = document.getElementById("appShell");
  const managerDashboard = document.getElementById("managerDashboard");
  const isLoginRequired = Boolean(PROFILE.loginRequired && !MANAGER_MODE);
  if (loginScreen) loginScreen.hidden = !isLoginRequired;
  if (appShell) appShell.hidden = isLoginRequired;
  if (managerDashboard) managerDashboard.hidden = !MANAGER_MODE || isLoginRequired;
  document.body?.classList?.toggle("is-manager-mode", MANAGER_MODE);
  document.body?.classList?.toggle("is-employee-login-required", isLoginRequired);
  ["backupBtn", "restoreBtn", "resetBtn"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.hidden = !MANAGER_MODE;
  });
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
  const hasCloudStatus = state.manager.cloudStatus && state.manager.cloudStatus !== "local";
  const cloudLabel = CLOUD_API_BASE_URL || hasCloudStatus
    ? state.manager.cloudStatus?.startsWith("cloud-error")
      ? " · 雲端連線異常"
      : CLOUD_API_BASE_URL === "mock" || state.manager.cloudStatus?.startsWith("mock")
        ? " · mock雲端"
        : " · 雲端資料"
    : "";
  if (branchLabel) {
    branchLabel.textContent = MANAGER_MODE
      ? `${PROFILE.branch} · 店長儀表板${cloudLabel}`
      : `${PROFILE.branch} · ${PROFILE.agent} · 員編 ${PROFILE.employeeId || PROFILE.userKey}${cloudLabel}`;
  }
  const switchButton = document.getElementById("switchEmployeeBtn");
  if (switchButton) switchButton.textContent = MANAGER_MODE ? "離開店長模式" : "登出 / 更換員編";
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
  const cue = buildEntryExperienceCue();
  const secondaryView = cue.view === "collection" ? "gacha" : "collection";
  const secondaryLabel = secondaryView === "gacha" ? "看抽卡額度" : "看卡片庫";
  summon.innerHTML = `
    <div class="summon-copy summon-tone-${escapeHtml(cue.tone)}">
      <span class="summon-kicker">${escapeHtml(cue.kicker)}</span>
      <strong>${escapeHtml(cue.title)}</strong>
      <p>${escapeHtml(cue.detail)}</p>
      <span class="assist-line">${escapeHtml(activePetAssistText(pet, owned))}</span>
    </div>
    <div class="summon-status">
      <span class="material-pill">${settled ? "今日已結算" : "待結算"}</span>
      <span class="soft-pill">可抽 ${tickets} 次</span>
      <span class="soft-pill">連續 ${streak} 天</span>
      <span class="soft-pill">${escapeHtml(currentForm(pet, owned))} Lv.${owned?.level || 1}</span>
    </div>
    <div class="summon-actions">
      <button class="primary-button" type="button" data-view="${escapeHtml(cue.view)}">${escapeHtml(cue.label)}</button>
      <button class="secondary-button" type="button" data-view="${secondaryView}">${secondaryLabel}</button>
    </div>
  `;
}

function progressPercent(current, target) {
  if (!target) return 0;
  return Math.max(0, Math.min(100, Math.round((Number(current || 0) / Number(target || 1)) * 100)));
}

function renderProgressDashboard() {
  const target = document.getElementById("progressDashboard");
  if (!target) return;
  const progress = state.progress || buildProgressSnapshot(state.metrics);
  const eEffectiveMilestone = progress.main.effective >= 4 ? "4/4 已達標" : progress.main.effective >= 3 ? "3/4 接近達標" : `${formatMetricValue(progress.main.effective)}/4 累積中`;
  const dreamClass = progress.main.dreamDone ? " is-celebration" : "";
  const highPercent = progressPercent(progress.highValue.current, progress.highValue.target);
  const monthPercent = progressPercent(progress.monthlyMission.current, progress.monthlyMission.target);
  const contractSources = progress.contractTemple.sources || {};
  const contractLine = `委託 ${formatMetricValue(contractSources.listing)} · 見面談 ${formatMetricValue(contractSources.meeting)} · 簽約 ${formatMetricValue(contractSources.contract)}`;
  const phoneSignal = progress.phoneSignal.calls >= 30 ? "訊號很亮" : progress.phoneSignal.calls >= 15 ? "訊號升溫" : "等待信號";
  const unlockLine = [
    poolUnlocked(POOLS[0], progress) ? "探索補給池" : "",
    poolUnlocked(POOLS[1], progress) ? "高價值行動池" : "",
    poolUnlocked(POOLS[2], progress) ? "成果種子池" : "",
    poolUnlocked(POOLS[3], progress) ? "成交神殿池" : "",
  ].filter(Boolean).join("、") || "完成累積後開啟抽卡";

  const periodPill = document.getElementById("progressPeriodPill");
  if (periodPill) periodPill.textContent = progress.period || currentPeriodKey();
  const pet = getActivePet();
  const owned = getOwned(pet.pet_id);
  const growthFocus = buildGrowthFocus(pet, owned);
  const awakenFocus = buildAwakenFocus(pet, owned);
  const drawFocus = {
    title: "抽卡刺激",
    detail: totalTickets() > 0 ? `${compactTicketText()}，先把今天能抽的抽掉。` : "目前沒有可抽券，完成行程或成果後會亮起卡池。",
    value: `${totalTickets()} 次`,
    tone: totalTickets() > 0 ? "hot" : "soft",
  };

  target.innerHTML = `
    <article class="progress-hero-card${dreamClass}">
      <span class="summon-kicker">${escapeHtml(progress.main.label)}</span>
      <strong>${formatMetricValue(progress.main.effective)} / ${formatMetricValue(progress.main.total)}</strong>
      <p>有效 / 全部組數。${escapeHtml(eEffectiveMilestone)}</p>
      ${progress.main.dreamDone ? `<span class="celebration-pill">E 全部達 ${formatMetricValue(progress.main.total)}，夢幻高標！</span>` : `<span class="soft-pill">E 全部 6 是爆發慶祝，不是每日壓力</span>`}
    </article>
    <div class="progress-focus-grid">
      ${[growthFocus, awakenFocus, drawFocus].map((focus) => `
        <article class="progress-focus-card is-${escapeHtml(focus.tone)}">
          <div class="team-topline">
            <strong>${escapeHtml(focus.title)}</strong>
            <span>${escapeHtml(focus.value)}</span>
          </div>
          <p>${escapeHtml(focus.detail)}</p>
        </article>
      `).join("")}
    </div>
    <article class="progress-card">
      <div class="team-topline"><strong>${escapeHtml(progress.highValue.label)}</strong><span>${formatMetricValue(progress.highValue.current)} / >${progress.highValue.target}</span></div>
      <div class="bar"><span style="width:${highPercent}%"></span></div>
      <p>${progress.highValue.done ? "高價值行為已點亮。" : "最想推動的是 B+C+D 有效組數。"}</p>
    </article>
    <article class="progress-card">
      <div class="team-topline"><strong>${escapeHtml(progress.phoneSignal.label)}</strong><span>${formatMetricValue(progress.phoneSignal.calls)} 通</span></div>
      <p>${escapeHtml(phoneSignal)}。電話是加成信號，不蓋過 B+C+D 有效。</p>
    </article>
    <article class="progress-card">
      <div class="team-topline"><strong>${escapeHtml(progress.monthlyMission.label)}</strong><span>${formatMetricValue(progress.monthlyMission.current)} / ${progress.monthlyMission.target}</span></div>
      <div class="bar"><span style="width:${monthPercent}%"></span></div>
      <p>月任務只看長期累積，不拆成每日壓力。</p>
    </article>
    <article class="progress-card">
      <div class="team-topline"><strong>${escapeHtml(progress.contractTemple.label)}</strong><span>${formatMetricValue(progress.contractTemple.current)}</span></div>
      <p>${escapeHtml(contractLine)}</p>
      <p class="small-text">${escapeHtml(progress.contractTemple.note)}</p>
    </article>
    <article class="progress-card">
      <div class="team-topline"><strong>已亮起抽卡項目</strong><span>${totalTickets()} 次</span></div>
      <p>${escapeHtml(unlockLine)}</p>
      <p class="small-text">抽卡倍率與精確掉落率待後端設定。</p>
    </article>
  `;
}

function renderMetrics() {
  const employeeMetrics = [
    ["development", "B 開發"],
    ["negotiation", "C 有效信號"],
    ["showing", "D 帶看"],
    ["calls", "電話信號"],
    ["listing", "委託"],
    ["meeting", "見面談"],
    ["contract", "簽約"],
  ];
  document.getElementById("metricsGrid").innerHTML = employeeMetrics.map(([key, label]) => `
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
  document.getElementById("poolGrid").innerHTML = [...POOLS].sort((left, right) => poolPriority(right) - poolPriority(left)).map((pool) => {
    const candidates = poolCandidates(pool);
    const unlocked = poolUnlocked(pool);
    const ready = unlocked && Number(state.tickets[pool.key] || 0) > 0 && candidates.length > 0;
    return `
      <article class="pool-card ${unlocked ? "" : "is-locked"} ${ready ? "is-ready" : ""}">
        <div class="team-topline">
          <h3>${pool.name}</h3>
          <span>${state.tickets[pool.key] || 0} 張</span>
        </div>
        <p class="small-text">${pool.source}</p>
        <p class="assist-line">${escapeHtml(poolExperienceCue(pool, candidates, unlocked))}</p>
        <div class="pool-meta">
          ${rarityDisplayText(pool)}
          <span class="soft-pill">${candidates.length} 張候選卡</span>
          <span class="soft-pill">${escapeHtml(activePetAssistText().replace("主寵助力：", ""))}</span>
        </div>
        <button class="primary-button" type="button" data-draw="${pool.key}" ${state.tickets[pool.key] <= 0 || !unlocked || !candidates.length ? "disabled" : ""}>${escapeHtml(poolDrawButtonLabel(pool))}</button>
      </article>
    `;
  }).join("");
}

function drawOutcomeTone(draw, pet) {
  if (draw?.duplicate) return "duplicate";
  if (pet?.rarity === "SSR" || pet?.rarity === "UR") return "rare";
  if (pet?.rarity === "SR") return "shine";
  return "new";
}

function drawOutcomeLabel(draw, pet) {
  if (draw?.duplicate) return `重複轉碎片 +${rewardCount(draw.fragmentsAdded)}`;
  if (pet?.rarity === "SSR" || pet?.rarity === "UR") return "稀有夥伴加入";
  return "新夥伴加入";
}

function drawNextAction(draw, pet, owned) {
  if (draw?.duplicate && owned && owned.star < 5 && owned.duplicate_fragments >= starCost(owned.star + 1)) {
    return { kind: "star", label: "去升星", petId: pet.pet_id };
  }
  if (pet && owned && canAwaken(pet, owned)) return { kind: "awaken", label: "去覺醒", petId: pet.pet_id };
  if (draw?.poolKey && Number(state.tickets?.[draw.poolKey] || 0) > 0) return { kind: "draw", label: "再抽一次", poolKey: draw.poolKey };
  return { kind: "view", label: "看卡片庫", view: "collection" };
}

function drawNextActionMarkup(action) {
  if (!action) return "";
  if (action.kind === "star") return `<button class="primary-button" type="button" data-star="${escapeHtml(action.petId)}">${escapeHtml(action.label)}</button>`;
  if (action.kind === "awaken") return `<button class="primary-button" type="button" data-awaken="${escapeHtml(action.petId)}">${escapeHtml(action.label)}</button>`;
  if (action.kind === "draw") return `<button class="primary-button" type="button" data-draw="${escapeHtml(action.poolKey)}">${escapeHtml(action.label)}</button>`;
  return `<button class="primary-button" type="button" data-view="${escapeHtml(action.view || "collection")}">${escapeHtml(action.label)}</button>`;
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
  const owned = pet ? getOwned(pet.pet_id) : null;
  const tone = drawOutcomeTone(lastDraw, pet);
  const nextAction = drawNextAction(lastDraw, pet, owned);
  target.innerHTML = `
    <article class="draw-result-card draw-tone-${escapeHtml(tone)}">
      <div class="mini-pet">${petVisual(pet, getOwned(pet.pet_id), "small")}</div>
      <div>
        <span class="summon-kicker">抽卡結果</span>
        <div class="pet-name-row">
          <h3>${pet.name}</h3>
          <span class="rarity-badge rarity-${pet.rarity}">${pet.rarity}</span>
          <span class="collection-badge is-ready">${escapeHtml(drawOutcomeLabel(lastDraw, pet))}</span>
        </div>
        ${flavor ? `<p class="pet-flavor">「${escapeHtml(flavor)}」</p>` : ""}
        <p class="small-text">${lastDraw.text}</p>
        ${lastDraw.assistText ? `<p class="assist-line">${escapeHtml(lastDraw.assistText)}</p>` : ""}
        <div class="draw-share-row">
          ${drawNextActionMarkup(nextAction)}
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
  const outcome = draw.duplicate
    ? `重複卡轉成 ${rewardCount(draw.fragmentsAdded)} 碎片，下一次升星又近一點。`
    : pet?.rarity === "SSR"
      ? "成交神殿有回應，今天這抽有感。"
      : "新夥伴加入卡片庫。";
  return [
    `${PROFILE.branch} ${PROFILE.agent} 在房仲精靈抽到 ${petText}。`,
    outcome,
    subtitle,
    draw.assistText || "",
    "累積推進抽卡，委託/見面談/簽約推進成交神殿。",
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
  const progress = state.progress || buildProgressSnapshot(metrics);
  return [
    `E ${formatMetricValue(progress.main.effective)} / ${formatMetricValue(progress.main.total)}`,
    `B+C+D 有效 ${formatMetricValue(progress.highValue.current)}`,
    `電話信號 ${formatMetricValue(progress.phoneSignal.calls)}`,
    `成交神殿 ${formatMetricValue(progress.contractTemple.current)}`,
  ].join("、");
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
  lines.push("累積推進抽卡，委託/見面談/簽約推進成交神殿。");
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
  if (goal.key === "listing") return Number(sourceMetrics.listing || 0) + Number(sourceMetrics.meeting || 0) + Number(sourceMetrics.contract || 0);
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
    `成果：委託 ${formatMetricValue(metrics.listing)}、見面談 ${formatMetricValue(metrics.meeting)}、簽約 ${formatMetricValue(metrics.contract)}`,
    `今日合計：行程 ${formatMetricValue(activityTotal)}、成果 ${formatMetricValue(resultTotal)}`,
    `店內任務：${goalLine}`,
    "累積推進抽卡，委託/見面談/簽約推進成交神殿。",
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

function ticketLabel(key) {
  return {
    general: "一般券",
    boosted: "強化券",
    result: "成果券",
    blessing: "祝福券",
  }[key] || key;
}

function collectionFragmentTotal() {
  return Object.values(state.collection || {}).reduce((sum, owned) => sum + Number(owned?.duplicate_fragments || 0), 0);
}

function renderInventoryBag() {
  const summary = document.getElementById("bagSummary");
  const grid = document.getElementById("bagGrid");
  const resetCard = document.getElementById("resetRuleCard");
  if (!grid) return;
  const tickets = ticketEntries();
  const materials = materialGainEntries(state.materials || {});
  const ownedCount = ownedCurrentPetCount();
  const fragmentTotal = collectionFragmentTotal();
  const actionable = findFirstActionableCollection();
  if (summary) summary.textContent = `${totalTickets()} 券 · ${materials.length} 種素材`;
  const sections = [
    {
      title: "今天先檢查",
      detail: totalTickets() > 0 ? `可抽 ${totalTickets()} 次` : "目前沒有可抽券",
      meta: "含報表卡點、免費抽或加碼；免費抽若已發放，今天未用不保留。",
      tone: totalTickets() > 0 ? "hot" : "soft",
    },
    {
      title: "現在可用",
      detail: actionable ? actionable.text : (tickets.length ? compactTicketText(tickets) : "暫無立即操作"),
      meta: actionable ? "先把碎片或素材變成寵物進度。" : "有券就抽，有素材就整理卡片庫。",
      tone: actionable ? "hot" : "growth",
    },
    {
      title: "長期累積",
      detail: materials.length ? materials.slice(0, 4).map(([key, value]) => `${materialLabel(key)} ${value}`).join(" · ") : "目前沒有素材",
      meta: "委託、見面談、簽約等真實成果推進覺醒與成熟合成。",
      tone: "soft",
    },
    {
      title: "收藏進度",
      detail: `${ownedCount} / ${PETS.length} 種 · 碎片 ${fragmentTotal}`,
      meta: "重複卡會轉成碎片，碎片可以升星與合成。",
      tone: "growth",
    },
  ];
  grid.innerHTML = sections.map((section) => `
    <article class="bag-card is-${escapeHtml(section.tone)}">
      <span class="summon-kicker">${escapeHtml(section.title)}</span>
      <strong>${escapeHtml(section.detail)}</strong>
      <p>${escapeHtml(section.meta)}</p>
    </article>
  `).join("");
  if (resetCard) {
    resetCard.innerHTML = `
      <span class="summon-kicker">全部重置規則</span>
      <strong>同仁自己選，選了就全部清空</strong>
      <p>卡片庫、寵物、碎片、素材、抽卡紀錄、每日免費抽、月榜第一與加碼都會消失。</p>
      <p>唯一保留的是 A/B/C/D 行程與成果項重新計算出的抽卡點數。</p>
    `;
  }
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

function renderCollectionActionStrip() {
  const target = document.getElementById("collectionActionStrip");
  if (!target) return;
  const action = findFirstActionableCollection();
  const ownedCount = ownedCurrentPetCount();
  if (!action) {
    target.innerHTML = `
      <article class="collection-action-card">
        <span class="summon-kicker">卡片庫下一步</span>
        <strong>${ownedCount ? "先累積碎片與素材" : "先抽到第一批夥伴"}</strong>
        <p>${ownedCount ? "抽到重複卡會變碎片；委託、見面談、簽約會讓覺醒素材增加。" : "去抽卡後，這裡會優先顯示可升星、可覺醒的卡。"}</p>
      </article>
    `;
    return;
  }
  target.innerHTML = `
    <article class="collection-action-card is-hot">
      <span class="summon-kicker">卡片庫下一步</span>
      <strong>${escapeHtml(action.text)}</strong>
      <p>目前最值得先處理的是 ${escapeHtml(action.pet.name)}，處理完再回來抽卡或看成果。</p>
      <button class="primary-button" type="button" data-${action.type === "star" ? "star" : action.type === "awaken" ? "awaken" : action.type === "ultimate" ? "ultimate" : "view"}="${escapeHtml(action.type === "material-ready" ? "collection" : action.pet.pet_id)}">${escapeHtml(action.label)}</button>
    </article>
  `;
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
  const missingAwaken = missingMaterials(pet.required_awaken_materials || {});
  const materialNearly = !owned.awakened && pet.available_forms.includes("覺醒型") && missingAwaken.length > 0 && missingAwaken.reduce((sum, item) => sum + item.missing, 0) <= 1;
  const fragmentGap = owned.star < 5 ? Math.max(0, nextCost - owned.duplicate_fragments) : 0;
  const ultimateReady = canUltimate(pet, owned);
  const badges = [];
  if (pet.pet_id === state.activePetId) badges.push({ label: "主寵", tone: "focus" });
  if (canStar) badges.push({ label: "可升星", tone: "ready" });
  else if (owned.star < 5 && fragmentGap > 0 && fragmentGap <= 3) badges.push({ label: "只差碎片", tone: "soft" });
  if (awakenReady) badges.push({ label: "可覺醒", tone: "ready" });
  else if (materialReady) badges.push({ label: "素材已足", tone: "soft" });
  else if (materialNearly) badges.push({ label: "素材快足", tone: "soft" });
  if (ultimateReady) badges.push({ label: "可究極", tone: "ready" });
  return {
    badges,
    score:
      (pet.pet_id === state.activePetId ? 100 : 0) +
      (awakenReady ? 80 : 0) +
      (ultimateReady ? 70 : 0) +
      (canStar ? 60 : 0) +
      (materialReady ? 40 : 0) +
      (materialNearly ? 30 : 0) +
      (fragmentGap > 0 && fragmentGap <= 3 ? 20 : 0) +
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
  renderCollectionActionStrip();
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
  const teamList = document.getElementById("teamList");
  renderTeamContribution();
  if (!teamList) return;
  teamList.innerHTML = TEAM_GOALS.map((goal) => {
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

function collectionCountsByStoryline() {
  return getStorylines().map((storyline) => {
    const pets = PETS.filter((pet) => pet.storyline_id === storyline.storyline_id);
    const owned = pets.filter((pet) => getOwned(pet.pet_id)).length;
    return { storyline, owned, total: pets.length };
  });
}

function managerLeaderboardRows() {
  const cloudPlayers = state.manager.cloudDashboard?.players;
  if (Array.isArray(cloudPlayers) && cloudPlayers.length) {
    return cloudPlayers.map((row) => {
      const metrics = normalizeGameMetrics(row.source_metrics || row.sourceMetrics || {});
      const basis = isPlainObject(row.event_basis) ? row.event_basis : {};
      return {
        agent: row.agent_name || row.agent || row.report_name || row.uid || "同仁",
        employeeId: row.uid || row.employee_id || "",
        branch: row.branch || PROFILE.branch,
        monthlyDevelopmentShowing: normalizeMetricValue(basis.monthly_policy_development_plus_showing || row.monthlyDevelopmentShowing || 0),
        highValueEffective: normalizeMetricValue(basis.bcd_valid || row.highValueEffective || 0),
        eTotal: normalizeMetricValue(basis.e_total || row.eTotal || 0),
        listing: normalizeMetricValue(metrics.listing || row.listing || 0),
        meeting: normalizeMetricValue(metrics.meeting || row.meeting || 0),
        contract: normalizeMetricValue(metrics.contract || row.contract || 0),
        showing: normalizeMetricValue(metrics.showing || row.showing || 0),
        calls: normalizeMetricValue(metrics.calls || row.calls || 0),
      };
    }).sort((left, right) =>
      right.monthlyDevelopmentShowing - left.monthlyDevelopmentShowing ||
      right.contract - left.contract ||
      right.listing - left.listing ||
      right.showing - left.showing ||
      String(left.employeeId).localeCompare(String(right.employeeId), "zh-Hant")
    );
  }
  const progress = state.progress || buildProgressSnapshot(state.metrics);
  const metrics = normalizeGameMetrics(progress.sourceMetrics || state.metrics || {});
  const baseRow = {
    agent: PROFILE.agent,
    employeeId: PROFILE.employeeId,
    branch: PROFILE.branch,
    monthlyDevelopmentShowing: progress.monthlyMission?.current || 0,
    highValueEffective: progress.highValue?.current || 0,
    eTotal: progress.main?.total || 0,
    listing: metrics.listing,
    meeting: metrics.meeting,
    contract: metrics.contract,
    showing: metrics.showing,
    calls: metrics.calls,
  };
  return [baseRow].sort((left, right) =>
    right.monthlyDevelopmentShowing - left.monthlyDevelopmentShowing ||
    right.contract - left.contract ||
    right.listing - left.listing ||
    right.showing - left.showing ||
    String(left.employeeId).localeCompare(String(right.employeeId), "zh-Hant")
  );
}

function metricPairValue(metrics, key, side = "valid") {
  const value = metrics?.[key];
  if (isPlainObject(value)) return normalizeMetricValue(value[side] ?? value.valid ?? value.total ?? 0);
  return normalizeMetricValue(value || 0);
}

function managerAuditRows() {
  const previewRows = state.manager.cloudImportPreview?.player_previews;
  if (Array.isArray(previewRows) && previewRows.length) {
    return previewRows.map((row) => {
      const metrics = row.current_source_metrics || row.source_metrics || {};
      const basis = isPlainObject(row.event_basis) ? row.event_basis : {};
      return {
        source: "preview",
        name: row.report_name || row.agent_name || row.uid || "同仁",
        uid: row.uid || "",
        period: row.report_period || state.manager.cloudImportPreview?.period || state.manager.lastImport?.period || currentPeriodKey(),
        area: metricPairValue(metrics, "a_area_total"),
        development: metricPairValue(metrics, "b_development_total"),
        negotiation: metricPairValue(metrics, "c_negotiation_total"),
        showing: metricPairValue(metrics, "d_showing_group"),
        sales: metricPairValue(metrics, "d_sales_total"),
        eValid: normalizeMetricValue(basis.e_valid ?? metricPairValue(metrics, "e_total_group")),
        eTotal: normalizeMetricValue(basis.e_total ?? metricPairValue(metrics, "e_total_group", "total")),
        calls: normalizeMetricValue(basis.calls ?? metricPairValue(metrics, "calls")),
        listing: metricPairValue(metrics, "listing") + metricPairValue(metrics, "rent_listing"),
        meeting: metricPairValue(metrics, "meeting_or_offer") + metricPairValue(metrics, "rent_meeting_or_offer"),
        contract: metricPairValue(metrics, "contract") + metricPairValue(metrics, "rent_contract"),
      };
    });
  }
  const cloudPlayers = state.manager.cloudDashboard?.players;
  if (Array.isArray(cloudPlayers) && cloudPlayers.length) {
    return cloudPlayers.map((row) => {
      const metrics = row.source_metrics || row.sourceMetrics || {};
      const basis = isPlainObject(row.event_basis) ? row.event_basis : {};
      return {
        source: "published",
        name: row.agent_name || row.report_name || row.uid || "同仁",
        uid: row.uid || "",
        period: row.report_period || state.manager.cloudDashboard?.period || currentPeriodKey(),
        area: metricPairValue(metrics, "a_area_total"),
        development: metricPairValue(metrics, "b_development_total"),
        negotiation: metricPairValue(metrics, "c_negotiation_total"),
        showing: metricPairValue(metrics, "d_showing_group"),
        sales: metricPairValue(metrics, "d_sales_total"),
        eValid: normalizeMetricValue(basis.e_valid ?? metricPairValue(metrics, "e_total_group")),
        eTotal: normalizeMetricValue(basis.e_total ?? metricPairValue(metrics, "e_total_group", "total")),
        calls: normalizeMetricValue(basis.calls ?? metricPairValue(metrics, "calls")),
        listing: metricPairValue(metrics, "listing") + metricPairValue(metrics, "rent_listing"),
        meeting: metricPairValue(metrics, "meeting_or_offer") + metricPairValue(metrics, "rent_meeting_or_offer"),
        contract: metricPairValue(metrics, "contract") + metricPairValue(metrics, "rent_contract"),
      };
    });
  }
  return [];
}

function renderManagerImportAudit() {
  const target = document.getElementById("managerImportAudit");
  if (!target) return;
  const rows = managerAuditRows();
  const modeLabel = state.manager.cloudImportPreview?.import_id ? "預覽資料" : rows.length ? "已入帳資料" : "尚無資料";
  target.innerHTML = `
    <article class="manager-card">
      <span class="summon-kicker">匯入數據比對表</span>
      <strong>${modeLabel} · ${rows.length} 位</strong>
      <div class="audit-table-wrap">
        <div class="audit-table" role="table" aria-label="匯入數據比對表">
          <div class="audit-row audit-head" role="row">
            <span>人名</span>
            <span>員編</span>
            <span>A 商圈</span>
            <span>B 開發</span>
            <span>C 議價</span>
            <span>D 帶看</span>
            <span>D 銷售</span>
            <span>E 有效</span>
            <span>E 全部</span>
            <span>F 電話</span>
            <span>委託</span>
            <span>見面談</span>
            <span>簽約</span>
          </div>
          ${rows.length ? rows.map((row) => `
            <div class="audit-row" role="row">
              <span>${escapeHtml(row.name)}</span>
              <span>${escapeHtml(String(row.uid))}</span>
              <span>${formatMetricValue(row.area)}</span>
              <span>${formatMetricValue(row.development)}</span>
              <span>${formatMetricValue(row.negotiation)}</span>
              <span>${formatMetricValue(row.showing)}</span>
              <span>${formatMetricValue(row.sales)}</span>
              <span>${formatMetricValue(row.eValid)}</span>
              <span>${formatMetricValue(row.eTotal)}</span>
              <span>${formatMetricValue(row.calls)}</span>
              <span>${formatMetricValue(row.listing)}</span>
              <span>${formatMetricValue(row.meeting)}</span>
              <span>${formatMetricValue(row.contract)}</span>
            </div>
          `).join("") : `
            <div class="audit-empty">上傳 Excel 或預覽 Google Sheet 後，這裡會出現逐人數據。</div>
          `}
        </div>
      </div>
      <p class="small-text">這張表只給店長核對匯入資料；A-F 依目前報表欄位解析，確認無誤後再按「確認入帳」。</p>
    </article>
  `;
}

function renderManagerTemporaryTasks() {
  const target = document.getElementById("managerTemporaryTasks");
  if (!target) return;
  const progress = state.progress || buildProgressSnapshot(state.metrics);
  const highValueRemaining = Math.max(0, progress.highValue.target - progress.highValue.current);
  const monthlyRemaining = Math.max(0, progress.monthlyMission.target - progress.monthlyMission.current);
  target.innerHTML = `
    <article class="manager-card">
      <span class="summon-kicker">臨時任務</span>
      <strong>${state.manager.temporaryTaskStarted ? "已開啟" : "未開啟"} · 第一線故事碎片</strong>
      <p>第一版只讓店長開關任務，不寫死倍率；任務獎勵之後接後端設定。</p>
      <div class="manager-task-list">
        <div class="team-topline">
          <span>B+C+D 有效缺口</span>
          <span>${formatMetricValue(highValueRemaining)}</span>
        </div>
        <div class="team-topline">
          <span>月任務缺口</span>
          <span>${formatMetricValue(monthlyRemaining)}</span>
        </div>
        <div class="team-topline">
          <span>成交神殿來源</span>
          <span>委託 / 見面談 / 簽約</span>
        </div>
      </div>
      <p class="small-text">LINE 目前只保留入口與分享文案，機器人回覆先不接。</p>
    </article>
  `;
}

function renderManagerLeaderboard() {
  const target = document.getElementById("managerLeaderboard");
  if (!target) return;
  const rows = managerLeaderboardRows();
  target.innerHTML = `
    <article class="manager-card">
      <span class="summon-kicker">月榜排序</span>
      <strong>目前匯入 ${rows.length} 位</strong>
      <div class="leaderboard-table" role="table" aria-label="店長月榜排序">
        <div class="leaderboard-row leaderboard-head" role="row">
          <span>名次</span>
          <span>同仁</span>
          <span>開發+帶看</span>
          <span>委託</span>
          <span>簽約</span>
        </div>
        ${rows.map((row, index) => `
          <div class="leaderboard-row" role="row">
            <span>${index + 1}</span>
            <span>${escapeHtml(row.agent)}<small>${escapeHtml(row.employeeId)}</small></span>
            <span>${formatMetricValue(row.monthlyDevelopmentShowing)}</span>
            <span>${formatMetricValue(row.listing)}</span>
            <span>${formatMetricValue(row.contract)}</span>
          </div>
        `).join("")}
      </div>
      <p class="small-text">月榜第一與店長加碼屬於可失去獎勵；同仁若選全部重置，不保留這些額外次數。</p>
    </article>
  `;
}

function renderManagerDashboard() {
  if (!MANAGER_MODE) return;
  const teamToggle = document.getElementById("teamMissionToggle");
  if (teamToggle) teamToggle.textContent = state.manager.teamMissionStarted ? "已開始" : "未開始";
  const bonusToggle = document.getElementById("bonusToggle");
  if (bonusToggle) bonusToggle.textContent = state.manager.bonusEnabled ? "加碼待設定" : "未加碼";
  const temporaryTaskToggle = document.getElementById("temporaryTaskToggle");
  if (temporaryTaskToggle) temporaryTaskToggle.textContent = state.manager.temporaryTaskStarted ? "已開啟" : "未開啟";

  renderManagerTemporaryTasks();
  renderManagerImportAudit();
  renderManagerLeaderboard();

  const tracking = document.getElementById("managerTracking");
  if (tracking) {
    const lastImport = state.manager.lastImport;
    const warnings = state.manager.warnings || [];
    tracking.innerHTML = `
      <article class="manager-card">
        <span class="summon-kicker">追蹤狀態</span>
        <strong>${lastImport ? "已有匯入紀錄" : "尚未匯入資料"}</strong>
        <p>${lastImport ? `${escapeHtml(lastImport.period)} · ${new Date(lastImport.at).toLocaleString("zh-TW")}` : "拖移每日報表後，這裡會顯示最近匯入狀態。"}</p>
        <div class="pool-meta">
          <span class="soft-pill">團隊任務 ${state.manager.teamMissionStarted ? "開始" : "未開始"}</span>
          <span class="soft-pill">加碼 ${state.manager.bonusEnabled ? "placeholder" : "關閉"}</span>
        </div>
        ${warnings.length ? `<p class="small-text warning-text">${warnings.map(escapeHtml).join("、")}</p>` : `<p class="small-text">目前沒有匯入警告。</p>`}
      </article>
    `;
  }

  const collection = document.getElementById("managerCollection");
  if (collection) {
    const counts = collectionCountsByStoryline();
    const owned = ownedCurrentPetCount();
    collection.innerHTML = `
      <article class="manager-card">
        <span class="summon-kicker">卡片收集成果</span>
        <strong>總共搜集 ${owned}/${PETS.length} 種</strong>
        <div class="manager-storyline-list">
          ${counts.map((item) => `
            <div class="team-topline">
              <span>${escapeHtml(item.storyline.name)}</span>
              <span>${item.owned}/${item.total}</span>
            </div>
          `).join("")}
        </div>
      </article>
    `;
  }
  const cloudCommitBtn = document.getElementById("cloudCommitBtn");
  if (cloudCommitBtn) cloudCommitBtn.disabled = !state.manager.cloudImportPreview?.import_id;
  const status = document.getElementById("cloudImportStatus");
  if (status && !status.textContent && cloudManagerKeyRequired()) {
    setCloudImportStatus("真雲端店長操作請使用店長專用入口；管理 key 會自動收進本次瀏覽器工作階段。", "bad");
  }
}

function renderCardGameBoard() {
  const target = document.getElementById("cardGameBoard");
  if (!target) return;
  const pet = getActivePet();
  const owned = getOwned(pet.pet_id);
  const progress = state.progress || buildProgressSnapshot(state.metrics);
  target.innerHTML = `
    <article class="cardgame-card">
      <div class="mini-pet">${petVisual(pet, owned, "small")}</div>
      <div>
        <span class="summon-kicker">今日手牌</span>
        <strong>${escapeHtml(pet.name)} · ${escapeHtml(currentForm(pet, owned))}</strong>
        <p>E ${formatMetricValue(progress.main.effective)} / ${formatMetricValue(progress.main.total)}，B+C+D 有效 ${formatMetricValue(progress.highValue.current)}。</p>
        <p class="small-text">卡牌戰鬥/任務畫面雛形；正式卡牌效果、倍率與掉落率由後端規則接入。</p>
      </div>
    </article>
    <div class="cardgame-actions">
      <button class="secondary-button" type="button" data-view="gacha">去看抽卡額度</button>
      <button class="secondary-button" type="button" data-view="collection">整理卡片庫</button>
    </div>
  `;
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
  if (target.id === "switchEmployeeBtn") switchEmployee();
  if (target.id === "teamMissionToggle") {
    state.manager.teamMissionStarted = !state.manager.teamMissionStarted;
    saveState();
    render();
  }
  if (target.id === "bonusToggle") {
    state.manager.bonusEnabled = !state.manager.bonusEnabled;
    state.manager.bonusStatus = state.manager.bonusEnabled ? "placeholder" : "off";
    saveState();
    render();
  }
  if (target.id === "temporaryTaskToggle") {
    state.manager.temporaryTaskStarted = !state.manager.temporaryTaskStarted;
    saveState();
    render();
  }
  if (target.id === "cloudPreviewBtn") previewCloudImport();
  if (target.id === "cloudCommitBtn") commitCloudImport();
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
  handleManagerFile(file);
  event.target.value = "";
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

document.getElementById("employeeLoginForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  handleEmployeeLogin(event.currentTarget);
});

const managerDropZone = document.getElementById("managerDropZone");
if (managerDropZone) {
  managerDropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    managerDropZone.classList.add("is-dragover");
  });
  managerDropZone.addEventListener("dragleave", () => {
    managerDropZone.classList.remove("is-dragover");
  });
  managerDropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    managerDropZone.classList.remove("is-dragover");
    handleManagerFile(event.dataTransfer?.files?.[0]);
  });
}

ensureStarterPet();
ensureCollectionStoryline();
render();
loadExternalContent().then(loadCloudState);
registerServiceWorker();
