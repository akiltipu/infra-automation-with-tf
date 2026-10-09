"""Run: python3 -m unittest discover -s delivery -p 'test_*.py'"""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).parent
spec = importlib.util.spec_from_file_location("policy", ROOT / "check-policy.py")
policy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(policy)

class PolicyTests(unittest.TestCase):
    def test_review_decisions(self):
        for name, count in {"allowed": 0, "missing-owner": 1, "replace": 1, "delete": 1, "unknown-owner": 1}.items():
            with self.subTest(name=name):
                plan = json.loads((ROOT / "fixtures" / f"{name}.json").read_text())
                self.assertEqual(len(policy.violations(plan)), count)
