#!/usr/bin/env python3
"""
Repository hygiene and non-negotiables verification script.
Enforces:
1. Zero em dash characters (Unicode U+2014) across all source code, docs, and markup.
2. No hardcoded secret API keys (e.g. AIzaSy...).
"""

import os
import sys
import re

IGNORED_DIRS = {
    ".git",
    "node_modules",
    ".test_venv",
    ".venv",
    "dist",
    "build",
    "__pycache__",
    ".pytest_cache",
    "storage",
}

CHECKED_EXTENSIONS = (
    ".py",
    ".js",
    ".jsx",
    ".html",
    ".css",
    ".md",
    ".json",
    ".yml",
    ".yaml",
    ".sh",
)

EM_DASH = "\u2014"
API_KEY_REGEX = re.compile(r"AIzaSy[A-Za-z0-9_-]{33}")


def scan_repository():
    violations = []

    for root, dirs, files in os.walk("."):
        # Prune ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not d.startswith(".")]

        for fname in files:
            if not fname.endswith(CHECKED_EXTENSIONS):
                continue

            fpath = os.path.join(root, fname)

            try:
                with open(fpath, "r", encoding="utf-8") as fh:
                    for line_num, line in enumerate(fh, 1):
                        if EM_DASH in line:
                            violations.append(
                                f"[EM DASH] {fpath}:{line_num}: Contains forbidden em dash (U+2014)"
                            )

                        # Check for accidental hardcoded Google API keys
                        if API_KEY_REGEX.search(line) and not fpath.endswith("test_upload_validation.py"):
                            violations.append(
                                f"[SECRET] {fpath}:{line_num}: Potential hardcoded Gemini API key detected"
                            )
            except UnicodeDecodeError:
                continue
            except Exception as e:
                print(f"Warning: Failed to read {fpath}: {e}")

    return violations


def main():
    print("Running repository hygiene verification...")
    violations = scan_repository()

    if violations:
        print(f"\nHygiene check failed with {len(violations)} violation(s):")
        for v in violations:
            print(f"  - {v}")
        sys.exit(1)

    print("Repository hygiene verification PASSED. Zero violations found.")
    sys.exit(0)


if __name__ == "__main__":
    main()
