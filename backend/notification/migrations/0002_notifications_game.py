# Generated by Django 4.2.14 on 2025-01-18 17:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("notification", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="notifications",
            name="game",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
