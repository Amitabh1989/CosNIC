# Generated by Django 5.1 on 2024-08-12 02:39

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("sutclient", "0004_alter_client_name_alter_sut_name"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="config",
            name="auto_increment",
        ),
        migrations.RemoveField(
            model_name="config",
            name="bmc_interface",
        ),
        migrations.RemoveField(
            model_name="config",
            name="instance_id",
        ),
        migrations.AlterField(
            model_name="config",
            name="rmii_interface",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to="sutclient.rmii"
            ),
        ),
        migrations.AlterField(
            model_name="rmii",
            name="instance_id",
            field=models.IntegerField(default=1, max_length=100),
        ),
    ]