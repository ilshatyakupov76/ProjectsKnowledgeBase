const API_BASE = "/api";

let projects = [];
let sortMode = "score";

const elements = {
  tabs: document.querySelectorAll(".nav-tab"),
  panels: document.querySelectorAll(".tab-panel"),
  projectCount: document.querySelector("#projectCount"),
  featureCount: document.querySelector("#featureCount"),
  avgHours: document.querySelector("#avgHours"),
  searchInput: document.querySelector("#searchInput"),
  searchBtn: document.querySelector("#searchBtn"),
  clientFilter: document.querySelector("#clientFilter"),
  industryFilter: document.querySelector("#industryFilter"),
  platformFilter: document.querySelector("#platformFilter"),
  productFilter: document.querySelector("#productFilter"),
  stackFilter: document.querySelector("#stackFilter"),
  scoreFilter: document.querySelector("#scoreFilter"),
  scoreValue: document.querySelector("#scoreValue"),
  resultCount: document.querySelector("#resultCount"),
  queryHint: document.querySelector("#queryHint"),
  resultsBody: document.querySelector("#resultsBody"),
  emptyState: document.querySelector("#emptyState"),
  sortButtons: document.querySelectorAll(".segment"),
  projectsList: document.querySelector("#projectsList"),
  projectForm: document.querySelector("#projectForm"),
  featureRows: document.querySelector("#featureRows"),
  featureRowTemplate: document.querySelector("#featureRowTemplate"),
  addFeatureBtn: document.querySelector("#addFeatureBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  importInput: document.querySelector("#importInput"),
  resetBtn: document.querySelector("#resetBtn"),
  toast: document.querySelector("#toast")
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || `Ошибка API: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function readErrorMessage(response) {
  try {
    const payload = await response.json();
    if (Array.isArray(payload.detail)) {
      return payload.detail.map((item) => item.msg).join("; ");
    }
    return payload.detail || payload.message || "";
  } catch {
    return response.statusText;
  }
}

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      search.set(key, value);
    }
  });
  return search.toString() ? `?${search.toString()}` : "";
}

async function loadProjects() {
  projects = await apiRequest("/projects");
}

async function loadFilters() {
  const filters = await apiRequest("/filters");
  fillSelect(elements.clientFilter, filters.clients || [], "Все заказчики");
  fillSelect(elements.industryFilter, filters.industries || [], "Все отрасли");
  fillSelect(elements.platformFilter, filters.platforms || [], "Все платформы");
  fillSelect(elements.productFilter, filters.products || [], "Все продукты");
  fillSelect(elements.stackFilter, filters.stacks || [], "Любой стек");
}

async function loadSearchRows() {
  const query = buildQuery({
    q: elements.searchInput.value,
    client: elements.clientFilter.value,
    industry: elements.industryFilter.value,
    platform: elements.platformFilter.value,
    product: elements.productFilter.value,
    stack: elements.stackFilter.value
  });
  return apiRequest(`/features/search${query}`);
}

function getFeatureRows() {
  return projects.flatMap((project) =>
    project.features.map((feature) => ({
      projectId: project.id,
      projectName: project.name,
      client: project.client || "Не указан",
      industry: project.industry,
      platform: project.platform,
      product: project.product,
      ...feature,
      totalHours: Number(feature.analysisHours) + Number(feature.developmentHours) + Number(feature.testingHours)
    }))
  );
}

function splitStack(stack) {
  return String(stack || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function fillSelect(select, values, label) {
  const selected = select.value;
  select.innerHTML = "";
  select.append(new Option(label, ""));
  values.forEach((value) => select.append(new Option(value, value)));
  select.value = values.includes(selected) ? selected : "";
}

function sortRows(a, b) {
  if (sortMode === "total") {
    return b.totalHours - a.totalHours || b.score - a.score;
  }

  if (sortMode === "project") {
    return a.projectName.localeCompare(b.projectName, "ru") || b.score - a.score;
  }

  return b.score - a.score || b.totalHours - a.totalHours;
}

async function renderResults() {
  const query = elements.searchInput.value.trim();
  const minScore = Number(elements.scoreFilter.value);

  try {
    const rows = (await loadSearchRows())
      .filter((row) => row.score >= minScore)
      .sort(sortRows);

    elements.resultsBody.innerHTML = "";
    elements.emptyState.hidden = rows.length > 0;
    elements.resultCount.textContent = formatCount(rows.length, ["совпадение", "совпадения", "совпадений"]);
    elements.queryHint.textContent = query
      ? `Запрос: "${query}". Таблица отсортирована по выбранному признаку.`
      : "Показаны все функциональности. Для точного списка введите запрос.";

    const fragment = document.createDocumentFragment();
    for (const row of rows) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHtml(row.projectName)}</strong></td>
        <td>${escapeHtml(row.client)}</td>
        <td>${escapeHtml(row.industry)}</td>
        <td>${escapeHtml(row.platform)}</td>
        <td>${escapeHtml(row.product)}</td>
        <td class="feature-name">${highlight(row.name, query)}</td>
        <td>${row.analysisHours} ч</td>
        <td>${row.developmentHours} ч</td>
        <td>${row.testingHours} ч</td>
        <td><strong>${row.totalHours} ч</strong></td>
        <td><div class="stack-list">${splitStack(row.stack).map((stack) => `<span class="tag">${escapeHtml(stack)}</span>`).join("")}</div></td>
        <td><span class="score-pill">${row.score}%</span></td>
      `;
      fragment.append(tr);
    }

    elements.resultsBody.append(fragment);
  } catch (error) {
    elements.resultsBody.innerHTML = "";
    elements.emptyState.hidden = false;
    elements.resultCount.textContent = "0 совпадений";
    elements.queryHint.textContent = "Не удалось получить данные от API.";
    showToast(error.message);
  }
}

