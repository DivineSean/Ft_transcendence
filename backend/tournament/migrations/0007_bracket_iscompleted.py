# Generated by Django 4.2.14 on 2025-01-22 14:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0006_alter_tournament_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='bracket',
            name='isCompleted',
            field=models.BooleanField(default=False),
        ),
    ]
