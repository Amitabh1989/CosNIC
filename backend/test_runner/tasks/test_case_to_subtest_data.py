import os
import json
import pprint

DEBUG = False

"""
I need this data just to create a Test case to number of subtest mapping.
Using this data, I will show the user what subtest to run.

I can also show what subtest passed and what failed.
I can also then give user the feature to select the subtest to run and then run the subtest.

So what i will do it now, run both the files. And 
"""


def find_test_cases_and_subtests(base_dir):
    """Traverse the directory to find test cases and their corresponding subtests."""
    test_case_data = {}
    print(f"Starting directory walk from: {base_dir}")

    for root, dirs, files in os.walk(base_dir):
        # Skip __pycache__ directories
        dirs[:] = [d for d in dirs if d != "__pycache__"]

        print(f"Scanning directory: {root}") if DEBUG else None
        for file in files:
            print(f"Checking file: {file}") if DEBUG else None
            # Look for files matching the pattern QA_Controller-<number>.py
            if file.startswith("QA_Controller_") and file.endswith(".py"):
                test_case_id = file.replace("QA_Controller_", "").replace(".py", "")
                test_case_path = os.path.join(root, file)
                (
                    print(f"Found test case: {test_case_id} at {test_case_path}")
                    if DEBUG
                    else None
                )

                # The corresponding subtest directory should have the same name as the file, but all lowercase
                subtest_dir_name = file.replace(".py", "").lower()
                subtest_dir_path = os.path.join(root, subtest_dir_name)
                (
                    print(f"Looking for subtest directory: {subtest_dir_path}")
                    if DEBUG
                    else None
                )

                if os.path.isdir(subtest_dir_path):
                    # List all subtest .py files in the subtest directory
                    subtests = []
                    for subtest_file in os.listdir(subtest_dir_path):
                        if subtest_file.endswith(".py") and not subtest_file.startswith(
                            "__"
                        ):
                            subtest_path = os.path.join(subtest_dir_path, subtest_file)
                            subtests.append(
                                {"name": subtest_file, "path": subtest_path}
                            )
                            (
                                print(
                                    f"Added subtest: {subtest_file} at {subtest_path}"
                                )
                                if DEBUG
                                else None
                            )

                    # Add the test case and its subtests to the data structure
                    test_case_data[test_case_id] = {
                        "test_case_path": test_case_path,
                        "subtests": subtests,
                    }
                else:
                    (
                        print(f"Subtest directory not found: {subtest_dir_path}")
                        if DEBUG
                        else None
                    )
                    pass

    return test_case_data


# Example usage:
# base_dir = "C:\\GitHub\\CosNIC\\backend\\venvs\\1\\alpha_21\\Lib\\site-packages\\controller\\cuw\\test_script\\linux\\adv_ethernet_functionality"
base_dir = "C:\\GitHub\\CosNIC\\backend\\venvs\\1\\alpha_21\\Lib\\site-packages\\controller\\cuw\\test_script"
data_structure = find_test_cases_and_subtests(base_dir)

# Print the resulting data structure
if DEBUG:
    pprint.pprint(data_structure)


with open("test_case_subtest_data.json", "w") as f:
    # Write the dictionary to the file
    json.dump(data_structure, f, indent=4)
