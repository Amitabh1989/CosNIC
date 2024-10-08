# Generated by Django 5.1 on 2024-08-30 02:17

import test_runner.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("test_runner", "0018_rename_log_testrun_log_file"),
    ]

    operations = [
        migrations.AlterField(
            model_name="testrun",
            name="log_file",
            field=models.FileField(
                blank=True, null=True, upload_to=test_runner.models.logs_upload_path
            ),
        ),
    ]
