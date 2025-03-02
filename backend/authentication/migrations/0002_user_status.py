# Generated by Django 4.2.14 on 2024-12-30 15:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="status",
            field=models.CharField(
                choices=[
                    ("online", "Online"),
                    ("offline", "Offline"),
                    ("in-game", "In Game"),
                ],
                default="offline",
                max_length=8,
            ),
        ),
    ]
