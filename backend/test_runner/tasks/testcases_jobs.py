# import argparse
# import json
# import os
# import sys

# import django
# from django.core.exceptions import ObjectDoesNotExist
# from django.core.management.base import BaseCommand
# from test_runner.models import SubTests, TestCase
# DEBUG: bool = False


# class Command(BaseCommand):
#     """
#     Django management command to create or update TestCase and SubTests records from JSON input.

#     This command can process a JSON file, a JSON string, or fetch data from the database
#     to update or create entries in the TestCase and SubTests models.
#     """

#     help = "Create or update TestCase and SubTests records from JSON input"

#     def add_arguments(self, parser):
#         """
#         Add command-line arguments to the parser.

#         Arguments:
#         --json-file: Path to the JSON file containing test case data.
#         --json-data: JSON string input directly.
#         --from-db: Flag to fetch JSON data from the database.
#         """
#         parser.add_argument(
#             "--json-file",
#             type=str,
#             help="Path to the JSON file containing test case data",
#         )
#         parser.add_argument("--json-data", type=str, help="JSON string input directly")
#         parser.add_argument(
#             "--from-db", action="store_true", help="Fetch JSON data from the database"
#         )

#     def handle(self, *args, **options):
#         """
#         Main method to handle the command logic.

#         It processes the input options, reads the JSON data, and processes each test case and its subtests.
#         """
#         json_data = None
#         if DEBUG:
#             self.stdout.write(self.style.SUCCESS("Options: ", options))

#         try:
#             with open(options["json_file"], "r") as f:
#                 data = json.load(f)

#             self.stdout.write(self.style.SUCCESS("The JSON file is valid."))
#         except json.JSONDecodeError as e:
#             self.stdout.write(self.style.SUCCESS(f"Invalid JSON file: {e}"))
#             return

#         for tcid, details in data.items():
#             test_case_path = details.get("test_case_path", "")
#             self.stdout.write(self.style.SUCCESS(f"Test Case Path: {test_case_path}"))
#             relative_test_case_path = test_case_path.replace("\\", "/").split(
#                 "site-packages"
#             )[-1]
#             if DEBUG:
#                 self.stdout.write(
#                     self.style.SUCCESS(
#                         f"Relative Test Case Path: {relative_test_case_path}"
#                     )
#                 )

#             subtests = details.get("subtests", [])
#             feature = ""
#             sub_feature = ""

#             # Calculate everything with the relative path now.
#             split_realtive_test_case_path = relative_test_case_path.split("/")
#             split_realtive_test_case_path = [
#                 x for x in split_realtive_test_case_path if x.strip(" ")
#             ]

#             # Extract OS, suite name, and determine feature or subfeature
#             applicable_os = split_realtive_test_case_path[3]
#             suite_name = split_realtive_test_case_path[4]

#             if DEBUG:
#                 self.stdout.write(
#                     self.style.SUCCESS(
#                         f"Split Test Case Relative Path: {split_realtive_test_case_path}"
#                     )
#                 )

#             # Determine the test case title based on path structure
#             if split_realtive_test_case_path[5].startswith("QA_Controller"):
#                 test_case_title = split_realtive_test_case_path[-1].replace(".py", "")

#             # Handle subtest case
#             elif split_realtive_test_case_path[5].startswith("qa_controller"):
#                 if DEBUG:
#                     self.stdout.write(self.style.SUCCESS(f"Subtest spotted"))
#                 feature = ""
#                 sub_feature = ""

#             else:
#                 # Handle subfeature if present
#                 if len(split_realtive_test_case_path) == 7:
#                     test_case_title = split_realtive_test_case_path[6]
#                     feature = split_realtive_test_case_path[5]
#                     sub_feature = ""

#                 if len(split_realtive_test_case_path) == 8:
#                     test_case_title = split_realtive_test_case_path[7]
#                     sub_feature = split_realtive_test_case_path[6]
#                     feature = split_realtive_test_case_path[5]

#             test_case_title_without_extension = test_case_title.replace(".py", "")

#             # Output the results for validation
#             self.stdout.write(
#                 self.style.SUCCESS(
#                     f"Test Case Relative Path: {relative_test_case_path}\n"
#                     f"Split Test Case Relative Path: {split_realtive_test_case_path}\n"
#                     f"Test Case Title: {test_case_title_without_extension}\n"
#                     f"Test Case Path: {test_case_path}\n"
#                     f"Applicable OS: {applicable_os}\n"
#                     f"Suite Name: {suite_name}\n"
#                     f"Feature Name: {feature}\n"
#                     f"Subfeature: {sub_feature}\n"
#                 )
#             )

#             # Uncomment this section to update/create the TestCase and SubTests models
#             # test_case, created = TestCase.objects.update_or_create(
#             #     tcid=tcid,
#             #     defaults={
#             #         "title": test_case_title_without_extension,
#             #         "path": test_case_path,
#             #         "suite_name": suite_name,
#             #         "applicable_os": applicable_os,
#             #         "feature": feature,
#             #         "sub_feature": sub_feature,
#             #         "category": "functional",
#             #     },
#             # )

