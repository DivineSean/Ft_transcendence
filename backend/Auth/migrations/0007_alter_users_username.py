# Generated by Django 4.2.14 on 2024-10-06 15:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Auth', '0006_alter_users_username'),
    ]

    operations = [
        migrations.AlterField(
            model_name='users',
            name='username',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
