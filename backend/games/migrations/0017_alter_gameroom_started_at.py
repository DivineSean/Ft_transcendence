# Generated by Django 4.2.14 on 2025-01-02 15:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("games", "0016_alter_gameroom_started_at"),
    ]

    operations = [
        migrations.AlterField(
            model_name="gameroom",
            name="started_at",
            field=models.BigIntegerField(default=0),
        ),
    ]