function highlight(value, query) {
  const escaped = escapeHtml(value);
  const tokens = tokenize(query);
  if (!tokens.length) {
    return escaped;
  }

  return tokens.reduce((html, token) => {
    const safeToken = escapeRegExp(token);
    return html.replace(new RegExp(`(${safeToken})`, "gi"), "<mark>$1</mark>");
  }, escaped);
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalize(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 2);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatCount(number, forms) {
  const abs = Math.abs(number) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) {
    return `${number} ${forms[2]}`;
  }
  if (last > 1 && last < 5) {
    return `${number} ${forms[1]}`;
  }
  if (last === 1) {
    return `${number} ${forms[0]}`;
  }
  return `${number} ${forms[2]}`;
}

function updateMetrics() {
  const rows = getFeatureRows();
  const totalHours = rows.reduce((sum, row) => sum + row.totalHours, 0);
  elements.projectCount.textContent = projects.length;
  elements.featureCount.textContent = rows.length;
  elements.avgHours.textContent = rows.length ? `${Math.round(totalHours / rows.length)} ч` : "0 ч";
}

function renderProjects() {
  elements.projectsList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const project of projects) {
    const total = project.features.reduce((sum, feature) => {
      return sum + Number(feature.analysisHours) + Number(feature.developmentHours) + Number(feature.testingHours);
    }, 0);

    const card = document.createElement("article");
    card.className = "project-card";
    card.innerHTML = `
      <div class="project-summary">
        <div>
          <h3>${escapeHtml(project.name)}</h3>
          <div class="project-meta">
            <span class="tag">${escapeHtml(project.client || "Не указан")}</span>
            <span class="tag">${escapeHtml(project.industry)}</span>
            <span class="tag">${escapeHtml(project.platform)}</span>
            <span class="tag">${escapeHtml(project.product)}</span>
          </div>
        </div>
        <div class="project-total">
          <strong>${total} ч</strong>
          ${formatCount(project.features.length, ["функциональность", "функциональности", "функциональностей"])}
        </div>
      </div>
      <div class="feature-list">
        ${project.features.map((feature) => {
          const featureTotal = Number(feature.analysisHours) + Number(feature.developmentHours) + Number(feature.testingHours);
          return `
            <div class="feature-item">
              <div>
                <strong>${escapeHtml(feature.name)}</strong>
                <div class="project-meta">${splitStack(feature.stack).map((stack) => `<span class="tag">${escapeHtml(stack)}</span>`).join("")}</div>
              </div>
              <div class="feature-hours">
                аналитика ${feature.analysisHours} ч<br>
                разработка ${feature.developmentHours} ч<br>
                тестирование ${feature.testingHours} ч<br>
                всего <strong>${featureTotal} ч</strong>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
    fragment.append(card);
  }

  elements.projectsList.append(fragment);
}

