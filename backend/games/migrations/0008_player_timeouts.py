# Generated by Django 4.2.14 on 2024-12-25 15:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0007_achievement_playerachievement'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='timeouts',
            field=models.PositiveSmallIntegerField(default=3),
        ),
    ]
