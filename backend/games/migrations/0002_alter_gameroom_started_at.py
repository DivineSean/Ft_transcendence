# Generated by Django 4.2.14 on 2024-12-29 14:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("games", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="gameroom",
            name="started_at",
            field=models.BigIntegerField(default=1735482028940),
        ),
    ]
