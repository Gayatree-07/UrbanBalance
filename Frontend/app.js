(() => {
  const BUDGET = 1_000_000;
  const COSTS = {
    rain_garden: 200_000,
    permeable_pavement: 250_000,
    shade_infrastructure: 150_000,
    building_redesign: 100_000
  };
  
  const TREE_IDS = ["tree_a", "tree_b", "tree_c"];
  const state = {
    development: "balanced",
    trees: new Set(TREE_IDS),
    interventions: new Set(),
    weather: "clear",
    lastResult: null
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = n => "₹" + Math.round(n).toLocaleString("en-IN");
  const interventionsCost = () => [...state.interventions].reduce((sum, key) => sum + COSTS[key], 0);

  function syncTreeUI() {
    $$("[data-tree]").forEach(button => {
      const selected = state.trees.has(button.dataset.tree);
      button.classList.toggle("preserved", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    $$("[data-tree-check]").forEach(input => input.checked = state.trees.has(input.dataset.treeCheck));
    const count = state.trees.size;
    $("#sceneStatus").textContent = `${count} of 3 trees preserved${state.trees.has("tree_b") ? " · Tree B protected" : ""}`;
  }

  function syncDevelopmentUI() {
    $$("[data-development]").forEach(button => {
      button.classList.toggle("active", button.dataset.development === state.development);
      button.setAttribute("aria-pressed", String(button.dataset.development === state.development));
    });
    const building = $("#proposedBuilding");
    building.classList.remove("scale-compact", "scale-balanced", "scale-expanded");
    building.classList.add(`scale-${state.development}`);
    const styles = {
      compact: { width: "22%", height: "25%", left: "45%", top: "56%" },
      balanced: { width: "28%", height: "30%", left: "42%", top: "51%" },
      expanded: { width: "33%", height: "34%", left: "39%", top: "47%" }
    };
    Object.assign(building.style, styles[state.development]);
    $("#resultCaption").textContent = `Illustrative model · ${state.development[0].toUpperCase() + state.development.slice(1)} development`;
  }

  function syncInterventionUI() {
    $$("[data-intervention]").forEach(input => input.checked = state.interventions.has(input.dataset.intervention));
    $("#rainGardenVisual").style.display = state.interventions.has("rain_garden") ? "flex" : "none";
    $("#pavementVisual").style.display = state.interventions.has("permeable_pavement") ? "block" : "none";
    $("#shadeVisual").style.display = state.interventions.has("shade_infrastructure") ? "block" : "none";
    const spent = interventionsCost();
    const remaining = BUDGET - spent;
    $("#budgetSpent").textContent = `${money(spent)} spent`;
    $("#budgetRemaining").textContent = `${money(remaining)} left`;
    $("#budgetBar").style.width = `${Math.min(100, spent / BUDGET * 100)}%`;
    
    const feedback = $("#adaptationFeedback");

    const adaptationDetails = {
      rain_garden: {
        name: "Rain garden",
        benefit: "Helps capture stormwater and reduce runoff.",
        cost: COSTS.rain_garden
      },
      permeable_pavement: {
        name: "Permeable pavement",
        benefit: "Allows more rainwater to soak into the ground.",
        cost: COSTS.permeable_pavement
      },
      shade_infrastructure: {
        name: "Shade infrastructure",
        benefit: "Adds shaded space to help reduce heat exposure.",
        cost: COSTS.shade_infrastructure
      },
      building_redesign: {
        name: "Building redesign",
        benefit: "Reduces the paved footprint and supports a more balanced layout.",
        cost: COSTS.building_redesign
      }
    };

    const selected = [...state.interventions]
      .map(id => adaptationDetails[id])
      .filter(Boolean);

    if (selected.length === 0) {
      feedback.innerHTML =
        "<strong>Your adaptation strategy</strong>" +
        "<p>Select an adaptation to see its intended benefit and cost.</p>";
    } else {
      const items = selected.map(item =>
        `<li><strong>${item.name}</strong> — ${item.benefit} <span>${money(item.cost)}</span></li>`
      ).join("");

      feedback.innerHTML =
        "<strong>Your adaptation strategy</strong>" +
        `<ul>${items}</ul>` +
        `<p><strong>${money(spent)}</strong> allocated · <strong>${money(remaining)}</strong> remaining</p>`;
    }

    $("#budgetWarning").textContent = remaining < 0 ? "Over budget. Remove an adaptation to continue." : "";
    $("#simulateBtn").disabled = remaining < 0;
  }

  function syncWeatherUI() {
    $("#cityScene").dataset.weather = state.weather;
    $("#sceneLabel").textContent = state.weather === "rain" ? "HEAVY RAIN SCENARIO" : "HEATWAVE SCENARIO";
    $$(".scenario-btn").forEach(button => button.classList.toggle("active", button.dataset.scenario === state.weather));
  }

  
  
  function syncAll() {
    syncTreeUI();
    syncDevelopmentUI();
    syncInterventionUI();
    syncWeatherUI();
  }

  // Temporary browser-side adapter mirrors backend/simulation.py for local UI work.
  // Replace runSimulation() with an API request when the Python HTTP endpoint is ready.
  function runLocalSimulation() {
    const trees = {
      tree_a: { shade: 350, interception: 1000, infiltration: 2000, heat_benefit: 7 },
      tree_b: { shade: 500, interception: 1500, infiltration: 3000, heat_benefit: 10 },
      tree_c: { shade: 250, interception: 700, infiltration: 1500, heat_benefit: 5 }
    };
    const development = {
      compact: { added_impervious: 600, development_score: 65 },
      balanced: { added_impervious: 900, development_score: 80 },
      expanded: { added_impervious: 1300, development_score: 95 }
    };
    const interventions = {
      rain_garden: { water_capture: 25000, heat_reduction: 3 },
      permeable_pavement: { water_capture: 30000, heat_reduction: 2 },
      shade_infrastructure: { water_capture: 0, heat_reduction: 8, shade_bonus: 150 },
      building_redesign: { water_capture: 0, heat_reduction: 3, impervious_reduction: 150 }
    };
    let impervious = 5000 + development[state.development].added_impervious;
    if (state.interventions.has("building_redesign")) impervious -= interventions.building_redesign.impervious_reduction;
    impervious = Math.max(0, impervious);

    const selectedTrees = [...state.trees].map(id => trees[id]);
    const sum = (arr, key) => arr.reduce((total, item) => total + (Number.isFinite(Number(item?.[key])) ? Number(item[key]) : 0), 0);
    const treeShade = sum(selectedTrees, "shade");
    const treeIntercept = sum(selectedTrees, "interception");
    const treeInfiltration = sum(selectedTrees, "infiltration");
    const treeHeat = sum(selectedTrees, "heat_benefit");
    const selectedInterventions = [...state.interventions].map(id => interventions[id]);
    const interventionHeat = sum(selectedInterventions, "heat_reduction");
    const interventionCapture = sum(selectedInterventions, "water_capture");
    const heat = Math.max(0, Math.min(100, 60 + (impervious / 10000) * 20 - treeHeat - interventionHeat));
    const unmitigatedRunoff = 80 * impervious * 0.8;
    const runoff = Math.max(0, unmitigatedRunoff - treeIntercept - treeInfiltration - interventionCapture);
    const runoffPressure = unmitigatedRunoff > 0 ? runoff / unmitigatedRunoff * 100 : 0;
    const waterResilience = Math.max(0, Math.min(100, (1 - runoffPressure / 100) * 200));
    const shade = Math.min(100, (treeShade * .86 + sum(selectedInterventions, "shade_bonus")) / 2000 * 100);
    const resilience = (100 - heat) * .4 + waterResilience * .4 + shade * .2;
    return {
      heat_exposure: Number(heat.toFixed(2)),
      runoff_pressure: Number(runoffPressure.toFixed(2)),
      shade_coverage: Number(shade.toFixed(2)),
      resilience_index: Number(resilience.toFixed(2)),
      development_score: development[state.development].development_score,
      adaptation_cost: interventionsCost(),
      remaining_budget: BUDGET - interventionsCost(),
      effective_runoff: Number(runoff.toFixed(2)),
      unmitigated_runoff: Number(unmitigatedRunoff.toFixed(2))
    };
  }
    
async function runSimulation() {
  const response = await fetch("/api/simulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      development: state.development,
      preserved_trees: [...state.trees],
      interventions: [...state.interventions]
    })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Simulation request failed.");
  }

  return result;
}


  function setMetric(valueId, barId, hintId, value, max, hint, reverse = false) {
    $(valueId).innerHTML = `${value}<small>${max === 100 && valueId === "#runoffValue" ? "%" : ""}</small>`;
    const normalized = Math.max(0, Math.min(100, Number(value) / max * 100));
    $(barId).style.width = `${reverse ? 100 - normalized : normalized}%`;
    $(hintId).textContent = hint;
  }

  function renderResult(result) {
    // Normalize missing or invalid values explicitly: zero is a valid result, blank/NaN is not.
    const safeNumber = (value, fallback = 0) => {
      const number = Number(value);
      return value !== null && value !== undefined && value !== "" && Number.isFinite(number)
        ? number : fallback;
    };
    const heat = safeNumber(result?.heat_exposure);
    const runoff = safeNumber(result?.runoff_pressure);
    const shade = safeNumber(result?.shade_coverage);
    const resilience = safeNumber(result?.resilience_index);
    const developmentScore = safeNumber(result?.development_score);
    const cost = safeNumber(result?.adaptation_cost, interventionsCost());
    const remaining = safeNumber(result?.remaining_budget, BUDGET - cost);

    state.lastResult = {
      ...result,
      heat_exposure: heat,
      runoff_pressure: runoff,
      shade_coverage: shade,
      resilience_index: resilience,
      development_score: developmentScore,
      adaptation_cost: cost,
      remaining_budget: remaining
    };
    

    $("#heatValue").innerHTML = `${heat.toFixed(1)}<small>/ 100</small>`;
    $("#heatBar").style.width = `${Math.max(0, Math.min(100, heat))}%`;
    $("#heatHint").textContent = heat < 40
      ? "Lower modeled heat exposure."
      : heat < 55 ? "Moderate modeled heat exposure." : "Higher modeled heat exposure.";

    $("#runoffValue").innerHTML = `${runoff.toFixed(1)}<small>%</small>`;
    $("#runoffBar").style.width = `${Math.max(0, Math.min(100, runoff))}%`;
    $("#runoffHint").textContent = "Remaining runoff relative to this strategy's unmitigated runoff.";

    $("#shadeValue").innerHTML = `${shade.toFixed(1)}<small>%</small>`;
    $("#shadeBar").style.width = `${Math.max(0, Math.min(100, shade))}%`;
    $("#shadeHint").textContent = shade === 0
      ? "No modeled shade from selected trees or infrastructure."
      : "Estimated shade across the modeled pedestrian area.";

    $("#resilienceValue").innerHTML = `${resilience.toFixed(1)}<small>/ 100</small>`;
    $("#resilienceBar").style.width = `${Math.max(0, Math.min(100, resilience))}%`;
    $("#resilienceHint").textContent = "Weighted heat resilience, water resilience, and shade.";

    $("#developmentValue").textContent = `${developmentScore} / 100`;
    $("#costValue").textContent = money(cost);
    $("#remainingValue").textContent = money(remaining);
    $("#resultCaption").textContent = `${state.weather === "rain" ? "Heavy rain" : "Heatwave"} · ${state.development[0].toUpperCase() + state.development.slice(1)} development`;
    $("#cityScene").classList.remove("has-result");
    void $("#cityScene").offsetWidth;
    $("#cityScene").classList.add("has-result");
  }
// ---------- Strategy comparison ----------

let savedStrategy = null;

function formatStrategyMetrics(result) {
  const money = value =>
    `₹${Number(value).toLocaleString("en-IN")}`;
  return `
    <div class="strategy-metric-row">
      <span>Resilience index</span>
      <strong>${Number(result.resilience_index).toFixed(1)}/100</strong>
    </div>
    <div class="strategy-metric-row">
      <span>Heat exposure</span>
      <strong>${Number(result.heat_exposure).toFixed(1)}/100</strong>
    </div>
    <div class="strategy-metric-row">
      <span>Runoff pressure</span>
      <strong>${Number(result.runoff_pressure).toFixed(1)}%</strong>
    </div>
    <div class="strategy-metric-row">
      <span>Adaptation cost</span>
      <strong>${money(result.adaptation_cost)}</strong>
    </div>
    <div class="strategy-metric-row">
      <span>Budget remaining</span>
      <strong>${money(result.remaining_budget)}</strong>
    </div>
    <div class="strategy-metric-row">
      <span>Development score</span>
      <strong>${result.development_score}/100</strong>
    </div>
  `;
}

function renderStrategyCard(elementId, result) {
  $(`#${elementId}`).innerHTML = formatStrategyMetrics(result);
}

async function simulateStrategy(strategy) {
  const response = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      development: strategy.development,
      preserved_trees: strategy.trees,
      interventions: strategy.interventions
    })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Strategy simulation failed.");
  }

  return result;
}


async function refreshStrategyComparison() {
  console.log("Strategy comparison function started");
  const developmentFirst = {
    development: "expanded",
    trees: ["tree_a"],
    interventions: ["building_redesign"]
  };

  const resilienceFirst = {
    development: "balanced",
    trees: ["tree_a", "tree_b", "tree_c"],
    interventions: [
      "rain_garden",
      "permeable_pavement",
      "shade_infrastructure"
    ]
  };

  const developmentCard = document.querySelector("#developmentFirstMetrics");
  const resilienceCard = document.querySelector("#resilienceFirstMetrics");

  try {
    const [developmentResult, resilienceResult] = await Promise.all([
      simulateStrategy(developmentFirst),
      simulateStrategy(resilienceFirst)
    ]);

    renderStrategyCard("developmentFirstMetrics", developmentResult);
    renderStrategyCard("resilienceFirstMetrics", resilienceResult);
  } catch (error) {
    console.error("Preset strategy comparison failed:", error);

    developmentCard.innerHTML =
      "<p>Development-first results unavailable. Check the backend.</p>";

    resilienceCard.innerHTML =
      "<p>Climate-resilience-first results unavailable. Check the backend.</p>";
  }

  // Refresh the saved design independently.
  if (savedStrategy) {
    renderStrategyCard("savedStrategyMetrics", savedStrategy.result);
  }
}


$("#saveStrategyBtn").addEventListener("click", () => {
  const name = $("#strategyName").value.trim();
  const status = $("#strategySaveStatus");

  if (!name) {
    status.textContent = "Enter a name for your design first.";
    return;
  }

  if (!state.lastResult) {
    status.textContent = "Run the simulation before saving your design.";
    return;
  }

   savedStrategy = {
    name,
    development: state.development,
    trees: [...state.trees],
    interventions: [...state.interventions],
    weather: state.weather,
    result: { ...state.lastResult }
  };

  $("#savedStrategyTitle").textContent = name;
  $("#savedStrategyDescription").textContent =
    `${state.development} development · ${state.trees.size} trees preserved · ` +
    `${state.interventions.size} adaptations selected`;

  renderStrategyCard("savedStrategyMetrics", savedStrategy.result);
  status.textContent = "Design saved for comparison.";
});

  $$("[data-tree]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.tree;
    state.trees.has(id) ? state.trees.delete(id) : state.trees.add(id);
    syncTreeUI();
  }));
  $$("[data-tree-check]").forEach(input => input.addEventListener("change", () => {
    input.checked ? state.trees.add(input.dataset.treeCheck) : state.trees.delete(input.dataset.treeCheck);
    syncTreeUI();
  }));
  $$("[data-development]").forEach(button => button.addEventListener("click", () => {
    state.development = button.dataset.development;
    syncDevelopmentUI();
  }));
  $$("[data-intervention]").forEach(input => input.addEventListener("change", () => {
    const id = input.dataset.intervention;
    input.checked ? state.interventions.add(id) : state.interventions.delete(id);
    syncInterventionUI();
  }));
  $$(".scenario-btn").forEach(button => button.addEventListener("click", () => {
    state.weather = button.dataset.scenario;
    syncWeatherUI();
  }));

  $("#simulateBtn").addEventListener("click", async () => {
    const button = $("#simulateBtn");
    button.disabled = true;
    $("span", button).textContent = "Simulating…";
    try {
      const result = await runSimulation();
      renderResult(result);
    } catch (error) {
      $("#budgetWarning").textContent = error.message || "Simulation failed. Please try again.";
    } finally {
      $("span", button).textContent = "Run simulation";
      button.disabled = interventionsCost() > BUDGET;
    }
  });
  
  
$("#resetBtn").addEventListener("click", async () => {
  state.development = "balanced";
  state.trees = new Set(TREE_IDS);
  state.interventions.clear();
  state.weather = "clear";

  syncAll();

  const button = $("#simulateBtn");
  button.disabled = true;

  try {
    const result = await runSimulation();
    renderResult(result);
  } catch (error) {
    $("#budgetWarning").textContent =
      error.message || "Could not reset the simulation.";
  } finally {
    button.disabled = interventionsCost() > BUDGET;
  }
});


  $("#assumptionsBtn").addEventListener("click", () => $("#assumptionsDialog").showModal());
  $("#closeDialog").addEventListener("click", () => $("#assumptionsDialog").close());
  $("#assumptionsDialog").addEventListener("click", event => {
    if (event.target === $("#assumptionsDialog")) $("#assumptionsDialog").close();
  });

  
  console.info("UrbanBalance frontend v3 loaded");
  syncAll();
  renderResult({...state.lastResult});
  refreshStrategyComparison();
})();