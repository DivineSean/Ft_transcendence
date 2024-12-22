# Generated by Django 4.2.14 on 2024-12-20 21:30

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("notification", "0002_alter_notifications_userid"),
    ]

    operations = [
        migrations.AddField(
            model_name="notifications",
            name="senderId",
            field=models.ForeignKey(
                default="",
                on_delete=django.db.models.deletion.CASCADE,
                related_name="sender",
                to=settings.AUTH_USER_MODEL,
            ),
            preserve_default=False,
        ),
    ]
