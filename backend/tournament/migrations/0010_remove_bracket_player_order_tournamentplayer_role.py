# Generated by Django 4.2.14 on 2025-01-23 13:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tournament", "0009_bracket_player_order"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="bracket",
            name="player_order",
        ),
        migrations.AddField(
            model_name="tournamentplayer",
            name="role",
            field=models.PositiveIntegerField(blank=True, default=0),
            preserve_default=False,
        ),
    ]