function addFeatureRow(values = {}) {
  const node = elements.featureRowTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector('[name="featureName"]').value = values.name || "";
  node.querySelector('[name="analysisHours"]').value = values.analysisHours ?? 16;
  node.querySelector('[name="developmentHours"]').value = values.developmentHours ?? 40;
  node.querySelector('[name="testingHours"]').value = values.testingHours ?? 12;
  node.querySelector('[name="stack"]').value = values.stack || "";
  node.querySelector(".remove-feature").addEventListener("click", () => {
    if (elements.featureRows.children.length > 1) {
      node.remove();
    } else {
      showToast("В проекте должна остаться хотя бы одна функциональность.");
    }
  });
  elements.featureRows.append(node);
}

function collectFeatureRows() {
  return [...elements.featureRows.querySelectorAll(".feature-row")].map((row) => ({
    name: row.querySelector('[name="featureName"]').value.trim(),
    analysisHours: Number(row.querySelector('[name="analysisHours"]').value),
    developmentHours: Number(row.querySelector('[name="developmentHours"]').value),
    testingHours: Number(row.querySelector('[name="testingHours"]').value),
    stack: row.querySelector('[name="stack"]').value.trim()
  }));
}

async function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.projectForm);
  const newProject = {
    name: formData.get("projectName").trim(),
    client: formData.get("client").trim(),
    industry: formData.get("industry").trim(),
    platform: formData.get("platform").trim(),
    product: formData.get("product").trim(),
    features: collectFeatureRows()
  };

  if (newProject.features.some((feature) => !feature.name || !feature.stack)) {
    showToast("Заполните название и стек для каждой функциональности.");
    return;
  }

  try {
    await apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify(newProject)
    });
    await refreshAll();
    elements.projectForm.reset();
    elements.featureRows.innerHTML = "";
    addFeatureRow();
    switchTab("search");
    elements.searchInput.value = newProject.features[0].name;
    await renderResults();
    showToast("Проект добавлен в базу знаний.");
  } catch (error) {
    showToast(error.message);
  }
}

async function exportJson() {
  try {
    const data = await apiRequest("/export");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "projects-knowledge-base.json";
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    showToast(error.message);
  }
}

function importJson(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) {
        throw new Error("JSON должен содержать массив проектов.");
      }

      await apiRequest("/import", {
        method: "POST",
        body: JSON.stringify(imported)
      });
      await refreshAll();
      showToast("База знаний импортирована.");
    } catch (error) {
      showToast(`Ошибка импорта: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

async function resetData() {
  const confirmed = confirm("Вернуть демо-данные? Текущие данные в базе будут заменены.");
  if (!confirmed) {
    return;
  }

  try {
    await apiRequest("/reset-demo-data", { method: "POST" });
    await refreshAll();
    showToast("Демо-данные восстановлены.");
  } catch (error) {
    showToast(error.message);
  }
}

function switchTab(tab) {
  elements.tabs.forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  elements.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tab));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => elements.toast.classList.remove("show"), 2800);
}

async function refreshAll() {
  try {
    await loadProjects();
    await loadFilters();
    updateMetrics();
    renderProjects();
    await renderResults();
  } catch (error) {
    projects = [];
    updateMetrics();
    renderProjects();
    elements.resultsBody.innerHTML = "";
    elements.emptyState.hidden = false;
    elements.resultCount.textContent = "0 совпадений";
    elements.queryHint.textContent = "API недоступен. Проверьте, что backend запущен.";
    showToast(error.message);
  }
}

function attachEvents() {
  elements.tabs.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  elements.searchBtn.addEventListener("click", renderResults);
  elements.searchInput.addEventListener("input", renderResults);
  elements.scoreFilter.addEventListener("input", () => {
    elements.scoreValue.textContent = `${elements.scoreFilter.value}%`;
    renderResults();
  });

  [
    elements.clientFilter,
    elements.industryFilter,
    elements.platformFilter,
    elements.productFilter,
    elements.stackFilter
  ].forEach((select) => select.addEventListener("change", renderResults));

  elements.sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sortMode = button.dataset.sort;
      elements.sortButtons.forEach((item) => item.classList.toggle("active", item === button));
      renderResults();
    });
  });

  elements.addFeatureBtn.addEventListener("click", () => addFeatureRow());
  elements.projectForm.addEventListener("submit", handleSubmit);
  elements.exportBtn.addEventListener("click", exportJson);
  elements.importInput.addEventListener("change", importJson);
  elements.resetBtn.addEventListener("click", resetData);
}

attachEvents();
addFeatureRow();
refreshAll();
