# Generated by Django 4.2.14 on 2025-01-15 02:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("games", "0022_alter_playerrating_recent_results"),
    ]

    operations = [
        migrations.AddField(
            model_name="playerrating",
            name="rating_history",
            field=models.JSONField(default=list),
        ),
    ]
