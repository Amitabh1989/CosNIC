# import json
# from django.core.management.base import BaseCommand

# # from test_runner.models import TestCase, SubTests
# from django.core.exceptions import ObjectDoesNotExist


# class Command(BaseCommand):
#     help = "Create or update TestCase and SubTests records from JSON input"

#     def add_arguments(self, parser):
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
#         json_data = None

#         if options["json_file"]:
#             with open(options["json_file"], "r") as file:
#                 json_data = file.read()

#         elif options["json_data"]:
#             json_data = options["json_data"]

#         else:
#             self.stdout.write(self.style.ERROR("No JSON input provided."))
#             return

#         data = json.loads(json_data)
#         # self.stdout.write(self.style.SUCCESS(f"data : {data}"))
#         self.stdout.write(self.style.ERROR(f"JSON Decode data: {data}"))

#         for tcid, details in data.items():
#             test_case_path = details.get("test_case_path", "")
#             subtests = details.get("subtests", [])

#             applicable_os = test_case_path.split("\\")[1]
#             path_parts = test_case_path.split("\\")
#             suite_name = path_parts[-3]
#             feature = path_parts[-2]
#             test_case_title = path_parts[-1]
#             test_case_title_without_extension = test_case_title.replace(".py", "")

#             print(test_case_title_without_extension)

#             for subtest in subtests:
#                 # SubTests.objects.update_or_create(
#                 #     test_case=test_case,
#                 #     name=subtest["name"],
#                 #     defaults={"path": subtest["path"]},
#                 # )
#                 self.stdout.write(self.style.SUCCESS(f"Subtest : {subtest}"))

#         self.stdout.write(
#             self.style.SUCCESS("Successfully updated test cases and subtests.")
#         )


import json
from django.core.management.base import BaseCommand

# Uncomment this if you have these imports available
# from test_runner.models import TestCase, SubTests


class Command(BaseCommand):
    help = "Create or update TestCase and SubTests records from JSON input"

    def add_arguments(self, parser):
        parser.add_argument(
            "--json-file",
            type=str,
            help="Path to the JSON file containing test case data",
        )
        parser.add_argument("--json-data", type=str, help="JSON string input directly")
        parser.add_argument(
            "--from-db", action="store_true", help="Fetch JSON data from the database"
        )

    def handle(self, *args, **options):
        json_data = None

        if options["json_file"]:
            self.stdout.write(
                self.style.SUCCESS(f"Loading JSON from file: {options['json_file']}")
            )
            try:
                with open(options["json_file"], "r") as file:
                    json_data = file.read()
            except FileNotFoundError:
                self.stdout.write(
                    self.style.ERROR(f"File not found: {options['json_file']}")
                )
                return

        elif options["json_data"]:
            self.stdout.write(self.style.SUCCESS(f"Using JSON data directly."))
            json_data = options["json_data"]

        else:
            self.stdout.write(self.style.ERROR("No JSON input provided."))
            return

        try:
            data = json.loads(json_data)
            self.stdout.write(self.style.SUCCESS(f"Data loaded successfully: {data}"))
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f"JSON Decode Error: {e}"))
            return

        self.stdout.write(self.style.SUCCESS("Processing data..."))

        for tcid, details in data.items():
            test_case_path = details.get("test_case_path", "")
            subtests = details.get("subtests", [])

            applicable_os = test_case_path.split("\\")[1]
            path_parts = test_case_path.split("\\")
            suite_name = path_parts[-3]
            feature = path_parts[-2]
            test_case_title = path_parts[-1]
            test_case_title_without_extension = test_case_title.replace(".py", "")

            self.stdout.write(
                self.style.SUCCESS(
                    f"Test Case Title: {test_case_title_without_extension}"
                )
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"Applicable OS: {applicable_os}, Suite: {suite_name}, Feature: {feature}"
                )
            )

            for subtest in subtests:
                self.stdout.write(self.style.SUCCESS(f"Subtest: {subtest}"))

        self.stdout.write(
            self.style.SUCCESS("Successfully processed test cases and subtests.")
        )