#             for subtest in subtests:
#                 self.stdout.write(self.style.SUCCESS(f"Subtest: {subtest}"))
#                 # Uncomment this section to update/create SubTests models
#                 realtive_path = (
#                     subtest["path"].replace("\\", "/").split("site-packages")[-1]
#                 )
#                 self.stdout.write(self.style.SUCCESS(f"Relative Path: {realtive_path}"))
#                 # SubTests.objects.update_or_create(
#                 #     test_case=test_case,
#                 #     name=subtest["name"],
#                 #     defaults={"path": subtest["path"]},
#                 # )

#         self.stdout.write(
#             self.style.SUCCESS("Successfully updated test cases and subtests.")
#         )


# if __name__ == "__main__":
#     parser = argparse.ArgumentParser(description="Process test cases and subtests.")
#     parser.add_argument("--json-file", type=str, help="Path to the JSON file")
#     parser.add_argument("--json-data", type=str, help="JSON string input directly")
#     parser.add_argument(
#         "--from-db", action="store_true", help="Fetch JSON data from the database"
#     )

#     args = parser.parse_args()
#     command = Command()

#     # Mocking options dict
#     options = {
#         "json_file": args.json_file,
#         "json_data": args.json_data,
#         "from_db": args.from_db,
#     }

#     command.handle(**options)


# backend/test_runner/tasks.py
import json
import os
from datetime import datetime

from celery import shared_task
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from test_runner.models import SubTests, TestCase


@shared_task
def update_testcase_subtests(json_file=None, json_data=None, from_db=False):
    """
    Process test cases and subtests from JSON file or data.

    Args:
        json_file (str): Path to the JSON file containing test case data.
        json_data (str): JSON string input directly.
        from_db (bool): Flag to fetch JSON data from the database.
    """
    DEBUG = False
    if DEBUG:
        print(
            f"Options: json_file={json_file}, json_data={json_data}, from_db={from_db}"
        )

    # Fetch data from the database if the from_db flag is set
    if from_db:
        # Your logic to fetch data from the database
        pass

    # Process JSON file
    if not json_file:
        json_file = r"C:\\GitHub\\CosNIC\\test_case_subtest_data_1.json"
    if json_file:
        try:
            with open(json_file, "r") as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Invalid JSON file: {e}")
            return

    # Process JSON data
    elif json_data:
        try:
            data = json.loads(json_data)
        except json.JSONDecodeError as e:
            print(f"Invalid JSON data: {e}")
            return

    else:
        print("No JSON input provided.")
        return

    with transaction.atomic():
        for tcid, details in data.items():
            test_case_path = details.get("test_case_path", "")
            print(f"Test Case Path: {test_case_path}")
            relative_test_case_path = test_case_path.replace("\\", "/").split(
                "site-packages"
            )[-1]

            subtests = details.get("subtests", [])
            feature = ""
            sub_feature = ""

            split_relative_test_case_path = relative_test_case_path.split("/")
            split_relative_test_case_path = [
                x for x in split_relative_test_case_path if x.strip(" ")
            ]

            applicable_os = split_relative_test_case_path[3]
            suite_name = split_relative_test_case_path[4]

            if split_relative_test_case_path[5].startswith("QA_Controller"):
                test_case_title = split_relative_test_case_path[-1].replace(".py", "")

            elif split_relative_test_case_path[5].startswith("qa_controller"):
                feature = ""
                sub_feature = ""

            else:
                if len(split_relative_test_case_path) == 7:
                    test_case_title = split_relative_test_case_path[6]
                    feature = split_relative_test_case_path[5]
                    sub_feature = ""

                if len(split_relative_test_case_path) == 8:
                    test_case_title = split_relative_test_case_path[7]
                    sub_feature = split_relative_test_case_path[6]
                    feature = split_relative_test_case_path[5]

            test_case_title_without_extension = test_case_title.replace(".py", "")

            # Uncomment this section to update/create the TestCase and SubTests models
            test_case, created = TestCase.objects.update_or_create(
                tcid=tcid,
                defaults={
                    "title": test_case_title_without_extension,
                    "path": relative_test_case_path,
                    "suite_name": suite_name,
                    "applicable_os": applicable_os,
                    "feature": feature,
                    "sub_feature": sub_feature,
                    "category": "functional",
                    "modified_at": datetime.now(),
                },
            )

            for subtest in subtests:
                print(f"Subtest: {subtest}")
                # Uncomment this section to update/create SubTests models
                realtive_path = (
                    subtest["path"].replace("\\", "/").split("site-packages")[-1]
                )
                print(f"Relative Path: {realtive_path}")
                SubTests.objects.update_or_create(
                    test_case=test_case,
                    name=subtest["name"],
                    defaults={
                        "path": realtive_path,
                        "modified_at": datetime.now(),
                    },
                )

    print("Successfully updated test cases and subtests.")
