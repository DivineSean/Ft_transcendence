# Generated by Django 4.2.14 on 2024-11-23 16:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Auth', '0006_alter_users_istwofa'),
    ]

    operations = [
        migrations.AlterField(
            model_name='users',
            name='isTwoFa',
            field=models.BooleanField(default=False),
        ),
    ]
