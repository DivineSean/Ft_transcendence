# Generated by Django 4.2.14 on 2025-01-14 23:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("games", "0021_alter_playerrating_recent_results"),
    ]

    operations = [
        migrations.AlterField(
            model_name="playerrating",
            name="recent_results",
            field=models.JSONField(default=list),
        ),
    ]
