import json
import math

def lambda_handler(event, context):
    required = [
        "heat_exposure",
        "runoff_pressure",
        "shade_coverage",
        "water_resilience"
    ]

    missing = [key for key in required if key not in event]
    if missing:
        return {
            "statusCode": 400,
            "body": json.dumps({
                "error": "Missing metrics",
                "fields": missing
            })
        }

    metrics = {}
    for key in required:
        try:
            value = float(event[key])
        except (TypeError, ValueError):
            return {
                "statusCode": 400,
                "body": json.dumps({"error": f"Invalid metric: {key}"})
            }

        if not math.isfinite(value):
            return {
                "statusCode": 400,
                "body": json.dumps({"error": f"Metric must be finite: {key}"})
            }

        metrics[key] = value

    return {
        "statusCode": 200,
        "body": json.dumps({
            "project": "UrbanBalance",
            "scenario": event.get("scenario", "Environmental scenario"),
            "metrics": metrics,
            "interpretation": (
                "Lower heat exposure and runoff pressure are preferable. "
                "Higher shade coverage and water resilience are preferable. "
                "These are model outputs, not field measurements."
            )
        })
    }
