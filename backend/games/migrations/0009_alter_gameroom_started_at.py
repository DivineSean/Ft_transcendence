# Generated by Django 4.2.14 on 2024-12-30 15:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("games", "0008_alter_gameroom_started_at"),
    ]

    operations = [
        migrations.AlterField(
            model_name="gameroom",
            name="started_at",
            field=models.BigIntegerField(default=1735574139502),
        ),
    ]
