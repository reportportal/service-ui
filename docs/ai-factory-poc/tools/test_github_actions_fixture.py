"""Offline safety and contract checks; no credentials or network are required."""

import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location(
    "fixture", Path(__file__).with_name("github_actions_fixture.py"))
fixture = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(fixture)


class FixtureTest(unittest.TestCase):
    def test_dry_run_is_offline_and_does_not_load_credentials(self):
        with patch.object(fixture, "bearer_token", side_effect=AssertionError), \
                patch.object(fixture, "Client", side_effect=AssertionError), \
                contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(fixture.main([]), 0)
        self.assertEqual(json.loads(output.getvalue())["status"], "DRY_RUN")

    def test_tokens_are_private_and_placeholders_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            env_file = Path(directory) / ".env"
            for token in ("integrationParameters.token", "<token>", "XXX", ""):
                env_file.write_text(f"BEARER_TOKEN='{token}'\n")
                with patch.dict(os.environ, {}, clear=True), self.assertRaises(fixture.FixtureError):
                    fixture.bearer_token(env_file)
            env_file.write_text("BEARER_TOKEN='local-test-credential'\n")
            with patch.dict(os.environ, {}, clear=True):
                self.assertEqual(fixture.bearer_token(env_file), "local-test-credential")
            with patch.dict(os.environ, {"BEARER_TOKEN": "environment-test-credential"}):
                self.assertEqual(fixture.bearer_token(env_file), "environment-test-credential")

    def test_apply_rejects_other_projects_before_credentials_or_network(self):
        with patch.object(fixture, "bearer_token", side_effect=AssertionError), \
                patch.object(fixture, "Client", side_effect=AssertionError), \
                contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(fixture.main(["--apply", "--project", "other_project"]), 1)
        self.assertIn("authorized only", json.loads(output.getvalue())["error"])

    def test_raw_and_single_bearer_prefix_create_the_same_authorization_header(self):
        for value in ("test-credential", "Bearer test-credential", "bEaReR   test-credential"):
            with patch.dict(os.environ, {"BEARER_TOKEN": value}):
                token = fixture.bearer_token(Path("not-read.env"))
            client = fixture.Client("https://rp.example/api", token)
            response = unittest.mock.MagicMock()
            response.__enter__.return_value.read.return_value = b"{}"
            with patch.object(client.opener, "open", return_value=response) as call:
                client.call("GET", "/v1/project/superadmin_personal/tms/quality-standard")
            self.assertEqual(call.call_args.args[0].get_header("Authorization"), "Bearer test-credential")
        for value in ("Bearer ", "Bearer <token>", "Bearer integrationParameters.token",
                      "Bearer Bearer test-credential", "Bearer\ttest-credential", "Bearer x y",
                      "Bearer test-credential\n", "Bearer test-credential\rInjected: value"):
            with patch.dict(os.environ, {"BEARER_TOKEN": value}), self.assertRaises(fixture.FixtureError):
                fixture.bearer_token(Path("not-read.env"))

    def test_transport_requires_https_without_embedded_credentials(self):
        for base in ("http://rp.example/api", "https://user:pass@rp.example/api",
                     "https://rp.example/api?token=secret", "https://rp.example/api#fragment",
                     "https://rp.example/other"):
            with self.assertRaises(fixture.FixtureError):
                fixture.api_base(base)
        self.assertEqual(fixture.api_base("https://rp.example/api/"), "https://rp.example/api")
        with self.assertRaises(fixture.FixtureError):
            fixture.NoRedirect().redirect_request(None, None, 302, "", {}, "http://other.example")
        with patch.object(fixture.ssl, "create_default_context") as context:
            fixture.Client("https://rp.example/api", "test-credential", "company-ca.pem")
        context.assert_called_once_with(cafile="company-ca.pem")

    def test_invalid_quality_standard_stops_before_post(self):
        for standard in ({}, {"criteria": []}, {"criteria": [{"id": True, "maxPoints": 10}]},
                         {"criteria": [{"id": 1, "maxPoints": -1}]},
                         {"criteria": [{"id": 1, "maxPoints": 0}]}):
            client = unittest.mock.Mock()
            client.call.return_value = standard
            with self.assertRaises(fixture.FixtureError):
                fixture.apply_fixture(client, "superadmin_personal", "org/repo", "fix.yml", {})
            self.assertEqual(client.call.call_count, 1)
            self.assertEqual(client.call.call_args.args[0], "GET")

    def test_payload_uses_actual_criterion_and_display_ids(self):
        self.assertEqual(fixture.quality_scores({"criteria": [
            {"id": 71, "maxPoints": 15}, {"id": 92, "maxPoints": 20}]}), [
                {"criterionId": 71, "score": 10}, {"criterionId": 92, "score": 14}])
        payload = fixture.iteration_payload("probe", "TC123", "org/repo", "fix.yml", "now")
        upload = payload["iteration"]["stages"][0]
        self.assertEqual(upload["stageKey"], "upload")
        self.assertEqual(upload["execution"]["executorType"], "GITHUB_ACTIONS")
        self.assertNotIn("externalRunId", upload["execution"])
        target = upload["sections"][0]["rows"][0]["cells"]["testCase"]["target"]
        self.assertEqual(target, {"entityType": "TEST_CASE", "entityId": "TC123"})

    def test_partial_failure_retains_ids_and_never_retries(self):
        client = unittest.mock.Mock()
        client.call.side_effect = [
            {"criteria": [{"id": 71, "maxPoints": 100}]},
            {"id": 12, "displayId": "TC13", "testFolder": {"id": 14}},
            fixture.FixtureError("API POST failed with HTTP 500; no automatic retry.")]
        state = {}
        with self.assertRaises(fixture.FixtureError):
            fixture.apply_fixture(client, "superadmin_personal", "org/repo", "fix.yml", state)
        self.assertEqual(client.call.call_count, 3)
        self.assertEqual(state["test_case_id"], 12)
        self.assertEqual(state["folder_id"], 14)
        self.assertEqual(state["operation"], "record_synthetic_generation")
        self.assertNotIn("source_iteration_id", state)

    def test_success_reads_back_ai_and_source_target(self):
        source = fixture.iteration_payload("probe", "TC13", "org/repo", "fix.yml", "now")["iteration"]
        source["stages"][0].pop("execution")
        source["stages"][0]["relatedEntities"] = [{"entityType": "TEST_CASE", "entityId": "TC13"}]
        source.update({"id": 22, "pipelineId": 25})
        client = unittest.mock.Mock()
        client.call.side_effect = [
            {"criteria": [{"id": 71, "maxPoints": 100}]},
            {"id": 12, "displayId": "TC13", "testFolder": {"id": 14}}, {}, source,
            {"id": 12, "displayId": "TC13", "origin": "AI", "status": "DRAFT",
             "defaultVersionId": 19, "metrics": {"overallScore": 72, "obsolete": False,
                "criteria": [{"criterionId": 71, "score": 72}]}}, source]
        state = {}
        fixture.apply_fixture(client, "superadmin_personal", "org/repo", "fix.yml", state)
        self.assertEqual(state["status"], "FIXTURE_VERIFIED_DISPATCH_NOT_RUN")
        self.assertEqual(state["source_iteration_id"], 22)
        self.assertEqual(state["pipeline_id"], 25)
        self.assertEqual(client.call.call_count, 6)
        self.assertEqual(client.call.call_args_list[3].kwargs["idempotency_key"], state["idempotency_key"])
        with self.assertRaises(fixture.FixtureError):
            fixture.verify_source(source, "TC99")
        source["stages"][0].pop("relatedEntities")
        with self.assertRaises(fixture.FixtureError):
            fixture.verify_source(source, "TC13")

    def test_evaluation_uses_criteria_for_non_100_rubric_and_rejects_stale_grade(self):
        scores = [{"criterionId": 71, "score": 10}, {"criterionId": 92, "score": 14}]
        metrics = {"overallScore": 69, "obsolete": False, "criteria": scores}
        fixture.verify_grade(metrics, scores)
        for invalid in ({}, {**metrics, "obsolete": True}, {**metrics, "criteria": []},
                        {**metrics, "criteria": [{"criterionId": 71, "score": 11}, scores[1]]},
                        {**metrics, "overallScore": True}):
            with self.assertRaises(fixture.FixtureError):
                fixture.verify_grade(invalid, scores)

    def test_source_linkage_supports_legacy_missing_key_but_rejects_wrong_key(self):
        source = fixture.iteration_payload("probe", "TC13", "org/repo", "fix.yml", "now")["iteration"]
        stage = source["stages"][0]
        stage.pop("stageKey")
        stage["name"] = "Arbitrary label"
        stage["sequence"] = 99
        stage["relatedEntities"] = [{"entityType": "TEST_CASE", "entityId": "TC13"}]
        fixture.verify_source(source, "TC13")
        stage["stageKey"] = "grade"
        with self.assertRaises(fixture.FixtureError):
            fixture.verify_source(source, "TC13")
        stage.pop("stageKey")
        stage["sections"][0]["rows"][0]["cells"]["testCase"].pop("target")
        with self.assertRaises(fixture.FixtureError):
            fixture.verify_source(source, "TC13")

    def test_iteration_warning_retains_known_ids_and_stops_before_reads(self):
        client = unittest.mock.Mock()
        client.call.side_effect = [
            {"criteria": [{"id": 71, "maxPoints": 100}]},
            {"id": 12, "displayId": "TC13", "testFolder": {"id": 14}}, {},
            {"id": 22, "pipelineId": 25, "warnings": [{"message": "not logged"}]}]
        state = {}
        with self.assertRaises(fixture.FixtureError):
            fixture.apply_fixture(client, "superadmin_personal", "org/repo", "fix.yml", state)
        self.assertEqual(state["source_iteration_id"], 22)
        self.assertEqual(state["pipeline_id"], 25)
        self.assertEqual(client.call.call_count, 4)


if __name__ == "__main__":
    unittest.main()
