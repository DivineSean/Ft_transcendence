# Generated by Django 4.2.14 on 2024-12-18 23:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Auth', '0006_merge_20241215_1717'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='users',
            name='_2fa',
        ),
    ]
