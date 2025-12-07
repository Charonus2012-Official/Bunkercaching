import os
from datetime import timedelta
from jose import jwt

from backend.tokens import create_access_token, SECRET_KEY, ALGORITHM


def test_create_access_token_without_exp_when_remember_true():
    token = create_access_token({"sub": "tester"}, remember=True)
    payload = jwt.get_unverified_claims(token)
    # exp should not be present when remember=True
    assert "exp" not in payload
    assert payload.get("sub") == "tester"


def test_create_access_token_with_exp_default():
    token = create_access_token({"sub": "tester2"})
    payload = jwt.get_unverified_claims(token)
    assert payload.get("sub") == "tester2"
    # exp should be present when remember is False
    assert "exp" in payload
