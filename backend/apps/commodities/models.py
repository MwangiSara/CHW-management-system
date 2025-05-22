from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.

class Commodity(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    unit_of_measure = models.CharField(max_length=20, default='pieces')  # e.g., tablets, bottles, packets
    category = models.CharField(max_length=50, blank=True)  # e.g., Malaria, Family Planning
    max_quantity_per_request = models.PositiveIntegerField(
        default=99,
        validators=[MinValueValidator(1), MaxValueValidator(99)],
        help_text="Maximum quantity allowed per single request"
    )
    max_monthly_allocation = models.PositiveIntegerField(
        default=200,
        validators=[MinValueValidator(1)],
        help_text="Maximum total quantity per CHW per month"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.unit_of_measure})"

    class Meta:
        verbose_name_plural = "Commodities"
        ordering = ['name']
