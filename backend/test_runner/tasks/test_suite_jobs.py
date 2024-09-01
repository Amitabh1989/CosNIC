# import os
# import ast
# import json


# # def extract_test_cases(file_path):
# # """
# # The function `extract_test_cases` aims to extract test cases from a Python file using Abstract Syntax Trees (AST).

# # :param file_path: The `file_path` parameter in the `extract_test_cases` function is a string that represents the path to a Python file (.py) from which you want to extract test cases using Abstract Syntax Trees (AST)
# # """
# #     """Extract test cases from a .py file using AST."""
# #     test_cases = {}
# #     with open(file_path, "r") as file:
# #         tree = ast.parse(file.read(), filename=file_path)

# #     for node in ast.walk(tree):
# #         if isinstance(node, ast.FunctionDef):
# #             for decorator in node.decorator_list:
# #                 if (
# #                     isinstance(decorator, ast.Call)
# #                     and isinstance(decorator.func, ast.Attribute)
# #                     and decorator.func.attr == "Test_Case_ID"
# #                 ):
# #                     test_case_id = decorator.args[0].s
# #                     test_cases[test_case_id] = {"path": file_path}
# #                     break
# #     return test_cases


# # def extract_test_cases(file_path):
# #     """Extract test cases from a .py file using AST."""
# #     test_cases = {}
# #     with open(file_path, "r", encoding="utf-8") as file:
# #         tree = ast.parse(file.read(), filename=file_path)

# #     for node in ast.walk(tree):
# #         if isinstance(node, ast.FunctionDef):
# #             for decorator in node.decorator_list:
# #                 if (
# #                     isinstance(decorator, ast.Call)
# #                     and isinstance(decorator.func, ast.Attribute)
# #                     and decorator.func.attr == "Test_Case_ID"
# #                 ):
# #                     test_case_id = decorator.args[0].s
# #                     test_cases[test_case_id] = {"path": file_path}
# #                     break
# #     return test_cases


# # def walk_directory(base_dir):
# #     """Walk through the directory structure and build the data structure."""
# #     test_suites = {}

# #     for root, dirs, files in os.walk(base_dir):
# #         suite_name = os.path.basename(root)
# #         test_suite_path = root

# #         # Filter Python files
# #         py_files = [f for f in files if f.endswith(".py")]

# #         if py_files:
# #             test_suite = {"path": test_suite_path, "test_cases": {}}

# #             for py_file in py_files:
# #                 py_file_path = os.path.join(root, py_file)
# #                 test_cases = extract_test_cases(py_file_path)
# #                 test_suite["test_cases"].update(test_cases)

# #             test_suites[suite_name] = test_suite

# #     return test_suites


# # Example usage:
# # base_dir = os.getcwd()
# base_dir = os.path.join(
#     "C:\\GitHub\\CosNIC\\backend\\venvs\\1\\alpha_21\\Lib\\site-packages\\controller\\cuw\\test_suite"
# )
# print(f"Base dir  : {base_dir}")
# data_structure = walk_directory(base_dir)

# # Print the resulting structure
# import pprint

# pprint.pprint(data_structure)
# with open("data.json", "w") as f:
#     # Write the dictionary to the file
#     json.dump(data_structure, f, indent=4)


import os
import re
import json
import pprint


# def extract_subtests(subtest_dir):
#     """Extract subtests from the given subtest directory."""
#     subtests = []
#     for subtest_file in os.listdir(subtest_dir):
#         if subtest_file.endswith(".py"):
#             subtest_path = os.path.join(subtest_dir, subtest_file)
#             subtests.append({"name": subtest_file, "path": subtest_path})
#     return subtests


# def extract_test_case_ids(file_path):
#     """Extract test case IDs from the given .py file."""
#     test_case_ids = []
#     try:
#         with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
#             content = file.read()
#             matches = re.findall(r'@pytest\.mark\.Test_Case_ID\("(\d+)"\)', content)
#             test_case_ids.extend(matches)
#     except Exception as e:
#         print(f"Error reading {file_path}: {e}")
#     return test_case_ids


# def walk_directory(base_dir):
#     """Walk through the directory and create two data structures."""
#     test_cases_data = {}  # Mapping of test case ID -> details
#     suites_data = {}  # Mapping of suite name -> details

#     for root, dirs, files in os.walk(base_dir):
#         # Skip __pycache__ directories
#         dirs[:] = [d for d in dirs if d != "__pycache__"]

#         print(f"Scanning directory: {root}")

