# Generated by Django 4.2.14 on 2025-01-04 20:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0002_enable_trigram"),
    ]

    operations = [
        migrations.AddField(
            model_name="message",
            name="metadata",
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
    ]
