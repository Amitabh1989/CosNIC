import os
import re
import json
import pprint


DEBUG = False


def extract_subtests(subtest_dir):
    """Extract subtests from the given subtest directory."""
    subtests = []
    if os.path.exists(subtest_dir):
        for subtest_file in os.listdir(subtest_dir):
            if subtest_file.endswith(".py"):
                subtest_path = os.path.join(subtest_dir, subtest_file)
                subtests.append({"name": subtest_file, "path": subtest_path})
    return subtests


def extract_test_case_ids(file_path):
    """Extract test case IDs from the given .py file."""
    test_case_ids = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
            content = file.read()
            matches = re.findall(r'@pytest\.mark\.Test_Case_ID\("(\d+)"\)', content)
            test_case_ids.extend(matches)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return test_case_ids


def walk_directory(base_dir):
    """Walk through the directory and create a data structure with test suites."""
    test_suites_data = {}

    for root, dirs, files in os.walk(base_dir):
        # Skip __pycache__ directories
        dirs[:] = [d for d in dirs if d != "__pycache__"]

        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)
                suite_name = file.replace(".py", "")

                # Extract test case IDs
                test_case_ids = extract_test_case_ids(file_path)

                # Check if there is a subtest directory with the same name as the file (in lowercase)
                subtest_dir_name = suite_name.lower()
                subtest_dir = os.path.join(root, subtest_dir_name)
                subtests = extract_subtests(subtest_dir)

                # Build the data structure for this suite
                if suite_name not in test_suites_data:
                    test_suites_data[suite_name] = {"path": root, "test_cases": []}

                for test_case_id in test_case_ids:
                    test_suites_data[suite_name]["test_cases"].append(
                        {
                            "test_case_id": test_case_id,
                            "path": file_path,
                            "subtests": subtests,
                        }
                    )

    return test_suites_data


# Example usage:
base_dir = "C:\\GitHub\\CosNIC\\backend\\venvs\\1\\alpha_21\\Lib\\site-packages\\controller\\cuw\\test_suite"

test_suites_data = walk_directory(base_dir)

# Print the resulting data structure

if DEBUG:
    print("Test Suites Data Structure:")
    pprint.pprint(test_suites_data)


with open("test_suites_to_test_case_data.py.json", "w") as f:
    # Write the dictionary to the file
    json.dump(test_suites_data, f, indent=4)
