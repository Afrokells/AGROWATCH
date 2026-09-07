"""
AgroWatch User Contact & Credential Verification Engine
Enforces strict anti-dummy validation for Phone Numbers, Full Names, Passwords, and Locations.
"""

import re
from rest_framework.exceptions import ValidationError

# Recognized Ghana Telecom Network Prefixes
GHANA_NETWORK_PREFIXES = {
    # MTN Ghana
    "24", "54", "55", "59", "25",
    # Telecel (formerly Vodafone Ghana)
    "20", "50",
    # AT (formerly AirtelTigo Ghana)
    "27", "57", "26", "56",
    # Legacy / Other
    "28", "23"
}

# Blacklisted dummy names (case-insensitive)
DUMMY_NAMES_BLACKLIST = {
    "test", "dummy", "admin", "administrator", "user", "guest", "null", "none",
    "fake", "asdf", "qwerty", "farmer", "buyer", "demo", "sample", "nobody",
    "unknown", "testuser", "myname", "firstname", "lastname", "abc", "xyz",
    "agro", "agrowatch", "john doe", "jane doe"
}

# Blacklisted trivial dummy passwords
DUMMY_PASSWORDS_BLACKLIST = {
    "password", "password123", "12345678", "123456789", "1234567890",
    "admin123", "agrowatch", "agrowatch123", "qwerty123", "pass1234",
    "letmein1", "welcome1", "iloveyou", "00000000", "11111111", "12341234"
}


def normalize_and_validate_phone(phone_str: str) -> str:
    """
    Validates that a phone number is a legitimate contact number:
    - Normalizes local Ghana numbers (e.g. '0241234567' -> '+233241234567').
    - Rejects repetitive digits ('0000000000', '1111111111').
    - Rejects sequential numbers ('1234567890', '0123456789').
    - Verifies valid network operator prefixes for Ghanaian numbers.
    - Validates standard E.164 international numbers (10-15 digits).
    """
    if not phone_str or not isinstance(phone_str, str):
        raise ValidationError("A valid phone number is required.")

    # Clean whitespace, dashes, parentheses
    cleaned = re.sub(r"[\s\-\(\)]", "", phone_str.strip())

    # Check for basic digit structure
    if not re.match(r"^\+?[0-9]{9,15}$", cleaned):
        raise ValidationError(
            "Invalid phone number format. Please provide a valid mobile number (e.g. 024XXXXXXX or +233XXXXXXXXX)."
        )

    digits_only = re.sub(r"\D", "", cleaned)

    # 1. Reject identical repeated digits (e.g. 0000000000, 1111111111)
    if len(set(digits_only)) <= 2:
        raise ValidationError(
            "Please provide a legitimate phone number. Repeated dummy numbers are not allowed."
        )

    # 2. Reject ascending/descending sequences (e.g. 0123456789, 1234567890, 9876543210)
    ascending_seq = "0123456789012345"
    descending_seq = "9876543210987654"
    if digits_only in ascending_seq or digits_only in descending_seq:
        raise ValidationError(
            "Sequential dummy numbers (e.g. 1234567890) are not permitted. Please use your real phone number."
        )

    # 3. Ghana Mobile Number Formatting & Telecom Network Verification
    if cleaned.startswith("0") and len(digits_only) == 10:
        # Local format (e.g. 0241234567)
        net_prefix = digits_only[1:3]
        if net_prefix not in GHANA_NETWORK_PREFIXES:
            raise ValidationError(
                f"'0{net_prefix}' is not a recognized mobile network prefix in Ghana. "
                f"Valid prefixes include MTN (024, 054, 055, 059, 025), Telecel (020, 050), and AT (027, 057, 026, 056)."
            )
        return f"+233{digits_only[1:]}"

    elif cleaned.startswith("+233") or cleaned.startswith("233"):
        # International format for Ghana
        gh_digits = digits_only[3:] if cleaned.startswith("+233") else digits_only[3:]
        if len(gh_digits) != 9:
            raise ValidationError(
                "Ghanaian mobile numbers must contain exactly 9 digits after +233 (e.g. +233 24 123 4567)."
            )
        net_prefix = gh_digits[:2]
        if net_prefix not in GHANA_NETWORK_PREFIXES:
            raise ValidationError(
                f"'{net_prefix}' is not a recognized mobile network prefix in Ghana. "
                f"Please ensure you enter a legitimate MTN, Telecel, or AT mobile number."
            )
        return f"+233{gh_digits}"

    # Standard international number (outside Ghana)
    if len(digits_only) < 10 or len(digits_only) > 15:
        raise ValidationError("International phone numbers must be between 10 and 15 digits in length.")

    return cleaned if cleaned.startswith("+") else f"+{cleaned}"


def validate_legit_full_name(name_str: str) -> str:
    """
    Validates that the provided name is a legitimate full human name:
    - Must contain at least two words (First and Last name).
    - Each word must be at least 2 characters.
    - No digits or arbitrary symbols (letters, spaces, hyphens, and apostrophes only).
    - Rejects blacklisted dummy placeholders.
    """
    if not name_str or not isinstance(name_str, str):
        raise ValidationError("Full name is required.")

    cleaned = " ".join(name_str.strip().split())

    # Check for non-alphabetical characters
    if not re.match(r"^[A-Za-zÀ-ÿ\s\-\']+$", cleaned):
        raise ValidationError("Full name must only contain letters, hyphens, or apostrophes (no numbers or symbols).")

    words = cleaned.split()
    if len(words) < 2:
        raise ValidationError("Please provide both your First Name and Last Name (e.g. Kwame Mensah).")

    for w in words:
        if len(w) < 2:
            raise ValidationError(f"Name segment '{w}' is too short. Please provide your complete real name.")

    # Check against dummy blacklist
    lower_full = cleaned.lower()
    if lower_full in DUMMY_NAMES_BLACKLIST:
        raise ValidationError(f"'{cleaned}' is a placeholder. Please register with your real legal full name.")

    for w in words:
        if w.lower() in DUMMY_NAMES_BLACKLIST:
            raise ValidationError(f"Please use your legitimate name rather than placeholder words like '{w}'.")

    return cleaned.title()


def validate_legit_password(password_str: str, phone_number: str = "", full_name: str = "") -> None:
    """
    Enforces strong, non-dummy password credentials:
    - Minimum 8 characters.
    - Must include at least 1 letter and 1 numeric digit.
    - Cannot match blacklisted trivial passwords.
    - Cannot match user's phone number or name.
    """
    if not password_str or not isinstance(password_str, str):
        raise ValidationError("A password is required.")

    if len(password_str) < 8:
        raise ValidationError("Password must be at least 8 characters long.")

    if not re.search(r"[A-Za-z]", password_str):
        raise ValidationError("Password must contain at least one letter (A-Z or a-z).")

    if not re.search(r"\d", password_str):
        raise ValidationError("Password must contain at least one numeric digit (0-9).")

    low_pass = password_str.lower()
    if low_pass in DUMMY_PASSWORDS_BLACKLIST:
        raise ValidationError("This password is too common or easily guessed. Please create a more secure password.")

    if phone_number and phone_number.replace("+", "") in password_str:
        raise ValidationError("For security, your password cannot contain your phone number.")

    if full_name:
        for part in full_name.lower().split():
            if len(part) >= 3 and part in low_pass:
                raise ValidationError("For security, your password cannot contain your name.")

