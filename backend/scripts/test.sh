#!/usr/bin/env bash

set -e
set -x

coverage run --source=app -m pytest -s app/tests/api/routes/test_meetings.py
coverage report --show-missing
coverage html --title "${@-coverage}"
