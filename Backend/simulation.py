#Environmental Simulation Engine

SITE_AREA = 10000
BASE_IMPERVIOUS_AREA = 5000
PEDESTRIAN_AREA = 2000
ADAPTATION_BUDGET = 1000000

RAINFALL_MM = 80
RUNOFF_COEFFICIENT = 0.8
BASE_HEAT_INDEX = 60

TREES = {
    "tree_a" : {
        "name" : "Tree A",
        "shade" : 350,
        "interception" : 1000,
        "infiltration" : 2000,
        "heat_benefit" : 7,
    },

    "tree_b" : {
        "name" : "Tree B",
        "shade" : 500,
        "interception" : 1500,
        "infiltration" : 3000,
        "heat_benefit" : 10,
    },

    "tree_c" : {
        "name" : "Tree C",
        "shade" : 250,
        "interception" : 700,
        "infiltration" : 1500,
        "heat_benefit" : 5,
    },
}

DEVELOPMENT = {
    "compact" : {
        "name" : "Compact",
        "building_area" : 1800,
        "added_impervious " : 600,
        "development_score" : 65,
    },

    "balanced" : {
        "name" : "Balanced",
        "building_area" : 2200,
        "added_impervious " : 900,
        "development_score" : 80,
    },

    "expanded" : {
        "name" : "Expanded",
        "building_area" : 2600,
        "added_impervious " : 1300,
        "development_score" : 95,
    },
}

INTERVENTIONS = {
    "rain_garden" : {
        "name" : "Rain Garden",
        "cost" : 200000,
        "water_capture" : 25000,
        "heat_reduction" : 3,
    },

    "permeable_pavement" : {
        "name" : "Permeable Pavement",
        "cost" : 250000,
        "water_capture" : 30000,
        "heat_reduction" : 2,
    },

    "shade_infrastructure" : {
        "name" : "Shade Infrastructure",
        "cost" : 150000,
        "water_capture" : 0,
        "heat_reduction" : 8,
        "shade_bonus" : 150,
    },

    "building_redesign" : {
        "name" : "Building Redesign",
        "cost" : 100000,
        "water_capture" : 0,
        "heat_reduction" : 3,
        "impervious_reduction" : 150,
    },
}

def calculate_simulation(preserved_trees, development_type, selected_interventions):
    """
    Run one UrbanBalance scenario.

    Parameters:
    preserved_trees : List of tree IDs
    development_type: compact / balanced / expanded
    selected_interventions: List of intervention IDs

    """

    #Validate choices

    if development_type not in DEVELOPMENT:
        raise ValueError("Invalid development type.")

    for tree in preserved_trees:
        if tree not in TREES:
            raise ValueError(f"Invalid tree ID: {tree}")

    for intervention in selected_interventions:
        if intervention not in INTERVENTIONS:
            raise ValueError(f"Invalid intervention ID: {intervention}")

    # BUDGET 

    total_cost = sum(INTERVENTIONS[item]["cost"] 
                     for item in selected_interventions )

    if total_cost > ADAPTATION_BUDGET:
        raise ValueError("Selected adaptations exceed the ₹10 lakh budget.")

    # DEVELOPMENT

    development = DEVELOPMENT[development_type]

    impervious_area = (BASE_IMPERVIOUS_AREA + development["added_impervious "])

    # Building redesign reduces impervious area.
    if "building_redesign" in selected_interventions:
        impervious_area -= INTERVENTIONS["building_redesign"]["impervious_reduction"]

    impervious_area = max(0, impervious_area)

    #TREES

    selected_trees = [
             TREES[tree]
             for tree in preserved_trees
    ]

    total_tree_shade = sum(
            tree["shade"]
            for tree in selected_trees
    )

    tree_interception = sum(
        tree["interception"]
        for tree in selected_trees
    )

    tree_infiltration = sum(
        tree["infiltration"]
        for tree in selected_trees
    )

    tree_heat_benefit = sum(
        tree["heat_benefit"]
        for tree in selected_trees
    )

    #HEAT

    impervious_ratio = impervious_area / SITE_AREA

    impervious_hear_effect = impervious_ratio * 20

    intervention_heat_reduction = sum(
        INTERVENTIONS[item]["heat_reduction"]
        for item in selected_interventions
    )

    heat_exposure = (
        BASE_HEAT_INDEX
        + impervious_hear_effect
        - tree_heat_benefit
        - intervention_heat_reduction
    )

    heat_exposure = max(0, min(100, heat_exposure))

    heat_resilience = 100 - heat_exposure

    # STROM WATER

    unmitigated_runoff = (
        RAINFALL_MM
        * RUNOFF_COEFFICIENT
        * impervious_area
    )

    intervention_water_capture = sum(
        INTERVENTIONS[item]["water_capture"]
        for item in selected_interventions
    )

    effective_runoff = max(
        0,
        unmitigated_runoff
        - tree_interception
        - tree_infiltration
        - intervention_water_capture,
    )

    runoff_pressure = (
        effective_runoff / unmitigated_runoff * 100
        if unmitigated_runoff > 0
        else 0
    )


    # Water resilience is measured against a 50% runoff-reduction
    # scenario target. This is a project assumption, not a
    # universal engineering standard.

    water_resilience = max(0, min(100, (1 - runoff_pressure / 100) * 200))

     # -------------------------
    # Shade
    # -------------------------

    effective_tree_shade = total_tree_shade * 0.86

    shade_bonus = sum(
        INTERVENTIONS[item].get("shade_bonus", 0)
        for item in selected_interventions
    )

    effective_shade = effective_tree_shade + shade_bonus

    shade_coverage = min(
        100,
        effective_shade / PEDESTRIAN_AREA * 100
    )

    # -------------------------
    # Adaptation effectiveness
    # -------------------------

    # For now this is a diagnostic value.
    # We will calibrate the final version after testing
    # several scenarios.
    adaptation_effectiveness = 0

    # -------------------------
    # Resilience Index
    # -------------------------

    # Resilience measures environmental resilience.
    # Development capacity is intentionally kept separate
    # because more development is not inherently more resilient.
    #
    # Scenario weights:
    #   Heat resilience   = 40%
    #   Water resilience  = 40%
    #   Shade coverage    = 20%
    #
    # These are scenario assumptions, not universal standards.


    resilience_index = (
        heat_resilience * 0.40
        + water_resilience * 0.40
        + shade_coverage * 0.20
        
    )

    return {
        "heat_exposure": round(heat_exposure, 2),
        "heat_resilience": round(heat_resilience, 2),
        "unmitigated_runoff": round(unmitigated_runoff, 2),
        "effective_runoff": round(effective_runoff, 2),
        "runoff_pressure": round(runoff_pressure, 2),
        "water_resilience": round(water_resilience, 2),
        "shade_coverage": round(shade_coverage, 2),
        "development_score": development["development_score"],
        "development_type": development["name"],
        "adaptation_cost": total_cost,
        "remaining_budget": ADAPTATION_BUDGET - total_cost,
        "resilience_index": round(resilience_index, 2),
    }