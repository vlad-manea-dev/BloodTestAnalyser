import json
from app.services.analyzer import find_reference_range

def test_fuzzy_matching():
    test_cases = [
        ("Cholesterol", True),          # Exact match
        ("cholesterol", True),          # Case match
        ("Chloesterol", True),          # Typo
        ("HDL Cholesterol", True),      # Alias or close enough
        ("Non-existent", False),        # No match
        ("Triglycerides", True),        # Plural/Alias
        ("Fasting Triglyceride", True)  # Longer name
    ]

    print("Testing Fuzzy Matching:")
    for name, should_match in test_cases:
        result = find_reference_range(name)
        matched = result is not None
        status = "PASS" if matched == should_match else "FAIL"
        print(f"  '{name}': {'Matched' if matched else 'Not Matched'} - {status}")

if __name__ == "__main__":
    test_fuzzy_matching()
