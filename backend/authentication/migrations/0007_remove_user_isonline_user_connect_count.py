# Generated by Django 4.2.14 on 2025-01-16 20:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0006_user_exp_history'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='isOnline',
        ),
        migrations.AddField(
            model_name='user',
            name='connect_count',
            field=models.PositiveBigIntegerField(default=0),
        ),
    ]
