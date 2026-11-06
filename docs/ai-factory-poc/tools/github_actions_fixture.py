#!/usr/bin/env python3
"""Prepare disposable synthetic dispatch data. Dry-run is offline and is the default."""

import argparse
import json
import os
from pathlib import Path
import re
import ssl
import sys
from datetime import datetime, timezone
from urllib import error, parse, request
from uuid import uuid4


# Fixed location: the credentials file path is never taken from command-line input.
ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class FixtureError(Exception):
    """Safe error text only; never includes credentials or raw server responses."""


class NoRedirect(request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise FixtureError("Redirect refused; configure the final HTTPS API origin.")


def api_base(value):
    url = parse.urlsplit(value)
    if (url.scheme != "https" or not url.hostname or url.username or url.password
            or url.query or url.fragment or url.path.rstrip("/") != "/api"):
        raise FixtureError("API base must be an HTTPS origin followed by /api.")
    return value.rstrip("/")


def bearer_token(env_file):
    token = os.environ.get("BEARER_TOKEN", "")
    if not token and env_file.exists():
        for line in env_file.read_text().splitlines():
            key, separator, value = line.strip().partition("=")
            if separator and key.strip() == "BEARER_TOKEN":
                token = value.strip().strip("\"'")
                break
    if "\r" in token or "\n" in token:
        raise FixtureError("ReportPortal BEARER_TOKEN must not contain header line breaks.")
    token = re.sub(r"(?i)^Bearer +", "", token, count=1)
    if (not token or token.lower() in {"integrationparameters.token", "xxx", "token",
                                      "<token>", "<bearer_token>", "changeme"}
            or any(char.isspace() for char in token) or "<" in token or ">" in token):
        raise FixtureError("A real ReportPortal BEARER_TOKEN is required in environment or .env.")
    return token


class Client:
    def __init__(self, base, token, ca_file=None):
        self.base = api_base(base)
        self.token = token
        context = ssl.create_default_context(cafile=ca_file)
        self.opener = request.build_opener(NoRedirect(), request.HTTPSHandler(context=context))

    def call(self, method, path, payload=None, idempotency_key=None):
        headers = {"Authorization": f"Bearer {self.token}", "Accept": "application/json"}
        if payload is not None:
            headers["Content-Type"] = "application/json"
        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key
        req = request.Request(self.base + path, method=method, headers=headers,
                              data=None if payload is None else json.dumps(payload).encode())
        try:
            with self.opener.open(req, timeout=30) as response:
                result = json.load(response)
        except error.HTTPError as exc:
            raise FixtureError(f"API {method} failed with HTTP {exc.code}; no automatic retry.") from None
        except OSError:  # URLError, SSLError and TimeoutError are all OSError subclasses
            raise FixtureError(f"API {method} transport/TLS failed; no automatic retry.") from None
        except ValueError:  # includes UnicodeError and json.JSONDecodeError
            raise FixtureError(f"API {method} returned unreadable JSON; no automatic retry.") from None
        if not isinstance(result, dict):
            raise FixtureError("API returned an unexpected response shape.")
        return result


def positive_id(value):
    if type(value) is not int or value <= 0:
        raise FixtureError("API response did not contain a positive numeric identifier.")
    return value


def quality_scores(standard):
    criteria = standard.get("criteria")
    if not isinstance(criteria, list) or not criteria:
        raise FixtureError("Existing quality standard with valid criteria is required; nothing created.")
    scores = []
    for criterion in criteria:
        if not isinstance(criterion, dict):
            raise FixtureError("Quality standard criterion is invalid; nothing created.")
        identifier = positive_id(criterion.get("id"))
        maximum = criterion.get("maxPoints")
        if type(maximum) is not int or maximum < 0:
            raise FixtureError("Quality standard maximum is invalid; nothing created.")
        scores.append({"criterionId": identifier, "score": maximum * 72 // 100})
    if len({score["criterionId"] for score in scores}) != len(scores) or not any(
            criterion["maxPoints"] > 0 for criterion in criteria):
        raise FixtureError("Quality standard criteria are invalid; nothing created.")
    return scores


def case_payload(label):
    return {"name": label, "description": "Disposable synthetic dispatch fixture. No AI agent ran; "
            "criterion scores are controlled test data, not an evaluation.", "status": "DRAFT",
            "testFolder": {"name": label}, "manualScenario": {
                "manualScenarioType": "STEPS", "steps": [{
                    "instructions": "Inspect the dispatch probe identifiers.",
                    "expectedResult": "All three identifiers match the ReportPortal fixture."}]}}


def iteration_payload(label, display_id, repo, workflow, now):
    return {"name": label, "type": "TEST_CASE_GENERATION", "iteration": {
        "startedAt": now, "finishedAt": now, "stages": [{
            "stageKey": "upload", "name": "Upload", "sequence": 1,
            "status": "Passed", "statusCategory": "PASSED", "startedAt": now,
            "finishedAt": now, "message": "Synthetic dispatch fixture; no agent ran",
            "execution": {"executorType": "GITHUB_ACTIONS", "retryable": False,
                          "retryParameters": {"repo": repo, "workflowRef": workflow}},
            "sections": [{"key": "uploadReport", "title": "Synthetic upload report",
                          "role": "RESULT", "columns": [
                              {"key": "testCase", "label": "Test case"},
                              {"key": "result", "label": "Result"}],
                          "rows": [{"key": "synthetic-case", "cells": {
                              "testCase": {"value": display_id, "target": {
                                  "entityType": "TEST_CASE", "entityId": display_id}},
                              "result": "Passed"}}]}]}]}}


def is_passed_upload_stage_for(stage, target):
    # A legacy stage without a stageKey is accepted; a different key is not.
    return (stage.get("stageKey", "upload") == "upload"
            and stage.get("statusCategory") == "PASSED"
            and target in stage.get("relatedEntities", []))


def has_result_cell_for(stage, target):
    return any(
        isinstance(cell, dict) and cell.get("target") == target
        for section in stage.get("sections", []) if section.get("role") == "RESULT"
        for row in section.get("rows", [])
        for cell in row.get("cells", {}).values())


def verify_source(source, display_id):
    target = {"entityType": "TEST_CASE", "entityId": display_id}
    if not any(is_passed_upload_stage_for(stage, target) and has_result_cell_for(stage, target)
               for stage in source.get("stages", [])):
        raise FixtureError("Read-back did not confirm the passed source stage and case target.")


def verify_grade(metrics, scores):
    overall = metrics.get("overallScore")
    actual = metrics.get("criteria")
    if (type(overall) is not int or not 0 <= overall <= 100 or metrics.get("obsolete") is not False
            or not isinstance(actual, list) or len(actual) != len(scores)):
        raise FixtureError("Read-back did not confirm a current synthetic evaluation.")
    expected = {score["criterionId"]: score["score"] for score in scores}
    seen = set()
    for criterion in actual:
        if not isinstance(criterion, dict):
            raise FixtureError("Read-back evaluation criteria are invalid.")
        identifier = positive_id(criterion.get("criterionId"))
        score = criterion.get("score")
        if (identifier in seen or identifier not in expected or type(score) is not int
                or score != expected[identifier]):
            raise FixtureError("Read-back evaluation criteria differ from synthetic inputs.")
        seen.add(identifier)


def apply_fixture(client, project, repo, workflow, state):
    base = f"/v1/project/{project}"
    state["operation"] = "read_quality_standard"
    scores = quality_scores(client.call("GET", base + "/tms/quality-standard"))
    label = "R6-dispatch-probe-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ-") + uuid4().hex[:8]
    state["label"] = label
    state["operation"] = "create_case_and_folder"
    case = client.call("POST", base + "/tms/test-case", case_payload(label))
    state["test_case_id"] = positive_id(case.get("id"))
    folder = case.get("testFolder") or {}
    if folder.get("id") is not None:
        state["folder_id"] = positive_id(folder["id"])
    display_id = case.get("displayId")
    if not isinstance(display_id, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,255}", display_id):
        raise FixtureError("Created case has no valid server-generated display ID.")
    state["display_id"] = display_id
    case_path = base + f"/tms/test-case/{state['test_case_id']}"
    state["operation"] = "record_synthetic_generation"
    client.call("POST", case_path + "/generation", {"qualityScores": scores,
                "generation": {"tokensIn": 0, "tokensOut": 0, "costUsd": 0,
                               "model": "controlled-integration-fixture",
                               "skill": "controlled-integration-fixture"}})
    state["operation"] = "create_source_iteration"
    state["idempotency_key"] = str(uuid4())
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    source = client.call("POST", base + "/pipeline/iteration",
                         iteration_payload(label, display_id, repo, workflow, now),
                         idempotency_key=state["idempotency_key"])
    state["source_iteration_id"] = positive_id(source.get("id"))
    state["pipeline_id"] = positive_id(source.get("pipelineId"))
    if source.get("warnings"):
        raise FixtureError("Source report returned warnings; inspect through an authorized read surface.")
    state["operation"] = "verify_read_back"
    case = client.call("GET", case_path)
    if (case.get("id") != state["test_case_id"] or case.get("displayId") != display_id
            or case.get("origin") != "AI" or case.get("status") != "DRAFT"):
        raise FixtureError("Read-back did not confirm the synthetic AI Draft case.")
    state["default_version_id"] = positive_id(case.get("defaultVersionId"))
    verify_grade(case.get("metrics") or {}, scores)
    source = client.call("GET", base + f"/pipeline/iteration/{state['source_iteration_id']}")
    if source.get("id") != state["source_iteration_id"] or source.get("pipelineId") != state["pipeline_id"]:
        raise FixtureError("Source read-back identity did not match the created iteration.")
    verify_source(source, display_id)
    state["status"] = "FIXTURE_VERIFIED_DISPATCH_NOT_RUN"
    state["operation"] = "complete"


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--apply", action="store_true", help="Create disposable fixture after preflight")
    mode.add_argument("--dry-run", action="store_true", help="Offline plan only (default)")
    parser.add_argument("--api-base", default="https://tms.epmrpp.reportportal.io/api")
    parser.add_argument("--project", default="superadmin_personal")
    parser.add_argument("--repo", default="reportportal/service-ui")
    parser.add_argument("--workflow", default="fix-test-case.yml")
    parser.add_argument("--ca-file", help="Trusted CA bundle; normal TLS verification stays enabled")
    args = parser.parse_args(argv)
    state = {"status": "DRY_RUN", "operation": "offline_plan"}
    try:
        api_base(args.api_base)
        if (not re.fullmatch(r"[A-Za-z0-9_-]+", args.project)
                or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", args.repo)
                or not re.fullmatch(r"[A-Za-z0-9_.-]+\.ya?ml", args.workflow)):
            raise FixtureError("Project, repository or workflow name is invalid.")
        if args.apply:
            if args.project != "superadmin_personal":
                raise FixtureError("Apply is authorized only for superadmin_personal.")
            token = bearer_token(ENV_FILE)
            client = Client(args.api_base, token, args.ca_file)
            state["status"] = "INCOMPLETE"
            apply_fixture(client, args.project, args.repo, args.workflow, state)
        else:
            state["plan"] = ["GET quality standard", "POST disposable case with new folder",
                             "POST synthetic generation", "POST source iteration with Idempotency-Key",
                             "GET case and iteration to verify"]
        print(json.dumps(state, sort_keys=True))
        return 0
    except FixtureError as exc:
        state["error"] = str(exc)
    except (OSError, ValueError, TypeError, KeyError):
        state["error"] = "Local configuration or response shape is invalid; no automatic retry."
    state["status"] = "INCOMPLETE"
    print(json.dumps(state, sort_keys=True))
    return 1


if __name__ == "__main__":
    sys.exit(main())
