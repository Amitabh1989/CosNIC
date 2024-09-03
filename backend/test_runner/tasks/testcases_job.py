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

#         # elif options["from_db"]:
#         #     # Fetch data from the database
#         #     try:
#         #         data_from_db = TestCase.objects.values(
#         #             "id", "test_case_path", "subtests__name", "subtests__path"
#         #         )
#         #         json_data = json.dumps(data_from_db)  # Convert queryset to JSON
#         #     except ObjectDoesNotExist:
#         #         self.stdout.write(self.style.ERROR("No data found in the database."))
#         #         return

#         else:
#             self.stdout.write(self.style.ERROR("No JSON input provided."))
#             return

#         data = json.loads(json_data)
#         print

#         for tcid, details in data.items():
#             test_case_path = details.get("test_case_path", "")
#             subtests = details.get("subtests", [])

#             applicable_os = test_case_path.split("\\")[1]
#             path_parts = test_case_path.split("\\")
#             suite_name = path_parts[-3]
#             feature = path_parts[-2]
#             test_case_title = path_parts[-1]
#             test_case_title_without_extension = test_case_title.replace(".py", "")

#             # test_case, created = TestCase.objects.update_or_create(
#             #     tcid=tcid,
#             #     defaults={
#             #         "title": test_case_title_without_extension,
#             #         "path": test_case_path,
#             #         "suite_name": suite_name,
#             #         "applicable_os": applicable_os,
#             #         "feature": feature,
#             #         "sub_feature": "",
#             #         "category": "functional",
#             #     },
#             # )
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


# import json

# from django.core.management.base import BaseCommand

# Uncomment this if you have these imports available
# from test_runner.models import TestCase, SubTests


# class Command(BaseCommand):
import json
from django.core.management.base import BaseCommand
from django.core.exceptions import ObjectDoesNotExist

import json
import argparse
from django.core.management.base import BaseCommand

# Ensure Django setup is complete (Replace with your project settings)
import django
import os

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "your_project.settings")
# django.setup()


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
            with open(options["json_file"], "r") as file:
                json_data = file.read()

        elif options["json_data"]:
            json_data = options["json_data"]

        else:
            self.stdout.write(self.style.ERROR("No JSON input provided."))
            return

        data = json.loads(json_data)
        self.stdout.write(self.style.SUCCESS(f"Data: {data}"))

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

            for subtest in subtests:
                self.stdout.write(self.style.SUCCESS(f"Subtest: {subtest}"))

        self.stdout.write(
            self.style.SUCCESS("Successfully updated test cases and subtests.")
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process test cases and subtests.")
    parser.add_argument("--json-file", type=str, help="Path to the JSON file")
    parser.add_argument("--json-data", type=str, help="JSON string input directly")
    parser.add_argument(
        "--from-db", action="store_true", help="Fetch JSON data from the database"
    )

    args = parser.parse_args()
    command = Command()

    # Mocking options dict
    options = {
        "json_file": args.json_file,
        "json_data": args.json_data,
        "from_db": args.from_db,
    }

    command.handle(**options)
