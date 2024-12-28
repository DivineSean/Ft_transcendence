# Generated by Django 4.2.14 on 2024-12-28 22:37

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
            name='FriendshipRequest',
            fields=[
                ('FriendshipRequestID', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('accepted_at', models.DateTimeField(blank=True, default=None, null=True)),
                ('rejected_at', models.DateTimeField(blank=True, default=None, null=True)),
                ('fromUser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fromUser', to=settings.AUTH_USER_MODEL)),
                ('toUser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='toUser', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('fromUser', 'toUser')},
            },
        ),
        migrations.CreateModel(
            name='Friendship',
            fields=[
                ('friendshipID', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='f1', to=settings.AUTH_USER_MODEL)),
                ('user2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='f2', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user1', 'user2')},
            },
        ),
    ]
