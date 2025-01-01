# Generated by Django 4.2.14 on 2025-01-01 15:46

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
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20, unique=True)),
                ('min_players', models.PositiveSmallIntegerField(default=2, help_text='Minimum number of players required to start the game')),
                ('max_players', models.PositiveSmallIntegerField(default=2, help_text='Maximum players allowed in the game')),
            ],
        ),
        migrations.CreateModel(
            name='GameRoom',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('waiting', 'Waiting for Players'), ('ongoing', 'Game Ongoing'), ('paused', 'Game Paused'), ('completed', 'Game Completed'), ('expired', 'Game Expired')], default='waiting', max_length=20)),
                ('state', models.JSONField(default=dict)),
                ('turn', models.PositiveSmallIntegerField(default=1)),
                ('started_at', models.BigIntegerField(default=0)),
                ('paused_at', models.BigIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='games.game')),
            ],
        ),
        migrations.CreateModel(
            name='PlayerRating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.PositiveIntegerField(default=951)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='games.game')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating_gain', models.PositiveSmallIntegerField()),
                ('rating_loss', models.PositiveSmallIntegerField()),
                ('role', models.PositiveSmallIntegerField()),
                ('ready', models.BooleanField(default=False)),
                ('score', models.PositiveIntegerField(default=0)),
                ('timeouts', models.PositiveSmallIntegerField(default=3)),
                ('result', models.CharField(blank=True, choices=[('win', 'Win'), ('loss', 'Loss'), ('draw', 'Draw')], max_length=10, null=True)),
                ('game_room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='games.gameroom')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Achievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='achievements', to='games.game')),
            ],
        ),
        migrations.CreateModel(
            name='PlayerAchievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('level', models.CharField(max_length=20)),
                ('progress', models.PositiveIntegerField(default=0)),
                ('threshold', models.PositiveIntegerField()),
                ('earned_at', models.DateTimeField(auto_now_add=True)),
                ('achievement', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='games.achievement')),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='games.game')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='achievements', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'game', 'achievement', 'level')},
            },
        ),
    ]
