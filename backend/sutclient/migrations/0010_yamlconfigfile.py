# Generated by Django 5.1.1 on 2024-10-05 11:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("sutclient", "0009_alter_rmii_instance_id"),
    ]

    operations = [
        migrations.CreateModel(
            name="YamlConfigFile",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("file", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("modified_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]