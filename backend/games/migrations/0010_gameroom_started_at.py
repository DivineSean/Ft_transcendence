# Generated by Django 4.2.14 on 2024-12-27 16:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("games", "0009_gameroom_turn"),
    ]

    operations = [
        migrations.AddField(
            model_name="gameroom",
            name="started_at",
            field=models.BigIntegerField(default=1735317532241),
        ),
    ]
