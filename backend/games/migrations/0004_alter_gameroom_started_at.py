# Generated by Django 4.2.14 on 2024-12-29 14:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0003_alter_gameroom_started_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gameroom',
            name='started_at',
            field=models.BigIntegerField(default=1735481442992),
        ),
    ]
