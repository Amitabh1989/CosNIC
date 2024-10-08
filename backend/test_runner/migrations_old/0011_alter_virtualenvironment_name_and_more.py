# Generated by Django 5.1 on 2024-08-29 15:40

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("test_runner", "0010_alter_virtualenvironment_path_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name="virtualenvironment",
            name="name",
            field=models.CharField(max_length=255),
        ),
        migrations.AddConstraint(
            model_name="virtualenvironment",
            constraint=models.UniqueConstraint(
                fields=("user", "name"), name="unique_venv_name_per_user"
            ),
        ),
    ]
