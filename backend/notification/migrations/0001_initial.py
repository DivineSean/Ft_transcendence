# Generated by Django 4.2.14 on 2024-11-28 12:10

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Notifications",
            fields=[
                (
                    "notificationId",
                    models.UUIDField(
                        default=uuid.uuid4,
                        primary_key=True,
                        serialize=False,
                        unique=True,
                    ),
                ),
                (
                    "notifType",
                    models.CharField(
                        choices=[
                            ("FR", "Friend Request"),
                            ("IG", "Invite Game"),
                            ("IT", "Invite Tournament"),
                            ("ME", "Message"),
                        ],
                        max_length=2,
                    ),
                ),
                ("notifMessage", models.CharField(max_length=255, null=True)),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                ("isRead", models.BooleanField(default=False)),
                (
                    "userId",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
