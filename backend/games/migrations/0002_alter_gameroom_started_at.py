# Generated by Django 4.2.14 on 2024-12-29 12:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gameroom',
            name='started_at',
            field=models.BigIntegerField(default=1735473828820),
        ),
    ]
