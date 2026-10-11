from simulation import calculate_simulation


scenarios = [
    {
        "name": "A — All Trees + Compact",
        "trees": ["tree_a", "tree_b", "tree_c"],
        "development": "compact",
        "interventions": [],
    },
    {
        "name": "B — All Trees + Expanded",
        "trees": ["tree_a", "tree_b", "tree_c"],
        "development": "expanded",
        "interventions": [],
    },
    {
        "name": "C — Expanded + Rain Garden",
        "trees": ["tree_a", "tree_b", "tree_c"],
        "development": "expanded",
        "interventions": ["rain_garden"],
    },
    {
        "name": "D — Expanded + Permeable Pavement",
        "trees": ["tree_a", "tree_b", "tree_c"],
        "development": "expanded",
        "interventions": ["permeable_pavement"],
    },
    {
        "name": "E — Expanded + Maximum Adaptation",
        "trees": ["tree_a", "tree_b", "tree_c"],
        "development": "expanded",
        "interventions": [
            "rain_garden",
            "permeable_pavement",
            "shade_infrastructure",
            "building_redesign",
        ],
    },
    {
        "name": "F — Remove Tree B + Expanded",
        "trees": ["tree_a", "tree_c"],
        "development": "expanded",
        "interventions": [],
    },
]


for scenario in scenarios:

    result = calculate_simulation(
        preserved_trees=scenario["trees"],
        development_type=scenario["development"],
        selected_interventions=scenario["interventions"],
    )

    print("\n" + "=" * 55)
    print(scenario["name"])
    print("=" * 55)

    print(f"🌡️ Heat Exposure:      {result['heat_exposure']}")
    print(f"🌧️ Runoff Pressure:    {result['runoff_pressure']}%")
    print(f"💧 Water Resilience:   {result['water_resilience']}")
    print(f"🌳 Shade Coverage:     {result['shade_coverage']}%")
    print(f"🏗️ Development:        {result['development_score']}")
    print(f"💰 Adaptation Cost:    ₹{result['adaptation_cost']:,}")
    print(f"💵 Remaining Budget:   ₹{result['remaining_budget']:,}")
    print(f"🛡️ Resilience Index:   {result['resilience_index']}")
   