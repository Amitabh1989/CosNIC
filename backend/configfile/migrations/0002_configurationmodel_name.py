# Generated by Django 4.2.1 on 2024-08-09 03:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("configfile", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="configurationmodel",
            name="name",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
