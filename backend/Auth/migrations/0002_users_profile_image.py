# Generated by Django 4.2.14 on 2024-11-29 09:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Auth", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="users",
            name="profile_image",
            field=models.ImageField(blank=True, null=True, upload_to="profile_images/"),
        ),
    ]
