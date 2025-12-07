import os
import sys


# Ensure project root is on sys.path so "backend" and other top-level
# packages are importable when running `pytest` from the repo root.
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
