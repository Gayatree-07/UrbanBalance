import json
import sys
import subprocess
import tempfile
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = ROOT / "Frontend"

sys.path.insert(0, str(BACKEND_DIR))
from simulation import calculate_simulation


def invoke_local_lambda(metrics):
    event = {
        "scenario": f"{metrics['development_type']} development proposal",
        "heat_exposure": metrics["heat_exposure"],
        "runoff_pressure": metrics["runoff_pressure"],
        "shade_coverage": metrics["shade_coverage"],
        "water_resilience": metrics["water_resilience"],
    }

    event_path = None

    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".json",
            encoding="utf-8",
            delete=False,
            dir=ROOT,
        ) as event_file:
            json.dump(event, event_file)
            event_path = event_file.name

        
        completed = subprocess.run(
            [
                "cmd.exe",
                "/c",
                r"C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd",
                "local",
                "invoke",
                "ScenarioFunction",
                "--template-file",
                str(ROOT / "sam-backend" / "template.yaml"),
                "--event",
                event_path,
            ],
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            timeout=60,
        )

        

        if completed.returncode != 0:
            raise RuntimeError(
                f"SAM invocation failed: {completed.stderr[-1000:]}"
            )

        lambda_response = None

        for line in reversed(completed.stdout.splitlines()):
            try:
                candidate = json.loads(line)
            except json.JSONDecodeError:
                continue

            if isinstance(candidate, dict) and "statusCode" in candidate:
                lambda_response = candidate
                break

        if lambda_response is None:
            raise RuntimeError("Could not parse the Lambda response")

        if lambda_response["statusCode"] != 200:
            raise RuntimeError(lambda_response.get("body", "Lambda failed"))

        return json.loads(lambda_response["body"])

    finally:
        if event_path:
            Path(event_path).unlink(missing_ok=True)



class UrbanBalanceHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)

    def send_json(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/health":
            self.send_json(200, {
                "status": "ok",
                "service": "UrbanBalance API"
            })
            return

        if self.path.startswith("/api/"):
            self.send_json(404, {"error": "API endpoint not found"})
            return

        super().do_GET()

    def do_POST(self):
        if self.path not in ("/api/simulate", "/api/serverless-summary"):
            self.send_json(404, {"error": "API endpoint not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 100000:
                self.send_json(400, {"error": "Invalid request body"})
                return

            payload = json.loads(self.rfile.read(length).decode("utf-8"))

            if not isinstance(payload, dict):
                self.send_json(400, {"error": "Expected a JSON object"})
                return

            trees = payload.get("preserved_trees", [])
            development = payload.get("development", "compact")
            interventions = payload.get("interventions", [])

            if not isinstance(trees, list) or not isinstance(interventions, list):
                self.send_json(400, {
                    "error": "Trees and interventions must be lists"
                })
                return

            
            result = calculate_simulation(trees, development, interventions)

            if self.path == "/api/serverless-summary":
                summary = invoke_local_lambda(result)
                self.send_json(200, {
                    "simulation": result,
                    "serverless_summary": summary
            })
            else:
                self.send_json(200, result)


        except (json.JSONDecodeError, UnicodeDecodeError):
            self.send_json(400, {"error": "Invalid JSON"})
        except ValueError as exc:
            self.send_json(400, {"error": str(exc)})
        
        except Exception as exc:
            import traceback
            self.log_error("Unexpected error: %s", exc)
            traceback.print_exc()
            self.send_json(500, {
            "error": "Simulation failed. Check the server terminal."
            })



if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8000), UrbanBalanceHandler)
    print("UrbanBalance running at http://127.0.0.1:8000")
    print("Health check: http://127.0.0.1:8000/api/health")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping UrbanBalance server...")
    finally:
        server.server_close()
