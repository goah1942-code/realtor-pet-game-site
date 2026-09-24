const collectionLeaderboard = { metric: "owned_kinds", phase: "idle", data: null, generation: 0, controller: null, timer: null, trigger: null, scroll: null };
const collectionLeaderboardDialog = document.getElementById("collectionLeaderboardDialog");

function validCollectionLeaderboard(data, now = Date.now()) {
  const keysOnly = (value, keys) => value && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).every((key) => keys.includes(key));
  if (keysOnly(data, ["schema_version", "status"]) && [1, 2].includes(data.schema_version) && data.status === "disabled") return true;
  if (!keysOnly(data, ["schema_version", "mode", "scope", "snapshot_at", "max_age_seconds", "boards"])
    || data.schema_version !== 2 || data.mode !== "player_ranking" || data.scope !== "store_current_collection"
    || data.max_age_seconds !== 300 || typeof data.snapshot_at !== "string"
    || !Number.isFinite(Date.parse(data.snapshot_at)) || Date.parse(data.snapshot_at) > now + 60000
    || Date.parse(data.snapshot_at) + 300000 <= now
    || !keysOnly(data.boards, ["owned_kinds", "five_star_kinds"])) return false;
  const validBoards = ["owned_kinds", "five_star_kinds"].every((metric) => {
    const board = data.boards[metric];
    if (!keysOnly(board, ["status", "entries"]) || !["ready", "empty"].includes(board.status)
      || !Array.isArray(board.entries) || board.entries.length > 1000) return false;
    if (board.status !== "ready") return board.entries.length === 0;
    if (!board.entries.length) return false;
    let rank = 0;
    let previous = Infinity;
    return board.entries.every((entry, index) => {
      if (!keysOnly(entry, ["rank", "count", "name"]) || typeof entry.name !== "string"
        || !entry.name.trim() || entry.name.length > 80 || !Number.isSafeInteger(entry.count)
        || entry.count <= 0 || entry.count > 1000 || entry.count > previous) return false;
      if (entry.count !== previous) rank = index + 1;
      if (entry.rank !== rank) return false;
      previous = entry.count;
      return true;
    });
  });
  if (!validBoards) return false;
  const owned = data.boards.owned_kinds;
  const five = data.boards.five_star_kinds;
  const ownedScores = owned.entries.map((entry) => entry.count);
  const fiveScores = five.entries.map((entry) => entry.count);
  return fiveScores.length <= ownedScores.length && fiveScores.every((score, index) => score <= ownedScores[index]);
}

