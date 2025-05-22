from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date

User = get_user_model()

class CommodityRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('DELIVERED', 'Delivered'),
    ]

    requester = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='commodity_requests',
        limit_choices_to={'role': 'CHW'}
    )
    approver = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_requests',
        limit_choices_to={'role': 'CHA'}
    )
    commodity = models.ForeignKey(
        'commodities.Commodity', 
        on_delete=models.CASCADE,
        related_name='requests'
    )
    quantity_requested = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(99)]
    )
    quantity_approved = models.PositiveIntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    reason_for_request = models.TextField(blank=True, help_text="Why do you need these commodities?")
    rejection_reason = models.TextField(blank=True)
    notes = models.TextField(blank=True, help_text="Additional notes from approver")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    def __str__(self):
        return f"{self.requester.username} - {self.commodity.name} ({self.quantity_requested}) - {self.status}"

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Auto-assign approver based on CHW's supervisor
        if not self.approver and self.requester.supervisor:
            self.approver = self.requester.supervisor
        
        # Set approval timestamp
        if self.status == 'APPROVED' and not self.approved_at:
            self.approved_at = timezone.now()
        
        # Set delivery timestamp
        if self.status == 'DELIVERED' and not self.delivered_at:
            self.delivered_at = timezone.now()
            
        super().save(*args, **kwargs)

    def clean(self):
        from django.core.exceptions import ValidationError
        
        # Check daily limit (one request per commodity per day)
        if self.pk is None:  # New request
            today = date.today()
            existing_request = CommodityRequest.objects.filter(
                requester=self.requester,
                commodity=self.commodity,
                created_at__date=today,
                status__in=['PENDING', 'APPROVED']
            ).exists()
            
            if existing_request:
                raise ValidationError(
                    f'You have already requested {self.commodity.name} today. Only one request per commodity per day is allowed.'
                )
        
        # Check monthly limit
        if self.pk is None:  # New request
            current_month = timezone.now().replace(day=1)
            monthly_total = CommodityRequest.objects.filter(
                requester=self.requester,
                commodity=self.commodity,
                created_at__gte=current_month,
                status__in=['APPROVED', 'DELIVERED']
            ).aggregate(
                total=models.Sum('quantity_approved')
            )['total'] or 0
            
            if monthly_total + self.quantity_requested > self.commodity.max_monthly_allocation:
                remaining = self.commodity.max_monthly_allocation - monthly_total
                raise ValidationError(
                    f'Monthly limit exceeded. You can only request {remaining} more {self.commodity.name} this month.'
                )

        # Validate quantity against commodity limits
        if self.quantity_requested > self.commodity.max_quantity_per_request:
            raise ValidationError(
                f'Maximum {self.commodity.max_quantity_per_request} {self.commodity.name} allowed per request.'
            )

class RequestLog(models.Model):
    """Audit log for all request-related actions"""
    ACTION_CHOICES = [
        ('CREATED', 'Request Created'),
        ('APPROVED', 'Request Approved'),
        ('REJECTED', 'Request Rejected'),
        ('DELIVERED', 'Request Marked as Delivered'),
        ('UPDATED', 'Request Updated'),
    ]
    
    request = models.ForeignKey(CommodityRequest, on_delete=models.CASCADE, related_name='logs')
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    details = models.JSONField(default=dict, blank=True)  # Store additional context
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.request} - {self.action} by {self.performed_by} at {self.timestamp}"
    
    class Meta:
        ordering = ['-timestamp']