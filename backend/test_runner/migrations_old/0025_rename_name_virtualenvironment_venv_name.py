# Generated by Django 5.1 on 2024-08-31 10:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("test_runner", "0024_alter_testcase_title_subtests"),
    ]

    operations = [
        migrations.RenameField(
            model_name="virtualenvironment",
            old_name="name",
            new_name="venv_name",
        ),
    ]
