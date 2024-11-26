# Generated by Django 4.2.14 on 2024-11-24 10:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='rating_gain',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='player',
            name='rating_loss',
            field=models.PositiveSmallIntegerField(default=0),
            preserve_default=False,
        ),
    ]
