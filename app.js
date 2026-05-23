const STORAGE_KEY = "integrator-project-kb-v1";

const seedProjects = [
  {
    id: "pharma-servicedesk",
    name: "ServiceDesk для фармацевтической сети",
    industry: "Фармацевтика",
    platform: "ELMA",
    product: "ServiceDesk",
    features: [
      {
        name: "Регистрация и маршрутизация обращений аптечных точек",
        analysisHours: 32,
        developmentHours: 96,
        testingHours: 28,
        stack: "ELMA BPM, JavaScript, REST API"
      },
      {
        name: "Интеграция с бухгалтерской учетной системой",
        analysisHours: 40,
        developmentHours: 120,
        testingHours: 36,
        stack: "C#, REST API, MS SQL"
      },
      {
        name: "SLA-контроль заявок сервисной поддержки",
        analysisHours: 24,
        developmentHours: 72,
        testingHours: 24,
        stack: "ELMA BPM, JavaScript"
      }
    ]
  },
  {
    id: "construction-crm",
    name: "CRM для строительного холдинга",
    industry: "Строительство",
    platform: "Bitrix24",
    product: "CRM",
    features: [
      {
        name: "Воронка продаж объектов недвижимости",
        analysisHours: 28,
        developmentHours: 88,
        testingHours: 24,
        stack: "PHP, Bitrix24 REST, MySQL"
      },
      {
        name: "Интеграция CRM с бухгалтерской системой",
        analysisHours: 36,
        developmentHours: 112,
        testingHours: 32,
        stack: "PHP, 1C API, REST"
      },
      {
        name: "Аналитические отчеты для руководителя отдела продаж",
        analysisHours: 30,
        developmentHours: 80,
        testingHours: 20,
        stack: "JavaScript, SQL, BI connector"
      }
    ]
  },
  {
    id: "refinery-call-center",
    name: "Колл-центр для нефтеперерабатывающего предприятия",
    industry: "Нефтепереработка",
    platform: "BPMSoft",
    product: "Колл-центр",
    features: [
      {
        name: "Учет рабочего времени операторов колл-центра",
        analysisHours: 26,
        developmentHours: 76,
        testingHours: 22,
        stack: "C#, BPMSoft, PostgreSQL"
      },
      {
        name: "Аналитические отчеты для руководителя колл-центра",
        analysisHours: 34,
        developmentHours: 92,
        testingHours: 26,
        stack: "C#, SQL, Power BI"
      },
      {
        name: "Интеграция телефонии с карточкой обращения",
        analysisHours: 30,
        developmentHours: 108,
        testingHours: 34,
        stack: "C#, SIP, REST API"
      }
    ]
  },
  {
    id: "bank-bpm",
    name: "Автоматизация клиентских процессов банка",
    industry: "Финансовые услуги",
    platform: "ELMA",
    product: "BPM",
    features: [
      {
        name: "Согласование заявок на изменение клиентских лимитов",
        analysisHours: 44,
        developmentHours: 132,
        testingHours: 40,
        stack: "ELMA BPM, Java, Oracle"
      },
      {
        name: "Интеграция с системой электронного архива",
        analysisHours: 30,
        developmentHours: 86,
        testingHours: 24,
        stack: "Java, SOAP, Oracle"
      },
      {
        name: "Контроль сроков обработки клиентских обращений",
        analysisHours: 22,
        developmentHours: 64,
        testingHours: 20,
        stack: "ELMA BPM, JavaScript"
      }
    ]
  },
  {
    id: "retail-helpdesk",
    name: "HelpDesk для розничной сети",
    industry: "Ритейл",
    platform: "Bitrix24",
    product: "ServiceDesk",
    features: [
      {
        name: "Классификация обращений магазинов по категориям",
        analysisHours: 18,
        developmentHours: 54,
        testingHours: 16,
        stack: "PHP, Bitrix24 REST"
      },
      {
        name: "Учет времени работы сотрудников поддержки",
        analysisHours: 20,
        developmentHours: 58,
        testingHours: 18,
        stack: "PHP, JavaScript, MySQL"
      },
      {
        name: "Дашборд качества обслуживания для руководителя",
        analysisHours: 26,
        developmentHours: 74,
        testingHours: 20,
        stack: "JavaScript, SQL"
      }
    ]
  }
];

let projects = loadProjects();
let sortMode = "score";

const elements = {
  tabs: document.querySelectorAll(".nav-tab"),
  panels: document.querySelectorAll(".tab-panel"),
  projectCount: document.querySelector("#projectCount"),
  featureCount: document.querySelector("#featureCount"),
  avgHours: document.querySelector("#avgHours"),
  searchInput: document.querySelector("#searchInput"),
  searchBtn: document.querySelector("#searchBtn"),
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

function loadProjects() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return cloneData(seedProjects);
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : cloneData(seedProjects);
  } catch {
    return cloneData(seedProjects);
  }
}

function cloneData(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects, null, 2));
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

function getFeatureRows() {
  return projects.flatMap((project) =>
    project.features.map((feature) => ({
      projectId: project.id,
      projectName: project.name,
      industry: project.industry,
      platform: project.platform,
      product: project.product,
      ...feature,
      totalHours: Number(feature.analysisHours) + Number(feature.developmentHours) + Number(feature.testingHours)
    }))
  );
}

