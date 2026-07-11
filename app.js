const LEGACY_STORAGE_KEY = "realtor-pet-game-v2";
const APP_VERSION = "v52";
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
const DRAW_SESSION_STORAGE_KEY = `${STORAGE_KEY}:draw-session-v1`;
const DRAW_CLAIM_QUEUE_STORAGE_KEY = `${STORAGE_KEY}:draw-claim-queue-v1`;
const HOME_OPENING_STORAGE_KEY = `${STORAGE_KEY}:home-opening-v17`;
const PRODUCTION_CLOUD_API_BASE_URL = "https://script.google.com/macros/s/AKfycbwUGu1SSwNJxJZqZU5RX7dZC095_1QOS_XHgH_vu7Hw1x2LG99aoR6Eedpm4ntG5VI/exec";
const CLOUD_API_BASE_URL = readCloudApiBaseUrl();
captureCloudManagerKeyFromUrl();
let homeOpeningStateCache = null;
let petTalkTimer = 0;
let drawRequest = null;
let pinnedDrawPoolKey = "";
let lastDrawRevealLatencyMs = 0;
const DRAW_CLAIM_BATCH_DELAY_MS = 250;
let pendingPreparedDrawClaims = [];
let activePreparedDrawClaims = [];
let drawClaimBatchTimer = null;
let drawClaimBatchInFlight = false;
let activeDrawClaimRequestId = "";
let drawClaimRetryCount = 0;
let cloudPlayerStateReady = !CLOUD_API_BASE_URL || CLOUD_API_BASE_URL === "mock" || MANAGER_MODE;
const DRAW_REVEAL_OVERLAY_ENABLED = false;

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

const STORYLINE_ESSENCE_LABELS = {
  area: "商圈精華",
  development: "開拓精華",
  call: "信號精華",
  negotiation: "議價精華",
  showing: "銷售精華",
  listing: "信任精華",
  offer: "斡旋精華",
  contract: "契約精華",
};
const ESSENCE_ART = {
  development: {
    image: "assets/essences/development_essence.webp",
    thumbnail: "assets/essences/development_essence-thumb.webp",
  },
  call: {
    image: "assets/essences/call_essence.webp",
    thumbnail: "assets/essences/call_essence-thumb.webp",
  },
  showing: {
    image: "assets/essences/showing_essence.webp",
    thumbnail: "assets/essences/showing_essence-thumb.webp",
  },
  listing: {
    image: "assets/essences/listing_essence.webp",
    thumbnail: "assets/essences/listing_essence-thumb.webp",
  },
  contract: {
    image: "assets/essences/contract_essence.webp",
    thumbnail: "assets/essences/contract_essence-thumb.webp",
  },
};
const HATCH_ESSENCE_COST = 9;
const STAR_SOUL_ESSENCE_REWARD = 3;
const TEMPLE_BLESSING_SOUL_COST = 5;
const ULTIMATE_FEATURE_ENABLED = false;

const POOLS = [
  {
    key: "general",
    name: "免費卡池",
    ticketName: "免費池抽數",
    source: "每日免費 3 抽＋電話量獎勵",
    unlockText: "每日有 3 抽；電話每累積 15 通再增加 1 抽",
    allowedStorylines: ["sl_development_expedition", "sl_call_signal_tower", "sl_showing_route", "sl_listing_seed_garden", "development", "call", "showing", "listing"],
    rarityBands: ["N", "R"],
  },
  {
    key: "visit",
    name: "拜訪卡池",
    ticketName: "拜訪池抽數",
    source: "有效拜訪＋其他拜訪 30%＋社區服務 50%",
    unlockText: "每累積 1 點拜訪進度增加 1 抽，小數進度會保留",
    allowedStorylines: ["sl_development_expedition", "development"],
    rarityBands: ["N", "R", "SR", "SSR"],
  },
  {
    key: "showing",
    name: "帶看卡池",
    ticketName: "帶看池抽數",
    source: "帶看組數",
    unlockText: "每累積 1 組帶看增加 1 抽",
    allowedStorylines: ["sl_showing_route", "showing"],
    rarityBands: ["N", "R", "SR", "SSR"],
  },
  {
    key: "result",
    name: "成果卡池",
    ticketName: "成果池抽數",
    source: "委託、斡旋／要約、送訂",
    unlockText: "每累積 1 件成果增加 1 抽",
    allowedStorylines: ["sl_listing_seed_garden", "listing"],
    rarityBands: ["N", "R", "SR", "SSR"],
  },
  {
    key: "contract",
    name: "成交卡池",
    ticketName: "成交池抽數",
    source: "見面談每 2 次 1 抽＋成交每 0.1 件 1 抽",
    unlockText: "見面談與成交分別累積，達整數抽數時即可抽卡",
    allowedStorylines: ["sl_contract_team_sanctum", "contract"],
    rarityBands: ["N", "R", "SR", "SSR"],
  },
];

const RARITY_ORDER = ["N", "R", "SR", "SSR", "UR"];
const GACHA_CONFIG_INTERFACE = {
  dropRates: "由後端提供，例如 { general: { N: 70, R: 30 } }；未提供時 UI 不顯示精確掉落率。",
  assistRules: "由後端提供主寵助力倍率或稀有感應規則；未提供時只顯示已開啟狀態。",
  poolUnlocks: "由後端提供各池解鎖門檻；前端第一版只呈現進度與 placeholder。",
};
const INTERNAL_DRAW_PACING_CONFIG = {
  monthlyGoal: "每天有小進度、每週有一次明顯爽點、月底看得到主寵養成成果。",
  // Local/offline fallback only. The live API is the source of truth for real draws.
  defaultOutcomeWeights: { pet: 2, egg: 5, essence: 93 },
  pools: {
    general: {
      outcomeWeights: { pet: 0, egg: 5, essence: 95 },
      publicCue: "免費卡池：有做就能累積抽數，完整卡機率由本月節奏控制。",
    },
    visit: {
      outcomeWeights: { pet: 2, egg: 8, essence: 90 },
      publicCue: "拜訪卡池：拜訪與社區服務會累積開發線素材。",
    },
    showing: {
      outcomeWeights: { pet: 3, egg: 9, essence: 88 },
      publicCue: "帶看卡池：每一組帶看都會推進帶看故事線。",
    },
    result: {
      outcomeWeights: { pet: 5, egg: 12, essence: 83 },
      publicCue: "成果卡池：委託、斡旋／要約與送訂會累積成果線素材。",
    },
    contract: {
      outcomeWeights: { pet: 15, egg: 15, essence: 70 },
      publicCue: "成交卡池：見面談與成交會累積成交線回饋。",
    },
  },
  essenceAmountWeights: [
    { amount: 1, weight: 55 },
    { amount: 2, weight: 35 },
    { amount: 3, weight: 6 },
    { amount: 4, weight: 3 },
    { amount: 5, weight: 1 },
  ],
};
const INTERNAL_PET_PITY_RULES = {
  contract: { maxMisses: 5 },
};
const MONTHLY_BASE_TARGETS = {
  development: { label: "有效拜訪", target: 10, unit: "次" },
  showing: { label: "帶看", target: 15, unit: "次" },
  listing: { label: "委託", target: 4, unit: "件" },
  contract: { label: "成交主力門檻", target: 0.35, unit: "件", decimals: 2, note: "0.35 件以上視為主要成交人員；抽卡依本次新增差額建立批次" },
};
const GUARANTEED_DRAW_POOLS = [
  { key: "development", poolKey: "guaranteed_development", name: "拜訪保證抽", storylineId: "sl_development_expedition", theme: "theme-blue" },
  { key: "showing", poolKey: "guaranteed_showing", name: "帶看保證抽", storylineId: "sl_showing_route", theme: "theme-blue" },
  { key: "listing", poolKey: "guaranteed_listing", name: "委託保證抽", storylineId: "sl_listing_seed_garden", theme: "theme-orange" },
  { key: "contract", poolKey: "guaranteed_contract", name: "成交保證抽", storylineId: "sl_contract_team_sanctum", theme: "theme-gold" },
];

const PET_WISH_RULES = [
  {
    key: "area",
    tags: ["AREA_ACTIVITY"],
    title: "社區星願",
    target: 1,
    current: (metrics) => Number(metrics.area || 0),
    unit: "次社區服務",
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
    unit: "次拜訪",
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
    bonus: { exp: 30, result: 1 },
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
    bonus: { exp: 30, showing: 1 },
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
    bonus: { exp: 50, contract: 1, materials: { team_core: 1 } },
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
    bonus: { exp: 120, general: 3, visit: 1, result: 2, materials: { team_core: 2 } },
  },
  {
    count: 14,
    title: "十四日王牌寶箱",
    bonus: { exp: 240, visit: 2, showing: 1, result: 3, contract: 1, materials: { team_core: 3, contract_core: 1 } },
  },
  {
    count: 30,
    title: "三十日店鋪守護寶箱",
    bonus: { exp: 500, visit: 3, showing: 2, result: 5, contract: 2, materials: { team_core: 8, contract_core: 2 } },
  },
];

const GAME_SOURCE_METRICS = [
  ["area", "社區服務"],
  ["development", "拜訪"],
  ["negotiation", "回報"],
  ["showing", "帶看"],
  ["calls", "電話量"],
  ["momentum", "前置信號"],
  ["listing", "委託"],
  ["offer", "斡旋"],
  ["price", "改附表"],
  ["meeting", "見面談"],
  ["contract", "簽約"],
  ["performance", "業績"],
];

const METRIC_LABELS = GAME_SOURCE_METRICS;
const GAME_SOURCE_METRIC_KEYS = GAME_SOURCE_METRICS.map(([key]) => key);
const REPORT_VALID_WEIGHT = 1;
const REPORT_TOTAL_ONLY_WEIGHT = 0.4;
const GAME_SOURCE_POLICY = {
  source: "每日行程/成果報表",
  rule: "遊戲獎勵只採計每日行程/成果報表的社區服務、拜訪、回報、帶看、電話量、前置信號與成果欄位；試營運追蹤、心得、圖片、外部報表不進入經驗、券、素材或團隊貢獻計算。",
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
  performance: 0,
};

const TEAM_GOALS = [
  { key: "showing", name: "店內帶看累積", current: 0, target: 30, reward: "團隊星核 +2" },
  { key: "development", name: "店內開發累積", current: 0, target: 60, reward: "強化行程券 +1" },
  { key: "listing", name: "店內成果累積", current: 0, target: 8, reward: "信任素材 +2" },
];

const ENTRY_SCREEN_METRICS = [
  ["area", "社區服務（組數）"],
  ["development", "拜訪（組數）"],
  ["negotiation", "回報（組數）"],
  ["showing", "帶看（組數）"],
  ["calls", "電話通數"],
  ["development", "募集"],
  ["momentum", "追蹤"],
  ["listing", "委託 A / N"],
  ["meeting", "見面談（斡旋）"],
  ["offer", "斡旋"],
  ["price", "附表"],
  ["contract", "成件"],
  ["performance", "業績"],
];

const ENTRY_SCREEN_SUMMARY_METRICS = [
  { key: "activityTotal", label: "行程量", getValue: (metrics) => (metrics.area || 0) + (metrics.development || 0) + (metrics.negotiation || 0) + (metrics.showing || 0) + (metrics.momentum || 0) },
  { key: "resultTotal", label: "成果數量", getValue: (metrics) => (metrics.listing || 0) + (metrics.offer || 0) + (metrics.price || 0) + (metrics.meeting || 0) + (metrics.contract || 0) },
];

const ENTRY_REDEEM_RULES = [
  { title: "社區服務卡", effect: "抽到後補上社區服務的行程組數。", key: "area" },
  { title: "拜訪卡", effect: "抽到後補上拜訪組數，推進日常行程。", key: "development" },
  { title: "回報卡", effect: "抽到後補上回報組數，幫你補掉議價/附表來源。", key: "negotiation" },
  { title: "帶看卡", effect: "抽到後補上帶看組數，帶動見面進場。", key: "showing" },
  { title: "電話卡", effect: "抽到後補上電話通數，提升信號穩定度。", key: "calls" },
  { title: "委託卡", effect: "抽到後補上委託量，對應成件進度與業績條件。", key: "listing" },
  { title: "簽約卡", effect: "抽到後補上成件/業績，推進成交神殿。", key: "contract" },
];

const SPIRIT_FOOD_ACTIVITY_ITEMS = [
  { key: "area", label: "社區服務", unit: "組", hintSubject: "社區服務", rewardText: "會補一口行程食糧。" },
  { key: "development", label: "拜訪", unit: "組", hintSubject: "拜訪", rewardText: "就更接近多一張開發卡。" },
  { key: "negotiation", label: "回報", unit: "組", hintSubject: "回報", rewardText: "會記錄成果池進度。" },
  { key: "showing", label: "帶看", unit: "組", hintSubject: "帶看", rewardText: "會讓帶看小旅行更亮。" },
];

const SPIRIT_FOOD_RESULT_ITEMS = [
  { key: "listing", label: "委託", unit: "間", hintSubject: "委託", rewardText: "可推進成果抽卡獎勵。" },
  { key: "price", label: "附表", unit: "件", hintSubject: "附表", rewardText: "會先記錄成果食糧。" },
  { key: "offer", label: "斡旋", unit: "件", hintSubject: "斡旋", rewardText: "會先記錄成果食糧。" },
  { key: "contract", label: "成件", unit: "件", decimals: 1, hintSubject: "成件", rewardText: "可推進成交神殿祝福。" },
  { key: "performance", label: "業績", unit: "", hintSubject: "業績", rewardText: "只顯示成果，不重複計算成件獎勵。" },
];

const HOME_METRIC_ITEMS = [
  { key: "development", label: "拜訪", unit: "組", tone: "activity" },
  { key: "showing", label: "帶看", unit: "組", tone: "activity" },
  { key: "negotiation", label: "回報", unit: "組", tone: "activity" },
  { key: "listing", label: "委託", unit: "間", tone: "result" },
  { key: "contract", label: "成件", unit: "件", tone: "result", decimals: 1 },
  { key: "performance", label: "業績", unit: "", tone: "result" },
];

const HOME_TICKET_NUDGES = {
  general: "電話量再累積一點，免費抽會增加",
  visit: "有效拜訪、其他拜訪與社區服務都能推進",
  showing: "帶看再 +1 組，就多 1 次帶看池抽卡",
  result: "委託或斡旋成果再 +1 件，就多 1 次成果池抽卡",
  contract: "見面談與成交會分別累積成交池抽數",
};

const HOME_HERO_ACTIVITY_ITEMS = [
  { key: "area", label: "社區服務", unit: "組" },
  { key: "development", label: "拜訪", unit: "組" },
  { key: "negotiation", label: "回報", unit: "組" },
  { key: "showing", label: "帶看", unit: "組" },
  { key: "calls", label: "電話量", unit: "通" },
];

const HOME_HERO_RESULT_ITEMS = [
  { key: "listing", label: "N.", unit: "件" },
  { key: "meeting", label: "A.", unit: "件" },
  { key: "price", label: "二附", unit: "件" },
  { key: "offer", label: "斡旋", unit: "件" },
  { key: "contract", label: "成件", unit: "件", decimals: 1 },
  { key: "performance", label: "業績", unit: "" },
];

function buildEntryScreenKpis(metricsSource = {}) {
  const metrics = normalizeGameMetrics(metricsSource);
  const summaryCards = ENTRY_SCREEN_SUMMARY_METRICS.map((item) => `
    <article class="entry-kpi-card">
      <strong>${formatMetricValue(item.getValue(metrics))}</strong>
      <span>${escapeHtml(item.label)}</span>
    </article>
  `).join("");
  const baseCards = ENTRY_SCREEN_METRICS.map(([key, label]) => `
    <article class="entry-kpi-card">
      <strong>${formatMetricValue(metrics[key])}</strong>
      <span>${escapeHtml(label)}</span>
    </article>
  `).join("");
  return `
    ${summaryCards}
    ${baseCards}
  `;
}

function buildRedeemRuleCards() {
  return ENTRY_REDEEM_RULES.map((rule) => `
    <article class="entry-rule-item">
      <strong>${escapeHtml(rule.title)}</strong>
      <p>${escapeHtml(rule.effect)}</p>
    </article>
  `).join("");
}

function periodDisplayName(periodKey = currentPeriodKey()) {
  const match = String(periodKey || "").match(/^\d{4}-(0?[1-9]|1[0-2])/);
  const month = match ? Number(match[1]) : 0;
  const names = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  return names[month - 1] || "本月";
}

function foodItemValue(item, metrics) {
  if (typeof item.getValue === "function") return normalizeMetricValue(item.getValue(metrics));
  return normalizeMetricValue(metrics[item.key] || 0);
}

function nextFoodMissing(value) {
  const current = normalizeMetricValue(value);
  return normalizeMetricValue(Math.floor(current) + 1 - current);
}

function foodHintText(item, value) {
  const missing = nextFoodMissing(value);
  return `${item.hintSubject || item.label}再 +${formatMetricValue(missing)}${item.unit}，${item.rewardText}`;
}

function spiritFoodTotal(metrics = {}) {
  const source = normalizeGameMetrics(metrics);
  return [
    "area",
    "development",
    "negotiation",
    "showing",
    "listing",
    "price",
    "offer",
    "contract",
  ].reduce((sum, key) => sum + Number(source[key] || 0), 0);
}

function buildSpiritFoodSummaryCard(metricsSource = {}, periodKey = currentPeriodKey()) {
  const metrics = normalizeGameMetrics(metricsSource);
  const periodName = periodDisplayName(periodKey);
  return `
    <article class="spirit-food-summary-card">
      <div class="spirit-food-title">
        <div>
          <span>您目前${escapeHtml(periodName)}的累積精靈食糧</span>
          <strong>${formatMetricValue(spiritFoodTotal(metrics))}</strong>
        </div>
        <span class="soft-pill">行程養等級，成果推覺醒</span>
      </div>
      <p class="small-text">先看最接近的一步，再決定今天補行程、衝成果，或直接把抽卡機會用掉。</p>
    </article>
  `;
}

function buildSpiritFoodSectionCard(title, items, metrics, tone = "activity") {
  return `
    <article class="spirit-food-section spirit-food-section-${escapeHtml(tone)}">
      <div class="team-topline">
        <strong>${escapeHtml(title)}</strong>
        <span class="soft-pill">${items.length} 項</span>
      </div>
      <div class="spirit-food-list">
        ${items.map((item) => {
          const value = foodItemValue(item, metrics);
          return `
            <article class="spirit-food-row">
              <div class="spirit-food-row-head">
                <strong>${escapeHtml(item.label)}</strong>
                <span class="spirit-food-value">${formatMetricValueForItem(value, item)}${escapeHtml(item.unit)}</span>
              </div>
              <p class="spirit-food-reward">${escapeHtml(foodHintText(item, value))}</p>
            </article>
          `;
        }).join("")}
      </div>
    </article>
  `;
}

function remainingDailyFreeDraws() {
  const free = Number(state.drawPoints?.daily_free || 0);
  return Math.max(0, Math.min(regularTicketTotal(), free));
}

function buildHomePriorityCard() {
  const cue = buildEntryExperienceCue();
  const tickets = totalTickets();
  const freeDraws = remainingDailyFreeDraws();
  const statusText = tickets > 0
    ? `可抽 ${tickets} 次${freeDraws > 0 ? ` · 免費抽剩 ${freeDraws} 次` : ""}`
    : "先補累積，抽卡入口就會亮起";
  return {
    ...cue,
    statusText,
  };
}

function buildHomeActionStrip() {
  const tickets = totalTickets();
  const freeDraws = remainingDailyFreeDraws();
  return `
    <article class="home-action-strip">
      <div>
        <span class="summon-kicker">現在就去</span>
        <strong>${tickets > 0 ? `目前可兌換 ${tickets} 次抽卡` : "抽卡額度暫時還沒亮起"}</strong>
        <p>${freeDraws > 0 ? `今日免費抽剩 ${freeDraws} 次，當天沒用就消失。` : "先補行程或成果，新的抽卡機會就會累積進來。"}</p>
      </div>
      <div class="home-action-buttons">
        <button class="primary-button" type="button" data-view="gacha">看抽卡額度</button>
        <button class="secondary-button" type="button" data-view="collection">看卡片庫</button>
        <button class="secondary-button" type="button" data-view="bag">看背包</button>
      </div>
      <p class="small-text">主寵助力已開啟；卡池只顯示本月節奏，不公開精確機率。</p>
    </article>
  `;
}

