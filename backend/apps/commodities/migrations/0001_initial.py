# Generated by Django 4.2.21 on 2025-05-22 10:10

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Commodity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('unit_of_measure', models.CharField(default='pieces', max_length=20)),
                ('category', models.CharField(blank=True, max_length=50)),
                ('max_quantity_per_request', models.PositiveIntegerField(default=99, help_text='Maximum quantity allowed per single request', validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(99)])),
                ('max_monthly_allocation', models.PositiveIntegerField(default=200, help_text='Maximum total quantity per CHW per month', validators=[django.core.validators.MinValueValidator(1)])),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Commodities',
                'ordering': ['name'],
            },
        ),
    ]
