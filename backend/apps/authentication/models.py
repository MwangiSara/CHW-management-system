from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    ROLES = [
        ('CHW', 'Community Health Worker'),
        ('CHA', 'Community Health Assistant'),
        ('ADMIN', 'Administrator'),
    ]
    role= models.CharField(max_length=100, choices=ROLES)
    phone_number = models.CharField(max_length=10, blank=True)
    location = models.CharField(max_length=255,blank=True)
    supervisor = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True,related_name='supervised_workers',help_text="CHA who supervises this CHW")
    is_active_worker = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    class Meta:
        db_table = 'auth_user'
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # CHW must have a CHA supervisor
        if self.role == 'CHW' and not self.supervisor:
            raise ValidationError('CHW must have a CHA supervisor assigned.')
        
        # CHA cannot have CHW as supervisor
        if self.role == 'CHA' and self.supervisor and self.supervisor.role == 'CHW':
            raise ValidationError('CHA cannot be supervised by a CHW.')



