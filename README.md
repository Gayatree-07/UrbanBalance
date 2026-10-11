# UrbanBalance 🌳

### See the consequences before you build.

UrbanBalance is an interactive urban-planning simulator that helps users explore the trade-offs between urban development, environmental resilience, and limited budgets.

Through a visual neighborhood model, users can experiment with development intensity, tree preservation, and climate-adaptation measures, then compare their design against two predefined strategies: **Development-first** and **Climate-resilience-first**.

## 🌍 The Problem

Urban development can improve housing and infrastructure, but it can also increase heat exposure, reduce green cover, and worsen stormwater runoff. Cities must make these decisions while working with limited land and financial resources.

UrbanBalance explores these competing priorities through an interactive simulation that makes the environmental trade-offs of planning decisions visible.

## ✨ Key Features

- **Interactive 2D neighborhood:** Explore a visual representation of an urban development scenario.
- **Development controls:** Compare compact, balanced, and expanded development.
- **Tree preservation:** Choose which existing trees to protect.
- **Climate-adaptation interventions:** Experiment with rain gardens, permeable pavement, shade infrastructure, and building redesign.
- **Budget-aware planning:** Explore adaptation options within a modeled budget of ₹10,00,000.
- **Environmental metrics:** Examine modeled heat exposure, runoff pressure, shade coverage, and resilience.
- **Strategy comparison:** Compare a saved design against two predefined alternatives.
- **Scenario visualization:** Switch between heatwave and heavy-rain visual scenarios.
- **Assumptions and limitations:** Review the assumptions behind the simulation.

## 📊 Compare Three Planning Strategies

### 1. Development-first

Prioritizes development capacity while keeping adaptation spending low.

- Expanded development
- One preserved tree
- Building redesign as the selected adaptation
- Modeled adaptation cost: ₹1,00,000

### 2. Climate-resilience-first

Prioritizes environmental resilience while retaining development.

- Balanced development
- All three trees preserved
- Rain garden, permeable pavement, and shade infrastructure
- Modeled adaptation cost: ₹6,00,000

### 3. Your Current Design

Users configure their own strategy by choosing development intensity, preserved trees, and adaptation interventions. After running a simulation, they can save their design and compare its results against both predefined strategies.

The preset strategies provide consistent benchmarks; saving a new design updates the user's comparison card without replacing the presets.

## 📈 Metrics

| Metric | What it represents |
|---|---|
| Resilience index | A combined score based on modeled heat resilience, water resilience, and shade |
| Heat exposure | Estimated heat exposure under the selected design |
| Runoff pressure | Remaining runoff relative to the scenario's unmitigated runoff |
| Shade coverage | Estimated shade across the modeled pedestrian area |
| Development score | A score associated with the selected development intensity |
| Adaptation cost | Total modeled cost of selected interventions |
| Remaining budget | Budget left after adaptation spending |

> **Important:** These values come from a simplified simulation. They are not measurements from a real neighborhood or predictions from a validated climate model, and should not replace professional urban planning or environmental assessment.

## 🛠️ Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python
- **API:** Local HTTP API for simulation requests
- **Serverless tooling:** AWS Serverless   Application Model (AWS SAM) CLI
- **Local serverless execution:** Docker
- **Version control:** Git and GitHub

The core simulation can run locally. AWS SAM CLI and Docker are used for local serverless development and testing.

**Deployment status:** UrbanBalance has not been deployed to AWS cloud infrastructure. Cloud access was blocked by an account subscription restriction during development. This repository does not claim a production AWS deployment.

## 🗂️ Project Structure

UrbanBalance/
├── Backend/
│   ├── api_server.py
│   ├── simulation.py
│   └── test_simulation.py
├── Frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── sam-backend/
│   ├── template.yaml
│   ├── events/
│   │   └── scenario.json
│   └── src/
│       └── app.py
├── .gitignore
└── README.md

## 🚀 Getting Started

### Prerequisites

- Python 3
- A modern web browser
- Docker and AWS SAM CLI for local serverless testing

### 1. Clone the repository

```bash
git clone https://github.com/Gayatree-07/UrbanBalance.git
cd UrbanBalance
```

### 2. Start the backend

From the project root, run:

```bash
python Backend/api_server.py
```

Keep the terminal running. Open the local URL printed by the server, or use the URL configured by your application.

If the backend requires additional Python packages, install them as specified by your project setup.

### 3. Explore the simulator

1. Adjust development intensity.
2. Choose which trees to preserve.
3. Select climate-adaptation interventions.
4. Run the simulation.
5. Review the environmental metrics and remaining budget.
6. Save your design.
7. Compare it against the Development-first and Climate-resilience-first strategies.

### 4. Run the tests

From the project root:

```bash
python -m unittest discover -s Backend -p "test_*.py"
```

### 5. Run the local serverless function

The serverless backend is configured in `sam-backend/template.yaml`.

With Docker running and AWS SAM CLI installed, use the function's logical ID from the SAM template:

```bash
cd sam-backend
sam build
sam local invoke FUNCTION_LOGICAL_ID --event events/scenario.json
```

Replace `FUNCTION_LOGICAL_ID` with the actual logical ID declared in `template.yaml`. Local invocation does not mean the function has been deployed to AWS.

## 🧮 How It Works

1. The user configures a development scenario.
2. The frontend sends the selected development intensity, preserved trees, and interventions to the Python API.
3. The simulation calculates modeled environmental indicators and adaptation costs.
4. The frontend displays the resulting metrics.
5. The strategy-comparison feature runs the two predefined scenarios and displays their results alongside the user's saved design.

The current implementation uses simplified model assumptions and fixed intervention costs. Results should be interpreted as illustrative comparisons rather than real-world forecasts.

## 🔮 Future Improvements

- Calibrate the simulation using local environmental and urban-planning data.
- Add more neighborhood layouts and planning scenarios.
- Support multiple saved designs and persistent storage.
- Improve accessibility and mobile usability.
- Add charts that make differences between strategies easier to interpret.
- Explore AWS deployment when cloud access is available.
- Validate simulation assumptions with urban-planning and environmental experts.

## 🎯 Project Vision

UrbanBalance aims to make the consequences of urban-development decisions more understandable and accessible. By allowing people to explore alternatives before building, it encourages more informed conversations about development, affordability, green infrastructure, and climate resilience.

**Build thoughtfully. Compare the trade-offs. Plan for a more resilient neighborhood.**

---

**Built for Environmental Hacks 2026.**