function homeBagSummaryText() {
  const eggs = eggEntries().reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const essences = essenceEntries().reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const materials = Object.values(state.materials || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const total = eggs + essences + materials;
  return total > 0 ? `${total} 件` : "整理";
}

function buildHomeFunctionDock() {
  const tickets = totalTickets();
  const pet = getActivePet();
  const ownedCount = ownedCurrentPetCount();
  const items = [
    { view: "gacha", label: "抽卡", value: tickets > 0 ? `${tickets} 次` : "快解鎖", hot: tickets > 0 },
    { view: "collection", label: "卡片庫", value: `${ownedCount}/${PETS.length}` },
    { view: "bag", label: "背包", value: homeBagSummaryText() },
    { view: "collection", label: "寵物", value: pet?.name || "夥伴" },
  ];
  return `
    <nav class="home-function-dock" aria-label="功能頁">
      <div class="home-function-copy">
        <span>功能頁</span>
        <strong>${tickets > 0 ? `抽卡 ${tickets} 次先用掉` : "先看哪裡快解鎖"}</strong>
      </div>
      <div class="home-function-grid">
        ${items.map((item) => `
          <button class="home-function-button ${item.hot ? "is-hot" : ""}" type="button" data-view="${escapeHtml(item.view)}">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </button>
        `).join("")}
      </div>
    </nav>
  `;
}

function buildHomeMetricsStrip(metricsSource = {}) {
  const metrics = normalizeGameMetrics(metricsSource);
  return `
    <section class="home-panel home-metrics-strip" aria-label="目前行程與成果">
      <div class="home-panel-head">
        <strong>目前行程跟成果</strong>
        <span>本月</span>
      </div>
      <div class="home-metric-grid">
        ${HOME_METRIC_ITEMS.map((item) => {
          const value = normalizeMetricValue(metrics[item.key] || 0);
          const hasValue = value > 0;
          const detail = homeMetricZeroCue(item);
          return `
            <article class="home-metric-tile is-${escapeHtml(item.tone)} ${hasValue ? "" : "is-waiting"}">
              <span>${escapeHtml(item.label)}</span>
              <strong>${hasValue ? `${formatMetricValueForItem(value, item)}${escapeHtml(item.unit)}` : "待推進"}</strong>
              ${hasValue ? "" : `<small>${escapeHtml(detail)}</small>`}
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function homeMetricZeroCue(item) {
  if (item.label === "成件") return "成交每 0.1 件都會推進成交池";
  if (item.label === "業績") return "成件入帳後一起累積";
  if (item.key === "listing") return "補 1 件委託推成果券";
  if (item.key === "showing") return "補 1 組帶看推強化池";
  if (item.key === "negotiation") return "補 1 組回報推強化池";
  return "補 1 組拜訪推一般券";
}

function homeHeroMetricValue(item, metrics) {
  const value = normalizeMetricValue(metrics[item.key] || 0);
  if (value <= 0) return "待";
  return `${formatMetricValueForItem(value, item)}${item.unit || ""}`;
}

function buildHomeHeroMetricGroup(title, items, metrics) {
  return `
    <div class="home-status-group">
      <strong>${escapeHtml(title)}</strong>
      <div class="home-status-chips">
        ${items.map((item) => `
          <span class="home-status-chip">
            <b>${escapeHtml(item.label)}</b>
            <small>${escapeHtml(homeHeroMetricValue(item, metrics))}</small>
          </span>
        `).join("")}
      </div>
    </div>
  `;
}

function buildHomeStatusBoard(metricsSource = {}) {
  const metrics = normalizeGameMetrics(metricsSource);
  return `
    <section class="home-status-board" aria-label="行程與成果摘要">
      ${buildHomeHeroMetricGroup("行程", HOME_HERO_ACTIVITY_ITEMS, metrics)}
      ${buildHomeHeroMetricGroup("成果", HOME_HERO_RESULT_ITEMS, metrics)}
    </section>
  `;
}

function buildHomeTicketStrip() {
  const entries = ["general", "visit", "showing", "result", "contract"];
  const total = totalTickets();
  return `
    <section class="home-panel home-ticket-strip" aria-label="目前累積卡片">
      <div class="home-panel-head">
        <strong>已累積抽卡</strong>
        <span>${total > 0 ? `${total} 次` : "快解鎖"}</span>
      </div>
      <div class="home-ticket-grid">
        ${entries.map((key) => {
          const value = Number(state.tickets?.[key] || 0);
          const progress = nextTicketProgress(key, state.metrics);
          return `
            <article class="home-ticket-tile ${value > 0 ? "is-ready" : ""}">
              <div>
                <span>${escapeHtml(ticketLabel(key))}</span>
                <strong>${value > 0 ? `${value}<small>抽</small>` : "快解鎖"}</strong>
              </div>
              ${value > 0
                ? `<p>${escapeHtml(HOME_TICKET_NUDGES[key] || "再累積一點，就更接近抽卡")}</p>`
                : `
                  <div class="mini-progress">
                    <span style="width:${progress.percent}%"></span>
                  </div>
                  <p>${escapeHtml(progress.unlockText)}</p>
                `}
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function closestHatchProgress() {
  return PETS
    .map((pet) => {
      const eggs = eggCount(pet.pet_id);
      const essence = essenceCount(pet.storyline_id);
      if (!eggs || getOwned(pet.pet_id)) return null;
      const gap = Math.max(0, HATCH_ESSENCE_COST - essence);
      return { pet, eggs, essence, gap, ready: gap === 0 };
    })
    .filter(Boolean)
    .sort((left, right) => Number(right.ready) - Number(left.ready) || left.gap - right.gap)[0] || null;
}

function closestStarProgress() {
  return PETS
    .map((pet) => {
      const owned = getOwned(pet.pet_id);
      if (!owned || owned.star >= 5) return null;
      const cost = starCost(owned.star + 1);
      const gap = Math.max(0, cost - rewardCount(owned.duplicate_fragments || 0));
      return { pet, owned, cost, gap, ready: gap === 0 };
    })
    .filter(Boolean)
    .sort((left, right) => Number(right.ready) - Number(left.ready) || left.gap - right.gap)[0] || null;
}

function buildHomeResourceStrip() {
  const hatch = closestHatchProgress();
  const star = closestStarProgress();
  const templeBlessing = rewardCount(state.specialResources?.templeBlessing || 0);
  const ownedCount = ownedCurrentPetCount();
  const hatchText = hatch
    ? hatch.ready
      ? `${hatch.pet.name} 可孵化`
      : `${hatch.pet.name} 還差 ${hatch.gap} 個${essenceLabelForStoryline(hatch.pet.storyline_id)}`
    : "抽到蛋後這裡會顯示孵化缺口";
  const starText = star
    ? star.ready
      ? `${star.pet.name} 可升 ${star.owned.star + 1} 星`
      : `${star.pet.name} 還差 ${star.gap} 個星魂`
    : "抽到重複寵物會累積星魂";
  return `
    <section class="home-panel home-resource-strip" aria-label="目前累積資源">
      <div class="home-panel-head">
        <strong>目前累積了什麼</strong>
        <span>${ownedCount}/${PETS.length} 隻</span>
      </div>
      <div class="home-resource-grid">
        <article>
          <span>寵物</span>
          <strong>${ownedCount}<small>隻</small></strong>
        </article>
        <article class="${hatch?.ready ? "is-ready" : ""}">
          <span>最近孵化</span>
          <strong>${escapeHtml(hatchText)}</strong>
        </article>
        <article class="${star?.ready ? "is-ready" : ""}">
          <span>最近升星</span>
          <strong>${escapeHtml(starText)}</strong>
        </article>
        ${templeBlessing ? `<article class="is-ready"><span>神殿祝福</span><strong>${templeBlessing}<small>個</small></strong></article>` : ""}
      </div>
    </section>
  `;
}

function buildHomeTodayChangeStrip(monthlyMetrics = {}) {
  const metrics = normalizeGameMetrics(monthlyMetrics);
  const seen = new Set();
  const changed = HOME_METRIC_ITEMS
    .filter((item) => {
      if (seen.has(item.key)) return false;
      seen.add(item.key);
      return normalizeMetricValue(metrics[item.key] || 0) > 0;
    })
    .slice(0, 3);
  if (!changed.length) {
    return `
      <section class="home-today-change" aria-label="本月累積">
        <strong>本月尚無行程資料</strong>
        <span>店長下次匯入後，這裡會顯示當月累積。</span>
      </section>
    `;
  }
  return `
    <section class="home-today-change is-active" aria-label="本月累積">
      <strong>本月累積進度</strong>
      <div>
        ${changed.map((item) => `
          <span>${escapeHtml(item.label)} ${formatMetricValueForItem(metrics[item.key], item)}${escapeHtml(item.unit)}</span>
        `).join("")}
      </div>
      <p class="home-confirm-cue">依店長最近一次匯入的當月累積資料顯示。</p>
    </section>
  `;
}

function questWorkLabel(quest) {
  if (!quest) return "去補拜訪";
  if (quest.key === "activity") return "去補拜訪";
  if (quest.key === "boosted") return "去補拜訪/銷售";
  if (quest.key === "result") return "去補委託";
  if (quest.key === "contract") return "去補成件";
  return "看本月累積";
}

function questActionCue(quest) {
  if (!quest) return { action: "補 1 組拜訪", benefit: "抽卡更近" };
  if (quest.key === "boosted") return { action: "補 1 組銷售", benefit: "強化抽更近" };
  if (quest.key === "result") return { action: "補 1 件委託", benefit: "推覺醒素材" };
  if (quest.key === "contract") return { action: "補 1 件成件", benefit: "祝福抽更近" };
  return { action: "補 1 組拜訪", benefit: "抽卡更近" };
}

function questActionLabel(quest) {
  const cue = questActionCue(quest);
  return `${cue.action}，${cue.benefit}`;
}

function homePetStarCue(pet, owned) {
  if (!pet || !owned) return "先保留主寵，累積星魂後可升星";
  const currentStar = Math.max(1, Number(owned.star || 1));
  if (currentStar >= 5) return "已達 5 星，後續重複會保留為星魂";
  const nextStar = currentStar + 1;
  const cost = starCost(nextStar);
  const current = rewardCount(owned.duplicate_fragments || 0);
  const gap = Math.max(0, cost - current);
  const levelGap = Math.max(0, starLevelRequirement(nextStar) - rewardCount(owned.level || 1));
  if (levelGap > 0 && gap <= 0) return `星魂已足，再升 ${levelGap} 級可解鎖 ${nextStar} 星`;
  return gap <= 0
    ? `星魂已滿，可升 ${nextStar} 星`
    : `還差 ${formatMetricValue(gap)} 個星魂可升 ${nextStar} 星`;
}

function homePetDrawCue(metricsSource = state.metrics) {
  const quests = buildDailyQuests(metricsSource);
  const resultQuest = quests.find((quest) => quest.key === "result");
  const contractQuest = quests.find((quest) => quest.key === "contract");
  const boostedQuest = quests.find((quest) => quest.key === "boosted");
  if (resultQuest && !resultQuest.done) return "再 1 件委託/見面談/簽約，成果抽更近";
  if (contractQuest && !contractQuest.done) return "再 1 件成件，祝福抽更近";
  if (resultQuest?.done || contractQuest?.done) return "下一筆成果會繼續推進成果抽";
  if (boostedQuest && !boostedQuest.done) return "再補銷售或回報，強化抽更近";
  return "再補 1 組拜訪，抽卡入口更近";
}

function ticketDeltaParts(delta = {}) {
  const labels = {
    general: "免費池",
    visit: "拜訪池",
    showing: "帶看池",
    result: "成果池",
    contract: "成交池",
  };
  return Object.entries(labels)
    .filter(([key]) => Number(delta[key] || 0) > 0)
    .map(([key, label]) => `${label} +${rewardCount(delta[key])}`);
}

function rewardDeltaForMetrics(baseRewards, nextRewards) {
  return {
    exp: Math.max(0, Number(nextRewards.exp || 0) - Number(baseRewards.exp || 0)),
    general: Math.max(0, Number(nextRewards.general || 0) - Number(baseRewards.general || 0)),
    visit: Math.max(0, Number(nextRewards.visit || 0) - Number(baseRewards.visit || 0)),
    showing: Math.max(0, Number(nextRewards.showing || 0) - Number(baseRewards.showing || 0)),
    result: Math.max(0, Number(nextRewards.result || 0) - Number(baseRewards.result || 0)),
    contract: Math.max(0, Number(nextRewards.contract || 0) - Number(baseRewards.contract || 0)),
  };
}

function nextRewardGapForMetric(metricsSource, metricKey, maxGap = 8) {
  const metrics = normalizeGameMetrics(metricsSource);
  const baseRewards = calculateRewards(metrics, getActivePet(), false);
  const baseTicketTotal = rewardTicketTotal(baseRewards);
  for (let gap = 1; gap <= maxGap; gap += 1) {
    const nextMetrics = { ...metrics, [metricKey]: normalizeMetricValue(metrics[metricKey] || 0) + gap };
    const nextRewards = calculateRewards(nextMetrics, getActivePet(), false);
    const delta = rewardDeltaForMetrics(baseRewards, nextRewards);
    if (rewardTicketTotal(nextRewards) > baseTicketTotal) {
      return {
        gap,
        delta,
        nextRewards,
        ticketDelta: rewardTicketTotal(nextRewards) - baseTicketTotal,
      };
    }
  }
  const oneMoreMetrics = { ...metrics, [metricKey]: normalizeMetricValue(metrics[metricKey] || 0) + 1 };
  const oneMoreRewards = calculateRewards(oneMoreMetrics, getActivePet(), false);
  return {
    gap: 1,
    delta: rewardDeltaForMetrics(baseRewards, oneMoreRewards),
    nextRewards: oneMoreRewards,
    ticketDelta: 0,
  };
}

function petMatchesWork(pet, metricKey) {
  if (!pet) return false;
  const tags = Array.isArray(pet.work_behavior_tags) ? pet.work_behavior_tags.map((tag) => String(tag).toUpperCase()) : [];
  const storyline = String(pet.storyline_id || "").toLowerCase();
  if (metricKey === "showing") return storyline.includes("showing") || tags.includes("SHOWING") || tags.includes("CLIENT_MEETING");
  if (metricKey === "development") return storyline.includes("development") || tags.includes("DEVELOPMENT") || tags.includes("CALL_COUNT");
  return false;
}

function targetPetForPilotMission(metricKey) {
  const active = getActivePet();
  if (petMatchesWork(active, metricKey)) return active;
  const ownedPet = PETS.find((pet) => getOwned(pet.pet_id) && petMatchesWork(pet, metricKey));
  if (ownedPet) return ownedPet;
  return PETS.find((pet) => petMatchesWork(pet, metricKey)) || active;
}

function pilotMissionRoute(metricKey, pet) {
  if (metricKey === "showing") return petMatchesWork(pet, "showing") ? "帶看小旅行" : "帶看小旅行";
  if (metricKey === "development") return "開發遠征隊";
  return "本月累積";
}

function pilotMissionRewardText(option) {
  const ticketParts = ticketDeltaParts(option.rewardDelta);
  if (ticketParts.length) return ticketParts.join("、");
  if (Number(option.rewardDelta.exp || 0) > 0) return `經驗 +${rewardCount(option.rewardDelta.exp)}`;
  return option.metricKey === "showing" ? "強化抽進度前進" : "一般抽進度前進";
}

function pilotMissionOption(metricsSource, metricKey) {
  const rewardGap = nextRewardGapForMetric(metricsSource, metricKey);
  const pet = targetPetForPilotMission(metricKey);
  const label = metricKey === "showing" ? "帶看" : "拜訪";
  const route = pilotMissionRoute(metricKey, pet);
  const rewardText = pilotMissionRewardText({ metricKey, rewardDelta: rewardGap.delta });
  const routeVerb = metricKey === "showing" ? "留下導覽軌跡" : "點亮開發路線";
  return {
    key: metricKey,
    label,
    unit: "組",
    gap: Math.max(1, rewardGap.gap),
    pet,
    petName: pet?.name || "主寵",
    route,
    routeVerb,
    rewardText,
    rewardDelta: rewardGap.delta,
    ticketDelta: rewardGap.ticketDelta,
    questKey: metricKey === "showing" ? "boosted" : "activity",
  };
}

function buildPilotMission(metricsSource = state.metrics) {
  const metrics = normalizeGameMetrics(metricsSource);
  const showing = pilotMissionOption(metrics, "showing");
  const development = pilotMissionOption(metrics, "development");
  const selected = development.gap + 1 < showing.gap ? development : showing;
  const isShowing = selected.key === "showing";
  return {
    ...selected,
    eyebrow: isShowing ? "試營運主任務" : "次要替代任務",
    title: `再補 ${formatMetricValue(selected.gap)} 組${selected.label}`,
    detail: `${selected.route}／${selected.petName}會${selected.routeVerb}，預計推進：${selected.rewardText}。`,
    buttonLabel: `去補${selected.label}`,
    focusSelector: `[data-quest="${selected.questKey}"]`,
  };
}

function buildPilotMissionCard(metricsSource = state.metrics, options = {}) {
  const mission = buildPilotMission(metricsSource);
  const compact = Boolean(options.compact);
  return `
    <article class="pilot-mission-card ${compact ? "is-compact" : ""}" data-pilot-mission-card="1">
      <span>${escapeHtml(mission.eyebrow)}</span>
      <strong>${escapeHtml(mission.title)}</strong>
      <p>${escapeHtml(mission.detail)}</p>
      <button class="primary-button" type="button" data-pilot-mission="${escapeHtml(mission.key)}">${escapeHtml(mission.buttonLabel)}</button>
    </article>
  `;
}

const POOL_QUEST_KEY = {
  general: "activity",
  visit: "boosted",
  showing: "showing",
  result: "result",
  contract: "contract",
};

function questProgressState(quest) {
  if (!quest) {
    return {
      key: "activity",
      current: 0,
      target: 1,
      gap: 1,
      percent: 0,
      actionText: "補 1 組拜訪",
      unlockText: "補 1 組拜訪就能推進抽卡",
      label: "差 1 組拜訪",
    };
  }
  const current = normalizeMetricValue(quest.current || 0);
  const target = Math.max(1, normalizeMetricValue(quest.target || 1));
  const gap = Math.max(0, normalizeMetricValue(target - current));
  const percent = progressPercent(Math.min(current, target), target);
  const action = questActionCue(quest).action;
  const unlockText = gap > 0 ? `${action} → ${quest.reward}` : quest.message;
  return {
    key: quest.key,
    current,
    target,
    gap,
    percent,
    actionText: action,
    unlockText,
    label: gap > 0 ? `差 ${formatMetricValue(gap)} ${action.replace(/^補\s*/, "").replace(/^1\s*/, "")}` : "可推進",
  };
}

function nextQuestForPool(poolKey, metrics = state.metrics) {
  const questKey = POOL_QUEST_KEY[poolKey] || "activity";
  return buildDailyQuests(metrics).find((quest) => quest.key === questKey) || null;
}

function nextTicketProgress(poolKey = "general", metrics = state.metrics) {
  const quest = nextQuestForPool(poolKey, metrics);
  return questProgressState(quest);
}

function nextBestTicketProgress(metrics = state.metrics) {
  const quests = buildDailyQuests(metrics)
    .filter((quest) => !quest.done)
    .map(questProgressState)
    .sort((left, right) => left.gap - right.gap || right.percent - left.percent);
  return quests[0] || questProgressState(buildDailyQuests(metrics)[0]);
}

function rewardTicketTotal(rewards = {}) {
  return Number(rewards.general || 0) + Number(rewards.visit || rewards.boosted || 0) + Number(rewards.showing || 0) + Number(rewards.result || 0) + Number(rewards.contract || rewards.blessing || 0);
}

function buildDrawEfficiencyOptions(metricsSource = state.metrics) {
  const metrics = normalizeGameMetrics(metricsSource);
  const baseRewards = calculateRewards(metrics, getActivePet(), false);
  const baseTicketTotal = rewardTicketTotal(baseRewards);
  return [
    { key: "development", label: "拜訪", action: "多 1 組拜訪", poolKey: "general" },
    { key: "showing", label: "帶看", action: "多 1 組帶看", poolKey: "showing" },
  ].map((option) => {
    const nextMetrics = { ...metrics, [option.key]: normalizeMetricValue(metrics[option.key] || 0) + 1 };
    const nextRewards = calculateRewards(nextMetrics, getActivePet(), false);
    const ticketDelta = Math.max(0, rewardTicketTotal(nextRewards) - baseTicketTotal);
    const expDelta = Math.max(0, Number(nextRewards.exp || 0) - Number(baseRewards.exp || 0));
    const progress = nextTicketProgress(option.poolKey, metrics);
    const score = ticketDelta * 100 + expDelta + Number(progress.percent || 0) / 10;
    const resultText = ticketDelta > 0
      ? `補上報表後 +${ticketDelta} 抽`
      : option.key === "showing"
        ? `帶看推高價值池，經驗 +${expDelta}`
        : `拜訪推一般券，經驗 +${expDelta}`;
    return {
      ...option,
      ticketDelta,
      expDelta,
      progress,
      score,
      resultText,
    };
  }).sort((left, right) => right.score - left.score);
}

function buildDrawEfficiencyCard(metricsSource = state.metrics) {
  const options = buildDrawEfficiencyOptions(metricsSource);
  const best = options[0];
  if (!best) return "";
  const second = options[1];
  const tie = second && best.ticketDelta === second.ticketDelta && best.expDelta === second.expDelta;
  const headline = tie
    ? "拜訪、帶看都能推抽卡"
    : `${best.action}最有效`;
  const detail = best.ticketDelta > 0
    ? `${best.resultText}，經驗 +${best.expDelta}。`
    : `${best.resultText}；${second?.label || "另一項"}也能補抽卡進度。`;
  return `
    <article class="home-efficiency-card">
      <span>想多抽，先看效率</span>
      <strong>${escapeHtml(headline)}</strong>
      <p>${escapeHtml(detail)}</p>
      <div class="home-efficiency-options">
        ${options.map((option, index) => `
          <b class="${index === 0 ? "is-best" : ""}">
            ${escapeHtml(option.label)}
            <small>${escapeHtml(option.ticketDelta > 0 ? `+${option.ticketDelta}抽` : `+${option.expDelta}經驗`)}</small>
          </b>
        `).join("")}
      </div>
    </article>
  `;
}

function monthEndDaysLeft(date = new Date()) {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Math.max(1, daysInMonth - date.getDate() + 1);
}

function readHomeOpeningState() {
  if (homeOpeningStateCache) return homeOpeningStateCache;
  const today = todayKey();
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem(HOME_OPENING_STORAGE_KEY) || "{}") || {};
  } catch {
    stored = {};
  }
  const lastDate = String(stored.lastOpenDate || "");
  const previousDate = previousDateKey(today);
  const streak = lastDate === today
    ? Math.max(1, Number(stored.openStreak || 1))
    : lastDate === previousDate
      ? Math.max(1, Number(stored.openStreak || 0) + 1)
      : 1;
  const firstOpenToday = lastDate !== today;
  if (firstOpenToday) {
    try {
      localStorage.setItem(HOME_OPENING_STORAGE_KEY, JSON.stringify({ lastOpenDate: today, openStreak: streak }));
    } catch {
      // localStorage is a visual-only enhancement; ignore privacy mode failures.
    }
  }
  homeOpeningStateCache = {
    firstOpenToday,
    openStreak: streak,
    tone: streak >= 14 ? "legend" : streak >= 7 ? "hot" : streak >= 3 ? "warm" : "soft",
  };
  return homeOpeningStateCache;
}

function yesterdaySettlementCue() {
  const yesterday = previousDateKey(todayKey());
  const settlement = state.dailySettlements?.[yesterday];
  if (!settlement?.awarded) return "";
  const metrics = normalizeGameMetrics(settlement.deltaMetrics || settlement.metrics || {});
  const parts = [
    ["拜訪", metrics.development],
    ["帶看", metrics.showing],
    ["回報", metrics.negotiation],
    ["委託", metrics.listing],
    ["成件", metrics.contract],
  ]
    .filter(([, value]) => normalizeMetricValue(value) > 0)
    .map(([label, value]) => `${label} +${formatMetricValue(value)}`);
  return parts.length ? `昨天成果已入帳：${parts.slice(0, 3).join("、")}` : "昨天的成果已入帳，今天可以接著推進。";
}

function homeOpeningGreetingMarkup() {
  const opening = readHomeOpeningState();
  if (!opening.firstOpenToday) return "";
  const streakText = opening.openStreak >= 3 ? `連續開啟 ${opening.openStreak} 天，火種還在。` : "今天先補一件最短任務。";
  const settlementCue = yesterdaySettlementCue();
  return `
    <div class="home-greeting-card is-${escapeHtml(opening.tone)}" aria-live="polite">
      <strong>${escapeHtml(getActivePet()?.name || "你的夥伴")}回來了</strong>
      <span>${escapeHtml(settlementCue || streakText)}</span>
    </div>
  `;
}

function petTalkLine() {
  const pet = getActivePet();
  const progress = nextBestTicketProgress(state.metrics);
  const lines = [
    "今天也一起把一個缺口補起來。",
    "我在這裡，等你把行程變成抽卡。",
    "先做最短的一步，獎勵就會亮。",
    "成果不是報表，是我的進化素材。",
    "把今天的拜訪補上，我就更接近升級。",
    "你多跑一組，我就多亮一格。",
    "今天先不用想太多，先推一個最接近的獎勵。",
  ];
  if (progress?.gap > 0) {
    lines.push(`${progress.label}，抽卡入口就會亮。`);
    lines.push(`${progress.unlockText}，我會記住這次推進。`);
  }
  return lines[Math.floor(Math.random() * lines.length)] || `${pet?.name || "夥伴"}準備好了。`;
}

function showPetTalk() {
  const petButton = document.querySelector("[data-pet-talk='1']");
  const bubble = document.getElementById("petTalkBubble");
  if (!petButton || !bubble) return;
  window.clearTimeout(petTalkTimer);
  petButton.classList.remove("is-talking");
  bubble.hidden = false;
  bubble.textContent = petTalkLine();
  requestAnimationFrame(() => petButton.classList.add("is-talking"));
  petTalkTimer = window.setTimeout(() => {
    bubble.hidden = true;
    petButton.classList.remove("is-talking");
  }, 3000);
}

function switchToView(view, options = {}) {
  if (view !== "gacha") pinnedDrawPoolKey = "";
  document.querySelectorAll(".tab-button").forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));
  const panelId = `view-${view}`;
  const panel = document.getElementById(panelId);
  if (!panel) return false;
  document.querySelectorAll(".view-panel").forEach((item) => item.classList.toggle("is-active", item.id === panelId));
  if (view === "collection") renderCollection();
  if (options.scroll !== false && typeof panel.scrollIntoView === "function") {
    panel.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  return true;
}

function progressRingMarkup(progress, options = {}) {
  const percent = Math.max(0, Math.min(100, Number(progress?.percent || 0)));
  const radius = 39;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;
  const label = options.label || progress?.label || "快解鎖";
  const sublabel = options.sublabel || `${Math.round(percent)}%`;
  return `
    <div class="progress-ring ${percent >= 100 ? "is-complete" : ""}" style="--ring-percent:${percent}">
      <svg viewBox="0 0 96 96" role="img" aria-label="${escapeHtml(label)}">
        <circle class="progress-ring-track" cx="48" cy="48" r="${radius}"></circle>
        <circle class="progress-ring-fill" cx="48" cy="48" r="${radius}" stroke-dasharray="${dash} ${circumference - dash}"></circle>
      </svg>
      <span>${escapeHtml(label)}</span>
      <small>${escapeHtml(sublabel)}</small>
    </div>
  `;
}

function actionableDailyQuest(metrics = state.metrics, options = {}) {
  const allowZeroReward = Boolean(options.allowZeroReward);
  return buildDailyQuests(metrics)
    .filter((item) => !item.done)
    .filter((item) => allowZeroReward || (!String(item.reward || "").includes("+0") && item.key !== "contract"))
    .sort((a, b) => (a.target - a.current) - (b.target - b.current))[0] || null;
}

function buildHomeDecisionCard(deltaMetrics = {}, periodKey = currentPeriodKey()) {
  const priority = buildHomePriorityCard();
  const readyTickets = totalTickets();
  const sprint = buildMonthSprintItems()[0];
  const mission = buildPilotMission(deltaMetrics);
  const shouldDrawFirst = readyTickets > 0;
  const workLabel = shouldDrawFirst ? "去抽卡" : mission.buttonLabel;
  const actionView = shouldDrawFirst ? "gacha" : "today";
  const title = shouldDrawFirst ? `先把 ${readyTickets} 次抽卡用掉` : mission.title;
  const reward = shouldDrawFirst
    ? "新卡、蛋或精華立刻入袋"
    : mission.rewardText
    ? mission.rewardText
    : sprint?.tag === "快完成"
      ? "快完成"
      : "一般券更接近";
  const detail = shouldDrawFirst
    ? `抽完再看下一步；${sprint ? sprint.title : "重複寵物會變成星魂"}。`
    : mission
    ? `${mission.detail} · ${sprint ? `本月主推：${sprint.title}` : "先讓本月有第一個推進感"}`
    : sprint?.detail || "補完再回來抽卡，星魂會更接近。";
  return `
    <article class="home-decision-card summon-tone-${escapeHtml(priority.tone || "growth")}">
      <span>${escapeHtml(periodDisplayName(periodKey))}今天先做這個</span>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(detail)}</p>
      <button class="primary-button" type="button" ${shouldDrawFirst ? `data-view="${escapeHtml(actionView)}"` : `data-pilot-mission="${escapeHtml(mission.key)}"`}>${escapeHtml(shouldDrawFirst ? workLabel : mission.buttonLabel)}</button>
    </article>
  `;
}

function buildHomeChallengeCard(deltaMetrics = {}, priority = buildHomePriorityCard()) {
  const quests = buildDailyQuests(deltaMetrics);
  const nextQuest = quests
    .filter((quest) => !quest.done)
    .sort((a, b) => (a.target - a.current) - (b.target - b.current))[0];
  const streak = nextStreakRewardPreview();
  const title = nextQuest ? nextQuest.title : "連續推進";
  const detail = nextQuest
    ? nextQuest.message
    : `再 ${streak.remaining} 天開 ${streak.title}`;
  const reward = nextQuest ? nextQuest.reward : streak.rewardText;
  return `
    <article class="home-challenge-card summon-tone-${escapeHtml(priority.tone)}">
      <span>今日最短挑戰</span>
      <strong>${escapeHtml(detail)}</strong>
      <p>${escapeHtml(title)} · ${escapeHtml(reward || "完成後會讓養成更接近下一階段")}</p>
    </article>
  `;
}

function monthSprintWorkCue(pet) {
  const tags = Array.isArray(pet?.work_behavior_tags) ? pet.work_behavior_tags : [];
  const storyline = String(pet?.storyline_id || "");
  if (tags.includes("contract") || storyline.includes("contract")) return "今天再補成件或簽約成果，成交神殿會更接近。";
  if (tags.includes("listing") || storyline.includes("listing")) return "今天再補 1 件委託，覺醒素材會更接近。";
  if (tags.includes("showing") || storyline.includes("showing")) return "今天再補帶看或見面談，牠的路線會更快推進。";
  if (tags.includes("call") || storyline.includes("call")) return "今天再補電話或回報，信號素材會更接近。";
  return "今天再補拜訪或開發，星魂會更接近。";
}

function buildMonthSprintItems() {
  const items = [];
  PETS.forEach((pet) => {
    const owned = getOwned(pet.pet_id);
    if (!owned) return;
    const nextCost = owned.star < 5 ? starCost(owned.star + 1) : 0;
    const fragmentGap = owned.star < 5 ? Math.max(0, nextCost - owned.duplicate_fragments) : Infinity;
    const workCue = monthSprintWorkCue(pet);
    if (owned.star < 5 && fragmentGap <= 0) {
      items.push({
        score: 120,
        tag: "快完成",
        title: `${pet.name} 可升 ${owned.star + 1} 星`,
        detail: `星魂已滿，先升星，${workCue}`,
      });
    } else if (owned.star < 5 && fragmentGap <= 12) {
      items.push({
        score: 90 - fragmentGap,
        tag: fragmentGap <= 3 ? "快完成" : "今天可推",
        title: `${pet.name} 差 ${fragmentGap} 片升 ${owned.star + 1} 星`,
        detail: workCue,
      });
    }
    if (canAwaken(pet, owned)) {
      items.push({
        score: 115,
        tag: "快完成",
        title: `${pet.name} 可覺醒`,
        detail: "成果素材已到位，先把成果變成戰力。",
      });
      return;
    }
    if (!owned.awakened && pet.available_forms?.includes("覺醒型")) {
      const missing = missingMaterials(pet.required_awaken_materials || {});
      const missingTotal = missing.reduce((sum, item) => sum + item.missing, 0);
      if (missingTotal > 0 && missingTotal <= 2) {
        const first = missing[0];
        items.push({
          score: 84 - missingTotal,
          tag: missingTotal === 1 ? "快完成" : "今天可推",
          title: `${pet.name} 差 ${first.label} ${first.missing} 個覺醒`,
          detail: workCue,
        });
      } else if (!missing.length && owned.star < 5) {
        items.push({
          score: 72,
          tag: "今天可推",
          title: `${pet.name} 素材已足，先補星魂`,
          detail: `升到 5 星就能覺醒；${workCue}`,
        });
      }
    }
  });
  if (totalTickets() > 0) {
    items.push({
      score: 70,
      tag: "今天可推",
      title: `手上還有 ${totalTickets()} 次抽卡`,
      detail: "先抽掉，重複寵物也會變成星魂。",
    });
  }
  return items
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}

function buildHomeMonthSprintCard() {
  const items = buildMonthSprintItems();
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);
  const title = daysLeft <= 7 ? "月底前最值得衝" : "本月最值得衝";
  if (!items.length) return "";
  const [primary, ...secondary] = items;
  return `
    <article class="home-sprint-card">
      <div class="home-panel-head">
        <strong>${escapeHtml(title)}</strong>
        <span>剩 ${daysLeft} 天</span>
      </div>
      <div class="home-sprint-primary">
        <span>${escapeHtml(primary.tag || "主推")}</span>
        <strong>${escapeHtml(primary.title)}</strong>
        <p>${escapeHtml(primary.detail)}</p>
      </div>
      <div class="home-sprint-list">
        ${secondary.map((item, index) => `
          <div class="home-sprint-item">
            <b>${escapeHtml(item.tag || String(index + 2))}</b>
            <div>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.detail)}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function buildHomeOpeningStepCard(deltaMetrics = {}) {
  const progress = state.progress || buildProgressSnapshot(state.metrics);
  const period = progress.period || currentPeriodKey();
  const food = spiritFoodTotal(progress.sourceMetrics || state.metrics || {});
  const isEarlyMonth = new Date().getDate() <= 7 || food <= 3;
  if (!isEarlyMonth) return "";
  const quest = buildDailyQuests(deltaMetrics)
    .filter((item) => !item.done && item.key !== "contract" && !String(item.reward || "").includes("+0"))
    .sort((a, b) => (a.target - a.current) - (b.target - b.current))[0];
  const text = quest?.message || "今天先補 1 組拜訪，讓本月進度亮起。";
  const reward = quest?.reward || "一般券更接近";
  return `
    <article class="home-opening-step-card">
      <span>${escapeHtml(periodDisplayName(period))}開局第一步</span>
      <strong>${escapeHtml(text)}</strong>
      <p>${escapeHtml(reward)} · 先讓新月份有第一個推進感。</p>
    </article>
  `;
}

function previousPeriodKey(periodKey = currentPeriodKey()) {
  const match = String(periodKey || "").match(/^(\d{4})-(\d{2})$/);
  if (!match) return "";
  const date = new Date(Number(match[1]), Number(match[2]) - 2, 1);
  return currentPeriodKey(date);
}

function persistentGrowthSummary() {
  const pet = getActivePet();
  const owned = pet ? getOwned(pet.pet_id) : null;
  const materialCount = Object.values(state.materials || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  if (!pet || !owned) return `寵物、星魂、蛋、精華會保留；目前素材 ${materialCount} 個。`;
  return `${pet.name} Lv.${owned.level || 1}、${owned.star || 1} 星、星魂 ${owned.duplicate_fragments || 0}、蛋與精華都保留。`;
}

function buildHomeMonthResetCard(metricsSource = {}, periodKey = currentPeriodKey()) {
  const metrics = normalizeGameMetrics(metricsSource);
  const food = spiritFoodTotal(metrics);
  const previousPeriod = previousPeriodKey(periodKey);
  const ledger = normalizeSourceLedger(state.sourceLedger);
  const hadPreviousPeriod = Boolean(previousPeriod && ledger.periods?.[previousPeriod]);
  const isEarlyMonth = new Date().getDate() <= 7;
  if (!hadPreviousPeriod && !isEarlyMonth && food > 3) return "";
  const lead = food <= 3 ? `${periodDisplayName(periodKey)}剛開始累積` : `${periodDisplayName(periodKey)}持續累積中`;
  return `
    <section class="home-month-reset-card">
      <strong>${escapeHtml(lead)}</strong>
      <span>${escapeHtml(persistentGrowthSummary())}</span>
    </section>
  `;
}

function buildHomeHelpDrawer(metricsSource = {}) {
  const metrics = normalizeGameMetrics(metricsSource);
  return `
    <details class="home-help-drawer">
      <summary><span class="home-help-plus">＋</span><strong>玩法說明</strong><span>展開看細節</span></summary>
      <div class="home-help-content">
        ${buildSpiritFoodSectionCard("行程狀況", SPIRIT_FOOD_ACTIVITY_ITEMS, metrics, "activity")}
        ${buildSpiritFoodSectionCard("成果狀況", SPIRIT_FOOD_RESULT_ITEMS, metrics, "result")}
        ${buildHomeActionStrip()}
      </div>
    </details>
  `;
}

function buildHomeHeroPanel(metricsSource = {}, periodKey = currentPeriodKey(), priority = buildHomePriorityCard()) {
  const metrics = normalizeGameMetrics(metricsSource);
  const pet = getActivePet();
  const owned = getOwned(pet.pet_id);
  const tickets = totalTickets();
  const freeDraws = remainingDailyFreeDraws();
  const opening = readHomeOpeningState();
  const daysLeft = monthEndDaysLeft();
  const drawLabel = tickets > 0 ? `去抽卡 ${tickets} 次` : "看怎麼解鎖抽卡";
  const drawProgress = tickets > 0
    ? { percent: 100, label: `可抽 ${tickets} 次`, unlockText: "先把抽卡機會用掉" }
    : nextBestTicketProgress(state.metrics);
  const nextLevelGoal = buildActivePetGrowthGoals(pet, owned).find((goal) => goal.title === "下一級");
  const petGrowthCue = nextLevelGoal?.detail || "行程養等級，成果推覺醒";
  const petLevel = Number(owned?.level || 1);
  const petExp = Math.max(0, Number(owned?.exp || 0));
  const petExpNeed = expNeeded(petLevel);
  const petExpPercent = progressPercent(Math.min(petExp, petExpNeed), petExpNeed);
  const petHeroClass = owned?.awakened || pet?.rarity === "SSR" || pet?.rarity === "UR" ? " is-rare" : "";
  const petStarCue = homePetStarCue(pet, owned);
  const petDrawCue = homePetDrawCue(metrics);
  const nextQuest = actionableDailyQuest(state.metrics) || actionableDailyQuest(state.metrics, { allowZeroReward: true });
  const zeroDrawCue = `${questActionLabel(nextQuest)}，抽卡入口就會亮。`;
  const nextDrawCue = tickets > 0
    ? priority.detail || priority.title || "再補一點行程或成果，抽卡入口就會亮起"
    : zeroDrawCue;
  const drawButtonAttr = tickets > 0 ? 'data-view="gacha"' : 'data-pilot-mission="home"';
  const foodTotal = spiritFoodTotal(metrics);
  const foodText = foodTotal > 0 ? formatMetricValue(foodTotal) : "待啟動";
  return `
    <section class="home-hero-panel">
      <div class="home-hero-copy">
        <span class="summon-kicker">房仲精靈</span>
        <strong>歡迎 ${escapeHtml(PROFILE.agent)} 回來，養成專區</strong>
        <div class="home-hero-pills">
          <span class="home-streak-badge is-${escapeHtml(opening.tone)}">🔥${opening.openStreak}</span>
          <span class="home-month-left ${daysLeft <= 5 ? "is-hot" : ""}">本月剩 ${daysLeft} 天</span>
        </div>
        <div class="home-food-count">
          <span>${escapeHtml(periodDisplayName(periodKey))}精靈食糧</span>
          <b>${escapeHtml(foodText)}</b>
        </div>
      </div>
      ${buildHomeStatusBoard(metrics)}
      <button class="home-pet-window${petHeroClass}" type="button" data-pet-talk="1" aria-label="和目前主寵互動">
        ${petVisual(pet, owned, "large")}
        <span>${escapeHtml(pet.name)} · Lv.${owned?.level || 1}</span>
        <div class="home-pet-exp" aria-label="主寵經驗 ${petExp}/${petExpNeed}">
          <i style="width:${petExpPercent}%"></i>
        </div>
        <small>${escapeHtml(petGrowthCue)}</small>
        <div class="home-pet-cues">
          <b>${escapeHtml(petStarCue)}</b>
          <small>${escapeHtml(petDrawCue)}</small>
        </div>
        <em id="petTalkBubble" class="pet-talk-bubble" hidden></em>
      </button>
      <button class="text-button home-change-pet" type="button" data-view="collection">更換夥伴</button>
      ${homeOpeningGreetingMarkup()}
      <div class="home-draw-now">
        <button class="secondary-button home-draw-button" type="button" ${drawButtonAttr}>${drawLabel}</button>
      </div>
      <div class="home-draw-cues">
        ${buildPilotMissionCard(metrics, { compact: true })}
        <p class="home-next-cue">${escapeHtml(tickets > 0 ? nextDrawCue : drawProgress.unlockText)}</p>
      </div>
    </section>
  `;
}

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
  if (!raw) {
    const hostname = typeof location === "object" ? String(location.hostname || "").toLowerCase() : "";
    const protocol = typeof location === "object" ? String(location.protocol || "") : "";
    // Opening index.html directly is a supported manager test path. Use the same
    // player state as the public site instead of reviving stale browser-only data.
    return hostname === "goah1942-code.github.io" || protocol === "file:"
      ? PRODUCTION_CLOUD_API_BASE_URL
      : "";
  }
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
  clearStoredDrawSession();
}

