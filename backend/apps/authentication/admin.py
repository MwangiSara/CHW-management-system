from django.contrib import admin
from .models import User

# Register your models here.
admin.site.site_header = "CHW System Administration"
admin.site.site_title = "CHW Admin"
admin.site.index_title = "Welcome to CHW System Administration"
admin.site.register(User)