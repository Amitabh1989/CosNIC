# Generated by Django 5.1 on 2024-09-04 01:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("test_runner", "0035_testcase_applicable_os_testcase_feature_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="testcase",
            name="controllers",
            field=models.JSONField(default=list),
        ),
    ]
