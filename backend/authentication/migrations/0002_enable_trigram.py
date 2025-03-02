# Generated by Django 4.2.14 on 2024-12-29 20:45

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        # Replace 'authentication' with your app name
        # Replace '0001_initial' with your last migration
        ("authentication", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql="CREATE EXTENSION IF NOT EXISTS pg_trgm;",
            reverse_sql="DROP EXTENSION IF EXISTS pg_trgm;",
        ),
        # If you also want to create a case-insensitive collation for better search
        migrations.RunSQL(
            sql="""
            CREATE COLLATION IF NOT EXISTS case_insensitive (
                provider = icu,
                locale = 'und-u-ks-level2',
                deterministic = false
            );
            """,
            reverse_sql="DROP COLLATION IF EXISTS case_insensitive;",
        ),
    ]