function renderCollectionLeaderboard() {
  const ui = collectionLeaderboard;
  const five = ui.metric === "five_star_kinds";
  document.querySelectorAll("[data-leaderboard-metric]").forEach((button) => {
    const selected = button.dataset.leaderboardMetric === ui.metric;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  const panel = document.getElementById("collectionLeaderboardPanel");
  panel.setAttribute("aria-labelledby", five ? "leaderboardTabFive" : "leaderboardTabOwned");
  const hint = (five ? "養成達五星以上的不同寵物，與稀有度無關。" : "相同寵物只計一次，蛋與星魂不計入。") + "同分並列；0 種未上榜。";
  const data = ui.data;
  const board = data?.boards?.[ui.metric];
  let content;
  if (ui.phase === "loading") content = '<p class="collection-leaderboard-message" role="status">正在載入排行榜…</p>';
  else if (ui.phase === "offline") content = '<p class="collection-leaderboard-message" role="status">此模式沒有店內排行榜。</p>';
  else if (ui.phase === "error") content = '<p class="collection-leaderboard-message" role="status">排行榜暫時無法載入。</p>';
  else if (ui.phase === "expired") content = '<p class="collection-leaderboard-message" role="status">資料已過期，請重新載入。</p>';
  else if (data?.status === "disabled") content = '<p class="collection-leaderboard-message" role="status">收藏排行榜尚未開放。</p>';
  else if (board?.status === "empty") content = `<p class="collection-leaderboard-message" role="status">${five ? "目前尚無五星收藏。" : "目前尚無上榜收藏。"}</p>`;
  else if (board?.status === "ready") content = `<table class="collection-leaderboard-table"><caption class="visually-hidden">${five ? "五星種類" : "寵物種類"}排行榜</caption><thead><tr><th scope="col">名次</th><th scope="col">同仁</th><th scope="col">種類數</th></tr></thead><tbody>${board.entries.map((entry) => {
    const tied = board.entries.filter((other) => other.rank === entry.rank).length > 1;
    return `<tr><th scope="row">${tied ? "並列" : ""}第 ${entry.rank} 名</th><td>${escapeHtml(entry.name)}</td><td><strong>${entry.count}</strong> 種</td></tr>`;
  }).join("")}</tbody></table>`;
  else content = '<p class="collection-leaderboard-message" role="status">排行榜暫時無法載入。</p>';
  panel.innerHTML = `<p class="collection-leaderboard-hint">${hint}</p>${content}`;
  document.getElementById("collectionLeaderboardTime").textContent = data?.snapshot_at
    ? `擷取於 ${new Date(data.snapshot_at).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}` : "";
  const refresh = document.getElementById("collectionLeaderboardRefresh");
  refresh.disabled = ui.phase === "loading" || ui.phase === "offline";
  refresh.textContent = ui.phase === "error" ? "重試" : ui.phase === "expired" ? "重新載入" : "\u21bb";
  refresh.classList.toggle("is-text", ["error", "expired"].includes(ui.phase));
}

function lockCollectionLeaderboardScroll() {
  const body = document.body;
  const properties = ["position", "top", "left", "width", "overflow"];
  collectionLeaderboard.scroll = { x: scrollX, y: scrollY, styles: Object.fromEntries(properties.map((key) => [key, body.style[key]])) };
  body.style.position = "fixed";
  body.style.top = `${-collectionLeaderboard.scroll.y}px`;
  body.style.left = `${-collectionLeaderboard.scroll.x}px`;
  body.style.width = "100%";
  body.style.overflow = "hidden";
}

function unlockCollectionLeaderboardScroll() {
  const saved = collectionLeaderboard.scroll;
  if (!saved) return;
  Object.entries(saved.styles).forEach(([key, value]) => { document.body.style[key] = value; });
  const behavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(saved.x, saved.y);
  document.documentElement.style.scrollBehavior = behavior;
  collectionLeaderboard.scroll = null;
}

function cancelCollectionLeaderboard() {
  collectionLeaderboard.generation += 1;
  collectionLeaderboard.controller?.abort();
  collectionLeaderboard.controller = null;
  clearTimeout(collectionLeaderboard.timer);
  collectionLeaderboard.data = null;
}

async function loadCollectionLeaderboard() {
  const ui = collectionLeaderboard;
  if (ui.phase === "loading" || !collectionLeaderboardDialog.open) return;
  cancelCollectionLeaderboard();
  const generation = ui.generation;
  if (!CLOUD_API_BASE_URL || CLOUD_API_BASE_URL === "mock") {
    ui.phase = "offline";
    renderCollectionLeaderboard();
    return;
  }
  ui.phase = "loading";
  renderCollectionLeaderboard();
  const controller = new AbortController();
  ui.controller = controller;
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const url = new URL(CLOUD_API_BASE_URL);
    url.search = "";
    url.hash = "";
    url.searchParams.set("action", "collectionLeaderboard");
    const response = await fetch(url.href, { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer", signal: controller.signal });
    if (!response.ok) throw new Error("unavailable");
    const envelope = await response.json();
    if (generation !== ui.generation || !collectionLeaderboardDialog.open) return;
    if (envelope?.ok !== true || envelope.action !== "collectionLeaderboard") {
      if (envelope?.errors?.some((error) => error.code === "UNKNOWN_ACTION")) {
        ui.data = { schema_version: 2, status: "disabled" };
      } else throw new Error("unavailable");
    } else {
      if (!validCollectionLeaderboard(envelope.data)) throw new Error("invalid snapshot");
      ui.data = envelope.data;
    }
    ui.phase = "ready";
    if (ui.data.snapshot_at) ui.timer = setTimeout(() => {
      if (generation !== ui.generation || !collectionLeaderboardDialog.open) return;
      ui.data = null;
      ui.phase = "expired";
      renderCollectionLeaderboard();
    }, Math.max(0, Date.parse(ui.data.snapshot_at) + 300000 - Date.now()));
  } catch (error) {
    if (generation !== ui.generation || !collectionLeaderboardDialog.open) return;
    ui.data = null;
    ui.phase = "error";
  } finally {
    clearTimeout(timeout);
    if (generation === ui.generation) {
      ui.controller = null;
      renderCollectionLeaderboard();
    }
  }
}

document.getElementById("collectionLeaderboardOpen").addEventListener("click", (event) => {
  if (collectionLeaderboardDialog.open) return;
  collectionLeaderboard.trigger = event.currentTarget;
  collectionLeaderboard.phase = "idle";
  lockCollectionLeaderboardScroll();
  collectionLeaderboardDialog.showModal();
  document.getElementById("collectionLeaderboardClose").focus();
  loadCollectionLeaderboard();
});
function closeCollectionLeaderboard() {
  cancelCollectionLeaderboard();
  if (collectionLeaderboardDialog.open) collectionLeaderboardDialog.close();
  unlockCollectionLeaderboardScroll();
  collectionLeaderboard.phase = "idle";
  collectionLeaderboard.trigger?.focus({ preventScroll: true });
}
document.getElementById("collectionLeaderboardClose").addEventListener("click", closeCollectionLeaderboard);
collectionLeaderboardDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeCollectionLeaderboard();
});
collectionLeaderboardDialog.addEventListener("close", () => {
  if (!collectionLeaderboardDialog.open && collectionLeaderboard.scroll) closeCollectionLeaderboard();
});
document.getElementById("collectionLeaderboardRefresh").addEventListener("click", loadCollectionLeaderboard);
document.querySelectorAll("[data-leaderboard-metric]").forEach((button) => {
  button.addEventListener("click", () => {
    collectionLeaderboard.metric = button.dataset.leaderboardMetric;
    renderCollectionLeaderboard();
  });
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? "owned_kinds" : event.key === "End" ? "five_star_kinds"
      : collectionLeaderboard.metric === "owned_kinds" ? "five_star_kinds" : "owned_kinds";
    collectionLeaderboard.metric = next;
    renderCollectionLeaderboard();
    document.querySelector(`[data-leaderboard-metric="${next}"]`).focus();
  });
});