#         # Suite name is derived from the root folder name
#         suite_name = os.path.basename(root)

#         for file in files:
#             if file.endswith(".py"):
#                 print(f"Checking file: {file}")
#                 file_path = os.path.join(root, file)
#                 test_case_ids = extract_test_case_ids(file_path)

#                 if test_case_ids:
#                     print(f"Found test cases: {test_case_ids}")
#                     subtest_dir = os.path.join(root, file.replace(".py", "").lower())

#                     if os.path.isdir(subtest_dir):
#                         print(f"Found subtest directory: {subtest_dir}")
#                         subtests = extract_subtests(subtest_dir)

#                         for test_case_id in test_case_ids:
#                             # Build the dictionary entry for this test case
#                             test_cases_data[test_case_id] = {
#                                 "path": file_path,
#                                 "subtests": subtests,
#                             }

#                             # If suite doesn't exist in suites_data, add it
#                             if suite_name not in suites_data:
#                                 suites_data[suite_name] = {
#                                     "path": root,
#                                     "test_cases": [],
#                                 }

#                             # Append this test case to the suite's list of test cases
#                             suites_data[suite_name]["test_cases"].append(
#                                 {
#                                     "test_case_id": test_case_id,
#                                     "path": file_path,
#                                     "subtests": subtests,
#                                 }
#                             )

#     return test_cases_data, suites_data


def extract_subtests(subtest_dir):
    """Extract subtests from the given subtest directory."""
    subtests = []
    print(f"Extracting subtests from: {subtest_dir}")
    if os.path.exists(subtest_dir):
        for subtest_file in os.listdir(subtest_dir):
            if subtest_file.endswith(".py"):
                subtest_path = os.path.join(subtest_dir, subtest_file)
                subtests.append({"name": subtest_file, "path": subtest_path})
    else:
        print(f"Subtest directory does not exist: {subtest_dir}")
    return subtests


def extract_test_case_ids(file_path):
    """Extract test case IDs from the given .py file."""
    test_case_ids = []
    print(f"Extracting test cases from: {file_path}")
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
            content = file.read()
            matches = re.findall(r'@pytest\.mark\.Test_Case_ID\("(\d+)"\)', content)
            test_case_ids.extend(matches)
            if matches:
                print(f"Found test case IDs in {file_path}: {matches}")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return test_case_ids


def walk_directory(base_dir):
    """Walk through the directory and create two data structures."""
    test_cases_data = {}  # Mapping of test case ID -> details
    suites_data = {}  # Mapping of suite name -> details

    for root, dirs, files in os.walk(base_dir):
        # Skip __pycache__ directories
        dirs[:] = [d for d in dirs if d != "__pycache__"]

        print(f"Scanning directory: {root}")

        # Suite name is derived from the root folder name
        suite_name = os.path.basename(root)
        print(f"Detected suite name: {suite_name}")

        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)
                print(f"Checking file: {file_path}")
                test_case_ids = extract_test_case_ids(file_path)

                if test_case_ids:
                    # Check if there is a subtest directory with the same name as the file (in lowercase)
                    subtest_dir_name = file.replace(".py", "").lower()
                    subtest_dir = os.path.join(root, subtest_dir_name)
                    subtests = extract_subtests(subtest_dir)

                    for test_case_id in test_case_ids:
                        # Build the dictionary entry for this test case
                        test_cases_data[test_case_id] = {
                            "path": file_path,
                            "subtests": subtests,
                        }

                        # If suite doesn't exist in suites_data, add it
                        if suite_name not in suites_data:
                            suites_data[suite_name] = {"path": root, "test_cases": []}

                        # Append this test case to the suite's list of test cases
                        suites_data[suite_name]["test_cases"].append(
                            {
                                "test_case_id": test_case_id,
                                "path": file_path,
                                "subtests": subtests,
                            }
                        )

    return test_cases_data, suites_data


# Example usage:
base_dir = "C:\\GitHub\\CosNIC\\backend\\venvs\\1\\alpha_21\\Lib\\site-packages\\controller\\cuw\\test_suite"
test_cases_data, suites_data = walk_directory(base_dir)

# Print the resulting data structures

print("Test Cases Data Structure:")
pprint.pprint(test_cases_data)
print("\nSuites Data Structure:")
pprint.pprint(suites_data)


with open("test_cases_data.json", "w") as f:
    # Write the dictionary to the file
    json.dump(test_cases_data, f, indent=4)


with open("suites_data.json", "w") as f:
    # Write the dictionary to the file
    json.dump(suites_data, f, indent=4)