function readStoredDrawSessionId() {
  try {
    return String(sessionStorage.getItem(DRAW_SESSION_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

function storeDrawSessionId(sessionId) {
  try {
    if (sessionId) sessionStorage.setItem(DRAW_SESSION_STORAGE_KEY, String(sessionId));
    else sessionStorage.removeItem(DRAW_SESSION_STORAGE_KEY);
  } catch {
    // Browser storage is only a convenience. The server remains the authority.
  }
}

function clearStoredDrawSession() {
  storeDrawSessionId("");
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

function formatMetricValueForItem(value, item = {}) {
  const number = normalizeMetricValue(value);
  if (Number.isInteger(number) && Number(item.decimals || 0) > 0) return number.toFixed(Number(item.decimals));
  return formatMetricValue(number);
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

function normalizeProgressBasis(rawMetrics = {}) {
  const basis = rawMetrics.__basis || rawMetrics.event_basis || rawMetrics.eventBasis || rawMetrics.basis || {};
  return isPlainObject(basis) ? basis : {};
}

function basisMetricNumber(basis, keys = []) {
  const source = isPlainObject(basis) ? basis : {};
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
      return normalizeMetricValue(source[key]);
    }
  }
  return 0;
}

function basisMetricOrFallback(basis, keys = [], fallback = 0) {
  const source = isPlainObject(basis) ? basis : {};
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
      return normalizeMetricValue(source[key]);
    }
  }
  return normalizeMetricValue(fallback);
}

function preciseMetricOrFallback(source, keys = [], fallback = 0) {
  const data = isPlainObject(source) ? source : {};
  for (const key of keys) {
    if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
      const value = Number(data[key]);
      return Number.isFinite(value) ? Math.max(0, value) : 0;
    }
  }
  const value = Number(fallback);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function buildMonthlyBaseTargets({ basis = {}, groups = {}, source = {} } = {}) {
  const cloudProgress = isPlainObject(basis.monthly_base_progress) ? basis.monthly_base_progress : {};
  const values = {
    development: basisMetricOrFallback(cloudProgress, ["development_valid"], basisMetricOrFallback(basis, ["development_seen_groups", "development_valid"], groups.development?.effective || source.development)),
    showing: basisMetricOrFallback(cloudProgress, ["showing_groups"], basisMetricOrFallback(basis, ["showing_groups", "showing_group_valid"], source.showing)),
    listing: basisMetricOrFallback(cloudProgress, ["listing_count"], source.listing),
    contract: preciseMetricOrFallback(cloudProgress, ["contract_count"], source.contract),
  };
  return Object.entries(MONTHLY_BASE_TARGETS).map(([key, config]) => ({
    key,
    ...config,
    current: key === "contract" ? values[key] : normalizeMetricValue(values[key]),
    done: Number(values[key] || 0) >= config.target,
  }));
}

function buildFourPlusProgress({ basis = {}, mainEffective = 0, mainTotal = 0 } = {}) {
  const target = basisMetricNumber(basis, ["e_daily_target", "daily_target", "four_plus_target"]) || 4;
  const validDays = basisMetricNumber(basis, ["valid_days", "effective_days", "active_days", "report_days", "work_days"]);
  const allDailyAverage = basisMetricNumber(basis, ["e_total_daily_average", "e_all_daily_average", "e_daily_average", "e_daily_avg", "daily_e_average"]);
  const effectiveDailyAverage = basisMetricNumber(basis, ["e_valid_daily_average", "e_effective_daily_average"]);
  const allTotal = basisMetricNumber(basis, ["e_total", "e_total_group", "e_all_total", "e_daily_total"]);
  const effectiveTotal = basisMetricNumber(basis, ["e_valid", "e_daily_numerator"]);
  const current = allDailyAverage || (validDays > 0
    ? normalizeMetricValue((allTotal || mainTotal) / validDays)
    : allTotal || mainTotal);
  const effectiveCurrent = effectiveDailyAverage || (validDays > 0
    ? normalizeMetricValue((effectiveTotal || mainEffective) / validDays)
    : effectiveTotal || mainEffective);
  return {
    label: "日均行程（全部）",
    current,
    target,
    effectiveCurrent,
    extra: Math.max(0, normalizeMetricValue(current - target)),
    gap: Math.max(0, normalizeMetricValue(target - current)),
    validDays,
    sourceTotal: allTotal || mainTotal,
    effectiveSourceTotal: effectiveTotal || mainEffective,
    dailyAverage: Boolean(allDailyAverage || validDays > 0),
    done: current >= target,
  };
}

function buildProgressSnapshot(rawMetrics = state?.metrics || {}, sourceMetrics = normalizeGameMetrics(rawMetrics), deltaMetrics = normalizeGameMetrics(rawMetrics)) {
  const source = normalizeGameMetrics(sourceMetrics);
  const delta = normalizeGameMetrics(deltaMetrics);
  const groups = normalizeReportGroups(rawMetrics, source);
  const basis = normalizeProgressBasis(rawMetrics);
  const mainKeys = ["area", "development", "negotiation", "showing"];
  const highValueKeys = ["development", "negotiation", "showing"];
  const mainEffective = sumGroups(groups, mainKeys, "effective");
  const mainTotal = sumGroups(groups, mainKeys, "total");
  const highValueEffective = sumGroups(groups, highValueKeys, "effective");
  const monthlyMissionCurrent = normalizeMetricValue(groups.development.effective + groups.showing.total);
  const contractTempleCurrent = normalizeMetricValue(source.listing + source.meeting + source.contract);
  const monthlyBaseTargets = buildMonthlyBaseTargets({ basis, groups, source });
  return {
    period: reportPeriodKeyFromMetrics(rawMetrics),
    updatedAt: new Date().toISOString(),
    sourceMetrics: source,
    deltaMetrics: delta,
    groups,
    basis,
    main: {
      label: "行程合計（社區服務＋拜訪＋回報＋帶看）",
      effective: mainEffective,
      total: mainTotal,
      dreamTarget: 6,
      dreamDone: mainTotal >= 6,
    },
    fourPlus: buildFourPlusProgress({ basis, mainEffective, mainTotal }),
    highValue: {
      label: "高價值行為（拜訪＋回報＋帶看）",
      current: highValueEffective,
      target: 4,
      done: highValueEffective > 4,
    },
    phoneSignal: {
      label: "電話信號",
      calls: source.calls,
      note: "電話越多越好，作為信號加成，不蓋過拜訪、回報、銷售有效組數。",
    },
    monthlyMission: {
      label: "月任務：雙量行為 開發＋帶看",
      current: monthlyMissionCurrent,
      target: 20,
      done: monthlyMissionCurrent >= 20,
    },
    monthlyBaseTargets,
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
  const basis = normalizeProgressBasis(progress);
  return {
    ...buildProgressSnapshot({ ...(progress.sourceMetrics || sourceMetrics), __basis: basis }, progress.sourceMetrics || sourceMetrics, progress.deltaMetrics || sourceMetrics),
    ...progress,
    basis,
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
    const sessionKey = cleanProfileText(sessionStorage.getItem(CLOUD_MANAGER_KEY_STORAGE) || "", "", 160);
    const savedKey = cleanProfileText(localStorage.getItem(CLOUD_MANAGER_KEY_STORAGE) || "", "", 160);
    if (sessionKey && !savedKey) localStorage.setItem(CLOUD_MANAGER_KEY_STORAGE, sessionKey);
    return sessionKey || savedKey;
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
    if (key) {
      sessionStorage.setItem(CLOUD_MANAGER_KEY_STORAGE, key);
      localStorage.setItem(CLOUD_MANAGER_KEY_STORAGE, key);
    } else {
      sessionStorage.removeItem(CLOUD_MANAGER_KEY_STORAGE);
      localStorage.removeItem(CLOUD_MANAGER_KEY_STORAGE);
    }
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
    tickets: { general: 3, visit: 0, showing: 0, result: 0, contract: 0 },
    drawStats: {
      earned: { general: 3, visit: 0, showing: 0, result: 0, contract: 0 },
      drawn: { general: 0, visit: 0, showing: 0, result: 0, contract: 0 },
      trackingStartedAt: "local",
    },
    drawPoints: { report_points: 0, daily_free: 3, bonus_draw: 0, visit: 0, showing: 0, result: 0, contract: 0 },
    guaranteedDraws: { development: 0, showing: 0, listing: 0, contract: 0 },
    contractGuaranteeBatches: [],
    drawSession: { session_id: "", entries: [] },
    lastCloudResetAt: "",
    drawPity: {},
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
    eggs: {},
    essences: {},
    specialResources: {
      templeBlessing: 0,
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
      selectedImportFile: "",
      dashboardPeriod: currentPeriodKey(),
      testResetBusy: false,
      testResetStatus: "",
      testResetTone: "",
      testMetricsBusy: false,
      testMetricsStatus: "",
      testMetricsTone: "",
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
      visit: 0,
      showing: 0,
      result: 0,
      contract: 0,
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

function normalizeTicketBalances(tickets = {}, fallback = {}) {
  const source = isPlainObject(tickets) ? tickets : {};
  const base = isPlainObject(fallback) ? fallback : {};
  return {
    general: Math.max(0, Number(source.general ?? base.general ?? 0)),
    visit: Math.max(0, Number(source.visit ?? source.boosted ?? base.visit ?? 0)),
    showing: Math.max(0, Number(source.showing ?? base.showing ?? 0)),
    result: Math.max(0, Number(source.result ?? base.result ?? 0)),
    contract: Math.max(0, Number(source.contract ?? source.blessing ?? base.contract ?? 0)),
  };
}

function emptyDrawStats() {
  return {
    earned: { general: 0, visit: 0, showing: 0, result: 0, contract: 0 },
    drawn: { general: 0, visit: 0, showing: 0, result: 0, contract: 0 },
    trackingStartedAt: "",
  };
}

function normalizeDrawStats(drawStats = {}, ticketFallback = {}) {
  const source = isPlainObject(drawStats) ? drawStats : {};
  const fallback = normalizeTicketBalances(ticketFallback);
  const hasTracking = Boolean(source.tracking_started_at || source.trackingStartedAt);
  return {
    earned: normalizeTicketBalances(source.earned, hasTracking ? {} : fallback),
    drawn: normalizeTicketBalances(source.drawn),
    trackingStartedAt: source.tracking_started_at || source.trackingStartedAt || "",
  };
}

function recordDrawStats(type, poolKey, amount = 1) {
  if (!POOLS.some((pool) => pool.key === poolKey)) return;
  state.drawStats = normalizeDrawStats(state.drawStats, state.tickets);
  state.drawStats[type][poolKey] = Math.max(0, Number(state.drawStats[type][poolKey] || 0) + Number(amount || 0));
  if (!state.drawStats.trackingStartedAt) state.drawStats.trackingStartedAt = new Date().toISOString();
}

function normalizeDrawPity(drawPity = {}) {
  const source = isPlainObject(drawPity) ? drawPity : {};
  return Object.fromEntries(Object.keys(INTERNAL_PET_PITY_RULES).map((poolKey) => {
    const entry = isPlainObject(source[poolKey]) ? source[poolKey] : {};
    return [poolKey, { sincePet: rewardCount(entry.sincePet || 0) }];
  }));
}

function normalizeImportedState(importedState) {
  const initial = createInitialState();
  const source = isPlainObject(importedState) ? importedState : {};
  return {
    ...initial,
    ...source,
    tickets: normalizeTicketBalances(source.tickets, initial.tickets),
    drawStats: normalizeDrawStats(source.drawStats, source.tickets || initial.tickets),
    drawPoints: mergeObject(initial.drawPoints, source.drawPoints),
    guaranteedDraws: mergeObject(initial.guaranteedDraws, source.guaranteedDraws),
    contractGuaranteeBatches: Array.isArray(source.contractGuaranteeBatches) ? source.contractGuaranteeBatches.map((item) => ({ ...item })) : [],
    drawSession: isPlainObject(source.drawSession) ? { ...source.drawSession, entries: Array.isArray(source.drawSession.entries) ? source.drawSession.entries.map((item) => ({ ...item })) : [] } : { ...initial.drawSession },
    drawPity: normalizeDrawPity(source.drawPity || initial.drawPity),
    materials: mergeObject(initial.materials, source.materials),
    eggs: mergeObject(initial.eggs, source.eggs),
    essences: mergeObject(initial.essences, source.essences),
    specialResources: mergeObject(initial.specialResources, source.specialResources),
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

function applyBackendEmployeeSnapshot(snapshot = {}, options = {}) {
  const metrics = normalizeGameMetrics(snapshot.metrics || snapshot.sourceMetrics || state.metrics);
  const sourceMetrics = normalizeGameMetrics(snapshot.sourceMetrics || metrics);
  const deltaMetrics = normalizeGameMetrics(snapshot.deltaMetrics || metrics);
  state.metrics = deltaMetrics;
  state.progress = buildProgressSnapshot(
    { ...sourceMetrics, __periodKey: snapshot.period || currentPeriodKey(), __groups: snapshot.groups || {}, __basis: snapshot.basis || snapshot.eventBasis || {} },
    sourceMetrics,
    deltaMetrics,
  );
  applyCloudResetMarker(snapshot.lastResetAt);
  if (snapshot.replaceInventory) {
    if (isPlainObject(snapshot.tickets)) state.tickets = normalizeTicketBalances(snapshot.tickets);
    if (isPlainObject(snapshot.drawStats)) state.drawStats = normalizeDrawStats(snapshot.drawStats, state.tickets);
    if (isPlainObject(snapshot.drawPoints)) state.drawPoints = { ...snapshot.drawPoints };
    if (isPlainObject(snapshot.guaranteedDraws)) state.guaranteedDraws = normalizeGuaranteedDraws(snapshot.guaranteedDraws);
    if (isPlainObject(snapshot.materials)) state.materials = { ...snapshot.materials };
    if (isPlainObject(snapshot.eggs)) state.eggs = { ...snapshot.eggs };
    if (isPlainObject(snapshot.essences)) state.essences = { ...snapshot.essences };
    if (isPlainObject(snapshot.specialResources)) state.specialResources = { ...snapshot.specialResources };
    if (isPlainObject(snapshot.collection)) state.collection = { ...snapshot.collection };
  } else {
    if (isPlainObject(snapshot.tickets)) state.tickets = normalizeTicketBalances(snapshot.tickets, state.tickets);
    if (isPlainObject(snapshot.drawStats)) state.drawStats = normalizeDrawStats(snapshot.drawStats, state.tickets);
    if (isPlainObject(snapshot.drawPoints)) state.drawPoints = mergeObject(state.drawPoints, snapshot.drawPoints);
    if (isPlainObject(snapshot.guaranteedDraws)) state.guaranteedDraws = normalizeGuaranteedDraws(snapshot.guaranteedDraws);
    if (isPlainObject(snapshot.materials)) state.materials = mergeObject(state.materials, snapshot.materials);
    if (isPlainObject(snapshot.eggs)) state.eggs = mergeObject(state.eggs, snapshot.eggs);
    if (isPlainObject(snapshot.essences)) state.essences = mergeObject(state.essences, snapshot.essences);
    if (isPlainObject(snapshot.specialResources)) state.specialResources = mergeObject(state.specialResources, snapshot.specialResources);
    if (isPlainObject(snapshot.collection)) state.collection = mergeObject(state.collection, snapshot.collection);
  }
  if (Array.isArray(snapshot.contractGuaranteeBatches)) state.contractGuaranteeBatches = snapshot.contractGuaranteeBatches.map((item) => ({ ...item }));
  if (isPlainObject(snapshot.drawSession)) {
    state.drawSession = { ...snapshot.drawSession, entries: Array.isArray(snapshot.drawSession.entries) ? snapshot.drawSession.entries.map((item) => ({ ...item })) : [] };
    storeDrawSessionId(state.drawSession.session_id || "");
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
  if (options.persist !== false) saveState();
  if (options.render !== false) render();
  return state.progress;
}

function applyCloudResetMarker(lastResetAt) {
  const marker = String(lastResetAt || "");
  if (!marker || marker === state.lastCloudResetAt) return false;
  state.history = [];
  state.lastCloudResetAt = marker;
  return true;
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
      post_five_star_souls_earned: rewardCount(item.post_five_star_souls_earned || 0),
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
  const hasAuthoritativeTickets = isPlainObject(resources.tickets);
  const tickets = hasAuthoritativeTickets ? normalizeTicketBalances(resources.tickets) : {};
  const drawPoints = isPlainObject(resources.draw_points) ? resources.draw_points : {};
  // draw_points records earned progress, not the remaining balance. Only use it
  // for compatibility with old API responses that do not expose tickets at all.
  if (!hasAuthoritativeTickets && Object.keys(drawPoints).length) {
    tickets.general = Number(drawPoints.report_points || 0) + Number(drawPoints.daily_free || 0);
    tickets.visit = Number(drawPoints.visit ?? drawPoints.boosted ?? 0);
    tickets.showing = Number(drawPoints.showing || 0);
    tickets.result = Number(drawPoints.result || 0);
    tickets.contract = Number(drawPoints.contract ?? drawPoints.blessing ?? 0) + Number(drawPoints.bonus_draw || 0);
  }
  return normalizeTicketBalances(tickets);
}

function cloudPlayerStateToSnapshot(data = {}) {
  const resources = isPlainObject(data.resources) ? data.resources : {};
  const collection = isPlainObject(data.collection) ? data.collection : {};
  const ownedCollection = collectionArrayToMap(collection.owned || []);
  const sourceMetrics = normalizePlayerSourceMetrics(data.source_metrics || data.sourceMetrics || {});
  const snapshot = {
    period: data.period || currentPeriodKey(),
    sourceMetrics,
    deltaMetrics: normalizePlayerSourceMetrics(data.latest_delta || data.delta_metrics || data.deltaMetrics || sourceMetrics),
    basis: data.event_basis || data.eventBasis || {},
    drawPoints: isPlainObject(resources.draw_points) ? resources.draw_points : {},
    drawStats: isPlainObject(resources.draw_stats) ? resources.draw_stats : {},
    guaranteedDraws: normalizeGuaranteedDraws(resources.guaranteed_draws || resources.guaranteedDraws),
    contractGuaranteeBatches: Array.isArray(data.contract_guarantee_batches) ? data.contract_guarantee_batches : (Array.isArray(resources.contract_guarantee_batches) ? resources.contract_guarantee_batches : []),
    drawSession: isPlainObject(data.draw_session) ? data.draw_session : (isPlainObject(resources.draw_session) ? resources.draw_session : { session_id: "", entries: [] }),
    tickets: cloudResourcesToTickets(resources),
    materials: resources.materials || {},
    eggs: resources.eggs || {},
    essences: resources.essences || {},
    specialResources: resources.special_resources || resources.specialResources || {},
    lastResetAt: resources.last_reset_at || resources.lastResetAt || "",
    collection: ownedCollection,
    backendConfig: data.backend_config || data.backendConfig || {},
    settlementSummary: data.latestSettlement || data.latest_settlement || data.settlement_summary || data.settlementSummary || data.latest_reward_event || data.reward_summary || data.rewardSummary || null,
    replaceInventory: true,
  };
  if (data.active_pet?.pet_id) snapshot.activePetId = data.active_pet.pet_id;
  return snapshot;
}

function applyCloudPlayerState(data = {}, options = {}) {
  if (isPlainObject(data.player)) {
    PROFILE.branch = cleanProfileText(data.player.branch, PROFILE.branch, 18);
    PROFILE.agent = cleanProfileText(data.player.agent_name || data.player.agent, PROFILE.agent, 18);
    PROFILE.employeeId = cleanEmployeeId(data.player.uid || PROFILE.employeeId);
    PROFILE.userKey = stableProfileKey(PROFILE.employeeId || PROFILE.userKey);
  }
  const snapshot = cloudPlayerStateToSnapshot(data);
  applyBackendEmployeeSnapshot(snapshot, { persist: false, render: false });
  if (snapshot.activePetId && getPet(snapshot.activePetId)) state.activePetId = snapshot.activePetId;
  if (snapshot.settlementSummary) state.latestSettlementSummary = snapshot.settlementSummary;
  state.manager.cloudStatus = CLOUD_API_BASE_URL === "mock" ? "mock-playerState" : "cloud-playerState";
  if (options.persist !== false) saveState();
  preloadPreparedDrawAssets();
  if (options.render !== false) render();
  return true;
}

function applyCloudManagerDashboard(data = {}) {
  const retainedDashboard = state.manager.cloudDashboard;
  if (shouldRetainCommittedFallback(data, retainedDashboard)) {
    state.manager.cloudStatus = "cloud-managerDashboard-awaiting-committed-import";
    saveState();
    render();
    return false;
  }
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

function managerDashboardPeriod() {
  const value = String(state.manager.dashboardPeriod || "").trim();
  return /^\d{4}-\d{2}$/.test(value) ? value : currentPeriodKey();
}

function managerDashboardFromCommittedPreview(preview = {}, commit = {}) {
  const previewRows = Array.isArray(preview.player_previews) ? preview.player_previews : [];
  const period = preview.period || previewRows[0]?.report_period || state.manager.lastImport?.period || currentPeriodKey();
  const confirmedAt = new Date().toISOString();
  const previousPlayers = Array.isArray(state.manager.cloudDashboard?.players) ? state.manager.cloudDashboard.players : [];
  const previousByUid = new Map(previousPlayers.map((row) => [String(row.uid || row.employee_id || ""), row]));
  return {
    ...(isPlainObject(state.manager.cloudDashboard) ? state.manager.cloudDashboard : {}),
    period,
    local_commit_fallback: true,
    latest_import: {
      import_id: commit.import_id || preview.import_id || "",
      status: commit.status || "PUBLISHED",
      uploaded_at: state.manager.cloudDashboard?.latest_import?.uploaded_at || "",
      confirmed_at: confirmedAt,
      warning_count: Array.isArray(preview.warnings) ? preview.warnings.length : 0,
    },
    players: previewRows.map((row) => {
      const uid = cleanProfileText(row.uid || "", "", 24);
      return {
        ...(previousByUid.get(uid) || {}),
        uid,
        agent_name: row.report_name || row.agent_name || row.uid || "同仁",
        report_period: row.report_period || period,
        source_metrics: row.current_source_metrics || row.source_metrics || {},
        delta_metrics_latest: {},
        event_basis: row.event_basis || {},
        updated_at: confirmedAt,
      };
    }),
  };
}

function managerDashboardCanReplaceCommittedFallback(incoming = {}, fallback = {}) {
  const expectedImportId = cleanProfileText(fallback.latest_import?.import_id || "", "", 120);
  const incomingImportId = cleanProfileText(incoming.latest_import?.import_id || "", "", 120);
  if (expectedImportId && incomingImportId !== expectedImportId) return false;

  const expectedPlayers = Array.isArray(fallback.players) ? fallback.players : [];
  const incomingPlayers = Array.isArray(incoming.players) ? incoming.players : [];
  if (incomingPlayers.length < expectedPlayers.length) return false;

  const incomingByUid = new Map(incomingPlayers.map((row) => [String(row.uid || row.employee_id || ""), row]));
  return expectedPlayers.every((expected) => {
    const uid = String(expected.uid || expected.employee_id || "");
    const matched = incomingByUid.get(uid);
    if (!matched) return false;
    const expectedMetrics = expected.source_metrics || expected.sourceMetrics || {};
    const incomingMetrics = matched.source_metrics || matched.sourceMetrics || {};
    return !Object.keys(expectedMetrics).length || Object.keys(incomingMetrics).length > 0;
  });
}

function shouldRetainCommittedFallback(incoming = {}, fallback = {}) {
  if (!fallback?.local_commit_fallback) return false;
  if (managerDashboardCanReplaceCommittedFallback(incoming, fallback)) return false;
  const confirmedAt = Date.parse(String(fallback.latest_import?.confirmed_at || ""));
  if (!Number.isFinite(confirmedAt)) return false;
  return Date.now() - confirmedAt < 2 * 60 * 1000;
}

function cloudEnvelopeData(envelope, action) {
  if (!isPlainObject(envelope) || envelope.ok !== true) return null;
  if (envelope.action && envelope.action !== action) return null;
  return isPlainObject(envelope.data) ? envelope.data : null;
}

function mockCloudEnvelope(action, payload = {}) {
  const period = currentPeriodKey();
  if (action === "playerState") {
    const mockDrawEntries = PETS.filter((pet) => pet.can_be_drawn !== false).slice(0, 6).map((pet, index) => ({
      entry_id: `mock_general_${index + 1}`,
      pool: "general",
      resource_type: "ticket",
      claimed: false,
      outcome: {
        outcome_kind: "pet",
        pet_id: pet.pet_id,
        pet: { ...pet },
      },
    }));
    const mockDrawSession = {
      session_id: "mock_draw_session_v52",
      period,
      entries: mockDrawEntries,
    };
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
        event_basis: { e_daily_numerator: 7, e_valid: 7, e_total: 16, valid_days: 4, bcd_valid: 7, monthly_policy_development_plus_showing: 6 },
        latest_delta: { ...normalizeGameMetrics(SAMPLE_METRICS), calls: 5 },
        latestSettlement: {
          status: "changed",
          message: "本次已入帳：帶看 +1 組。",
          work_delta: { showing_group_valid: 1 },
          rewards_delta: { tickets: { general: 1 } },
        },
        resources: {
          draw_points: { report_points: 8, daily_free: 3, bonus_draw: 0 },
          tickets: { general: 6, visit: 2, showing: 2, result: 3, contract: 0 },
          guaranteed_draws: { development: 1, showing: 0, listing: 0, contract: 0 },
          materials: { development_core: 12, listing_core: 2, meeting_core: 1, showing_core: 1, call_core: 2 },
          eggs: { pet_call_003: 1 },
          essences: { call_essence: 6, development_essence: 3 },
          special_resources: { templeBlessing: 0 },
          draw_session: mockDrawSession,
        },
        draw_session: mockDrawSession,
        reset: { available: true, warning: "重置會清空卡片庫、寵物、星魂、蛋、精華、素材、抽卡紀錄、每日免費抽、月榜第一與加碼，只保留報表重新計算的抽卡點數" },
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
          { uid: "490326", agent_name: "蔡晉豪", event_basis: { valid_days: 4, e_total_daily_average: 4, e_daily_target_met: true, monthly_policy_development_plus_showing: 6, bcd_valid: 7 }, source_metrics: SAMPLE_METRICS, draw_points_balance: 8, tickets: { general: 6, visit: 2, showing: 2, result: 3, contract: 0 }, guaranteed_draws: { development: 1, showing: 0, listing: 0, contract: 0 }, collection_count: 2, latest_settlement_status: "changed", updated_at: new Date().toISOString() },
          { uid: "490101", agent_name: "示範同仁A", event_basis: { valid_days: 5, e_total_daily_average: 3.6, e_daily_target_met: false, monthly_policy_development_plus_showing: 12, bcd_valid: 5 }, source_metrics: { ...SAMPLE_METRICS, listing: 2, contract: 1, showing: 5 }, draw_points_balance: 4, tickets: { general: 4, visit: 1, showing: 5, result: 2, contract: 1 }, guaranteed_draws: { development: 0, showing: 1, listing: 0, contract: 1 }, collection_count: 4, latest_settlement_status: "first_import", updated_at: new Date().toISOString() },
        ],
        manager_test_player: {
          uid: "293127",
          agent_name: "游榮哲",
          source_metrics: {
            a_area_total: { valid: 2, total: 2 },
            b_development_total: { valid: 4, total: 4 },
            c_negotiation_total: { valid: 1, total: 1 },
            d_sales_total: { valid: 2, total: 2 },
            d_showing_group: { valid: 2, total: 2 },
            e_total_group: { valid: 9, total: 9 },
            calls: { valid: 36, total: 36 },
            listing: { valid: 1, total: 1 },
            meeting_or_offer: { valid: 1, total: 1 },
            contract: { valid: 0, total: 0 },
            test_offer: { valid: 1, total: 1 },
            test_performance: { valid: 80, total: 80 },
          },
          event_basis: { e_valid: 9, e_total: 9 },
        },
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
  if (action === "managerTestReset") {
    const scope = payload.scope === "all_players" ? "all_players" : "manager";
    const players = scope === "all_players"
      ? [
        ...mockCloudEnvelope("managerDashboard").data.players,
        { uid: "293127", agent_name: "游榮哲" },
        { uid: "327350", agent_name: "王若馨" },
      ]
      : [{ uid: "293127", agent_name: "游榮哲" }];
    return {
      ok: true,
      action,
      server_time: new Date().toISOString(),
      data: {
        scope,
        period,
        reset_count: players.length,
        players: players.map((player, index) => ({ uid: player.uid, agent_name: player.agent_name, reset_id: `mock_reset_${index + 1}` })),
        retained: { source_metrics: true, imports: true, report_points_recomputed: true, manager_test_metrics: true },
      },
      warnings: [],
      errors: [],
    };
  }
  if (action === "managerTestMetrics") {
    const sourceMetrics = {
      a_area_total: { valid: Number(payload.area || 0), total: Number(payload.area || 0) },
      b_development_total: { valid: Number(payload.development || 0), total: Number(payload.development || 0) },
      c_negotiation_total: { valid: Number(payload.negotiation || 0), total: Number(payload.negotiation || 0) },
      d_sales_total: { valid: Number(payload.showing || 0), total: Number(payload.showing || 0) },
      d_showing_group: { valid: Number(payload.showing || 0), total: Number(payload.showing || 0) },
      e_total_group: { valid: Number(payload.area || 0) + Number(payload.development || 0) + Number(payload.negotiation || 0) + Number(payload.showing || 0), total: Number(payload.area || 0) + Number(payload.development || 0) + Number(payload.negotiation || 0) + Number(payload.showing || 0) },
      calls: { valid: Number(payload.calls || 0), total: Number(payload.calls || 0) },
      listing: { valid: Number(payload.listing || 0), total: Number(payload.listing || 0) },
      meeting_or_offer: { valid: Number(payload.offer || 0), total: Number(payload.offer || 0) },
      contract: { valid: Number(payload.contract || 0), total: Number(payload.contract || 0) },
      test_offer: { valid: Number(payload.offer || 0), total: Number(payload.offer || 0) },
      test_performance: { valid: Number(payload.performance || 0), total: Number(payload.performance || 0) },
    };
    return {
      ok: true,
      action,
      server_time: new Date().toISOString(),
      data: { uid: "293127", period: payload.period || period, source_metrics: sourceMetrics, ranking_eligible: false },
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
          { uid: "490326", report_name: "蔡晉豪", report_period: period, current_source_metrics: { b_development_total: { valid: 4, total: 7 }, d_showing_group: { valid: 2, total: 2 }, listing: { valid: 1, total: 1 } }, event_basis: { e_valid: 3, e_total: 4.2, bcd_valid: 5, monthly_policy_development_plus_showing: 6 }, reward_preview: { draw_points_delta: 3 }, row_status: "MATCHED" },
          { uid: "490101", report_name: "示範同仁A", report_period: period, current_source_metrics: { b_development_total: { valid: 8, total: 10 }, d_showing_group: { valid: 5, total: 5 }, listing: { valid: 2, total: 2 }, contract: { valid: 1, total: 1 } }, event_basis: { e_valid: 7, e_total: 12, bcd_valid: 10, monthly_policy_development_plus_showing: 13 }, reward_preview: { draw_points_delta: 7 }, row_status: "MATCHED" },
        ],
        warnings: [],
      },
      warnings: [],
      errors: [],
    };
  }
  if (action === "draw") {
    const pool = payload.pool || "general";
    const guaranteedPool = guaranteedPoolConfig(pool);
    const pet = guaranteedPool
      ? guaranteedPoolCandidates(guaranteedPool)[0] || PETS[0]
      : poolCandidates(POOLS.find((item) => item.key === pool) || POOLS[0])[0] || PETS[0];
    const playerState = mockCloudEnvelope("playerState").data;
    if (guaranteedPool) {
      playerState.resources.guaranteed_draws = {
        ...normalizeGuaranteedDraws(state.guaranteedDraws),
        [guaranteedPool.key]: Math.max(0, Number(state.guaranteedDraws?.[guaranteedPool.key] || 0) - 1),
      };
    } else {
      playerState.resources.tickets = { ...state.tickets, [pool]: Math.max(0, Number(state.tickets[pool] || 0) - 1) };
    }
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
        resource_type: guaranteedPool ? "guaranteed_pet_draw" : "ticket",
        pet: { pet_id: pet.pet_id, name: pet.name, rarity: pet.rarity, storyline_id: pet.storyline_id },
        duplicate: false,
        fragments_added: 0,
        player_state: playerState,
      },
      warnings: [],
      errors: [],
    };
  }
  if (action === "claimDrawBatch") {
    const entryIds = Array.isArray(payload.draw_entry_ids)
      ? payload.draw_entry_ids
      : String(payload.draw_entry_ids || "").split(",").filter(Boolean);
    const sourceEntries = Array.isArray(state.drawSession?.entries) ? state.drawSession.entries : [];
    const draws = entryIds.map((entryId) => {
      const entry = sourceEntries.find((item) => item.entry_id === entryId) || {};
      const outcome = entry.outcome || {};
      const pet = getPet(outcome.pet_id || outcome.pet?.pet_id) || outcome.pet || PETS[0];
      return {
        draw_entry_id: entryId,
        pool: entry.pool || payload.pool || "general",
        outcome_kind: outcome.outcome_kind || "pet",
        pet,
        duplicate: false,
        fragments_added: 0,
        egg_pet_id: outcome.outcome_kind === "egg" ? pet.pet_id : "",
        essence_key: outcome.essence_key || "",
        essence_amount: Number(outcome.essence_amount || 0),
        resource_label: outcome.resource_label || "",
        resource_amount: Number(outcome.essence_amount || 0),
        text: "抽卡結果已入帳。",
      };
    });
    const playerState = mockCloudEnvelope("playerState").data;
    playerState.resources.tickets = { ...state.tickets };
    playerState.resources.guaranteed_draws = { ...state.guaranteedDraws };
    playerState.resources.contract_guarantee_batches = JSON.parse(JSON.stringify(state.contractGuaranteeBatches || []));
    playerState.resources.draw_session = {
      ...(state.drawSession || {}),
      entries: sourceEntries.map((entry) => entryIds.includes(entry.entry_id)
        ? { ...entry, claimed: true, client_revealed: false }
        : { ...entry, client_revealed: false }),
    };
    playerState.draw_session = playerState.resources.draw_session;
    return {
      ok: true,
      action,
      server_time: new Date().toISOString(),
      data: {
        draw_batch_id: `mock_claim_batch_${Date.now()}`,
        uid: PROFILE.employeeId || PROFILE.userKey,
        pool: draws.length === 1 ? draws[0].pool : "mixed",
        draw_count: draws.length,
        draws,
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
      tickets: { general: 0, visit: 0, showing: 0, result: 0, contract: 0 },
      guaranteed_draws: { development: 0, showing: 0, listing: 0, contract: 0 },
      materials: {},
      eggs: {},
      essences: {},
      special_resources: {},
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
  if (action === "claimDrawBatch") {
    const response = await fetch(CLOUD_API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Cloud API ${action} ${response.status}`);
    return response.json();
  }
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
      ? { period: managerDashboardPeriod(), manager_key: managerKey }
      : { uid: PROFILE.employeeId || PROFILE.userKey, period: currentPeriodKey(), draw_session_id: readStoredDrawSessionId() };
    if (!MANAGER_MODE && PROFILE.loginRequired) return false;
    const data = cloudEnvelopeData(await fetchCloudEnvelope(action, params), action);
    if (!data) return false;
    if (!MANAGER_MODE) cloudPlayerStateReady = true;
    return MANAGER_MODE ? applyCloudManagerDashboard(data) : applyCloudPlayerState(data);
  } catch (error) {
    if (!MANAGER_MODE) cloudPlayerStateReady = false;
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
  effective_days: 2,
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
      operating_period: managerDashboardPeriod(),
      source_kind: "google_sheet_id",
      spreadsheet_id: spreadsheetId,
      file_name: "店長匯入 Google Sheet",
    });
    const data = cloudEnvelopeData(envelope, "uploadImport");
    if (!data || !data.import_id) throw new Error(envelope?.errors?.[0]?.message || "preview missing import_id");
    const previewPeriod = data.period || data.periods?.[0] || data.player_previews?.[0]?.report_period;
    if (/^\d{4}-\d{2}$/.test(String(previewPeriod || ""))) state.manager.dashboardPeriod = String(previewPeriod);
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
    state.manager.dashboardPeriod = parsed.period;
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

function rawReportMetricValue(metrics, key, side = "valid") {
  return metricPairValue(metrics, key, side);
}

function excelGameMetrics(metrics) {
  const hasTestOffer = isPlainObject(metrics?.test_offer);
  return normalizeGameMetrics({
    area: rawReportMetricValue(metrics, "a_area_total", "total"),
    development: rawReportMetricValue(metrics, "b_development_total", "valid"),
    negotiation: rawReportMetricValue(metrics, "c_negotiation_total", "valid"),
    showing: rawReportMetricValue(metrics, "d_sales_total", "total"),
    momentum: rawReportMetricValue(metrics, "d1_schedule", "total") + rawReportMetricValue(metrics, "d1_face_schedule", "total"),
    calls: rawReportMetricValue(metrics, "calls", "valid"),
    listing: rawReportMetricValue(metrics, "listing", "valid") + rawReportMetricValue(metrics, "rent_listing", "valid"),
    offer: hasTestOffer ? rawReportMetricValue(metrics, "test_offer", "valid") : 0,
    price: rawReportMetricValue(metrics, "price_revision", "valid"),
    meeting: hasTestOffer ? 0 : rawReportMetricValue(metrics, "meeting_or_offer", "valid") + rawReportMetricValue(metrics, "rent_meeting_or_offer", "valid"),
    contract: rawReportMetricValue(metrics, "contract", "valid") + rawReportMetricValue(metrics, "rent_contract", "valid"),
    performance: rawReportMetricValue(metrics, "test_performance", "valid"),
  });
}

function normalizePlayerSourceMetrics(metrics = {}) {
  if (isPlainObject(metrics) && ("a_area_total" in metrics || "b_development_total" in metrics || "d_sales_total" in metrics)) {
    return excelGameMetrics(metrics);
  }
  return normalizeGameMetrics(metrics);
}

function excelEventBasis(metrics) {
  const valid = (key) => Number(metrics[key]?.valid || 0);
  const total = (key) => {
    const value = metrics[key]?.total;
    return value === undefined || value === null || value === "" ? valid(key) : Number(value || 0);
  };
  const bcdValid = valid("b_development_total") + valid("c_negotiation_total") + valid("d_sales_total");
  const eValid = valid("e_total_group");
  const eTotal = total("e_total_group");
  const developmentValid = valid("b_development_total");
  const showingGroups = valid("d_showing_group");
  const listingCount = valid("listing") + valid("rent_listing");
  const contractCount = valid("contract") + valid("rent_contract");
  const monthlyPolicy = valid("b_development_total") + valid("d_showing_group");
  return {
    valid_days: valid("effective_days"),
    e_daily_numerator: eValid,
    e_valid: eValid,
    e_total: eTotal,
    e_daily_target: 4,
    e_monthly_target: valid("effective_days") * 4,
    e_total_daily_average: valid("effective_days") > 0 ? eTotal / valid("effective_days") : 0,
    e_valid_daily_average: valid("effective_days") > 0 ? eValid / valid("effective_days") : 0,
    e_daily_target_met: valid("effective_days") > 0 && eTotal / valid("effective_days") >= 4,
    monthly_base_targets: {
      development_valid: 10,
      showing_groups: 15,
      listing_count: 4,
      contract_count: 0.35,
    },
    monthly_base_progress: {
      development_valid: developmentValid,
      showing_groups: showingGroups,
      listing_count: listingCount,
      contract_count: contractCount,
    },
    monthly_base_target_met: {
      development_valid: developmentValid >= 10,
      showing_groups: showingGroups >= 15,
      listing_count: listingCount >= 4,
      contract_count: contractCount >= 0.35,
    },
    area_total_groups: total("a_area_total"),
    development_seen_groups: developmentValid,
    development_total_groups: total("b_development_total"),
    sales_total_groups: total("d_sales_total"),
    showing_groups: showingGroups,
    buyer_deal_count: total("d_showing_group"),
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
    const committedPeriod = preview.player_previews?.[0]?.report_period || preview.period || preview.periods?.[0] || managerDashboardPeriod();
    if (/^\d{4}-\d{2}$/.test(String(committedPeriod || ""))) state.manager.dashboardPeriod = String(committedPeriod);
    state.manager.cloudDashboard = managerDashboardFromCommittedPreview(preview, data);
    state.manager.cloudImportPreview = null;
    state.manager.cloudStatus = CLOUD_API_BASE_URL === "mock" ? "mock-uploadImport-commit" : "cloud-uploadImport-commit";
    state.manager.lastImport = {
      at: new Date().toISOString(),
      period: state.manager.dashboardPeriod,
      source: data.import_id || "cloud",
      rows: data.committed_rows || 0,
    };
    saveState();
    render();
    await loadCloudState();
    render();
    setCloudImportStatus(`入帳完成：${data.committed_rows || 0} 位同仁，月榜已更新`, "good");
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
  state.manager.selectedImportFile = name;
  saveState();
  renderManagerImportSource();
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
    window.confirm(`全部重置 ${PROFILE.agent} 的進度？卡片庫、寵物、星魂、蛋、精華、素材、抽卡紀錄、每日免費抽、月榜第一與加碼都會清除；只保留行程與成果項重新計算出的抽卡點數。`);
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
      text: "雲端重置完成，已依規則清空卡片庫、星魂、蛋、精華、素材與加碼。",
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

function storylineResourceKey(storylineId = "") {
  const value = String(storylineId || "");
  if (value.includes("development") || value === "development") return "development";
  if (value.includes("call") || value === "call") return "call";
  if (value.includes("showing") || value === "showing") return "showing";
  if (value.includes("listing") || value === "listing") return "listing";
  if (value.includes("contract") || value === "contract") return "contract";
  return value.replace(/^sl_/, "").replace(/_.*$/, "") || "development";
}

function essenceKeyForStoryline(storylineId = "") {
  return `${storylineResourceKey(storylineId)}_essence`;
}

function essenceLabelForStoryline(storylineId = "") {
  const key = storylineResourceKey(storylineId);
  return STORYLINE_ESSENCE_LABELS[key] || `${fallbackStorylineName(storylineId)}精華`;
}

function essenceResourceKey(value = "", pet = null) {
  const raw = String(value || "").replace(/_essence$/, "");
  if (ESSENCE_ART[raw]) return raw;
  const fromValue = storylineResourceKey(raw);
  if (ESSENCE_ART[fromValue]) return fromValue;
  const fromPet = storylineResourceKey(pet?.storyline_id || "");
  return ESSENCE_ART[fromPet] ? fromPet : "development";
}

function essenceImageUrl(resourceKey, size = "small") {
  const art = ESSENCE_ART[essenceResourceKey(resourceKey)];
  return size === "small" ? art?.thumbnail || art?.image || "" : art?.image || art?.thumbnail || "";
}

function essenceLabelForResource(resourceKey, pet = null) {
  const key = essenceResourceKey(resourceKey, pet);
  return STORYLINE_ESSENCE_LABELS[key] || essenceLabelForStoryline(pet?.storyline_id || key);
}

function isEssenceDraw(draw) {
  return draw?.outcomeKind === "essence" || draw?.outcomeKind === "essence_conversion";
}

function essenceVisual(draw, pet, size = "small") {
  const key = essenceResourceKey(draw?.essenceKey || draw?.resourceKey || pet?.storyline_id, pet);
  const imageUrl = essenceImageUrl(key, size);
  const label = essenceLabelForResource(key, pet);
  return `
    <div class="pet-art-frame pet-art-${size} essence-art-frame" data-essence="${escapeHtml(key)}">
      <img class="pet-art-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(label)}" loading="lazy" decoding="async">
    </div>
  `;
}

function drawPrimaryLabel(draw, pet) {
  if (isEssenceDraw(draw)) return essenceLabelForResource(draw?.essenceKey || draw?.resourceKey, pet);
  return pet?.name || "抽卡結果";
}

function eggLabel(pet) {
  return `${pet?.name || "寵物"}蛋`;
}

function essenceCount(storylineId) {
  return rewardCount(state.essences?.[essenceKeyForStoryline(storylineId)] || 0);
}

function eggCount(petId) {
  return rewardCount(state.eggs?.[petId] || 0);
}

function addEgg(petId, amount = 1) {
  state.eggs = isPlainObject(state.eggs) ? state.eggs : {};
  state.eggs[petId] = rewardCount(state.eggs[petId] || 0) + rewardCount(amount);
  return state.eggs[petId];
}

function addEssence(storylineId, amount = 1) {
  state.essences = isPlainObject(state.essences) ? state.essences : {};
  const key = essenceKeyForStoryline(storylineId);
  state.essences[key] = rewardCount(state.essences[key] || 0) + rewardCount(amount);
  return state.essences[key];
}

function createOwnedPet(pet) {
  return {
    user_id: PROFILE.userKey,
    pet_id: pet.pet_id,
    level: 1,
    exp: 0,
    star: 1,
    current_form: pet.base_form,
    duplicate_fragments: 0,
    post_five_star_souls_earned: 0,
    owned_count: 1,
    first_acquired_at: new Date().toISOString(),
    last_upgraded_at: new Date().toISOString(),
    awakened: false,
    ultimate: false,
    level_system_reserved: true,
  };
}

function addDuplicateStarSoul(owned) {
  if (!owned) return 0;
  owned.owned_count = rewardCount(owned.owned_count || 1) + 1;
  owned.duplicate_fragments = rewardCount(owned.duplicate_fragments || 0) + 1;
  if (rewardCount(owned.star || 1) >= 5) {
    owned.post_five_star_souls_earned = rewardCount(owned.post_five_star_souls_earned || 0) + 1;
  }
  owned.last_upgraded_at = new Date().toISOString();
  return 1;
}

function canHatchPet(petId) {
  const pet = getPet(petId);
  return Boolean(pet && eggCount(petId) > 0 && essenceCount(pet.storyline_id) >= HATCH_ESSENCE_COST);
}

async function hatchPet(petId) {
  const pet = getPet(petId);
  if (!pet || !canHatchPet(petId)) return;
  if (CLOUD_API_BASE_URL && CLOUD_API_BASE_URL !== "mock") {
    await runCloudPetAction("hatch", petId);
    return;
  }
  const essenceKey = essenceKeyForStoryline(pet.storyline_id);
  state.eggs[petId] = Math.max(0, rewardCount(state.eggs[petId] || 0) - 1);
  state.essences[essenceKey] = Math.max(0, rewardCount(state.essences[essenceKey] || 0) - HATCH_ESSENCE_COST);
  const owned = getOwned(petId);
  const duplicate = Boolean(owned);
  if (owned) addDuplicateStarSoul(owned);
  else {
    state.collection[petId] = createOwnedPet(pet);
    state.activePetId = petId;
  }
  state.history.unshift({
    type: "system",
    at: new Date().toISOString(),
    text: duplicate
      ? `${eggLabel(pet)}孵化成功；因已擁有 ${pet.name}，轉為星魂 +1。`
      : `${eggLabel(pet)}孵化成功，${pet.name} 加入隊伍。`,
  });
  state.history = state.history.slice(0, 12);
  saveState();
  render();
  triggerCelebration(drawOutcomeTone(state.history[0], pet));
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
    state.collection[starter.pet_id] = createOwnedPet(starter);
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
    egg_image_url: normalizePetAssetUrl(pet.egg_image_url || pet.egg_image_asset),
    egg_thumbnail_url: normalizePetAssetUrl(pet.egg_thumbnail_url || pet.egg_thumbnail_asset || pet.egg_image_url || pet.egg_image_asset),
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
      detail: owned.star >= 5 ? "已達 5 星" : `星級 ${owned.star}/5，Lv.${owned.level}/${starLevelRequirement(nextStar)}，星魂 ${owned.duplicate_fragments}/${cost} 升 ${nextStar} 星`,
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
    goals.push({
      title: "究極型",
      detail: owned.ultimate
        ? "究極型已完成"
        : `功能尚未開放；五星後累計星魂 ${rewardCount(owned.post_five_star_souls_earned || 0)}，都會保留未來使用`,
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
      text: `${materialReport.petName} 覺醒素材已足，下一步收星魂升到 5 星。`,
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

function metricDeltaSummary(metricsSource = {}) {
  const metrics = normalizeGameMetrics(metricsSource);
  const items = [
    ["showing", "帶看", "組"],
    ["development", "拜訪", "組"],
    ["negotiation", "回報", "組"],
    ["listing", "委託", "件"],
    ["meeting", "見面談", "件"],
    ["contract", "成件", "件"],
  ].filter(([key]) => Number(metrics[key] || 0) > 0)
    .map(([key, label, unit]) => `${label} +${formatMetricValue(metrics[key])}${unit}`);
  return items.length ? items.slice(0, 4).join("、") : "本次沒有新增差額";
}

function backendSettlementSummaryText(summary) {
  if (!summary) return "";
  if (typeof summary === "string") return summary;
  if (!isPlainObject(summary)) return "";
  return summary.player_message || summary.message || summary.summary_text || summary.text || summary.note || "";
}

function routeProgressFromMetrics(metricsSource = {}) {
  const metrics = normalizeGameMetrics(metricsSource);
  if (Number(metrics.showing || 0) > 0 || Number(metrics.meeting || 0) > 0) return `帶看小旅行前進：帶看/見面談 +${formatMetricValue(Number(metrics.showing || 0) + Number(metrics.meeting || 0))}`;
  if (Number(metrics.development || 0) > 0) return `開發遠征隊前進：拜訪 +${formatMetricValue(metrics.development)}組`;
  if (Number(metrics.listing || 0) > 0) return `委託種子園前進：委託 +${formatMetricValue(metrics.listing)}件`;
  if (Number(metrics.contract || 0) > 0) return `成交神殿前進：成件 +${formatMetricValue(metrics.contract)}件`;
  return "路線等待下一筆有效行程或成果";
}

function rewardTicketSummary(rewards = {}) {
  const source = isPlainObject(rewards?.rewards_delta) ? rewards.rewards_delta : rewards;
  const ticketSource = isPlainObject(source?.tickets) ? source.tickets : source;
  const parts = ticketDeltaParts(ticketSource);
  const guaranteed = normalizeGuaranteedDraws(source?.guaranteed_draws || source?.guaranteedDraws);
  GUARANTEED_DRAW_POOLS.filter((pool) => pool.key !== "contract").forEach((pool) => {
    const amount = Number(guaranteed[pool.key] || 0);
    if (amount > 0) parts.push(`${pool.shortName}保證卡 +${rewardCount(amount)}`);
  });
  const contractBatches = Array.isArray(source?.contract_guarantee_batches) ? source.contract_guarantee_batches : [];
  if (contractBatches.length) parts.push(`成交保底批次 ${contractBatches.map((draws) => `${rewardCount(draws)}抽`).join("+")}`);
  if (parts.length) return `新獎勵：${parts.join("、")}`;
  return "新券：本次未新增，先看下一個主任務";
}

function petStateSummaryFromRewards(rewards = {}) {
  if (rewards.petGrowth) return petGrowthSummary(rewards.petGrowth);
  const pet = getActivePet();
  const owned = pet ? getOwned(pet.pet_id) : null;
  if (!pet || !owned) return "主寵狀態等待資料同步";
  return `${pet.name} Lv.${owned.level || 1}，${homePetStarCue(pet, owned)}`;
}

function buildSettlementLoopCard(rewards = state.lastRewards, settlement = state.dailySettlements?.[todayKey()]) {
  if (!settlement && !rewards) return "";
  const summaryText = backendSettlementSummaryText(settlement?.summary || settlement?.settlementSummary || state.latestSettlementSummary);
  const metrics = normalizeGameMetrics(settlement?.deltaMetrics || settlement?.metrics || state.metrics || {});
  const mission = buildPilotMission(state.metrics);
  const intakeLine = summaryText || metricDeltaSummary(metrics);
  const routeLine = routeProgressFromMetrics(metrics);
  const petLine = petStateSummaryFromRewards(rewards);
  const settlementRewards = state.latestSettlementSummary?.rewards_delta || state.latestSettlementSummary?.rewardsDelta;
  const ticketLine = rewardTicketSummary(settlementRewards || rewards);
  return `
    <article class="settlement-loop-card">
      <span>本次入帳閉環</span>
      <ol>
        <li><b>入帳</b><em>${escapeHtml(intakeLine)}</em></li>
        <li><b>路線</b><em>${escapeHtml(routeLine)}</em></li>
        <li><b>主寵</b><em>${escapeHtml(petLine)}</em></li>
        <li><b>獎勵</b><em>${escapeHtml(ticketLine)}</em></li>
      </ol>
      <div class="settlement-next-action">
        <strong>下一個行動：${escapeHtml(mission.title)}</strong>
        <button class="primary-button" type="button" data-pilot-mission="${escapeHtml(mission.key)}">${escapeHtml(mission.buttonLabel)}</button>
      </div>
    </article>
  `;
}

function addMaterials(items) {
  Object.entries(items).forEach(([key, value]) => {
    state.materials[key] = (state.materials[key] || 0) + value;
  });
}

function normalizeGuaranteedDraws(draws = {}) {
  const source = isPlainObject(draws) ? draws : {};
  return Object.fromEntries(GUARANTEED_DRAW_POOLS.map((pool) => [pool.key, Math.max(0, rewardCount(source[pool.key] || 0))]));
}

function guaranteedTargetTier(target = {}) {
  const current = Math.max(0, Number(target.current || 0));
  const threshold = Math.max(0, Number(target.target || 0));
  return threshold > 0 ? Math.floor((current + 0.000000001) / threshold) : 0;
}

function regularTicketTotal() {
  return Object.values(state.tickets || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function totalGuaranteedDraws() {
  const standard = Object.entries(normalizeGuaranteedDraws(state.guaranteedDraws))
    .filter(([key]) => key !== "contract")
    .reduce((sum, [, value]) => sum + value, 0);
  return standard + contractGuaranteeRemainingDraws();
}

function totalTickets() {
  return regularTicketTotal() + totalGuaranteedDraws();
}

function guaranteedPoolConfig(poolKey) {
  return GUARANTEED_DRAW_POOLS.find((pool) => pool.poolKey === poolKey || pool.key === poolKey) || null;
}

function displayPoolKey(poolKey) {
  return {
    guaranteed_development: "visit",
    guaranteed_showing: "showing",
    guaranteed_listing: "result",
    guaranteed_contract: "contract",
    contract_guarantee: "contract",
  }[poolKey] || poolKey;
}

function integratedGuaranteeForPool(poolKey) {
  const guaranteeKey = {
    visit: "development",
    showing: "showing",
    result: "listing",
    contract: "contract",
  }[poolKey];
  return guaranteeKey ? guaranteedPoolConfig(guaranteeKey) : null;
}

function integratedGuaranteeBalance(guarantee) {
  if (!guarantee) return 0;
  if (guarantee.key === "contract") return Number(state.guaranteedDraws?.contract || 0) + contractGuaranteeRemainingDraws();
  return Number(state.guaranteedDraws?.[guarantee.key] || 0);
}

function contractGuaranteeBatches() {
  return Array.isArray(state.contractGuaranteeBatches) ? state.contractGuaranteeBatches : [];
}

function contractGuaranteeRemainingDraws() {
  return contractGuaranteeBatches().reduce((sum, batch) => sum + Math.max(0, Number(batch.remaining_draws ?? (Number(batch.total_draws || 0) - Number(batch.revealed_draws || 0)))), 0);
}

function nextPreparedCloudDraw(poolKey) {
  return preparedCloudDraws(poolKey, 1)[0] || null;
}

function preparedCloudDraws(poolKey, limit = Infinity) {
  const entries = Array.isArray(state.drawSession?.entries) ? state.drawSession.entries : [];
  return entries
    .filter((entry) => entry.pool === poolKey && !entry.claimed && !entry.client_revealed)
    .slice(0, limit);
}

const preloadedDrawAssetUrls = new Set();

function preparedDrawImageUrl(entry) {
  const outcome = isPlainObject(entry?.outcome) ? entry.outcome : {};
  const pet = getPet(outcome.pet_id || outcome.pet?.pet_id) || outcome.pet;
  if (!pet) return "";
  if (outcome.outcome_kind === "essence") return essenceImageUrl(outcome.essence_key || pet.storyline_id, "small");
  if (outcome.outcome_kind === "egg") return eggImageUrl(pet, "small");
  return petImageUrl(pet, "small", getOwned(pet.pet_id));
}

function preloadPreparedDrawAssets(limit = 8) {
  if (typeof Image !== "function") return;
  const entries = Array.isArray(state.drawSession?.entries) ? state.drawSession.entries : [];
  entries
    .filter((entry) => !entry.claimed && !entry.client_revealed)
    .slice(0, limit)
    .map(preparedDrawImageUrl)
    .filter(Boolean)
    .forEach((url, index) => {
      if (preloadedDrawAssetUrls.has(url)) return;
      preloadedDrawAssetUrls.add(url);
      const image = new Image();
      image.decoding = "async";
      if (index === 0 && "fetchPriority" in image) image.fetchPriority = "high";
      image.src = url;
      if (typeof image.decode === "function") image.decode().catch(() => {});
    });
}

function guaranteedPoolCandidates(pool) {
  return PETS.filter((pet) => pet.storyline_id === pool?.storylineId && isFirstReleaseStoryline(pet.storyline_id));
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
  const hatch = PETS.find((pet) => canHatchPet(pet.pet_id));
  if (hatch) {
    const hatchOwned = getOwned(hatch.pet_id);
    return {
      pet: hatch,
      owned: hatchOwned,
      type: "hatch",
      label: hatchOwned ? "孵化成星魂" : "去孵化",
      text: hatchOwned
        ? `${hatch.name} 的同名蛋與精華已足，可孵化成1個星魂。`
        : `${hatch.name} 的蛋與精華已足，可以孵化。`,
    };
  }
  const ownedPets = PETS
    .map((pet) => ({ pet, owned: getOwned(pet.pet_id) }))
    .filter((item) => item.owned);
  const star = ownedPets.find(({ owned }) => {
    const nextStar = owned.star + 1;
    return owned.star < 5 && owned.level >= starLevelRequirement(nextStar) && owned.duplicate_fragments >= starCost(nextStar);
  });
  if (star) return { ...star, type: "star", label: "去升星", text: `${star.pet.name} 星魂已足，可以升星。` };
  const awaken = ownedPets.find(({ pet, owned }) => canAwaken(pet, owned));
  if (awaken) return { ...awaken, type: "awaken", label: "去覺醒", text: `${awaken.pet.name} 已達覺醒條件。` };
  const ultimate = ownedPets.find(({ pet, owned }) => canUltimate(pet, owned));
  if (ultimate) return { ...ultimate, type: "ultimate", label: "究極合成", text: `${ultimate.pet.name} 可以合成究極型。` };
  const materialReady = ownedPets.find(({ pet, owned }) =>
    !owned.awakened &&
    owned.star < 5 &&
    pet.available_forms?.includes("覺醒型") &&
    !missingMaterials(pet.required_awaken_materials).length
  );
  if (materialReady) return { ...materialReady, type: "material-ready", label: "整理卡片庫", text: `${materialReady.pet.name} 素材已足，先補星魂升星。` };
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
      detail: "先把已經到手的素材或星魂變成戰力，卡片庫會更有推進感。",
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
    kicker: "本月累積",
    title: `${PROFILE.agent}，${pet.name} 今天已經醒來。`,
    detail: `${growth.detail} 主寵助力已開啟。`,
    view: "today",
    label: "看成果累積",
    tone: "ready",
  };
}

function activePetAssistText(pet = getActivePet(), owned = pet ? getOwned(pet.pet_id) : null) {
  if (!pet || !owned) return "主寵助力：取得主寵後開啟";
  const rule = state.backendConfig?.assistRules?.[pet.storyline_id] || state.backendConfig?.assistRules?.default;
  if (rule?.label) return `主寵助力：${rule.label}`;
  return `主寵助力：${currentForm(pet, owned)} 已陪你推進`;
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

function drawPacingConfig(poolKey) {
  return {
    ...INTERNAL_DRAW_PACING_CONFIG,
    ...(INTERNAL_DRAW_PACING_CONFIG.pools?.[poolKey] || {}),
  };
}

function drawOutcomeWeights(poolKey) {
  return drawPacingConfig(poolKey).outcomeWeights || INTERNAL_DRAW_PACING_CONFIG.defaultOutcomeWeights;
}

function weightedChoiceFromMap(weights, fallback) {
  const entries = Object.entries(weights || {})
    .map(([key, value]) => [key, Number(value || 0)])
    .filter(([, value]) => value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (!entries.length || total <= 0) return fallback;
  let cursor = Math.random() * total;
  for (const [key, value] of entries) {
    cursor -= value;
    if (cursor <= 0) return key;
  }
  return entries.at(-1)[0];
}

function weightedChoiceFromEntries(entries = [], fallback = null) {
  const normalized = entries
    .map((entry) => ({ ...entry, weight: Number(entry.weight || 0) }))
    .filter((entry) => entry.weight > 0);
  const total = normalized.reduce((sum, entry) => sum + entry.weight, 0);
  if (!normalized.length || total <= 0) return fallback;
  let cursor = Math.random() * total;
  for (const entry of normalized) {
    cursor -= entry.weight;
    if (cursor <= 0) return entry;
  }
  return normalized.at(-1);
}

function drawPacingCue(poolKey) {
  const config = drawPacingConfig(poolKey);
  return config.publicCue || INTERNAL_DRAW_PACING_CONFIG.monthlyGoal;
}

function rarityDisplayText(pool) {
  const rates = configuredDropRates(pool.key);
  if (rates) {
    return `<span class="soft-pill">本月卡池已調整</span>${(pool.rarityBands || []).map((rarity) => `<span class="rarity-badge rarity-${rarity}">${rarity}</span>`).join("")}`;
  }
  return `<span class="soft-pill">本月卡池節奏</span>${(pool.rarityBands || []).map((rarity) => `<span class="rarity-badge rarity-${rarity}">${rarity}</span>`).join("")}`;
}

function poolCandidates(pool) {
  const allowedStorylines = new Set(pool.allowedStorylines || []);
  const rarityBands = new Set(pool.rarityBands || RARITY_ORDER);
  return PETS.filter((pet) => {
    if (!pet.can_be_drawn || pet.rarity === "UR") return false;
    if (!allowedStorylines.has(pet.storyline_id)) return false;
    if (!rarityBands.has(pet.rarity)) return false;
    if (pool.key === "general" && isContractTempleStoryline(pet.storyline_id)) return false;
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

function ensureDrawPityState() {
  state.drawPity = normalizeDrawPity(state.drawPity || {});
  return state.drawPity;
}

function shouldForcePetByPity(poolKey) {
  const rule = INTERNAL_PET_PITY_RULES[poolKey];
  if (!rule) return false;
  const pity = ensureDrawPityState()[poolKey];
  return rewardCount(pity?.sincePet || 0) >= rewardCount(rule.maxMisses || 0);
}

function drawCandidateWithPity(pool) {
  const candidates = poolCandidates(pool);
  if (!candidates.length) return null;
  if (shouldForcePetByPity(pool.key)) return randomFrom(candidates);
  return drawCandidate(pool);
}

function recordDrawPity(poolKey, result = {}) {
  const rule = INTERNAL_PET_PITY_RULES[poolKey];
  if (!rule) return;
  const pity = ensureDrawPityState();
  pity[poolKey].sincePet = result.pet ? 0 : rewardCount(pity[poolKey].sincePet || 0) + 1;
}

function poolUnlocked(pool, progress = state.progress || buildProgressSnapshot()) {
  const backendUnlock = state.backendConfig?.poolUnlocks?.[pool.key];
  if (backendUnlock?.unlocked === false) return false;
  return true;
}

function poolPriority(pool) {
  const tickets = Number(state.tickets?.[pool.key] || 0);
  const guarantee = integratedGuaranteeForPool(pool.key);
  const guaranteeReady = guarantee ? integratedGuaranteeBalance(guarantee) > 0 : false;
  if (pool.key === pinnedDrawPoolKey) return 1000;
  if (tickets > 0 || guaranteeReady) return 100;
  return 0;
}

function poolExperienceCue(pool, candidates, unlocked) {
  const tickets = Number(state.tickets?.[pool.key] || 0);
  const progress = nextTicketProgress(pool.key, state.metrics);
  if (!unlocked) return `${progress.unlockText}，這個卡池就會亮。`;
  if (tickets > 0) {
    if (pool.key === "visit") return "拜訪進度已入帳，可以抽開發線素材與夥伴。";
    if (pool.key === "showing") return "帶看進度已入帳，可以抽帶看線素材與夥伴。";
    if (pool.key === "result") return "成果已入帳，可以抽成果線素材與夥伴。";
    if (pool.key === "contract") return "成交進度已入帳，可以抽成交線素材與夥伴。";
    return "先把可抽次數用掉，重複寵物也會變星魂。";
  }
  return candidates.length ? `${progress.unlockText}，這裡就能抽。` : "卡池內容正在接入，先累積行程不會浪費。";
}

function poolWorkProgressValue(poolKey) {
  const progress = state.progress || buildProgressSnapshot(state.metrics);
  const basisPool = isPlainObject(progress.basis?.pool_progress) ? progress.basis.pool_progress : {};
  const source = normalizeGameMetrics(progress.sourceMetrics || state.metrics);
  const groups = progress.groups || createReportGroups();
  const developmentValid = basisMetricOrFallback(progress.basis, ["development_seen_groups", "development_valid"], groups.development?.effective || source.development);
  const developmentTotal = basisMetricOrFallback(progress.basis, ["development_total_groups"], groups.development?.total || developmentValid);
  const areaTotal = basisMetricOrFallback(progress.basis, ["area_total_groups"], groups.area?.total || source.area);
  const fallback = {
    general: source.calls / 15,
    visit: developmentValid + Math.max(0, developmentTotal - developmentValid) * 0.3 + areaTotal / 2,
    showing: basisMetricOrFallback(progress.basis, ["showing_groups"], source.showing),
    result: source.listing + source.offer + source.meeting,
    contract: source.meeting / 2 + source.contract / 0.1,
  };
  const basisKey = {
    general: "general_phone",
    visit: "visit",
    showing: "showing",
    result: "result",
    contract: "contract",
  }[poolKey];
  return preciseMetricOrFallback(basisPool, [basisKey], fallback[poolKey] || 0);
}

function poolWorkProgressDetails(poolKey) {
  const progress = state.progress || buildProgressSnapshot(state.metrics);
  const source = normalizeGameMetrics(progress.sourceMetrics || state.metrics);
  const groups = progress.groups || createReportGroups();
  const developmentValid = basisMetricOrFallback(progress.basis, ["development_seen_groups", "development_valid"], groups.development?.effective || source.development);
  const developmentTotal = basisMetricOrFallback(progress.basis, ["development_total_groups"], groups.development?.total || developmentValid);
  const areaTotal = basisMetricOrFallback(progress.basis, ["area_total_groups"], groups.area?.total || source.area);
  const showing = basisMetricOrFallback(progress.basis, ["showing_groups"], source.showing);
  const value = poolWorkProgressValue(poolKey);
  const remainder = Math.max(0, value - Math.floor(value + 0.000000001));
  const nextPercent = Math.round(remainder * 100);
  const details = {
    general: {
      total: `本月累積電話 ${formatMetricValue(source.calls)} 通`,
      next: `再 ${formatMetricValue(15 - (source.calls % 15 || 0))} 通電話，可增加 1 抽`,
    },
    visit: {
      total: `本月累積拜訪：有效 ${formatMetricValue(developmentValid)} 組／全部 ${formatMetricValue(developmentTotal)} 組 · 社區服務 ${formatMetricValue(areaTotal)} 組`,
      next: "再 1 組有效拜訪，可增加 1 抽",
    },
    showing: {
      total: `本月累積帶看 ${formatMetricValue(showing)} 組`,
      next: "再 1 組帶看，可增加 1 抽",
    },
    result: {
      total: `本月累積成果：委託 ${formatMetricValue(source.listing)} 件 · 斡旋／要約／送訂 ${formatMetricValue(source.offer + source.meeting)} 件`,
      next: "再 1 件委託、斡旋／要約或送訂，可增加 1 抽",
    },
    contract: {
      total: `本月累積：見面談 ${formatMetricValue(source.meeting)} 次 · 成交 ${formatMetricValue(source.contract)} 件`,
      next: `再 ${formatMetricValue(2 - (source.meeting % 2 || 0))} 次見面談可增加 1 抽；成交每增加 0.1 件也增加 1 抽`,
    },
  };
  return { value, nextPercent, ...(details[poolKey] || details.general) };
}

function poolDrawProgressMarkup(poolKey) {
  const work = poolWorkProgressDetails(poolKey);
  const balance = Math.max(0, Number(state.tickets?.[poolKey] || 0));
  const stats = normalizeDrawStats(state.drawStats, state.tickets);
  const workEarned = Math.floor(work.value + 0.000000001);
  const earned = Math.max(balance, workEarned, Number(stats.earned?.[poolKey] || 0));
  const drawn = stats.trackingStartedAt
    ? Math.max(0, Number(stats.drawn?.[poolKey] || 0))
    : Math.max(0, earned - balance);
  return `
    <section class="pool-work-progress" aria-label="${escapeHtml(POOLS.find((pool) => pool.key === poolKey)?.name || "卡池")}本月進度">
      <p class="pool-work-total">${escapeHtml(work.total)}</p>
      <div class="pool-work-stats">
        <span><small>已獲得</small><strong>${formatMetricValue(earned)} 抽</strong></span>
        <span><small>已抽</small><strong>${formatMetricValue(drawn)} 抽</strong></span>
        <span><small>目前可抽</small><strong>${formatMetricValue(balance)} 抽</strong></span>
      </div>
      <div class="mini-progress"><span style="width:${work.nextPercent}%"></span></div>
      <p class="pool-next-draw">${escapeHtml(work.next)}</p>
    </section>
  `;
}

function poolDrawButtonLabel(pool) {
  if (pool.key === "general") return "抽免費池";
  if (pool.key === "visit") return "抽拜訪池";
  if (pool.key === "showing") return "抽帶看池";
  if (pool.key === "result") return "抽成果池";
  if (pool.key === "contract") return "抽成交池";
  return "抽一次";
}

function poolHookText(poolKey) {
  if (poolKey === "visit") return "有效拜訪＋其他拜訪 30%＋社區服務 50%。";
  if (poolKey === "showing") return "每一組帶看都會增加帶看池抽數。";
  if (poolKey === "result") return "委託、斡旋／要約與送訂會增加成果池抽數。";
  if (poolKey === "contract") return "見面談每 2 次 1 抽；成交每 0.1 件 1 抽。";
  return "每日 3 抽，加上電話量累積的免費抽。";
}

function poolThemeClass(poolKey) {
  if (poolKey === "visit" || poolKey === "showing") return "theme-blue";
  if (poolKey === "result") return "theme-orange";
  if (poolKey === "contract") return "theme-gold";
  return "theme-green";
}

function poolUnlockButtonLabel(poolKey) {
  const progress = nextTicketProgress(poolKey, state.metrics);
  if (progress.gap <= 0) return "查看解鎖進度";
  return `${progress.label}解鎖`;
}

function showActionToast(message) {
  let toast = document.getElementById("actionToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "actionToast";
    toast.className = "action-toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove("is-showing");
  const show = () => toast.classList.add("is-showing");
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(show);
  else show();
  window.setTimeout(() => toast.classList.remove("is-showing"), 2600);
}

function triggerCelebration(tone = "growth") {
  if (typeof document === "undefined" || !document.body || typeof document.createElement !== "function") return;
  const burst = document.createElement("div");
  burst.className = `confetti-burst is-${tone}`;
  burst.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 30; index += 1) {
    const particle = document.createElement("i");
    particle.style.setProperty("--x", `${Math.round((Math.random() - 0.5) * 220)}px`);
    particle.style.setProperty("--y", `${Math.round(-80 - Math.random() * 170)}px`);
    particle.style.setProperty("--r", `${Math.round(Math.random() * 360)}deg`);
    particle.style.setProperty("--d", `${Math.round(Math.random() * 180)}ms`);
    burst.appendChild(particle);
  }
  document.body.appendChild(burst);
  window.setTimeout(() => burst.remove(), 1300);
}

function animateCountUps(container) {
  if (!container || typeof requestAnimationFrame !== "function") return;
  container.querySelectorAll("[data-count-to]").forEach((node) => {
    const target = Number(node.dataset.countTo || 0);
    const prefix = node.dataset.countPrefix || "";
    const suffix = node.dataset.countSuffix || "";
    const start = typeof performance === "object" && typeof performance.now === "function" ? performance.now() : Date.now();
    const duration = 620;
    const tick = (now) => {
      const ratio = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - ratio, 3);
      node.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
      if (ratio < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function handlePoolUnlockClick(poolKey) {
  const mission = buildPilotMission(state.metrics);
  showActionToast(`${mission.title}，${mission.rewardText}。`);
  switchToView("today", { scroll: false });
  window.setTimeout(() => {
    const card = document.querySelector("[data-pilot-mission-card='1']");
    if (!card) return;
    card.classList.add("is-focus");
    card.scrollIntoView({ block: "center", behavior: "smooth" });
    window.setTimeout(() => card.classList.remove("is-focus"), 1800);
  }, 80);
}

function handlePilotMissionClick() {
  const mission = buildPilotMission(state.metrics);
  showActionToast(`${mission.title}，${mission.detail}`);
  switchToView("today", { scroll: false });
  window.setTimeout(() => {
    const card = document.querySelector("[data-pilot-mission-card='1']") || document.querySelector(mission.focusSelector);
    if (!card) return;
    card.classList.add("is-focus");
    card.scrollIntoView({ block: "center", behavior: "smooth" });
    window.setTimeout(() => card.classList.remove("is-focus"), 1800);
  }, 80);
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
    visit: 0,
    showing: 0,
    result: 0,
    contract: 0,
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
    general: Math.floor(metrics.calls / 15),
    visit: Math.floor(metrics.development + metrics.area / 2),
    showing: Math.floor(metrics.showing),
    result: Math.floor(rewardCount(metrics.listing) + rewardCount(metrics.offer) + rewardCount(metrics.meeting)),
    contract: Math.floor(rewardCount(metrics.meeting) / 2 + contractCount / 0.1 + 0.0000001),
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
    visit: Number(rewards.visit || 0) + Number(bonus.visit || 0),
    showing: Number(rewards.showing || 0) + Number(bonus.showing || 0),
    result: Number(rewards.result || 0) + Number(bonus.result || 0),
    contract: Number(rewards.contract || 0) + Number(bonus.contract || 0),
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
    ["general", "免費池"],
    ["visit", "拜訪池"],
    ["showing", "帶看池"],
    ["result", "成果池"],
    ["contract", "成交池"],
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
  const phoneRemainder = metrics.calls % 15;
  const visitProgress = metrics.development + metrics.area / 2;
  const resultProgress = rewardCount(metrics.listing) + rewardCount(metrics.offer) + rewardCount(metrics.meeting);
  const contractCount = rewardCount(metrics.contract);
  const contractProgress = rewardCount(metrics.meeting) / 2 + contractCount / 0.1;

  return [
    {
      key: "activity",
      title: "免費卡池",
      reward: `電話獎勵 +${rewards.general}`,
      current: phoneRemainder,
      target: 15,
      done: metrics.calls >= 15,
      message: `電話再 ${phoneRemainder ? 15 - phoneRemainder : 15} 通，多 1 次免費池抽卡`,
    },
    {
      key: "boosted",
      title: "拜訪卡池",
      reward: `拜訪池 +${rewards.visit}`,
      current: visitProgress % 1,
      target: 1,
      done: visitProgress >= 1,
      message: "有效拜訪、其他拜訪與社區服務會累積拜訪池進度",
    },
    {
      key: "showing",
      title: "帶看卡池",
      reward: `帶看池 +${rewards.showing}`,
      current: metrics.showing,
      target: Math.floor(metrics.showing) + 1,
      done: metrics.showing >= 1,
      message: "每增加 1 組帶看，就增加 1 次帶看池抽卡",
    },
    {
      key: "result",
      title: "成果覺醒",
      reward: `成果池 +${rewards.result}`,
      current: resultProgress,
      target: 1,
      done: resultProgress >= 1,
      message: resultProgress >= 1 ? "委託與斡旋成果已推進成果池" : "先拿 1 件委託或斡旋成果",
    },
    {
      key: "contract",
      title: "成交卡池",
      reward: `成交池 +${rewards.contract}`,
      current: contractProgress,
      target: 1,
      done: contractProgress >= 1,
      message: contractProgress >= 1 ? "見面談或成交已推進成交池" : "見面談每 2 次、成交每 0.1 件會增加抽數",
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
    if (key in state.tickets) {
      state.tickets[key] += value;
      recordDrawStats("earned", key, value);
    }
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
    text: `${periodKey} 新增差額：經驗 +${rewards.exp}，抽卡 +${rewardTicketTotal(rewards)}${rewards.streakReward ? `，${rewards.streakReward.title}` : ""}${rewards.petGrowth ? `，${petGrowthSummary(rewards.petGrowth)}` : ""}`,
  });
  state.history = state.history.slice(0, 12);
  saveState();
  render();
  triggerCelebration(rewards.petGrowth ? "pet" : rewards.contract > 0 ? "rare" : rewardTicketTotal(rewards) > 0 ? "ticket" : "growth");
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
      sums[key] += reportMetricValueForHeader(header, key, parsed);
      groups[key].effective += parsed.effective;
      groups[key].total += reportMetricTotalForHeader(header, key, parsed);
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

function reportMetricValueForHeader(header, key, parsed) {
  const normalized = normalizeReportHeader(header);
  if (key === "area" && normalized.includes("家戶經營")) return parsed.total;
  if (key === "showing" && normalized.includes("銷售")) return parsed.total;
  if (key === "showing" && normalized.includes("成交買")) return parsed.effective;
  return parsed.weighted;
}

function reportMetricTotalForHeader(header, key, parsed) {
  const normalized = normalizeReportHeader(header);
  if (key === "showing" && normalized.includes("成交買")) return parsed.effective;
  return parsed.total;
}

function headerToMetricKey(header) {
  const normalized = normalizeReportHeader(header);
  if (EXACT_REPORT_HEADERS[normalized]) return EXACT_REPORT_HEADERS[normalized];
  return REPORT_HEADER_RULES.find(([, aliases]) => aliases.some((alias) => normalized.includes(alias)))?.[0];
}

function rollEssenceAmount() {
  const selected = weightedChoiceFromEntries(INTERNAL_DRAW_PACING_CONFIG.essenceAmountWeights, { amount: 1 });
  return rewardCount(selected?.amount || 1);
}

function rollDrawOutcomeKind(pool) {
  if (shouldForcePetByPity(pool.key)) return "pet";
  return weightedChoiceFromMap(drawOutcomeWeights(pool.key), "essence");
}

function applyPetDrawResult(pet) {
  const existing = getOwned(pet.pet_id);
  if (!existing) {
    state.collection[pet.pet_id] = createOwnedPet(pet);
    return {
      outcomeKind: "pet",
      duplicate: false,
      fragmentsAdded: 0,
      text: "新夥伴加入卡片庫",
    };
  }

  addDuplicateStarSoul(existing);
  return {
    outcomeKind: "star_soul",
    duplicate: true,
    fragmentsAdded: 1,
    text: existing.star >= 5
      ? `${pet.name}星魂 +1，五星後星魂已保留在背包`
      : `${pet.name}星魂 +1`,
  };
}

function buildLocalDrawResult(pool) {
  const pet = drawCandidate(pool);
  if (!pet) return null;
  const outcomeKind = rollDrawOutcomeKind(pool);
  if (outcomeKind === "pet") {
    return { pet, ...applyPetDrawResult(pet) };
  }
  if (outcomeKind === "egg") {
    addEgg(pet.pet_id, 1);
    return {
      pet,
      outcomeKind: "egg",
      duplicate: false,
      fragmentsAdded: 0,
      eggPetId: pet.pet_id,
      resourceLabel: eggLabel(pet),
      resourceAmount: 1,
      text: `${eggLabel(pet)} +1`,
    };
  }
  const amount = rollEssenceAmount();
  addEssence(pet.storyline_id, amount);
  return {
    pet,
    outcomeKind: "essence",
    duplicate: false,
    fragmentsAdded: 0,
    essenceKey: essenceKeyForStoryline(pet.storyline_id),
    essenceLabel: essenceLabelForStoryline(pet.storyline_id),
    essenceAmount: amount,
    resourceLabel: essenceLabelForStoryline(pet.storyline_id),
    resourceAmount: amount,
    text: `${essenceLabelForStoryline(pet.storyline_id)} ×${amount}`,
  };
}

function canStartDraw(poolKey) {
  const productionSequenceRequired = Boolean(CLOUD_API_BASE_URL && CLOUD_API_BASE_URL !== "mock");
  if (productionSequenceRequired && !cloudPlayerStateReady) return false;
  if (poolKey === "contract_guarantee") {
    return contractGuaranteeRemainingDraws() > 0 && Boolean(nextPreparedCloudDraw(poolKey));
  }
  const guaranteedPool = guaranteedPoolConfig(poolKey);
  if (guaranteedPool) {
    if (productionSequenceRequired) return Boolean(nextPreparedCloudDraw(poolKey));
    if (CLOUD_API_BASE_URL && nextPreparedCloudDraw(poolKey)) return true;
    const balance = Number(state.guaranteedDraws?.[guaranteedPool.key] || 0);
    return balance > 0 && guaranteedPoolCandidates(guaranteedPool).length > 0;
  }
  const pool = POOLS.find((item) => item.key === poolKey);
  if (productionSequenceRequired) {
    return Boolean(pool && Number(state.tickets?.[poolKey] || 0) > 0 && poolCandidates(pool).length > 0 && nextPreparedCloudDraw(poolKey));
  }
  return Boolean(pool && Number(state.tickets?.[poolKey] || 0) > 0 && poolCandidates(pool).length > 0);
}

function drawPendingMarkup(pool) {
  return `
    <article class="draw-pending-card" aria-live="polite" aria-busy="true">
      <span class="summon-kicker">正在開啟</span>
      <div class="draw-pending-main">
        <span class="draw-pending-orbit" aria-hidden="true"></span>
        <div>
          <strong>${escapeHtml(pool.name)}</strong>
          <p>精靈正在回應，請稍候。</p>
        </div>
      </div>
    </article>
  `;
}

function showDrawPendingState(poolKey, pool) {
  document.querySelectorAll("button[data-draw]").forEach((button) => {
    const isCurrentPool = button.dataset.draw === poolKey;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    if (isCurrentPool) {
      button.classList.add("is-drawing");
      button.textContent = "開啟中...";
    }
  });
  const resultTarget = document.getElementById("drawResult");
  if (resultTarget) resultTarget.innerHTML = drawPendingMarkup(pool);
  showDrawRevealPending(pool);
}

function openDrawRevealOverlay() {
  const overlay = document.getElementById("drawRevealOverlay");
  if (!overlay) return null;
  overlay.hidden = false;
  document.body?.classList?.add?.("draw-reveal-open");
  return overlay;
}

function closeDrawRevealOverlay() {
  const overlay = document.getElementById("drawRevealOverlay");
  if (overlay) overlay.hidden = true;
  document.body?.classList?.remove?.("draw-reveal-open");
}

function showDrawRevealPending(pool) {
  if (!DRAW_REVEAL_OVERLAY_ENABLED) return;
  const overlay = openDrawRevealOverlay();
  const target = document.getElementById("drawRevealContent");
  if (!overlay || !target) return;
  target.innerHTML = `
    <div class="draw-reveal-pending" aria-busy="true">
      <span class="draw-reveal-orbit" aria-hidden="true"></span>
      <span class="summon-kicker">正在揭曉</span>
      <strong>${escapeHtml(pool.name)}</strong>
      <p>抽卡順序已準備，正在翻開這一張。</p>
    </div>
  `;
}

function renderDrawRevealResult() {
  if (!DRAW_REVEAL_OVERLAY_ENABLED) return;
  const overlay = document.getElementById("drawRevealOverlay");
  const target = document.getElementById("drawRevealContent");
  if (!overlay || overlay.hidden || !target) return;
  const lastDraw = state.history.find((item) => item.type === "draw");
  const pet = lastDraw ? (getPet(lastDraw.petId) || lastDraw.petSnapshot) : null;
  if (!lastDraw || !pet) return;
  const owned = getOwned(pet.pet_id);
  const tone = drawOutcomeTone(lastDraw, pet);
  const flavor = isEssenceDraw(lastDraw) ? "" : petFlavorText(pet);
  const summary = drawResultSummaryText(lastDraw, pet);
  const syncText = lastDraw.syncError
    ? "結果已保留，雲端確認失敗，請保持網路後重新開啟。"
    : lastDraw.pendingSync
      ? "結果已揭曉，雲端保存中。"
      : "雲端已保存，可以繼續抽卡。";
  target.innerHTML = `
    <article class="draw-reveal-card draw-tone-${escapeHtml(tone)}">
      <span class="summon-kicker">抽卡結果</span>
      <div class="draw-reveal-visual">${drawResultVisual(pet, owned, lastDraw, "large")}</div>
      <div class="pet-name-row draw-reveal-name">
        <h2>${escapeHtml(drawPrimaryLabel(lastDraw, pet))}</h2>
        ${isEssenceDraw(lastDraw) ? "" : `<span class="rarity-badge rarity-${escapeHtml(pet.rarity)}">${escapeHtml(pet.rarity)}</span>`}
      </div>
      <strong class="draw-reveal-outcome">${escapeHtml(drawOutcomeLabel(lastDraw, pet))}</strong>
      ${flavor ? `<p class="pet-flavor">「${escapeHtml(flavor)}」</p>` : ""}
      ${summary ? `<p class="draw-result-summary">${escapeHtml(summary)}</p>` : ""}
      <p class="draw-reveal-sync ${lastDraw.pendingSync ? "is-saving" : "is-saved"}">${escapeHtml(syncText)}</p>
      <button class="primary-button draw-reveal-accept" type="button" data-close-draw-reveal="1">收下</button>
    </article>
  `;
}

function waitForDrawPendingPaint() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
      resolve();
      return;
    }
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
  });
}

function renderDrawSurfaces() {
  renderActivePet();
  renderEntrySummon();
  renderProgressDashboard();
  renderRewardAction();
  renderPools();
  renderDrawResult();
  renderCollectionSummary();
  renderInventoryBag();
  if (isViewActive("collection")) renderCollection();
  if (isViewActive("cardgame")) renderCardGameBoard();
}

function renderImmediateDrawSurfaces() {
  renderPools();
  renderDrawResult();
  const poolGrid = document.getElementById("poolGrid");
  if (drawRequest?.startedAt) lastDrawRevealLatencyMs = Math.max(0, Date.now() - drawRequest.startedAt);
  if (poolGrid?.dataset) poolGrid.dataset.lastRevealMs = String(lastDrawRevealLatencyMs);
}

function drawPerformanceMark(name) {
  if (typeof performance !== "object" || typeof performance.mark !== "function") return;
  performance.mark(`draw:${name}`);
}

function setDrawDiagnostic(status) {
  const poolGrid = document.getElementById("poolGrid");
  if (poolGrid?.dataset) poolGrid.dataset.lastDrawStatus = status;
}

function persistPreparedDrawClaimQueue() {
  try {
    const payload = {
      pending: pendingPreparedDrawClaims,
      active: activePreparedDrawClaims,
      activeRequestId: activeDrawClaimRequestId,
    };
    if (!payload.pending.length && !payload.active.length) localStorage.removeItem(DRAW_CLAIM_QUEUE_STORAGE_KEY);
    else localStorage.setItem(DRAW_CLAIM_QUEUE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // The in-memory queue still retries when storage is unavailable.
  }
}

function restorePreparedDrawClaimQueue() {
  try {
    const stored = JSON.parse(localStorage.getItem(DRAW_CLAIM_QUEUE_STORAGE_KEY) || "{}");
    pendingPreparedDrawClaims = Array.isArray(stored.pending) ? stored.pending : [];
    activePreparedDrawClaims = Array.isArray(stored.active) ? stored.active : [];
    activeDrawClaimRequestId = cleanProfileText(stored.activeRequestId || "", "", 240);
  } catch {
    pendingPreparedDrawClaims = [];
    activePreparedDrawClaims = [];
    activeDrawClaimRequestId = "";
  }
}

function schedulePreparedDrawClaimFlush(delay = DRAW_CLAIM_BATCH_DELAY_MS) {
  if (!CLOUD_API_BASE_URL || CLOUD_API_BASE_URL === "mock" && !pendingPreparedDrawClaims.length && !activePreparedDrawClaims.length) return;
  if (drawClaimBatchTimer) clearTimeout(drawClaimBatchTimer);
  drawClaimBatchTimer = setTimeout(() => {
    drawClaimBatchTimer = null;
    flushPreparedDrawClaims();
  }, Math.max(0, delay));
}

function enqueuePreparedDrawClaim(entry) {
  if (!entry?.entry_id || !state.drawSession?.session_id) return false;
  const exists = [...activePreparedDrawClaims, ...pendingPreparedDrawClaims]
    .some((claim) => claim.entryId === entry.entry_id && claim.sessionId === state.drawSession.session_id);
  if (exists) return true;
  pendingPreparedDrawClaims.push({
    sessionId: state.drawSession.session_id,
    entryId: entry.entry_id,
    poolKey: entry.pool,
    period: currentPeriodKey(),
    queuedAt: new Date().toISOString(),
  });
  persistPreparedDrawClaimQueue();
  schedulePreparedDrawClaimFlush(pendingPreparedDrawClaims.length >= 5 ? 0 : DRAW_CLAIM_BATCH_DELAY_MS);
  return true;
}

function preparedDrawClaimError(envelope) {
  const first = Array.isArray(envelope?.errors) ? envelope.errors[0] : null;
  const error = new Error(first?.message || "claimDrawBatch response missing data");
  error.code = first?.code || "DRAW_CLAIM_BATCH_FAILED";
  return error;
}

function replayPendingPreparedDrawDebits(claims = pendingPreparedDrawClaims) {
  const pendingKeys = new Set(claims.map((claim) => `${claim.sessionId}:${claim.entryId}`));
  (state.drawSession?.entries || []).forEach((entry) => {
    if (!pendingKeys.has(`${state.drawSession?.session_id}:${entry.entry_id}`) || entry.claimed) return;
    entry.client_revealed = true;
    delete entry.optimistic_debit;
    applyPreparedDrawOptimisticDebit(entry);
  });
}

function applyPreparedDrawClaimResults(data, claims) {
  const draws = Array.isArray(data?.draws) ? data.draws : [];
  applyCloudPlayerState(data.player_state, { persist: false, render: false });
  draws.forEach((drawResult) => {
    const historyItem = state.history.find((item) => item.drawSessionEntryId === drawResult.draw_entry_id);
    if (!historyItem) return;
    const pet = getPet(drawResult.pet?.pet_id) || drawResult.pet || historyItem.petSnapshot;
    Object.assign(historyItem, {
      petId: pet?.pet_id || historyItem.petId,
      petSnapshot: pet ? { ...pet } : historyItem.petSnapshot,
      duplicate: Boolean(drawResult.duplicate),
      fragmentsAdded: rewardCount(drawResult.fragments_added),
      outcomeKind: drawResult.outcome_kind || historyItem.outcomeKind,
      eggPetId: drawResult.egg_pet_id || "",
      essenceKey: drawResult.essence_key || "",
      essenceLabel: drawResult.resource_label || "",
      essenceAmount: rewardCount(drawResult.essence_amount || 0),
      resourceLabel: drawResult.resource_label || "",
      resourceAmount: rewardCount(drawResult.resource_amount || drawResult.essence_amount || 0),
      pendingSync: false,
      syncError: false,
    });
  });
  const acceptedIds = new Set(claims.map((claim) => claim.entryId));
  state.history.forEach((item) => {
    if (acceptedIds.has(item.drawSessionEntryId)) item.pendingSync = false;
  });
  replayPendingPreparedDrawDebits();
  state.manager.cloudStatus = "cloud-draw-claim-batch";
  drawPerformanceMark("sync-applied");
  saveState();
  renderDrawSurfaces();
}

async function flushPreparedDrawClaims() {
  if (drawClaimBatchInFlight || (!activePreparedDrawClaims.length && !pendingPreparedDrawClaims.length)) return false;
  if (!activePreparedDrawClaims.length) {
    const first = pendingPreparedDrawClaims[0];
    activePreparedDrawClaims = pendingPreparedDrawClaims
      .filter((claim) => claim.sessionId === first.sessionId && claim.period === first.period)
      .slice(0, 10);
    const activeKeys = new Set(activePreparedDrawClaims.map((claim) => `${claim.sessionId}:${claim.entryId}`));
    pendingPreparedDrawClaims = pendingPreparedDrawClaims
      .filter((claim) => !activeKeys.has(`${claim.sessionId}:${claim.entryId}`));
    activeDrawClaimRequestId = randomClientId("draw-claim-batch");
  }
  const claims = activePreparedDrawClaims.slice();
  const sessionId = claims[0]?.sessionId || "";
  const period = claims[0]?.period || currentPeriodKey();
  if (!claims.length || !sessionId) return false;

  drawClaimBatchInFlight = true;
  persistPreparedDrawClaimQueue();
  drawPerformanceMark("sync-sent");
  try {
    const envelope = await postCloudEnvelope("claimDrawBatch", {
      uid: PROFILE.employeeId || PROFILE.userKey,
      period,
      draw_session_id: sessionId,
      draw_entry_ids: claims.map((claim) => claim.entryId),
      client_request_id: activeDrawClaimRequestId,
    });
    const data = cloudEnvelopeData(envelope, "claimDrawBatch");
    if (!data?.player_state || !Array.isArray(data.draws)) throw preparedDrawClaimError(envelope);
    activePreparedDrawClaims = [];
    activeDrawClaimRequestId = "";
    drawClaimRetryCount = 0;
    applyPreparedDrawClaimResults(data, claims);
    persistPreparedDrawClaimQueue();
    if (pendingPreparedDrawClaims.length) schedulePreparedDrawClaimFlush(0);
    return true;
  } catch (error) {
    drawClaimRetryCount += 1;
    state.manager.cloudStatus = `cloud-draw-claim-retry:${error.code || error.message || "unknown"}`;
    claims.forEach((claim) => {
      const historyItem = state.history.find((item) => item.drawSessionEntryId === claim.entryId);
      if (historyItem) historyItem.syncError = true;
    });
    saveState();
    persistPreparedDrawClaimQueue();
    schedulePreparedDrawClaimFlush(Math.min(8000, 500 * (2 ** Math.min(drawClaimRetryCount, 4))));
    return false;
  } finally {
    drawClaimBatchInFlight = false;
  }
}

async function draw(poolKey) {
  if (drawRequest) {
    setDrawDiagnostic("blocked-request");
    return false;
  }
  if (!canStartDraw(poolKey)) {
    setDrawDiagnostic("blocked-eligibility");
    return false;
  }
  const guaranteedPool = guaranteedPoolConfig(poolKey);
  const pool = POOLS.find((item) => item.key === poolKey) || guaranteedPool || (poolKey === "contract_guarantee" ? { key: poolKey, name: "成交神殿保底批次" } : null);
  if (!pool) return false;

  pinnedDrawPoolKey = displayPoolKey(poolKey);
  drawRequest = { poolKey, startedAt: Date.now() };
  try {
    let pet = null;
    const preparedEntry = CLOUD_API_BASE_URL ? nextPreparedCloudDraw(poolKey) : null;
    if (preparedEntry) {
      if (drawRequest) return false;
      drawPerformanceMark("tap");
      pet = revealPreparedCloudDraw(pool, preparedEntry);
      if (!pet) {
        setDrawDiagnostic(`blocked-outcome:${preparedEntry.entry_id || "unknown"}`);
        return false;
      }
      renderImmediateDrawSurfaces();
      setDrawDiagnostic(`revealed:${preparedEntry.entry_id}`);
      drawPerformanceMark("reveal");
      renderDrawRevealResult();
      if (pet) triggerCelebration(drawOutcomeTone(state.history[0], pet));
      preloadPreparedDrawAssets();
      enqueuePreparedDrawClaim(preparedEntry);
      return Boolean(pet);
    }

    showDrawPendingState(poolKey, pool);
    await waitForDrawPendingPaint();
    if (CLOUD_API_BASE_URL && CLOUD_API_BASE_URL !== "mock") {
      state.manager.cloudStatus = "draw-session-preparing";
      saveState();
      closeDrawRevealOverlay();
      await loadCloudState();
      return false;
    } else if (CLOUD_API_BASE_URL) {
      pet = await drawCloud(poolKey);
    } else if (guaranteedPool) {
      pet = drawLocalGuaranteed(guaranteedPool);
    } else {
      const result = buildLocalDrawResult(pool);
      if (result?.pet) {
        pet = result.pet;
        state.tickets[poolKey] -= 1;
        recordDrawStats("drawn", poolKey, 1);
        recordDrawPity(poolKey, { pet: ["pet", "star_soul", "essence_conversion", "temple_blessing"].includes(result.outcomeKind) ? pet : null });
        const assistText = activePetAssistText();
        if (result.outcomeKind === "pet") state.activePetId = pet.pet_id;
        state.history.unshift({
          type: "draw",
          at: new Date().toISOString(),
          petId: pet.pet_id,
          text: `${pool.name} 抽到 ${result.text}`,
          assistText,
          poolKey,
          duplicate: Boolean(result.duplicate),
          fragmentsAdded: rewardCount(result.fragmentsAdded || 0),
          outcomeKind: result.outcomeKind,
          eggPetId: result.eggPetId || "",
          essenceKey: result.essenceKey || "",
          essenceLabel: result.essenceLabel || "",
          essenceAmount: rewardCount(result.essenceAmount || 0),
          resourceLabel: result.resourceLabel || "",
          resourceAmount: rewardCount(result.resourceAmount || 0),
          rateMode: configuredDropRates(pool.key) ? "backend-configured" : "prototype-unweighted",
        });
        state.history = state.history.slice(0, 12);
        saveState();
      }
    }

    renderDrawSurfaces();
    renderDrawRevealResult();
    if (pet) triggerCelebration(drawOutcomeTone(state.history[0], pet));
    return Boolean(pet);
  } finally {
    drawRequest = null;
  }
}

async function drawTenGeneral() {
  const poolKey = "general";
  const pool = POOLS.find((item) => item.key === poolKey);
  const entries = preparedCloudDraws(poolKey, 10);
  if (drawRequest || !pool || Number(state.tickets?.general || 0) < 10 || entries.length < 10) return false;

  pinnedDrawPoolKey = "general";
  const batchRevealId = randomClientId("ten-draw");
  drawRequest = { poolKey, batchSize: 10, startedAt: Date.now() };
  try {
    entries.forEach((entry, index) => {
      revealPreparedCloudDraw(pool, entry);
      const historyItem = state.history.find((item) => item.drawSessionEntryId === entry.entry_id);
      if (historyItem) {
        historyItem.batchRevealId = batchRevealId;
        historyItem.batchIndex = index + 1;
      }
    });
    saveState();
    renderDrawSurfaces();
    const batchDraws = state.history.filter((item) => item.batchRevealId === batchRevealId);
    const strongest = batchDraws.find((item) => item.outcomeKind === "pet" || item.outcomeKind === "star_soul")
      || batchDraws.find((item) => item.outcomeKind === "egg")
      || batchDraws[0];
    const strongestPet = strongest ? (getPet(strongest.petId) || strongest.petSnapshot) : null;
    if (strongestPet) triggerCelebration(drawOutcomeTone(strongest, strongestPet));
    return await drawCloudBatch(entries, batchRevealId);
  } finally {
    drawRequest = null;
  }
}

function revealPreparedCloudDraw(pool, entry) {
  const outcome = isPlainObject(entry?.outcome) ? entry.outcome : {};
  const pet = getPet(outcome.pet_id || outcome.pet?.pet_id) || outcome.pet;
  if (!pet) return null;
  pinnedDrawPoolKey = displayPoolKey(entry.pool);
  entry.client_revealed = true;
  applyPreparedDrawOptimisticDebit(entry);
  const outcomeKind = outcome.outcome_kind || "pet";
  const label = outcomeKind === "essence"
    ? `${outcome.resource_label || essenceLabelForStoryline(pet.storyline_id)} x${rewardCount(outcome.essence_amount || 1)}`
    : outcomeKind === "egg"
      ? `${eggLabel(pet)} +1`
      : `${pet.name} 已現身`;
  state.history.unshift({
    type: "draw",
    at: new Date().toISOString(),
    petId: pet.pet_id,
    petSnapshot: { ...pet },
    text: `${pool.name} ${label}`,
    assistText: activePetAssistText(),
    poolKey: entry.pool,
    duplicate: false,
    fragmentsAdded: 0,
    outcomeKind,
    eggPetId: outcomeKind === "egg" ? pet.pet_id : "",
    essenceKey: outcome.essence_key || "",
    essenceLabel: outcome.resource_label || "",
    essenceAmount: rewardCount(outcome.essence_amount || 0),
    resourceLabel: outcome.resource_label || "",
    resourceAmount: rewardCount(outcome.essence_amount || 0),
    drawSessionEntryId: entry.entry_id,
    pendingSync: true,
    rateMode: entry.resource_type === "contract_guarantee_batch" ? "contract-guarantee-batch" : "cloud-prepared",
  });
  state.history = state.history.slice(0, 12);
  saveState();
  return pet;
}

function applyPreparedDrawOptimisticDebit(entry) {
  if (!entry || entry.optimistic_debit) return false;
  if (entry.resource_type === "ticket") {
    const previous = Math.max(0, Number(state.tickets?.[entry.pool] || 0));
    state.tickets[entry.pool] = Math.max(0, previous - 1);
    recordDrawStats("drawn", entry.pool, 1);
    entry.optimistic_debit = { type: "ticket", pool: entry.pool, previous };
    return true;
  }
  if (entry.resource_type === "guaranteed_pet_draw") {
    const guaranteedPool = guaranteedPoolConfig(entry.pool);
    if (!guaranteedPool) return false;
    state.guaranteedDraws = normalizeGuaranteedDraws(state.guaranteedDraws);
    const previous = Math.max(0, Number(state.guaranteedDraws[guaranteedPool.key] || 0));
    state.guaranteedDraws[guaranteedPool.key] = Math.max(0, previous - 1);
    entry.optimistic_debit = { type: "guaranteed_pet_draw", key: guaranteedPool.key, previous };
    return true;
  }
  if (entry.resource_type === "contract_guarantee_batch") {
    const batch = contractGuaranteeBatches().find((item) => item.batch_id === entry.contract_batch_id);
    if (!batch) return false;
    const previousRevealed = Math.max(0, Number(batch.revealed_draws || 0));
    const previousRemaining = Math.max(0, Number(batch.remaining_draws ?? (Number(batch.total_draws || 0) - previousRevealed)));
    batch.revealed_draws = Math.min(Number(batch.total_draws || 0), previousRevealed + 1);
    batch.remaining_draws = Math.max(0, previousRemaining - 1);
    entry.optimistic_debit = {
      type: "contract_guarantee_batch",
      batchId: batch.batch_id,
      previousRevealed,
      previousRemaining,
    };
    return true;
  }
  return false;
}

function rollbackPreparedDrawOptimisticDebit(entry) {
  const debit = entry?.optimistic_debit;
  if (!debit) return false;
  if (debit.type === "ticket") {
    state.tickets[debit.pool] = debit.previous;
    recordDrawStats("drawn", debit.pool, -1);
  } else if (debit.type === "guaranteed_pet_draw") {
    state.guaranteedDraws = normalizeGuaranteedDraws(state.guaranteedDraws);
    state.guaranteedDraws[debit.key] = debit.previous;
  } else if (debit.type === "contract_guarantee_batch") {
    const batch = contractGuaranteeBatches().find((item) => item.batch_id === debit.batchId);
    if (batch) {
      batch.revealed_draws = debit.previousRevealed;
      batch.remaining_draws = debit.previousRemaining;
    }
  }
  delete entry.optimistic_debit;
  entry.client_revealed = false;
  return true;
}

function drawLocalGuaranteed(pool) {
  state.guaranteedDraws = normalizeGuaranteedDraws(state.guaranteedDraws);
  if (Number(state.guaranteedDraws[pool.key] || 0) <= 0) return false;
  const pet = randomFrom(guaranteedPoolCandidates(pool));
  if (!pet) return false;
  const result = applyPetDrawResult(pet);
  state.guaranteedDraws[pool.key] -= 1;
  if (result.outcomeKind === "pet") state.activePetId = pet.pet_id;
  state.history.unshift({
    type: "draw",
    at: new Date().toISOString(),
    petId: pet.pet_id,
    text: `${pool.name} 抽到 ${pet.name}，${result.text}`,
    assistText: activePetAssistText(),
    poolKey: pool.poolKey,
    duplicate: Boolean(result.duplicate),
    fragmentsAdded: rewardCount(result.fragmentsAdded || 0),
    outcomeKind: result.outcomeKind,
    rateMode: "monthly-guaranteed-pet",
  });
  state.history = state.history.slice(0, 12);
  saveState();
  return pet;
}

async function drawCloud(poolKey, preparedEntry = null) {
  const guaranteedPool = guaranteedPoolConfig(poolKey);
  const pool = POOLS.find((item) => item.key === poolKey) || guaranteedPool || (poolKey === "contract_guarantee" ? { key: poolKey, name: "成交神殿保底批次" } : null);
  if (!pool) return false;
  try {
    const envelope = await postCloudEnvelope("draw", {
      uid: PROFILE.employeeId || PROFILE.userKey,
      period: currentPeriodKey(),
      pool: poolKey,
      resource_type: preparedEntry?.resource_type || (guaranteedPool ? "guaranteed_pet_draw" : "ticket"),
      draw_session_id: preparedEntry ? state.drawSession?.session_id : "",
      draw_entry_id: preparedEntry?.entry_id || "",
      client_request_id: preparedEntry ? `draw_${state.drawSession?.session_id || "session"}_${preparedEntry.entry_id}` : randomClientId("draw"),
    });
    const data = cloudEnvelopeData(envelope, "draw");
    if (!data || !data.pet || !data.player_state) throw new Error("draw response missing pet/player_state");
    applyCloudPlayerState(data.player_state, { render: false });
    const pet = getPet(data.pet.pet_id) || data.pet;
    const outcomeKind = data.outcome_kind || (data.duplicate ? "star_soul" : "pet");
    const resultText = data.text || (data.duplicate ? `${pet.name || data.pet.pet_id}星魂 +${rewardCount(data.fragments_added)}` : "新寵物加入卡片庫");
    const historyItem = {
      type: "draw",
      at: new Date().toISOString(),
      petId: data.pet.pet_id,
      petSnapshot: { ...pet },
      text: `${pool.name} 抽到 ${pet.name || data.pet.pet_id}，${resultText}`,
      assistText: activePetAssistText(),
      poolKey,
      duplicate: Boolean(data.duplicate),
      fragmentsAdded: rewardCount(data.fragments_added),
      outcomeKind,
      eggPetId: data.egg_pet_id || "",
      essenceKey: data.essence_key || "",
      essenceLabel: data.resource_label || "",
      essenceAmount: rewardCount(data.essence_amount || 0),
      resourceLabel: data.resource_label || "",
      resourceAmount: rewardCount(data.resource_amount || data.essence_amount || 0),
      drawSessionEntryId: preparedEntry?.entry_id || "",
      pendingSync: false,
      rateMode: preparedEntry?.resource_type === "contract_guarantee_batch" ? "contract-guarantee-batch" : (guaranteedPool ? "cloud-monthly-guaranteed-pet" : "cloud"),
    };
    const existingIndex = preparedEntry ? state.history.findIndex((item) => item.drawSessionEntryId === preparedEntry.entry_id) : -1;
    if (existingIndex >= 0) state.history.splice(existingIndex, 1, historyItem);
    else state.history.unshift(historyItem);
    state.history = state.history.slice(0, 12);
    state.manager.cloudStatus = CLOUD_API_BASE_URL === "mock" ? "mock-draw" : "cloud-draw";
    saveState();
    renderDrawSurfaces();
    renderDrawRevealResult();
    return pet;
  } catch (error) {
    state.manager.cloudStatus = `cloud-draw-error:${error.message || "unknown"}`;
    const pending = preparedEntry && state.history.find((item) => item.drawSessionEntryId === preparedEntry.entry_id);
    if (pending) pending.syncError = true;
    rollbackPreparedDrawOptimisticDebit(preparedEntry);
    saveState();
    renderDrawSurfaces();
    renderDrawRevealResult();
    return false;
  }
}

async function drawCloudBatch(entries, batchRevealId) {
  try {
    const envelope = await postCloudEnvelope("drawBatch", {
      uid: PROFILE.employeeId || PROFILE.userKey,
      period: currentPeriodKey(),
      pool: "general",
      draw_session_id: state.drawSession?.session_id || "",
      draw_entry_ids: JSON.stringify(entries.map((entry) => entry.entry_id)),
      client_request_id: `draw_batch_${state.drawSession?.session_id || "session"}_${entries.map((entry) => entry.entry_id).join("_")}`,
    });
    const data = cloudEnvelopeData(envelope, "drawBatch");
    if (!data?.player_state || !Array.isArray(data.draws) || data.draws.length !== 10) throw new Error("drawBatch response missing draws/player_state");
    applyCloudPlayerState(data.player_state);
    data.draws.forEach((drawResult, index) => {
      const entry = entries[index];
      const historyItem = state.history.find((item) => item.drawSessionEntryId === entry?.entry_id);
      if (!historyItem) return;
      const pet = getPet(drawResult.pet?.pet_id) || drawResult.pet || historyItem.petSnapshot;
      Object.assign(historyItem, {
        petId: pet?.pet_id || historyItem.petId,
        petSnapshot: pet ? { ...pet } : historyItem.petSnapshot,
        text: `${POOLS.find((item) => item.key === "general")?.name || "免費卡池"} ${drawResult.text || "抽卡結果已入帳"}`,
        duplicate: Boolean(drawResult.duplicate),
        fragmentsAdded: rewardCount(drawResult.fragments_added),
        outcomeKind: drawResult.outcome_kind || historyItem.outcomeKind,
        eggPetId: drawResult.egg_pet_id || "",
        essenceKey: drawResult.essence_key || "",
        essenceLabel: drawResult.resource_label || "",
        essenceAmount: rewardCount(drawResult.essence_amount || 0),
        resourceLabel: drawResult.resource_label || "",
        resourceAmount: rewardCount(drawResult.resource_amount || drawResult.essence_amount || 0),
        pendingSync: false,
        batchRevealId,
        batchIndex: index + 1,
        rateMode: "cloud-batch-10",
      });
    });
    state.manager.cloudStatus = "cloud-draw-batch";
    saveState();
    renderDrawSurfaces();
    return true;
  } catch (error) {
    entries.slice().reverse().forEach(rollbackPreparedDrawOptimisticDebit);
    state.history = state.history.filter((item) => item.batchRevealId !== batchRevealId);
    state.manager.cloudStatus = `cloud-draw-batch-error:${error.message || "unknown"}`;
    saveState();
    renderDrawSurfaces();
    return false;
  }
}

async function runCloudPetAction(actionType, petId) {
  try {
    const envelope = await postCloudEnvelope("petAction", {
      uid: PROFILE.employeeId || PROFILE.userKey,
      period: currentPeriodKey(),
      action_type: actionType,
      pet_id: petId,
      client_request_id: randomClientId("pet-action"),
    });
    const data = cloudEnvelopeData(envelope, "petAction");
    if (!data?.player_state) throw new Error("petAction response missing player_state");
    applyCloudPlayerState(data.player_state);
    state.history.unshift({
      type: "system",
      at: new Date().toISOString(),
      text: data.message || "寵物資源已更新。",
    });
    state.history = state.history.slice(0, 12);
    state.manager.cloudStatus = "cloud-petAction";
    saveState();
    render();
    return true;
  } catch (error) {
    state.manager.cloudStatus = `cloud-petAction-error:${error.message || "unknown"}`;
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
  return 1;
}

function starCost(nextStar) {
  return { 2: 1, 3: 2, 4: 3, 5: 4 }[nextStar] || 0;
}

function starLevelRequirement(nextStar) {
  return Math.max(2, Math.min(5, rewardCount(nextStar || 2)));
}

async function upgradeStar(petId) {
  const pet = getPet(petId);
  const owned = getOwned(petId);
  if (!pet || !owned || owned.star >= 5) return;
  const nextStar = owned.star + 1;
  const cost = starCost(nextStar);
  if (rewardCount(owned.level || 1) < starLevelRequirement(nextStar)) return;
  if (owned.duplicate_fragments < cost) return;
  if (CLOUD_API_BASE_URL && CLOUD_API_BASE_URL !== "mock") {
    await runCloudPetAction("upgrade_star", petId);
    return;
  }
  owned.duplicate_fragments -= cost;
  owned.star = nextStar;
  owned.current_form = currentForm(pet, owned);
  owned.last_upgraded_at = new Date().toISOString();
  saveState();
  render();
}

function fiveStarSoulEntries() {
  return PETS
    .map((pet) => ({ pet, owned: getOwned(pet.pet_id) }))
    .filter(({ owned }) => owned && rewardCount(owned.star || 1) >= 5)
    .sort((left, right) => rewardCount(right.owned.duplicate_fragments) - rewardCount(left.owned.duplicate_fragments));
}

function recordPetResourceHistory(text) {
  state.history.unshift({ type: "system", at: new Date().toISOString(), text });
  state.history = state.history.slice(0, 12);
}

async function convertStarSoulToEssence(petId) {
  const pet = getPet(petId);
  const owned = getOwned(petId);
  if (!pet || !owned || owned.star < 5 || rewardCount(owned.duplicate_fragments) < 1) return;
  if (CLOUD_API_BASE_URL && CLOUD_API_BASE_URL !== "mock") {
    await runCloudPetAction("convert_essence", petId);
    return;
  }
  owned.duplicate_fragments -= 1;
  addEssence(pet.storyline_id, STAR_SOUL_ESSENCE_REWARD);
  recordPetResourceHistory(`${pet.name}星魂 -1，兌換${essenceLabelForStoryline(pet.storyline_id)} +${STAR_SOUL_ESSENCE_REWARD}。`);
  saveState();
  render();
}

async function convertStarSoulToTempleBlessing(petId) {
  const pet = getPet(petId);
  const owned = getOwned(petId);
  if (!pet || !owned || owned.star < 5 || !isContractTempleStoryline(pet.storyline_id)) return;
  if (rewardCount(owned.duplicate_fragments) < TEMPLE_BLESSING_SOUL_COST) return;
  if (CLOUD_API_BASE_URL && CLOUD_API_BASE_URL !== "mock") {
    await runCloudPetAction("convert_blessing", petId);
    return;
  }
  owned.duplicate_fragments -= TEMPLE_BLESSING_SOUL_COST;
  state.specialResources = isPlainObject(state.specialResources) ? state.specialResources : {};
  state.specialResources.templeBlessing = rewardCount(state.specialResources.templeBlessing || 0) + 1;
  recordPetResourceHistory(`${pet.name}星魂 -${TEMPLE_BLESSING_SOUL_COST}，兌換神殿祝福 +1。`);
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
  if (!ULTIMATE_FEATURE_ENABLED) return false;
  if (!owned || !owned.awakened || owned.ultimate || !pet.can_be_ultimate) return false;
  return hasMaterials(pet.required_ultimate_materials) && owned.duplicate_fragments >= ultimateFragmentCost(pet);
}

function ultimatePet(petId) {
  if (!ULTIMATE_FEATURE_ENABLED) return;
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
  const maintenanceMenu = document.getElementById("maintenanceMenu");
  if (maintenanceMenu) maintenanceMenu.hidden = !MANAGER_MODE;
  ["backupBtn", "restoreBtn"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.hidden = !MANAGER_MODE;
  });
  const legacyResetButton = document.getElementById("resetBtn");
  if (legacyResetButton) legacyResetButton.hidden = true;
  const managerVersion = document.getElementById("managerVersionLabel");
  if (managerVersion) {
    managerVersion.hidden = !MANAGER_MODE;
    managerVersion.textContent = `版本 ${APP_VERSION}`;
  }
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
  const cloudSettlement = isPlainObject(state.latestSettlementSummary) ? state.latestSettlementSummary : {};
  const cloudStatus = String(cloudSettlement.status || "").toLowerCase();
  const periodText = settled?.period || cloudSettlement.report_period || cloudSettlement.period || normalizeSourceLedger(state.sourceLedger).activePeriod || currentPeriodKey();
  const nextStreak = nextStreakRewardPreview();
  const nextStreakText = `下個寶箱 ${nextStreak.count}天：${nextStreak.title}`;
  if (status) {
    const periodStatus = settled
      ? settled.awarded
        ? `<span class="material-pill">${escapeHtml(periodText)} 差額已入帳</span><span class="soft-pill">新累積會補差額</span>`
        : `<span class="soft-pill">${escapeHtml(periodText)} 已記錄，沒有新增差額</span><span class="soft-pill">新累積會補差額</span>`
      : cloudStatus === "first_import"
        ? `<span class="material-pill">${escapeHtml(periodText)} 本月累積已同步</span><span class="soft-pill">首次匯入</span>`
        : cloudStatus === "changed"
          ? `<span class="material-pill">${escapeHtml(periodText)} 差額已入帳</span><span class="soft-pill">新累積會補差額</span>`
          : cloudStatus === "no_change"
            ? `<span class="soft-pill">${escapeHtml(periodText)} 已記錄，沒有新增差額</span><span class="soft-pill">新累積會補差額</span>`
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
  const employeeId = PROFILE.employeeId || PROFILE.userKey;
  const agentLabel = String(PROFILE.agent || "").includes(employeeId) || String(PROFILE.agent || "").includes("員編")
    ? ""
    : ` · ${PROFILE.agent}`;
  if (branchLabel) {
    branchLabel.textContent = MANAGER_MODE
      ? `${PROFILE.branch} · 店長儀表板${cloudLabel}`
      : `${PROFILE.branch}${agentLabel} · 員編 ${employeeId}${cloudLabel}`;
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
      <span class="soft-pill">${currentForm(pet, owned)}</span>
    </div>
    <p class="small-text">今天行程養等級，今天成果推覺醒。</p>
    <div class="stat-line">
      <div class="team-topline"><span>Lv.${owned?.level || 1}</span><span>${owned?.exp || 0}/${expMax}</span></div>
      <div class="bar"><span style="width:${expPercent}%"></span></div>
    </div>
    <div class="pool-meta">
      <span class="material-pill">${"★".repeat(owned?.star || 1)}${"☆".repeat(5 - (owned?.star || 1))}</span>
      <span class="material-pill">星魂 ${owned?.duplicate_fragments || 0}</span>
    </div>
    <p class="pet-compact-note">${escapeHtml(activePetAssistText(pet, owned))}</p>
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
  const sourceMetrics = normalizeGameMetrics((state.progress?.sourceMetrics || state.progress?.deltaMetrics || state.metrics || {}));
  const deltaMetrics = normalizeGameMetrics((state.progress?.deltaMetrics || state.metrics || {}));
  const progress = state.progress || buildProgressSnapshot(state.metrics);
  const priority = buildHomePriorityCard();
  summon.innerHTML = `
    ${buildHomeHeroPanel(sourceMetrics, progress.period, priority)}
    ${buildHomeFunctionDock()}
    ${buildHomeMonthResetCard(sourceMetrics, progress.period)}
    ${buildHomeTodayChangeStrip(sourceMetrics)}
    ${buildHomeTicketStrip()}
    ${buildHomeResourceStrip()}
    ${buildHomeMetricsStrip(sourceMetrics)}
    ${buildHomeHelpDrawer(sourceMetrics)}
  `;
}

function progressPercent(current, target) {
  if (!target) return 0;
  return Math.max(0, Math.min(100, Math.round((Number(current || 0) / Number(target || 1)) * 100)));
}

function formatProgressValue(value, decimals = 1) {
  const number = Number(value);
  return (Number.isFinite(number) ? number : 0).toFixed(Math.max(0, Number(decimals || 0))).replace(/0+$/, "").replace(/\.$/, "");
}

function contractTempleProgressCue(progress) {
  const contractShare = normalizeMetricValue(progress?.contractTemple?.sources?.contract || 0);
  const templeProgress = normalizeMetricValue(progress?.contractTemple?.current || 0);
  if (contractShare >= 0.35) return "成交分攤已達主要成交門檻；下一次匯入若有新增差額，會建立成交保底批次。";
  if (contractShare > 0) return "成交分攤尚未達 0.35 件；累積資料保留，保底批次只看本次新增差額。";
  if (templeProgress > 0) return "委託與見面談已推進成交神殿；成交保底批次仍需本次匯入有新增成交分攤。";
  return "委託、見面談、成件都會推進成交神殿，不只看整件成交。";
}

function renderProgressDashboard() {
  const target = document.getElementById("progressDashboard");
  if (!target) return;
  const progress = state.progress || buildProgressSnapshot(state.metrics);
  const fourPlus = progress.fourPlus || {
    current: progress.main?.total || 0,
    effectiveCurrent: progress.main?.effective || 0,
    target: 4,
    extra: Math.max(0, normalizeMetricValue((progress.main?.total || 0) - 4)),
    gap: Math.max(0, normalizeMetricValue(4 - (progress.main?.total || 0))),
    done: (progress.main?.total || 0) >= 4,
  };
  const allScheduleMilestone = fourPlus.done
    ? `全部行程日均已達 ${formatMetricValue(fourPlus.target)}${fourPlus.extra > 0 ? `，多出 ${formatMetricValue(fourPlus.extra)}` : ""}`
    : `全部行程日均 ${formatMetricValue(fourPlus.current)}/${formatMetricValue(fourPlus.target)}，還差 ${formatMetricValue(fourPlus.gap || 0)}`;
  const fourPercent = progressPercent(fourPlus.current, fourPlus.target);
  const highPercent = progressPercent(progress.highValue.current, progress.highValue.target);
  const monthlyBaseTargets = buildMonthlyBaseTargets({
    basis: progress.basis,
    groups: progress.groups,
    source: progress.sourceMetrics,
  });
  const contractSources = progress.contractTemple.sources || {};
  const contractLine = `委託 ${formatMetricValue(contractSources.listing)} · 見面談 ${formatMetricValue(contractSources.meeting)} · 簽約 ${formatMetricValue(contractSources.contract)}`;
  const phoneSignal = progress.phoneSignal.calls >= 30 ? "訊號很亮" : progress.phoneSignal.calls >= 15 ? "訊號升溫" : "等待信號";
  const unlockLine = [
    poolUnlocked(POOLS[0], progress) ? "免費卡池" : "",
    poolUnlocked(POOLS[1], progress) ? "拜訪卡池" : "",
    poolUnlocked(POOLS[2], progress) ? "帶看卡池" : "",
    poolUnlocked(POOLS[3], progress) ? "成果卡池" : "",
    poolUnlocked(POOLS[4], progress) ? "成交卡池" : "",
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
    <article class="progress-hero-card">
      <span class="summon-kicker">本月日均行程：有效 / 全部</span>
      <strong>${formatMetricValue(fourPlus.effectiveCurrent || 0)} / ${formatMetricValue(fourPlus.current)}</strong>
      <p>這是原報表的有效 / 全部日均。第一版以右側全部行程作為主要進度，有效行程先保留參考。</p>
      <span class="soft-pill">${escapeHtml(allScheduleMilestone)}</span>
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
      <div class="team-topline"><strong>日均行程（全部）</strong><span>${formatMetricValue(fourPlus.current)} / ${formatMetricValue(fourPlus.target)}${fourPlus.extra > 0 ? ` + ${formatMetricValue(fourPlus.extra)}` : ""}</span></div>
      <div class="bar"><span style="width:${fourPercent}%"></span></div>
      <p>${fourPlus.done ? "本月全部行程日均已達 4；超過的部分可作為後續加碼空間。" : `本月全部行程日均目標為 4，目前還差 ${formatMetricValue(fourPlus.gap || 0)}。`}</p>
      <p class="small-text">原報表有效 / 全部日均：${formatMetricValue(fourPlus.effectiveCurrent || 0)} / ${formatMetricValue(fourPlus.current)}。有效值目前只供參考；等全員全部行程日均穩定達 4，再考慮改為下一階段指標。</p>
    </article>
    <article class="progress-card">
      <div class="team-topline"><strong>高價值行為（拜訪＋回報＋帶看）</strong><span>${formatMetricValue(progress.highValue.current)} / >${progress.highValue.target}</span></div>
      <div class="bar"><span style="width:${highPercent}%"></span></div>
      <p>${progress.highValue.done ? "高價值行為已點亮。" : "最想推動的是拜訪、回報、帶看有效組數。"}</p>
    </article>
    <article class="progress-card">
      <div class="team-topline"><strong>${escapeHtml(progress.phoneSignal.label)}</strong><span>${formatMetricValue(progress.phoneSignal.calls)} 通</span></div>
      <p>${escapeHtml(phoneSignal)}。電話是加成信號，不蓋過行程有效進度。</p>
    </article>
    <article class="progress-card">
      <div class="team-topline"><strong>每月基礎目標</strong><span>${monthlyBaseTargets.filter((item) => item.done).length} / ${monthlyBaseTargets.length} 達成</span></div>
      ${monthlyBaseTargets.map((item) => `
        <div class="team-topline"><span>${escapeHtml(item.label)}</span><span>${formatProgressValue(item.current, item.decimals)} / ${formatProgressValue(item.target, item.decimals)} ${escapeHtml(item.unit)}</span></div>
        <div class="bar"><span style="width:${progressPercent(item.current, item.target)}%"></span></div>
      `).join("")}
      <p>成交 0.35 件是主要成交門檻；實際抽卡只看這次匯入比前次新增多少，依 0.35/0.4/0.5 建立 3/4/5 抽保底批次。四條目標各自計算，不互相抵銷。</p>
    </article>
    <article class="progress-card">
      <div class="team-topline"><strong>${escapeHtml(progress.contractTemple.label)}</strong><span>${formatMetricValue(progress.contractTemple.current)}</span></div>
      <p>${escapeHtml(contractLine)}</p>
      <p>${escapeHtml(contractTempleProgressCue(progress))}</p>
      <p class="small-text">${escapeHtml(progress.contractTemple.note)}</p>
    </article>
    <article class="progress-card">
      <div class="team-topline"><strong>已亮起抽卡項目</strong><span>${totalTickets()} 次</span></div>
      <p>${escapeHtml(unlockLine)}</p>
      <p class="small-text">同仁端只顯示本月卡池節奏，不公開精確機率與內建保底。</p>
    </article>
  `;
}

function renderMetrics() {
  const target = document.getElementById("metricsGrid");
  if (!target) return;
  const metrics = normalizeGameMetrics(state.progress?.sourceMetrics || state.metrics || {});
  const items = [...SPIRIT_FOOD_ACTIVITY_ITEMS, ...SPIRIT_FOOD_RESULT_ITEMS];
  target.innerHTML = items.map((item) => {
    const value = foodItemValue(item, metrics);
    return `
      <article class="metric-tile metric-food-tile">
        <div class="team-topline">
          <span>${escapeHtml(item.label)}</span>
          <strong>${formatMetricValue(value)}${escapeHtml(item.unit)}</strong>
        </div>
        <p>${escapeHtml(foodHintText(item, value))}</p>
      </article>
    `;
  }).join("");
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
    ["經驗", Number(rewards.exp || 0), "+"],
    ["抽卡", rewardTicketTotal(rewards), "+"],
    ["成果池", Number(rewards.result || 0), "+"],
    ["簽約核心", Number(rewards.materials?.contract_core || 0), "+"],
  ];
  if (rewards.wish) rewardItems.push(["心願", "完成", ""]);
  if (rewards.streakReward) rewardItems.push(["連續", `${rewards.streakReward.count}天`, ""]);
  if (rewards.materialReport?.gains?.length) rewardItems.push(["素材", `${rewards.materialReport.gains.length} 種`, ""]);
  if (rewards.petGrowth) rewardItems.push(["成長", `Lv.${rewards.petGrowth.toLevel}`, ""]);
  const target = document.getElementById("rewardStrip");
  if (!target) return;
  target.innerHTML = rewardItems.map(([label, value, prefix]) => {
    const numeric = typeof value === "number";
    const shownValue = numeric ? `${prefix || ""}${value}` : value;
    return `
    <div class="reward-item ${numeric && value > 0 ? "is-gain" : "is-idle"}">
      <strong ${numeric ? `data-count-to="${value}" data-count-prefix="${escapeHtml(prefix || "")}"` : ""}>${escapeHtml(shownValue)}</strong>
      <span>${label}</span>
    </div>
  `;
  }).join("");
  animateCountUps(target);
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
  const settlement = state.dailySettlements?.[todayKey()] || null;
  const settlementRewards = settlement?.rewards || null;
  const activeRewards = rewards.blocked ? settlementRewards || rewards : rewards;
  const nextStep = buildRewardNextStep(activeRewards);
  const nextStepUi = rewardNextStepMarkup(nextStep);
  const loopCard = buildSettlementLoopCard(activeRewards, settlement);
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
        ${loopCard}
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
        <span>${tickets > 0 ? "把目前的券換成新夥伴。" : "完成本月累積目標後會累積抽卡券。"}</span>
        ${nextStepUi.text}
      </div>
      ${loopCard}
      <div class="reward-action-buttons">
        <button class="${tickets > 0 ? "primary-button" : "secondary-button unlock-button"}" type="button" ${tickets > 0 ? 'data-view="gacha"' : 'data-unlock-pool="general"'}>${tickets > 0 ? "去抽卡" : "看解鎖進度"}</button>
        ${nextStepUi.button}
        ${shareButton}
        <span id="dailyShareStatus" class="small-text"></span>
      </div>
    </div>
  `;
}

function buildPoolInlineDrawResult(pool) {
  const drawResult = state.history.find((item) => item.type === "draw");
  if (!drawResult || displayPoolKey(drawResult.poolKey) !== pool.key) return "";
  if (drawResult.batchRevealId) return buildPoolTenDrawResult(drawResult.batchRevealId, drawResult.poolKey);
  const pet = getPet(drawResult.petId);
  if (!pet) return "";
  const owned = getOwned(pet.pet_id);
  const tone = drawOutcomeTone(drawResult, pet);
  const fragmentProgress = drawFragmentProgressText(drawResult, pet, owned);
  const outcome = drawOutcomeLabel(drawResult, pet);
  return `
    <section class="pool-inline-result draw-tone-${escapeHtml(tone)}" aria-live="polite">
      <span class="summon-kicker">剛剛抽到</span>
      <div class="pool-inline-main">
        <div class="mini-pet">${drawResultVisual(pet, owned, drawResult, "small")}</div>
        <div>
          <strong>${escapeHtml(drawPrimaryLabel(drawResult, pet))}</strong>
          ${isEssenceDraw(drawResult) ? "" : `<span class="rarity-badge rarity-${pet.rarity}">${escapeHtml(pet.rarity)}</span>`}
          <span class="collection-badge is-ready">${escapeHtml(outcome)}</span>
        </div>
      </div>
      <p>${escapeHtml(drawResultSummaryText(drawResult, pet))}</p>
      ${fragmentProgress ? `<p class="pool-inline-fragment">${escapeHtml(fragmentProgress)}</p>` : ""}
    </section>
  `;
}

function buildPoolTenDrawResult(batchRevealId, poolKey) {
  const draws = state.history
    .filter((item) => item.type === "draw" && item.poolKey === poolKey && item.batchRevealId === batchRevealId)
    .sort((left, right) => Number(left.batchIndex || 0) - Number(right.batchIndex || 0))
    .slice(0, 10);
  if (!draws.length) return "";
  const essenceCount = draws.filter((item) => item.outcomeKind === "essence").length;
  const eggCount = draws.filter((item) => item.outcomeKind === "egg").length;
  const petCount = draws.length - essenceCount - eggCount;
  return `
    <section class="pool-inline-result pool-ten-result" aria-live="polite">
      <div class="team-topline">
        <span class="summon-kicker">十連結果</span>
        <strong>精華 ${essenceCount} · 蛋 ${eggCount} · 寵物/星魂 ${petCount}</strong>
      </div>
      <div class="ten-draw-grid">
        ${draws.map((draw) => {
          const pet = getPet(draw.petId) || draw.petSnapshot;
          if (!pet) return "";
          const owned = getOwned(pet.pet_id);
          return `
            <div class="ten-draw-item draw-tone-${escapeHtml(drawOutcomeTone(draw, pet))}">
              <span>${draw.batchIndex}</span>
              <div class="mini-pet">${drawResultVisual(pet, owned, draw, "small")}</div>
              <strong>${escapeHtml(drawOutcomeLabel(draw, pet))}</strong>
            </div>
          `;
        }).join("")}
      </div>
      <p>${draws.some((item) => item.pendingSync) ? "結果已揭曉，整批雲端保存中。" : "十連結果已保存。"}</p>
    </section>
  `;
}

function renderGuaranteedDrawPools() {
  const progress = state.progress || buildProgressSnapshot(state.metrics);
  const targets = buildMonthlyBaseTargets({ basis: progress.basis, groups: progress.groups, source: progress.sourceMetrics });
  const balances = normalizeGuaranteedDraws(state.guaranteedDraws);
  const standardPools = GUARANTEED_DRAW_POOLS.filter((pool) => pool.key !== "contract").map((pool) => {
    const target = targets.find((item) => item.key === pool.key) || MONTHLY_BASE_TARGETS[pool.key];
    const balance = balances[pool.key] || 0;
    const candidates = guaranteedPoolCandidates(pool);
    const baseReady = balance > 0 && candidates.length > 0;
    const preparingSequence = Boolean(baseReady && CLOUD_API_BASE_URL && CLOUD_API_BASE_URL !== "mock" && (!cloudPlayerStateReady || !nextPreparedCloudDraw(pool.poolKey)));
    const ready = baseReady && !preparingSequence;
    const earnedTiers = guaranteedTargetTier(target);
    const nextThreshold = (earnedTiers + 1) * Number(target.target || 0);
    const targetText = `${formatProgressValue(target.current || 0, target.decimals)} / ${formatProgressValue(target.target, target.decimals)} ${target.unit}`;
    const statusText = preparingSequence
      ? "正在準備本次登入的抽卡順序，完成後按鈕會自動亮起。"
      : ready
      ? `可抽 ${balance} 張完整寵物卡`
      : earnedTiers > 0
        ? `已完成 ${earnedTiers} 個基礎區間；下一張累積到 ${formatProgressValue(nextThreshold, target.decimals)} ${target.unit}`
        : `每累積 ${formatProgressValue(target.target, target.decimals)} ${target.unit}取得 1 張保證抽 · 目前 ${formatProgressValue(target.current || 0, target.decimals)}`;
    return `
      <article class="pool-card ${escapeHtml(pool.theme)} ${ready ? "is-ready" : "is-unlockable"}">
        <span class="summon-kicker">每月工作保證卡</span>
        <div class="team-topline">
          <h3>${escapeHtml(pool.name)}</h3>
          <span>${ready ? `${balance} 張` : escapeHtml(targetText)}</span>
        </div>
        <p class="pool-hook">${escapeHtml(statusText)}</p>
        <p class="assist-line">抽取結果保證是這條故事線的完整寵物卡；重複卡固定轉成 1 星魂。</p>
        <div class="pool-meta">
          <span class="soft-pill">${candidates.length} 張候選卡</span>
          <span class="soft-pill">每達 1 段再得 1 張</span>
        </div>
        <button class="${ready ? "primary-button" : "secondary-button"}" type="button" ${ready ? `data-draw="${escapeHtml(pool.poolKey)}"` : "disabled"}>${ready ? "抽保證寵物卡" : preparingSequence ? "順序準備中" : earnedTiers > 0 ? "下一段累積中" : "尚未達標"}</button>
        ${buildPoolInlineDrawResult({ key: pool.poolKey })}
      </article>
    `;
  }).join("");
  return standardPools + renderContractGuaranteePool();
}

function renderContractGuaranteePool() {
  const batches = contractGuaranteeBatches();
  const remaining = contractGuaranteeRemainingDraws();
  const prepared = nextPreparedCloudDraw("contract_guarantee");
  const ready = remaining > 0 && cloudPlayerStateReady && Boolean(prepared);
  const batchText = batches.length
    ? batches.map((batch, index) => `第${index + 1}組 ${Number(batch.revealed_draws || 0)}/${Number(batch.total_draws || 0)}`).join(" · ")
    : "下一次店長匯入的成交新增差額會建立保底批次";
  const statusText = ready
    ? `本月還有 ${remaining} 次成交保底揭露；最後一抽固定完整寵物卡。`
    : remaining > 0
      ? "正在準備本次登入的抽卡序列，重新開啟頁面後即可揭露。"
      : "只採本次匯入新增的成交件數；0.35 起建立 3/4/5 抽保底批次。";
  return `
    <article class="pool-card theme-gold ${ready ? "is-ready" : "is-unlockable"}">
      <span class="summon-kicker">成交神殿保底批次</span>
      <div class="team-topline">
        <h3>成交保底抽</h3>
        <span>${remaining ? `${remaining} 次` : "尚未建立"}</span>
      </div>
      <p class="pool-hook">${escapeHtml(statusText)}</p>
      <p class="assist-line">${escapeHtml(batchText)}</p>
      <div class="pool-meta">
        <span class="soft-pill">本月限定</span>
        <span class="soft-pill">前段契約精華</span>
        <span class="soft-pill">最後保證完整寵物</span>
      </div>
      <button class="${ready ? "primary-button" : "secondary-button"}" type="button" ${ready ? 'data-draw="contract_guarantee"' : "disabled"}>${ready ? "揭露成交保底" : remaining ? "準備中" : "等待成交入帳"}</button>
      ${buildPoolInlineDrawResult({ key: "contract_guarantee" })}
    </article>
  `;
}

function renderPools() {
  const total = totalTickets();
  document.getElementById("ticketSummary").textContent = total > 0 ? `可抽 ${total}` : "快解鎖";
  const baseOrder = new Map(POOLS.map((pool, index) => [pool.key, index]));
  const regularPools = [...POOLS].sort((left, right) => (
    poolPriority(right) - poolPriority(left) || baseOrder.get(left.key) - baseOrder.get(right.key)
  )).map((pool) => {
    const candidates = poolCandidates(pool);
    const unlocked = poolUnlocked(pool);
    const tickets = Number(state.tickets[pool.key] || 0);
    const guarantee = integratedGuaranteeForPool(pool.key);
    const guaranteeBalance = integratedGuaranteeBalance(guarantee);
    const guaranteePoolKey = pool.key === "contract" && nextPreparedCloudDraw("contract_guarantee")
      ? "contract_guarantee"
      : guarantee?.poolKey || "";
    const guaranteeReady = Boolean(guaranteePoolKey && guaranteeBalance > 0 && canStartDraw(guaranteePoolKey));
    const baseReady = unlocked && tickets > 0 && candidates.length > 0;
    const preparingSequence = Boolean(baseReady && CLOUD_API_BASE_URL && CLOUD_API_BASE_URL !== "mock" && (!cloudPlayerStateReady || !nextPreparedCloudDraw(pool.key)));
    const ready = baseReady && !preparingSequence;
    const progress = nextTicketProgress(pool.key, state.metrics);
    const ticketLabelText = tickets > 0 ? `${tickets} 抽` : guaranteeBalance > 0 ? `保證 ${guaranteeBalance} 抽` : progress.label;
    const canGuide = !ready && !preparingSequence && candidates.length > 0;
    return `
      <article class="pool-card ${poolThemeClass(pool.key)} ${unlocked ? "" : "is-locked"} ${ready || guaranteeReady ? "is-ready" : "is-unlockable"}" data-pool-card="${escapeHtml(pool.key)}">
        <div class="team-topline">
          <h3>${pool.name}</h3>
          <span>${escapeHtml(ticketLabelText)}</span>
        </div>
        <p class="pool-hook">${escapeHtml(poolHookText(pool.key))}</p>
        <p class="assist-line">${escapeHtml(poolExperienceCue(pool, candidates, unlocked))}</p>
        ${poolDrawProgressMarkup(pool.key)}
        ${ready ? "" : `
          <div class="pool-unlock-progress">
            <div class="mini-progress"><span style="width:${progress.percent}%"></span></div>
            <small>${escapeHtml(progress.unlockText)}</small>
          </div>
        `}
        <div class="pool-meta">
          ${rarityDisplayText(pool)}
          <span class="soft-pill">${candidates.length} 張候選卡</span>
          <span class="soft-pill">${escapeHtml(drawPacingCue(pool.key))}</span>
          <span class="soft-pill">${escapeHtml(activePetAssistText().replace("主寵助力：", ""))}</span>
        </div>
        <div class="pool-draw-actions">
          <button class="${ready ? "primary-button" : "secondary-button unlock-button"}" type="button" ${ready ? `data-draw="${pool.key}"` : preparingSequence ? "disabled" : `data-unlock-pool="${pool.key}"`} ${!ready && !canGuide ? "disabled" : ""}>${escapeHtml(ready ? poolDrawButtonLabel(pool) : preparingSequence ? "順序準備中" : poolUnlockButtonLabel(pool.key))}</button>
          ${guaranteeBalance > 0 ? `<button class="secondary-button" type="button" ${guaranteeReady ? `data-draw="${escapeHtml(guaranteePoolKey)}"` : "disabled"}>${guaranteeReady ? `抽保證寵物卡（${guaranteeBalance}）` : "保證順序準備中"}</button>` : ""}
          ${pool.key === "general" ? (() => {
            const preparedTen = preparedCloudDraws("general", 10).length;
            const tenReady = ready && tickets >= 10 && preparedTen >= 10;
            const tenLabel = tenReady ? "十連抽" : tickets < 10 ? `差 ${10 - tickets} 張十連` : "十連準備中";
            return `<button class="secondary-button ten-draw-button" type="button" ${tenReady ? 'data-draw-ten="general"' : "disabled"}>${escapeHtml(tenLabel)}</button>`;
          })() : ""}
        </div>
        ${buildPoolInlineDrawResult(pool)}
      </article>
    `;
  }).join("");
  const poolGrid = document.getElementById("poolGrid");
  poolGrid.innerHTML = regularPools;
  if (poolGrid.dataset) poolGrid.dataset.lastRevealMs = String(lastDrawRevealLatencyMs);
}

function drawOutcomeTone(draw, pet) {
  if (draw?.outcomeKind === "egg") return "shine";
  if (draw?.outcomeKind === "essence" || draw?.outcomeKind === "essence_conversion") return "growth";
  if (draw?.outcomeKind === "temple_blessing") return "rare";
  if (draw?.duplicate) return "duplicate";
  if (pet?.rarity === "SSR" || pet?.rarity === "UR") return "rare";
  if (pet?.rarity === "SR") return "shine";
  return "new";
}

function drawOutcomeLabel(draw, pet) {
  if (draw?.outcomeKind === "egg") return `${eggLabel(pet)} +1`;
  if (draw?.outcomeKind === "essence") return `${essenceLabelForResource(draw?.essenceKey || draw?.resourceKey, pet)} ×${rewardCount(draw.essenceAmount || draw.resourceAmount || 0)}`;
  if (draw?.outcomeKind === "essence_conversion") return `${essenceLabelForResource(draw?.essenceKey || draw?.resourceKey, pet)} ×${rewardCount(draw.essenceAmount || 5)}`;
  if (draw?.outcomeKind === "temple_blessing") return "神殿祝福 +1";
  if (draw?.duplicate) return `${pet?.name || "寵物"}星魂 +${rewardCount(draw.fragmentsAdded)}`;
  if (pet?.rarity === "SSR" || pet?.rarity === "UR") return "稀有夥伴加入";
  return "新夥伴加入";
}

function drawResultSummaryText(draw, pet) {
  if (draw?.outcomeKind === "egg") {
    const currentEgg = eggCount(draw.eggPetId || pet?.pet_id);
    const essence = essenceCount(pet?.storyline_id);
    return `${eggLabel(pet)}已入袋，目前蛋 ${currentEgg} 顆、${essenceLabelForStoryline(pet?.storyline_id)} ${essence}/${HATCH_ESSENCE_COST}。`;
  }
  if (draw?.outcomeKind === "essence") {
    return `這抽沒有寵物，但${essenceLabelForResource(draw?.essenceKey || draw?.resourceKey, pet)} +${rewardCount(draw.essenceAmount || 0)} 已入袋，離孵化更近。`;
  }
  if (draw?.outcomeKind === "essence_conversion") {
    return `${pet?.name || "寵物"}已滿星，重複轉為${draw.essenceLabel || essenceLabelForStoryline(pet?.storyline_id)}。`;
  }
  if (draw?.outcomeKind === "temple_blessing") {
    return "成交神殿滿星重複已化成神殿祝福，未來可指定換蛋或精華。";
  }
  if (draw?.duplicate) return `${pet?.name || "寵物"}星魂 +${rewardCount(draw.fragmentsAdded)}，升星更近。`;
  return "新夥伴加入卡片庫。";
}

function hatchProgressForDraw(draw, pet) {
  if (!pet || !["egg", "essence"].includes(draw?.outcomeKind)) return null;
  const essence = essenceCount(pet.storyline_id);
  const progress = Math.min(HATCH_ESSENCE_COST, essence);
  const gap = Math.max(0, HATCH_ESSENCE_COST - essence);
  const storylineEggs = PETS
    .filter((item) => item.storyline_id === pet.storyline_id && eggCount(item.pet_id) > 0 && !getOwned(item.pet_id))
    .map((item) => ({ pet: item, eggs: eggCount(item.pet_id) }));
  const target = storylineEggs[0]?.pet || pet;
  const hasEgg = storylineEggs.length > 0 || draw.outcomeKind === "egg";
  const title = hasEgg
    ? `${eggLabel(target)}孵化進度`
    : `${fallbackStorylineName(pet.storyline_id)}孵化能量`;
  const detail = gap <= 0 && hasEgg
    ? `${essenceLabelForStoryline(pet.storyline_id)}已足，現在可孵化。`
    : hasEgg
      ? `已有蛋，還差 ${gap} 個${essenceLabelForStoryline(pet.storyline_id)}可孵化。`
      : `先累積 ${essenceLabelForStoryline(pet.storyline_id)} ${progress}/${HATCH_ESSENCE_COST}，抽到同線寵物蛋就能孵化。`;
  return {
    title,
    detail,
    progress,
    target: HATCH_ESSENCE_COST,
    percent: progressPercent(progress, HATCH_ESSENCE_COST),
  };
}

function drawHatchProgressMarkup(draw, pet) {
  const progress = hatchProgressForDraw(draw, pet);
  if (!progress) return "";
  return `
    <div class="draw-hatch-progress">
      <div class="team-topline">
        <strong>${escapeHtml(progress.title)}</strong>
        <span>${progress.progress}/${progress.target}</span>
      </div>
      <div class="bar"><span style="width:${progress.percent}%"></span></div>
      <p>${escapeHtml(progress.detail)}</p>
    </div>
  `;
}

function drawFragmentProgressText(draw, pet, owned) {
  if (!pet) return "";
  if (draw?.outcomeKind === "egg") {
    const essence = essenceCount(pet.storyline_id);
    const gap = Math.max(0, HATCH_ESSENCE_COST - essence);
    return gap <= 0
      ? `${eggLabel(pet)}可以孵化了，到卡片庫把牠叫出來。`
      : `還差 ${gap} 個${essenceLabelForStoryline(pet.storyline_id)}可孵化 ${pet.name}。`;
  }
  if (draw?.outcomeKind === "essence") {
    return `目前${essenceLabelForStoryline(pet.storyline_id)} ${essenceCount(pet.storyline_id)}/${HATCH_ESSENCE_COST}，搭配同線寵物蛋可孵化。`;
  }
  if (!owned) return "";
  if (draw?.outcomeKind === "essence_conversion") return `${pet.name} 的舊版兌換紀錄已保留；新版重複卡會先存成星魂。`;
  if (draw?.outcomeKind === "temple_blessing") return "舊版神殿祝福紀錄已保留；新版改由背包手動兌換。";
  if (owned.star >= 5) return `${pet.name} 已達 5 星，後續重複會保留為星魂，可到背包手動兌換。`;
  const nextStar = owned.star + 1;
  const cost = starCost(nextStar);
  const current = rewardCount(owned.duplicate_fragments);
  const gap = Math.max(0, cost - current);
  if (gap <= 0) return `星魂 ${current}/${cost} 已滿，可以把 ${pet.name} 升到 ${nextStar} 星。`;
  if (draw?.duplicate) return `${pet.name}星魂 +${rewardCount(draw.fragmentsAdded)}，目前 ${current}/${cost}，再 ${gap} 個星魂升 ${nextStar} 星。`;
  return `重複寵物會變星魂；${pet.name} 目前 ${current}/${cost}，再 ${gap} 個星魂升 ${nextStar} 星。`;
}

function drawMomentumCue(action, pet, owned) {
  if (action?.kind === "hatch") return `${pet.name} 的蛋和精華都夠了，先孵化拿到新夥伴。`;
  if (action?.kind === "star") return `星魂已滿，先升星，${pet.name} 的養成會立刻有感。`;
  if (action?.kind === "awaken") return `覺醒條件已到，成果素材可以轉成新的戰力。`;
  if (action?.kind === "draw") return `還有 ${totalTickets()} 次抽卡，先把手上的券抽完。`;
  if (action?.kind === "mission") return `抽完先回工作閉環：${buildPilotMission(state.metrics).detail}`;
  const quests = buildDailyQuests(state.metrics);
  const nextQuest = quests
    .filter((quest) => !quest.done)
    .sort((a, b) => (a.target - a.current) - (b.target - b.current))[0];
  if (nextQuest) return `${nextQuest.message}，補完再回來抽。`;
  if (owned) return `${pet.name} 已加入隊伍，回本月累積看下一個養成缺口。`;
  return "回本月累積補一個最短挑戰，再把新的券帶回來抽。";
}

function drawMonthlyPacingText(draw) {
  const cue = drawPacingCue(draw?.poolKey);
  const goal = INTERNAL_DRAW_PACING_CONFIG.monthlyGoal;
  if (draw?.outcomeKind === "pet" && !draw?.duplicate) return `月養成節奏：這次是大成果；接下來用蛋、精華與星魂把主寵養起來。`;
  if (draw?.outcomeKind === "egg") return `月養成節奏：寵物蛋是中獎節點；補同線精華就能孵化。`;
  if (draw?.outcomeKind === "essence") return `月養成節奏：這次是小進度；${cue}`;
  if (draw?.duplicate) return `月養成節奏：重複不是浪費，星魂會推升星。`;
  return `月養成節奏：${goal}`;
}

function todayDrawBattleText(draw = state.history.find((item) => item.type === "draw")) {
  const today = todayKey();
  const draws = (state.history || []).filter((item) => item.type === "draw" && todayKey(new Date(item.at || Date.now())) === today);
  if (!draws.length) return "";
  const newCount = draws.filter((item) => item.outcomeKind === "pet" && !item.duplicate).length;
  const eggCountToday = draws.filter((item) => item.outcomeKind === "egg").length;
  const duplicateCount = draws.filter((item) => item.outcomeKind === "star_soul").length;
  const fragments = draws.reduce((sum, item) => sum + rewardCount(item.fragmentsAdded || 0), 0);
  const essences = draws.reduce((sum, item) => sum + rewardCount(item.essenceAmount || 0), 0);
  const pet = draw ? getPet(draw.petId) : null;
  const owned = pet ? getOwned(pet.pet_id) : null;
  const nextCost = owned && owned.star < 5 ? starCost(owned.star + 1) : 0;
  const gap = owned && owned.star < 5 ? Math.max(0, nextCost - owned.duplicate_fragments) : 0;
  const progress = pet && owned && owned.star < 5
    ? `${pet.name} 距離升 ${owned.star + 1} 星還差 ${gap} 個星魂`
    : pet && owned
      ? `${pet.name} 已達 5 星，重複星魂會保留在背包`
      : "卡片庫已更新";
  return `今天抽卡戰果：新寵 ${newCount}、蛋 ${eggCountToday}、星魂 +${fragments}、精華 +${essences}；${progress}。`;
}

function drawWorkFollowupText() {
  const mission = buildPilotMission(state.metrics);
  return `下一步：${mission.title}，${mission.detail}`;
}

function drawNextAction(draw, pet, owned) {
  if (draw?.outcomeKind === "egg" && pet && canHatchPet(pet.pet_id)) {
    return { kind: "hatch", label: "去孵化", petId: pet.pet_id };
  }
  if (draw?.duplicate && owned && owned.star < 5 && owned.duplicate_fragments >= starCost(owned.star + 1)) {
    return { kind: "star", label: "去升星", petId: pet.pet_id };
  }
  if (pet && owned && canAwaken(pet, owned)) return { kind: "awaken", label: "去覺醒", petId: pet.pet_id };
  if (draw?.poolKey && Number(state.tickets?.[draw.poolKey] || 0) > 0) return { kind: "draw", label: "再抽一次", poolKey: draw.poolKey };
  const nextReadyPool = POOLS.find((pool) => Number(state.tickets?.[pool.key] || 0) > 0);
  if (nextReadyPool) return { kind: "draw", label: "再抽一次", poolKey: nextReadyPool.key };
  const mission = buildPilotMission(state.metrics);
  return { kind: "mission", label: mission.buttonLabel, missionKey: mission.key, view: "today" };
}

function drawNextActionMarkup(action) {
  if (!action) return "";
  if (action.kind === "hatch") return `<button class="primary-button" type="button" data-hatch="${escapeHtml(action.petId)}">${escapeHtml(action.label)}</button>`;
  if (action.kind === "star") return `<button class="primary-button" type="button" data-star="${escapeHtml(action.petId)}">${escapeHtml(action.label)}</button>`;
  if (action.kind === "awaken") return `<button class="primary-button" type="button" data-awaken="${escapeHtml(action.petId)}">${escapeHtml(action.label)}</button>`;
  if (action.kind === "draw") return `<button class="primary-button" type="button" data-draw="${escapeHtml(action.poolKey)}">${escapeHtml(action.label)}</button>`;
  if (action.kind === "mission") return `<button class="primary-button" type="button" data-pilot-mission="${escapeHtml(action.missionKey || "home")}">${escapeHtml(action.label)}</button>`;
  return `<button class="primary-button" type="button" data-view="${escapeHtml(action.view || "collection")}">${escapeHtml(action.label)}</button>`;
}

function renderDrawResult() {
  const lastDraw = state.history.find((item) => item.type === "draw");
  const target = document.getElementById("drawResult");
  if (!lastDraw) {
    target.innerHTML = "";
    return;
  }
  const pet = getPet(lastDraw.petId) || lastDraw.petSnapshot;
  if (!pet) {
    target.innerHTML = "";
    return;
  }
  const flavor = isEssenceDraw(lastDraw) ? "" : petFlavorText(pet);
  const owned = pet ? getOwned(pet.pet_id) : null;
  const tone = drawOutcomeTone(lastDraw, pet);
  const nextAction = drawNextAction(lastDraw, pet, owned);
  const fragmentProgress = drawFragmentProgressText(lastDraw, pet, owned);
  const hatchProgress = drawHatchProgressMarkup(lastDraw, pet);
  const resultSummary = drawResultSummaryText(lastDraw, pet);
  const momentumCue = drawMomentumCue(nextAction, pet, owned);
  const monthlyPacing = drawMonthlyPacingText(lastDraw);
  const battleText = todayDrawBattleText(lastDraw);
  const workFollowup = drawWorkFollowupText();
  target.innerHTML = `
    <article class="draw-result-card draw-tone-${escapeHtml(tone)}">
      <div class="mini-pet">${drawResultVisual(pet, getOwned(pet.pet_id), lastDraw, "large")}</div>
      <div>
        <span class="summon-kicker">抽卡結果</span>
        <div class="pet-name-row">
          <h3>${escapeHtml(drawPrimaryLabel(lastDraw, pet))}</h3>
          ${isEssenceDraw(lastDraw) ? "" : `<span class="rarity-badge rarity-${pet.rarity}">${pet.rarity}</span>`}
          <span class="collection-badge is-ready">${escapeHtml(drawOutcomeLabel(lastDraw, pet))}</span>
        </div>
        ${flavor ? `<p class="pet-flavor">「${escapeHtml(flavor)}」</p>` : ""}
        <p class="small-text">${lastDraw.text}</p>
        ${resultSummary ? `<p class="draw-result-summary">${escapeHtml(resultSummary)}</p>` : ""}
        ${fragmentProgress ? `<p class="draw-fragment-line">${escapeHtml(fragmentProgress)}</p>` : ""}
        ${hatchProgress}
        <p class="draw-pacing-cue">${escapeHtml(monthlyPacing)}</p>
        ${battleText ? `<p class="draw-battle-line">${escapeHtml(battleText)}</p>` : ""}
        <p class="draw-work-followup">${escapeHtml(workFollowup)}</p>
        <p class="draw-return-cue">${escapeHtml(momentumCue)}</p>
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
  const petText = isEssenceDraw(draw)
    ? drawPrimaryLabel(draw, pet)
    : pet ? `${pet.rarity} ${pet.name}` : "新夥伴";
  const subtitle = pet?.line_subtitle || pet?.card_effect_summary || "行程養寵物，成果拿覺醒素材。";
  const outcome = draw.outcomeKind === "egg"
    ? `拿到 ${eggLabel(pet)}，孵化又近一步。`
    : draw.outcomeKind === "essence"
      ? `拿到 ${draw.essenceLabel || essenceLabelForStoryline(pet?.storyline_id)} ×${rewardCount(draw.essenceAmount || 0)}。`
      : draw.outcomeKind === "temple_blessing"
        ? "成交神殿祝福已入袋。"
        : draw.duplicate
    ? `重複寵物轉成 ${rewardCount(draw.fragmentsAdded)} 星魂，下一次升星又近一點。`
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
    `拜訪＋回報＋銷售有效 ${formatMetricValue(progress.highValue.current)}`,
    `電話信號 ${formatMetricValue(progress.phoneSignal.calls)}`,
    `成交神殿 ${formatMetricValue(progress.contractTemple.current)}`,
  ].join("、");
}

function rewardSummaryText(rewards = state.lastRewards) {
  const parts = [];
  const ticketLabels = [
    ["general", "免費池"],
    ["visit", "拜訪池"],
    ["showing", "帶看池"],
    ["result", "成果池"],
    ["contract", "成交池"],
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
    general: "免費池",
    visit: "拜訪池",
    showing: "帶看池",
    result: "成果池",
    contract: "成交池",
  }[key] || key;
}

function collectionFragmentTotal() {
  return Object.values(state.collection || {}).reduce((sum, owned) => sum + Number(owned?.duplicate_fragments || 0), 0);
}

function eggEntries() {
  return Object.entries(state.eggs || {})
    .map(([petId, amount]) => ({ pet: getPet(petId), amount: rewardCount(amount) }))
    .filter((item) => item.pet && item.amount > 0);
}

function essenceEntries() {
  const storylines = getStorylines();
  return Object.entries(state.essences || {})
    .map(([key, amount]) => {
      const resourceKey = key.replace(/_essence$/, "");
      const storyline = storylines.find((item) => storylineResourceKey(item.storyline_id) === resourceKey);
      return {
        key,
        resourceKey,
        label: STORYLINE_ESSENCE_LABELS[resourceKey] || `${storyline?.name || resourceKey}精華`,
        amount: rewardCount(amount),
        thumbnail: essenceImageUrl(resourceKey, "small"),
      };
    })
    .filter((item) => item.amount > 0);
}

function essenceInventoryMarkup(entries = []) {
  if (!entries.length) return "";
  return `
    <div class="essence-inventory-list" aria-label="精華庫存">
      ${entries.map((item) => `
        <div class="essence-inventory-item">
          <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.label)}" loading="lazy" decoding="async">
          <span><strong>${escapeHtml(item.label)}</strong><small>${formatMetricValue(item.amount)} 個</small></span>
        </div>
      `).join("")}
    </div>
  `;
}

function soulExchangeMarkup() {
  const entries = fiveStarSoulEntries();
  if (!entries.length) {
    return `<p class="small-text">寵物達到五星後，這裡會開放同名星魂兌換。</p>`;
  }
  return `
    <div class="soul-exchange-list">
      ${entries.map(({ pet, owned }) => {
        const souls = rewardCount(owned.duplicate_fragments || 0);
        const lifetime = rewardCount(owned.post_five_star_souls_earned || 0);
        const temple = isContractTempleStoryline(pet.storyline_id);
        return `
          <div class="soul-exchange-row">
            <div>
              <strong>${escapeHtml(pet.name)}星魂 ${souls}</strong>
              <small>五星後累計 ${lifetime} · 究極功能尚未開放</small>
            </div>
            <div class="soul-exchange-actions">
              <button class="secondary-button" type="button" data-soul-essence="${escapeHtml(pet.pet_id)}" ${souls >= 1 ? "" : "disabled"}>1星魂換${STAR_SOUL_ESSENCE_REWARD}${escapeHtml(essenceLabelForStoryline(pet.storyline_id))}</button>
              ${temple ? `<button class="secondary-button" type="button" data-soul-blessing="${escapeHtml(pet.pet_id)}" ${souls >= TEMPLE_BLESSING_SOUL_COST ? "" : "disabled"}>${TEMPLE_BLESSING_SOUL_COST}星魂換1神殿祝福</button>` : ""}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
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
  const eggs = eggEntries();
  const essences = essenceEntries();
  const templeBlessing = rewardCount(state.specialResources?.templeBlessing || 0);
  const actionable = findFirstActionableCollection();
  if (summary) summary.textContent = `${totalTickets()} 次可抽 · ${eggs.length} 種蛋 · ${essences.length} 種精華`;
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
      meta: actionable ? "先把星魂、蛋或素材變成寵物進度。" : "有券就抽，有蛋、精華或素材就整理卡片庫。",
      tone: actionable ? "hot" : "growth",
    },
    {
      title: "孵化資源",
      detail: eggs.length ? eggs.slice(0, 3).map(({ pet, amount }) => `${eggLabel(pet)} ${amount}`).join(" · ") : "目前沒有寵物蛋",
      meta: essences.length ? essences.slice(0, 3).map((item) => `${item.label} ${item.amount}`).join(" · ") : "抽到精華後，可搭配同線寵物蛋孵化。",
      tone: "soft",
      actions: essenceInventoryMarkup(essences),
    },
    {
      title: "收藏進度",
      detail: `${ownedCount} / ${PETS.length} 種 · 星魂 ${fragmentTotal}`,
      meta: templeBlessing ? `神殿祝福 ${templeBlessing} 個。重複寵物固定轉成1星魂。` : "重複寵物固定轉成1星魂，星魂可以升星。",
      tone: "growth",
    },
    {
      title: "五星星魂兌換",
      detail: "五星後由玩家決定保留或兌換",
      meta: "一般寵物只能換同故事線精華；成交神殿寵物可另換神殿祝福。",
      tone: "growth soul-exchange",
      actions: soulExchangeMarkup(),
    },
    {
      title: "覺醒素材",
      detail: materials.length ? materials.slice(0, 4).map(([key, value]) => `${materialLabel(key)} ${value}`).join(" · ") : "目前沒有素材",
      meta: "委託、見面談、簽約等真實成果推進覺醒與成熟合成。",
      tone: "soft",
    },
  ];
  grid.innerHTML = sections.map((section) => `
    <article class="bag-card is-${escapeHtml(section.tone)}">
      <span class="summon-kicker">${escapeHtml(section.title)}</span>
      <strong>${escapeHtml(section.detail)}</strong>
      <p>${escapeHtml(section.meta)}</p>
      ${section.actions || ""}
    </article>
  `).join("");
  if (resetCard) {
    resetCard.innerHTML = `
      <span class="summon-kicker">全部重置規則</span>
      <strong>同仁自己選，選了就全部清空</strong>
      <p>卡片庫、寵物、星魂、蛋、精華、素材、抽卡紀錄、每日免費抽、月榜第一與加碼都會消失。</p>
      <p>唯一保留的是行程與成果項重新計算出的抽卡點數。</p>
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
        <strong>${ownedCount ? "先累積蛋、精華與星魂" : "先抽到第一批夥伴"}</strong>
        <p>${ownedCount ? "抽到蛋與精華可以孵化；重複寵物會變星魂；成果素材推覺醒。" : "去抽卡後，這裡會優先顯示可孵化、可升星、可覺醒的卡。"}</p>
      </article>
    `;
    return;
  }
  target.innerHTML = `
    <article class="collection-action-card is-hot">
      <span class="summon-kicker">卡片庫下一步</span>
      <strong>${escapeHtml(action.text)}</strong>
      <p>目前最值得先處理的是 ${escapeHtml(action.pet.name)}，處理完再回來抽卡或看成果。</p>
      <button class="primary-button" type="button" data-${action.type === "hatch" ? "hatch" : action.type === "star" ? "star" : action.type === "awaken" ? "awaken" : action.type === "ultimate" ? "ultimate" : "view"}="${escapeHtml(action.type === "material-ready" ? "collection" : action.pet.pet_id)}">${escapeHtml(action.label)}</button>
    </article>
  `;
}

function collectionActionState(pet, owned = getOwned(pet.pet_id)) {
  if (!owned) {
    const eggs = eggCount(pet.pet_id);
    const essence = essenceCount(pet.storyline_id);
    const hatchReady = canHatchPet(pet.pet_id);
    const badges = [];
    if (eggs) badges.push({ label: `${eggLabel(pet)} ${eggs}`, tone: hatchReady ? "ready" : "soft" });
    if (hatchReady) badges.push({ label: "可孵化", tone: "ready" });
    return { badges, score: (hatchReady ? 105 : 0) + (eggs ? 40 : 0) + Math.min(9, essence) };
  }
  const nextCost = owned.star < 5 ? starCost(owned.star + 1) : 0;
  const canStar = owned.star < 5 && owned.level >= starLevelRequirement(owned.star + 1) && owned.duplicate_fragments >= nextCost;
  const duplicateHatchReady = canHatchPet(pet.pet_id);
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
  if (duplicateHatchReady) badges.push({ label: "可孵成星魂", tone: "ready" });
  if (canStar) badges.push({ label: "可升星", tone: "ready" });
  else if (owned.star < 5 && fragmentGap > 0 && fragmentGap <= 3) badges.push({ label: "只差星魂", tone: "soft" });
  if (awakenReady) badges.push({ label: "可覺醒", tone: "ready" });
  else if (materialReady) badges.push({ label: "素材已足", tone: "soft" });
  else if (materialNearly) badges.push({ label: "素材快足", tone: "soft" });
  if (ultimateReady) badges.push({ label: "可究極", tone: "ready" });
  return {
    badges,
    score:
      (canStar ? 120 : 0) +
      (duplicateHatchReady ? 115 : 0) +
      (awakenReady ? 110 : 0) +
      (ultimateReady ? 100 : 0) +
      (fragmentGap > 0 && fragmentGap <= 3 ? 80 : 0) +
      (materialReady ? 70 : 0) +
      (materialNearly ? 60 : 0) +
      (pet.pet_id === state.activePetId ? 40 : 0) +
      (owned ? 10 : 0),
  };
}

function collectionWorkCue(pet, owned = getOwned(pet.pet_id)) {
  if (!pet) return "";
  if (!owned) {
    const eggs = eggCount(pet.pet_id);
    const essence = essenceCount(pet.storyline_id);
    if (!eggs) return `抽到${eggLabel(pet)}後，再集 ${HATCH_ESSENCE_COST} 個${essenceLabelForStoryline(pet.storyline_id)}就能孵化。`;
    const gap = Math.max(0, HATCH_ESSENCE_COST - essence);
    return gap <= 0
      ? `${eggLabel(pet)}與${essenceLabelForStoryline(pet.storyline_id)}都足夠，現在可孵化。`
      : `${eggLabel(pet)}已入袋，還差 ${gap} 個${essenceLabelForStoryline(pet.storyline_id)}可孵化。`;
  }
  const nextCost = owned.star < 5 ? starCost(owned.star + 1) : 0;
  if (owned.star < 5 && owned.duplicate_fragments >= nextCost && owned.level < starLevelRequirement(owned.star + 1)) {
    return `星魂已滿，再訓練到 Lv.${starLevelRequirement(owned.star + 1)} 可升 ${owned.star + 1} 星。`;
  }
  if (owned.star < 5 && owned.duplicate_fragments >= nextCost) return `星魂已滿，先升星，${pet.name} 馬上變強。`;
  if (canAwaken(pet, owned)) return `成果素材已到位，先覺醒，讓成果變成戰力。`;
  const pool = POOLS.find((item) => item.storylineIds?.includes(pet.storyline_id));
  const quest = buildDailyQuests(state.metrics)
    .filter((item) => !item.done)
    .sort((a, b) => (a.target - a.current) - (b.target - b.current))[0];
  if (owned.star < 5 && nextCost) {
    const gap = Math.max(0, nextCost - owned.duplicate_fragments);
    return `${pool ? pool.name : "同名寵物"}可補星魂；還差 ${gap} 個星魂升 ${owned.star + 1} 星。`;
  }
  if (owned.star >= 5) return `${pet.name} 已達 5 星；額外星魂可在背包換同線精華，究極功能尚未開放。`;
  if (quest) return `${quest.message}，回本月累積補完再回來養牠。`;
  return "今天行程養等級，成果素材推覺醒。";
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
        <div class="mini-pet">${petCollectionVisual(pet, owned, "small")}</div>
        <div class="pet-name-row">
          <h3>${pet.name}</h3>
          <span class="rarity-badge rarity-${pet.rarity}">${pet.rarity}</span>
        </div>
        ${renderCollectionBadges(action.badges)}
        <p class="small-text">${locked ? `${eggCount(pet.pet_id) ? `${eggLabel(pet)} ${eggCount(pet.pet_id)} · ${essenceLabelForStoryline(pet.storyline_id)} ${essenceCount(pet.storyline_id)}/${HATCH_ESSENCE_COST}` : "尚未取得"}` : `${currentForm(pet, owned)} · Lv.${owned.level} · ${owned.star}星 · 星魂 ${owned.duplicate_fragments}`}</p>
        <p class="collection-work-cue">${escapeHtml(collectionWorkCue(pet, owned))}</p>
        ${flavor ? `<p class="pet-flavor">「${escapeHtml(flavor)}」</p>` : ""}
        <p class="small-text">${escapeHtml(pet.card_effect_summary || "")}</p>
        <div class="pet-card-actions">
          <button class="secondary-button" type="button" data-active="${pet.pet_id}" ${locked ? "disabled" : ""}>設為夥伴</button>
          <button class="secondary-button" type="button" data-hatch="${pet.pet_id}" ${canHatchPet(pet.pet_id) ? "" : "disabled"}>孵化</button>
          <button class="secondary-button" type="button" data-star="${pet.pet_id}" ${!owned || owned.star >= 5 || owned.level < starLevelRequirement(owned.star + 1) || owned.duplicate_fragments < nextCost ? "disabled" : ""}>升星 ${nextCost ? `-${nextCost}星魂` : ""}</button>
          <button class="secondary-button" type="button" data-awaken="${pet.pet_id}" ${canAwaken(pet, owned) ? "" : "disabled"}>覺醒</button>
          <button class="secondary-button" type="button" data-ultimate="${pet.pet_id}" ${canUltimate(pet, owned) ? "" : "disabled"}>${ULTIMATE_FEATURE_ENABLED ? "究極合成" : "究極未開放"}</button>
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
  const auditRows = managerAuditRows();
  if (auditRows.length) {
    return auditRows.map((row) => ({
      agent: row.name,
      employeeId: row.uid,
      branch: PROFILE.branch,
      monthlyDevelopmentShowing: normalizeMetricValue(row.monthlyDevelopmentShowing ?? row.development + row.showing),
      highValueEffective: normalizeMetricValue(row.highValueEffective),
      eTotal: normalizeMetricValue(row.eTotal),
      listing: normalizeMetricValue(row.listing),
      meeting: normalizeMetricValue(row.meeting),
      contract: normalizeMetricValue(row.contract),
      showing: normalizeMetricValue(row.showing),
      calls: normalizeMetricValue(row.calls),
      source: row.source,
    })).sort((left, right) =>
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

function managerMonthlyTotals(rows = []) {
  const list = Array.isArray(rows) ? rows : [];
  const totals = {
    employeeCount: list.length,
    area: 0,
    development: 0,
    negotiation: 0,
    showing: 0,
    calls: 0,
    momentum: 0,
    listing: 0,
    meeting: 0,
    contract: 0,
    offer: 0,
    price: 0,
    monthlyDevelopmentShowing: 0,
  };
  return list.reduce((summary, row) => {
    summary.area += normalizeMetricValue(row.area);
    summary.development += normalizeMetricValue(row.development);
    summary.negotiation += normalizeMetricValue(row.negotiation);
    summary.showing += normalizeMetricValue(row.showing);
    summary.calls += normalizeMetricValue(row.calls);
    summary.momentum += normalizeMetricValue(row.momentum);
    summary.listing += normalizeMetricValue(row.listing);
    summary.meeting += normalizeMetricValue(row.meeting);
    summary.contract += normalizeMetricValue(row.contract);
    summary.offer += normalizeMetricValue(row.offer);
    summary.price += normalizeMetricValue(row.price);
    summary.monthlyDevelopmentShowing += normalizeMetricValue(row.monthlyDevelopmentShowing);
    return summary;
  }, totals);
}

function managerMonthlyActivityText(rows = [], metrics = {}) {
  const hasBreakdown = Array.isArray(rows) && rows.some((row) => (
    ["area", "development", "negotiation", "showing", "momentum"].some((key) => {
      const value = Number(row?.[key]);
      return Number.isFinite(value) && value !== 0;
    })
  ));
  if (hasBreakdown) {
    return (
      Number(metrics.area || 0) +
      Number(metrics.development || 0) +
      Number(metrics.negotiation || 0) +
      Number(metrics.showing || 0) +
      Number(metrics.momentum || 0)
    );
  }
  return Number(metrics.monthlyDevelopmentShowing || 0);
}

function managerMonthlyResultText(metrics = {}) {
  return Number(metrics.listing || 0) + Number(metrics.offer || 0) + Number(metrics.price || 0) + Number(metrics.meeting || 0) + Number(metrics.contract || 0);
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
        validDays: normalizeMetricValue(basis.valid_days ?? metricPairValue(metrics, "effective_days")),
        dailyAverage: normalizeMetricValue(basis.e_total_daily_average),
        dailyTargetMet: Boolean(basis.e_daily_target_met),
        monthlyDevelopmentShowing: normalizeMetricValue(basis.monthly_policy_development_plus_showing ?? metricPairValue(metrics, "b_development_total") + metricPairValue(metrics, "d_showing_group")),
        highValueEffective: normalizeMetricValue(basis.bcd_valid),
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
        validDays: normalizeMetricValue(basis.valid_days ?? metricPairValue(metrics, "effective_days")),
        dailyAverage: normalizeMetricValue(basis.e_total_daily_average),
        dailyTargetMet: Boolean(basis.e_daily_target_met),
        monthlyDevelopmentShowing: normalizeMetricValue(basis.monthly_policy_development_plus_showing ?? metricPairValue(metrics, "b_development_total") + metricPairValue(metrics, "d_showing_group")),
        highValueEffective: normalizeMetricValue(basis.bcd_valid),
        listing: metricPairValue(metrics, "listing") + metricPairValue(metrics, "rent_listing"),
        meeting: metricPairValue(metrics, "meeting_or_offer") + metricPairValue(metrics, "rent_meeting_or_offer"),
        contract: metricPairValue(metrics, "contract") + metricPairValue(metrics, "rent_contract"),
      };
    });
  }
  return [];
}

function managerAuditTotals(rows = []) {
  return (Array.isArray(rows) ? rows : []).reduce((totals, row) => {
    ["area", "development", "negotiation", "showing", "sales", "eValid", "eTotal", "calls", "listing", "meeting", "contract"].forEach((key) => {
      totals[key] += normalizeMetricValue(row[key]);
    });
    return totals;
  }, {
    area: 0,
    development: 0,
    negotiation: 0,
    showing: 0,
    sales: 0,
    eValid: 0,
    eTotal: 0,
    calls: 0,
    listing: 0,
    meeting: 0,
    contract: 0,
  });
}

function formatManagerImportTime(value) {
  if (!value) return "尚未入帳";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("zh-TW");
}

function renderManagerMonthStatus() {
  const target = document.getElementById("managerMonthStatus");
  if (!target) return;
  const rows = managerAuditRows();
  const isPreview = Boolean(state.manager.cloudImportPreview?.import_id);
  const dashboard = state.manager.cloudDashboard || {};
  const latestImport = dashboard.latest_import || {};
  const period = rows[0]?.period || state.manager.cloudImportPreview?.period || dashboard.period || managerDashboardPeriod();
  const hasPublishedImport = Boolean(latestImport.import_id && String(latestImport.status || "").toUpperCase() === "PUBLISHED");
  const totals = managerAuditTotals(rows);
  const statusLabel = isPreview ? "預覽中，尚未入帳" : hasPublishedImport ? "本月已入帳" : "本月尚未入帳";
  const statusDetail = isPreview
    ? "請先核對下方逐人數據，再按確認入帳；此時同仁端尚未更新。"
    : hasPublishedImport
      ? `最近確認：${formatManagerImportTime(latestImport.confirmed_at || state.manager.lastImport?.at)}`
      : "匯入 Excel 並確認入帳後，這裡會保留本月最新累積。";
  const metrics = [
    ["A 社區服務", totals.area],
    ["B 開發", totals.development],
    ["C 回報", totals.negotiation],
    ["D 帶看", totals.showing],
    ["E 全部行程", totals.eTotal],
    ["F 電話", totals.calls],
    ["委託", totals.listing],
    ["見面談", totals.meeting],
    ["簽約", totals.contract],
  ];
  target.innerHTML = `
    <article class="manager-card manager-month-card ${isPreview ? "is-preview" : ""}">
      <div class="team-topline">
        <div>
          <span class="summon-kicker">本月目前狀態</span>
          <strong>${escapeHtml(String(period))} · ${statusLabel}</strong>
        </div>
        <span class="soft-pill">${formatMetricValue(rows.length)} 位同仁</span>
      </div>
      <p class="small-text">${escapeHtml(statusDetail)}</p>
      <div class="manager-month-metrics">
        ${metrics.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${formatMetricValue(value)}</strong></div>`).join("")}
      </div>
      <p class="small-text">E 全部行程為 A+B+C+D 的全部組數；第一版用它作為日均行程的基礎，E 有效先只保留在下方明細供核對。</p>
    </article>
  `;
}

function renderManagerImportAudit() {
  const target = document.getElementById("managerImportAudit");
  if (!target) return;
  const rows = managerAuditRows();
  const latestImport = state.manager.cloudDashboard?.latest_import || {};
  const hasPublishedImport = Boolean(latestImport.import_id && String(latestImport.status || "").toUpperCase() === "PUBLISHED");
  const modeLabel = state.manager.cloudImportPreview?.import_id ? "預覽資料（尚未入帳）" : hasPublishedImport ? "已入帳資料" : "本月尚無已入帳資料";
  target.innerHTML = `
    <article class="manager-card">
      <span class="summon-kicker">步驟 2 · 預覽輸入數據</span>
      <strong>${modeLabel} · ${rows.length} 位</strong>
      <div class="audit-table-wrap">
        <div class="audit-table" role="table" aria-label="匯入數據比對表">
          <div class="audit-row audit-head" role="row">
            <span>人名</span>
            <span>員編</span>
            <span>有效天</span>
            <span>社區服務</span>
            <span>拜訪</span>
            <span>回報</span>
            <span>帶看</span>
            <span>銷售</span>
            <span>E 有效</span>
            <span>E 全部</span>
            <span>日均全部</span>
            <span>F 電話</span>
            <span>委託</span>
            <span>見面談</span>
            <span>簽約</span>
          </div>
          ${rows.length ? rows.map((row) => `
            <div class="audit-row" role="row">
              <span>${escapeHtml(row.name)}</span>
              <span>${escapeHtml(String(row.uid))}</span>
              <span>${formatMetricValue(row.validDays)}</span>
              <span>${formatMetricValue(row.area)}</span>
              <span>${formatMetricValue(row.development)}</span>
              <span>${formatMetricValue(row.negotiation)}</span>
              <span>${formatMetricValue(row.showing)}</span>
              <span>${formatMetricValue(row.sales)}</span>
              <span>${formatMetricValue(row.eValid)}</span>
              <span>${formatMetricValue(row.eTotal)}</span>
              <span>${formatMetricValue(row.dailyAverage)}${row.dailyTargetMet ? " ✓" : ""}</span>
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
      <p class="small-text">這張表是本月目前累積的逐人明細；A-F 依目前報表欄位解析。預覽時請確認無誤後再按「確認入帳」。</p>
    </article>
  `;
}

function managerGameProgressRows() {
  const players = state.manager.cloudDashboard?.players;
  if (!Array.isArray(players)) return [];
  return players.map((row) => {
    const tickets = normalizeTicketBalances(row.tickets);
    const guaranteed = isPlainObject(row.guaranteed_draws) ? row.guaranteed_draws : {};
    return {
      name: row.agent_name || row.report_name || row.uid || "同仁",
      uid: row.uid || "",
      workPoints: normalizeMetricValue(row.draw_points_balance),
      general: normalizeMetricValue(tickets.general),
      visit: normalizeMetricValue(tickets.visit),
      showing: normalizeMetricValue(tickets.showing),
      result: normalizeMetricValue(tickets.result),
      contract: normalizeMetricValue(tickets.contract),
      guaranteed: Object.values(guaranteed).reduce((sum, value) => sum + normalizeMetricValue(value), 0),
      collection: normalizeMetricValue(row.collection_count),
      settlement: row.latest_settlement_status || "empty",
    };
  });
}

function managerSettlementLabel(status) {
  return ({ first_import: "首次入帳", changed: "已補差額", no_change: "無新差額", empty: "尚未入帳" })[status] || status || "尚未入帳";
}

function renderManagerPlayerGameStatus() {
  const target = document.getElementById("managerPlayerGameStatus");
  if (!target) return;
  const rows = managerGameProgressRows();
  const latestImport = state.manager.cloudDashboard?.latest_import || {};
  const hasPublishedImport = Boolean(latestImport.import_id && String(latestImport.status || "").toUpperCase() === "PUBLISHED");
  target.innerHTML = `
    <article class="manager-card">
      <span class="summon-kicker">入帳後同仁遊戲狀態</span>
      <strong>${escapeHtml(managerDashboardPeriod())} · ${hasPublishedImport ? "同仁端已同步" : "尚未有本月正式入帳"}</strong>
      <div class="audit-table-wrap">
        <div class="manager-game-table" role="table" aria-label="同仁遊戲進度表">
          <div class="manager-game-row manager-game-head" role="row">
            <span>人名</span><span>員編</span><span>工作點數</span><span>免費池</span><span>拜訪池</span><span>帶看池</span><span>成果池</span><span>成交池</span><span>保證抽</span><span>寵物種數</span><span>最近入帳</span>
          </div>
          ${rows.map((row) => `
            <div class="manager-game-row" role="row">
              <span>${escapeHtml(row.name)}</span><span>${escapeHtml(String(row.uid))}</span><span>${formatMetricValue(row.workPoints)}</span><span>${formatMetricValue(row.general)}</span><span>${formatMetricValue(row.visit)}</span><span>${formatMetricValue(row.showing)}</span><span>${formatMetricValue(row.result)}</span><span>${formatMetricValue(row.contract)}</span><span>${formatMetricValue(row.guaranteed)}</span><span>${formatMetricValue(row.collection)}</span><span>${escapeHtml(managerSettlementLabel(row.settlement))}</span>
            </div>
          `).join("") || `<div class="audit-empty">入帳後會在這裡顯示每位同仁的遊戲資源。</div>`}
        </div>
      </div>
      <p class="small-text">工作點數、抽卡券、保證抽與寵物種數都來自同一份雲端 playerState；月榜只重算當月工作數據。</p>
    </article>
  `;
}

function renderManagerPeriodPicker() {
  const input = document.getElementById("managerDataPeriod");
  if (input && input.value !== managerDashboardPeriod()) input.value = managerDashboardPeriod();
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
          <span>高價值行為缺口</span>
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
  const isPreview = Boolean(state.manager.cloudImportPreview?.import_id);
  target.innerHTML = `
    <article class="manager-card">
      <span class="summon-kicker">步驟 3 · 月榜排名</span>
      <strong>${isPreview ? "依本次預覽數字即時排序" : "依目前已入帳數字排序"} · ${rows.length} 位</strong>
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
      <p class="small-text">${isPreview ? "目前排名尚未入帳；確認後會成為正式本月月榜。" : "月榜使用目前正式累積數據；店長與秘書不列入同仁排名。"}</p>
    </article>
  `;
}

function renderManagerImportSource() {
  const target = document.getElementById("managerSelectedFileName");
  if (!target) return;
  const selected = cleanProfileText(state.manager.selectedImportFile || "", "", 160);
  target.textContent = selected ? `已選擇：${selected}` : "尚未選擇檔案";
}

function renderManagerResetTools() {
  const managerButton = document.getElementById("managerResetManagerBtn");
  const allButton = document.getElementById("managerResetAllBtn");
  const status = document.getElementById("managerResetStatus");
  if (!managerButton || !allButton || !status) return;

  const busy = Boolean(state.manager.testResetBusy);
  managerButton.disabled = busy;
  allButton.disabled = busy;
  managerButton.textContent = busy ? "重置中..." : "只重置店長";
  allButton.textContent = busy ? "重置中..." : "重置全部玩家";
  status.textContent = state.manager.testResetStatus || "";
  status.classList.toggle("is-good", state.manager.testResetTone === "good");
  status.classList.toggle("is-bad", state.manager.testResetTone === "bad");
}

async function managerResetTestData(scope = "manager") {
  if (!MANAGER_MODE) return false;
  if (!CLOUD_API_BASE_URL) {
    state.manager.testResetStatus = "測試重置需要正式雲端 API。";
    state.manager.testResetTone = "bad";
    renderManagerResetTools();
    return false;
  }
  if (cloudManagerKeyRequired()) {
    state.manager.testResetStatus = "管理網址缺少 manager_key，請重新開啟店長專用入口。";
    state.manager.testResetTone = "bad";
    renderManagerResetTools();
    return false;
  }

  const targetText = scope === "all_players"
    ? "全部玩家（含店長與秘書）"
    : "店長測試帳號 293127";
  const confirmed = typeof window !== "object" || typeof window.confirm !== "function" || window.confirm(
    `確定重置${targetText}的遊戲進度？卡片、寵物、星魂、素材、抽卡紀錄、免費抽與加碼會清空；所有累積數據都保留。`,
  );
  if (!confirmed) return false;

  state.manager.testResetBusy = true;
  state.manager.testResetStatus = `正在重置${targetText}...`;
  state.manager.testResetTone = "";
  saveState();
  renderManagerResetTools();
  try {
    const envelope = await postCloudEnvelope("managerTestReset", {
      manager_key: getCloudManagerKey(),
      scope,
      period: state.manager.cloudDashboard?.period || currentPeriodKey(),
      confirm_text: "RESET_TEST_GAME_STATE",
      client_request_id: randomClientId("manager-reset"),
    });
    const data = cloudEnvelopeData(envelope, "managerTestReset");
    if (!data) throw new Error(envelope?.errors?.[0]?.message || "managerTestReset response missing data");
    await loadCloudState();
    state.manager.testResetStatus = `重置完成：${data.reset_count || 0} 位。所有累積數據均已保留，遊戲進度已重新開始。`;
    state.manager.testResetTone = "good";
    return true;
  } catch (error) {
    state.manager.testResetStatus = `重置失敗：${error.message || "unknown"}`;
    state.manager.testResetTone = "bad";
    return false;
  } finally {
    state.manager.testResetBusy = false;
    saveState();
    render();
  }
}

function managerTestMetricsFromDashboard() {
  const player = state.manager.cloudDashboard?.manager_test_player || {};
  const source = player.source_metrics || {};
  const read = (rawKey, flatKey, side = "valid") => {
    if (isPlainObject(source[rawKey])) return metricPairValue(source, rawKey, side);
    return normalizeMetricValue(source[flatKey]);
  };
  return {
    area: read("a_area_total", "area", "total"),
    development: read("b_development_total", "development"),
    negotiation: read("c_negotiation_total", "negotiation"),
    showing: read("d_showing_group", "showing"),
    calls: read("calls", "calls"),
    listing: read("listing", "listing") + read("rent_listing", "rent_listing"),
    offer: read("test_offer", "offer"),
    contract: read("contract", "contract") + read("rent_contract", "rent_contract"),
    performance: read("test_performance", "performance"),
  };
}

function renderManagerTestMetrics() {
  const form = document.getElementById("managerTestMetricsForm");
  const submit = document.getElementById("managerTestMetricsSubmit");
  const status = document.getElementById("managerTestMetricsStatus");
  if (!form || !submit || !status) return;
  const values = managerTestMetricsFromDashboard();
  if (!state.manager.testMetricsBusy) {
    form.elements.period.value = state.manager.cloudDashboard?.period || currentPeriodKey();
    Object.entries(values).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = formatMetricValue(value);
    });
  }
  Array.from(form.elements).forEach((element) => { element.disabled = Boolean(state.manager.testMetricsBusy); });
  submit.textContent = state.manager.testMetricsBusy ? "套用中..." : "套用到店長帳號";
  status.textContent = state.manager.testMetricsStatus || "";
  status.classList.toggle("is-good", state.manager.testMetricsTone === "good");
  status.classList.toggle("is-bad", state.manager.testMetricsTone === "bad");
}

async function saveManagerTestMetrics(form) {
  if (!MANAGER_MODE) return false;
  if (cloudManagerKeyRequired()) {
    state.manager.testMetricsStatus = "管理網址缺少 manager_key，請重新開啟店長專用入口。";
    state.manager.testMetricsTone = "bad";
    renderManagerTestMetrics();
    return false;
  }
  const fieldKeys = ["area", "development", "negotiation", "showing", "calls", "listing", "offer", "contract", "performance"];
  const payload = Object.fromEntries(fieldKeys.map((key) => [key, Math.max(0, Number(form.elements[key]?.value || 0))]));
  payload.period = form.elements.period?.value || currentPeriodKey();
  state.manager.testMetricsBusy = true;
  state.manager.testMetricsStatus = "正在套用店長測試數據...";
  state.manager.testMetricsTone = "";
  renderManagerTestMetrics();
  try {
    const envelope = await postCloudEnvelope("managerTestMetrics", {
      manager_key: getCloudManagerKey(),
      ...payload,
      client_request_id: randomClientId("manager-test-metrics"),
    });
    const data = cloudEnvelopeData(envelope, "managerTestMetrics");
    if (!data) throw new Error(envelope?.errors?.[0]?.message || "managerTestMetrics response missing data");
    await loadCloudState();
    state.manager.testMetricsStatus = `已套用到店長帳號 293127；本月行程 ${formatMetricValue(payload.area + payload.development + payload.negotiation + payload.showing)}，業績 ${formatMetricValue(payload.performance)}。`;
    state.manager.testMetricsTone = "good";
    return true;
  } catch (error) {
    state.manager.testMetricsStatus = `套用失敗：${error.message || "unknown"}`;
    state.manager.testMetricsTone = "bad";
    return false;
  } finally {
    state.manager.testMetricsBusy = false;
    saveState();
    render();
  }
}

function renderManagerDashboard() {
  if (!MANAGER_MODE) return;
  const teamToggle = document.getElementById("teamMissionToggle");
  if (teamToggle) teamToggle.textContent = state.manager.teamMissionStarted ? "已開始" : "未開始";
  const bonusToggle = document.getElementById("bonusToggle");
  if (bonusToggle) bonusToggle.textContent = state.manager.bonusEnabled ? "加碼規劃中" : "未加碼";
  const temporaryTaskToggle = document.getElementById("temporaryTaskToggle");
  if (temporaryTaskToggle) temporaryTaskToggle.textContent = state.manager.temporaryTaskStarted ? "已開啟" : "未開啟";

  renderManagerTemporaryTasks();
  renderManagerImportSource();
  renderManagerPeriodPicker();
  renderManagerMonthStatus();
  renderManagerImportAudit();
  renderManagerPlayerGameStatus();
  renderManagerLeaderboard();
  renderManagerResetTools();
  renderManagerTestMetrics();

  const tracking = document.getElementById("managerTracking");
  if (tracking) {
    const lastImport = state.manager.lastImport;
    const warnings = state.manager.warnings || [];
    const leaderboardRows = managerLeaderboardRows();
    const totals = managerMonthlyTotals(leaderboardRows);
    const periodText = lastImport?.period || state.manager.cloudDashboard?.period || leaderboardRows[0]?.period || currentPeriodKey();
    const hasRows = totals.employeeCount > 0;
    const monthlyActivity = managerMonthlyActivityText(leaderboardRows, totals);
    const monthlyResult = managerMonthlyResultText(totals);
    tracking.innerHTML = `
      <article class="manager-card">
        <span class="summon-kicker">行程狀態</span>
        <strong>${hasRows ? `${formatMetricValue(totals.employeeCount)} 位同仁本月行程資料` : "尚未有可顯示的行程資料"}</strong>
        <p>${hasRows ? `${escapeHtml(periodText)} · ${lastImport ? new Date(lastImport.at).toLocaleString("zh-TW") : "已同步展示"}` : "拖移每日報表後，這裡會顯示各同仁這個月累積行程數據。"}</p>
        <div class="pool-meta">
          <span class="soft-pill">行程 ${formatMetricValue(monthlyActivity)}</span>
          <span class="soft-pill">電話 ${formatMetricValue(totals.calls)}</span>
          <span class="soft-pill">成果 ${formatMetricValue(monthlyResult)}</span>
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
        <p>E ${formatMetricValue(progress.main.effective)} / ${formatMetricValue(progress.main.total)}，拜訪＋回報＋銷售有效 ${formatMetricValue(progress.highValue.current)}。</p>
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

function petVisualStage(pet, owned) {
  if (!pet || !owned) return "";
  if (owned.ultimate || owned.awakened) return owned.ultimate ? "stage_05_mature" : "stage_04_awakened";
  if (Number(owned.star || 1) >= 5 || Number(owned.level || 1) >= 10) return "stage_05_mature";
  if (Number(owned.level || 1) >= 6) return "stage_03_growth";
  if (Number(owned.level || 1) >= 3) return "stage_02_young";
  return "stage_01_initial";
}

function petStageImageUrl(pet, owned, size) {
  const stage = petVisualStage(pet, owned);
  if (!stage || !pet?.pet_id) return "";
  const suffix = size === "small" ? "-thumb" : "";
  return normalizePetAssetUrl(`assets/pets/stages/${pet.pet_id}-${stage}-v2${suffix}.webp`);
}

function petImageUrl(pet, size, owned = null) {
  if (!pet) return "";
  const stageAsset = petStageImageUrl(pet, owned, size);
  if (stageAsset) return stageAsset;
  const preferred = size === "small" ? pet.thumbnail_url || pet.image_url : pet.image_url || pet.thumbnail_url;
  return normalizePetAssetUrl(preferred);
}

function eggImageUrl(pet, size) {
  if (!pet) return "";
  const preferred = size === "small"
    ? pet.egg_thumbnail_url || pet.egg_image_url
    : pet.egg_image_url || pet.egg_thumbnail_url;
  return normalizePetAssetUrl(preferred);
}

function eggVisual(pet, size, hasEgg = true) {
  const assetUrl = eggImageUrl(pet, size);
  if (!assetUrl) return petVisual(pet, null, size);
  const trait = petVisualTrait(pet);
  const opacity = hasEgg ? 0.92 : 0.45;
  const alt = `${pet.name}蛋 ${trait.label}`;
  return `
    <div class="pet-art-frame pet-art-${size} egg-art-frame" data-visual="${trait.key}" style="opacity:${opacity}">
      <img class="pet-art-image" src="${escapeHtml(assetUrl)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">
    </div>
  `;
}

function petCollectionVisual(pet, owned, size) {
  if (owned) return petVisual(pet, owned, size);
  const hasEgg = eggCount(pet.pet_id) > 0;
  return eggImageUrl(pet, size) ? eggVisual(pet, size, hasEgg) : petVisual(pet, owned, size);
}

function drawResultVisual(pet, owned, draw, size) {
  if (isEssenceDraw(draw)) return essenceVisual(draw, pet, size);
  if (draw?.outcomeKind === "egg" && eggImageUrl(pet, size)) return eggVisual(pet, size, true);
  return petVisual(pet, owned, size);
}

function petVisual(pet, owned, size) {
  const stage = petVisualStage(pet, owned);
  const assetUrl = petImageUrl(pet, size, owned);
  if (!assetUrl) return petSvg(pet, owned, size);
  const trait = petVisualTrait(pet);
  const opacity = owned ? 1 : 0.45;
  const alt = `${pet.name} ${stage || trait.label}`;
  return `
    <div class="pet-art-frame pet-art-${size}" data-visual="${trait.key}" data-stage="${stage}" style="opacity:${opacity}">
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
  if (target.dataset.closeDrawReveal) {
    closeDrawRevealOverlay();
    return;
  }
  if (target.dataset.petTalk) {
    showPetTalk();
    return;
  }
  if (target.dataset.unlockPool) {
    handlePoolUnlockClick(target.dataset.unlockPool);
    return;
  }
  if (target.dataset.pilotMission) {
    handlePilotMissionClick();
    return;
  }
  const view = target.dataset.view;
  if (view) {
    switchToView(view);
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
  if (target.id === "managerResetManagerBtn") managerResetTestData("manager");
  if (target.id === "managerResetAllBtn") managerResetTestData("all_players");
  if (target.id === "backupBtn") downloadProgressBackup();
  if (target.id === "restoreBtn") document.getElementById("backupInput")?.click();
  if (target.id === "resetBtn") requestResetProgress();
  if (target.dataset.shareDraw) shareLastDraw();
  if (target.dataset.shareDaily) shareDailyReport();
  if (target.dataset.shareTeam) shareTeamContribution();
  if (target.dataset.drawTen === "general") {
    drawTenGeneral();
    return;
  }
  if (target.dataset.draw) draw(target.dataset.draw);
  if (target.dataset.active) {
    state.activePetId = target.dataset.active;
    saveState();
    render();
  }
  if (target.dataset.star) upgradeStar(target.dataset.star);
  if (target.dataset.hatch) hatchPet(target.dataset.hatch);
  if (target.dataset.soulEssence) convertStarSoulToEssence(target.dataset.soulEssence);
  if (target.dataset.soulBlessing) convertStarSoulToTempleBlessing(target.dataset.soulBlessing);
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

document.getElementById("managerTestMetricsForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  saveManagerTestMetrics(event.currentTarget);
});

document.getElementById("managerDataPeriod")?.addEventListener("change", async (event) => {
  const period = String(event.currentTarget.value || "");
  if (!/^\d{4}-\d{2}$/.test(period)) return;
  state.manager.dashboardPeriod = period;
  state.manager.cloudImportPreview = null;
  saveState();
  render();
  setCloudImportStatus(`正在讀取 ${period} 的已入帳資料...`);
  const loaded = await loadCloudState();
  setCloudImportStatus(loaded ? `已切換到 ${period}` : `${period} 尚未有可顯示的正式入帳`, loaded ? "good" : "");
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
restorePreparedDrawClaimQueue();
render();
loadExternalContent().then(async () => {
  await loadCloudState();
  const outstandingClaims = [...activePreparedDrawClaims, ...pendingPreparedDrawClaims];
  if (outstandingClaims.length) {
    replayPendingPreparedDrawDebits(outstandingClaims);
    saveState();
    renderDrawSurfaces();
    schedulePreparedDrawClaimFlush(0);
  }
});
registerServiceWorker();