function scoreFeature(query, feature) {
  const queryTokens = tokenize(query);
  const haystack = normalize(`${feature.name} ${feature.projectName} ${feature.industry} ${feature.platform} ${feature.product} ${feature.stack}`);
  const featureName = normalize(feature.name);

  if (queryTokens.length === 0) {
    return 100;
  }

  let score = 0;
  for (const token of queryTokens) {
    if (featureName.includes(token)) {
      score += 75;
    } else if (haystack.includes(token)) {
      score += 52;
    } else {
      const fuzzyHit = haystack.split(" ").some((word) => isCloseToken(word, token));
      if (fuzzyHit) {
        score += 32;
      }
    }
  }

  const phraseBonus = featureName.includes(normalize(query)) ? 25 : 0;
  const tokenScore = Math.round(score / queryTokens.length);
  return Math.min(100, tokenScore + phraseBonus);
}

function isCloseToken(word, token) {
  if (word.startsWith(token) || token.startsWith(word)) {
    return true;
  }

  if (word.length > 5 && token.length > 5) {
    return word.slice(0, 6) === token.slice(0, 6);
  }

  return false;
}

function uniqueValues(rows, key) {
  return [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ru"));
}

function stackValues(rows) {
  return [...new Set(rows.flatMap((row) => splitStack(row.stack)))].sort((a, b) => a.localeCompare(b, "ru"));
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

function updateFilters() {
  const rows = getFeatureRows();
  fillSelect(elements.industryFilter, uniqueValues(rows, "industry"), "Все отрасли");
  fillSelect(elements.platformFilter, uniqueValues(rows, "platform"), "Все платформы");
  fillSelect(elements.productFilter, uniqueValues(rows, "product"), "Все продукты");
  fillSelect(elements.stackFilter, stackValues(rows), "Любой стек");
}

function getFilteredRows() {
  const query = elements.searchInput.value;
  const minScore = Number(elements.scoreFilter.value);

  return getFeatureRows()
    .map((row) => ({ ...row, score: scoreFeature(query, row) }))
    .filter((row) => !elements.industryFilter.value || row.industry === elements.industryFilter.value)
    .filter((row) => !elements.platformFilter.value || row.platform === elements.platformFilter.value)
    .filter((row) => !elements.productFilter.value || row.product === elements.productFilter.value)
    .filter((row) => !elements.stackFilter.value || splitStack(row.stack).includes(elements.stackFilter.value))
    .filter((row) => row.score >= minScore)
    .sort(sortRows);
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

function renderResults() {
  const rows = getFilteredRows();
  const query = elements.searchInput.value.trim();

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

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.projectForm);
  const newProject = {
    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `project-${Date.now()}`,
    name: formData.get("projectName").trim(),
    industry: formData.get("industry").trim(),
    platform: formData.get("platform").trim(),
    product: formData.get("product").trim(),
    features: collectFeatureRows()
  };

  if (newProject.features.some((feature) => !feature.name || !feature.stack)) {
    showToast("Заполните название и стек для каждой функциональности.");
    return;
  }

  projects.unshift(newProject);
  saveProjects();
  refreshAll();
  elements.projectForm.reset();
  elements.featureRows.innerHTML = "";
  addFeatureRow();
  switchTab("search");
  elements.searchInput.value = newProject.features[0].name;
  renderResults();
  showToast("Проект добавлен в базу знаний.");
}

function exportJson() {
  const blob = new Blob([JSON.stringify(projects, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "projects-knowledge-base.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importJson(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) {
        throw new Error("JSON должен содержать массив проектов.");
      }

      projects = imported.map(normalizeProject);
      saveProjects();
      refreshAll();
      showToast("База знаний импортирована.");
    } catch (error) {
      showToast(`Ошибка импорта: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function normalizeProject(project, index) {
  if (!project.name || !project.industry || !project.platform || !project.product || !Array.isArray(project.features)) {
    throw new Error(`Некорректный проект в позиции ${index + 1}.`);
  }

  return {
    id: project.id || `project-${Date.now()}-${index}`,
    name: String(project.name),
    industry: String(project.industry),
    platform: String(project.platform),
    product: String(project.product),
    features: project.features.map((feature, featureIndex) => {
      if (!feature.name || !feature.stack) {
        throw new Error(`Некорректная функциональность в проекте "${project.name}", строка ${featureIndex + 1}.`);
      }

      return {
        name: String(feature.name),
        analysisHours: Number(feature.analysisHours) || 0,
        developmentHours: Number(feature.developmentHours) || 0,
        testingHours: Number(feature.testingHours) || 0,
        stack: String(feature.stack)
      };
    })
  };
}

function resetData() {
  const confirmed = confirm("Вернуть демо-данные? Текущие локальные изменения будут заменены.");
  if (!confirmed) {
    return;
  }

  projects = cloneData(seedProjects);
  saveProjects();
  refreshAll();
  showToast("Демо-данные восстановлены.");
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

function refreshAll() {
  updateFilters();
  updateMetrics();
  renderProjects();
  renderResults();
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
