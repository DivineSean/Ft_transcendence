# Generated by Django 4.2.14 on 2025-01-05 14:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_message_metadata'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='metadata',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
