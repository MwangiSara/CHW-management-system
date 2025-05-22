from django.contrib import admin
from .models import CommodityRequest,RequestLog

# Register your models here.
admin.site.register(CommodityRequest)
admin.site.register(RequestLog)