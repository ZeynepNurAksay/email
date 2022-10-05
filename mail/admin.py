from django.contrib import admin
from .models import *

class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username")

class EmailAdmin(admin.ModelAdmin):
    list_display = ("id", "sender")
    
admin.site.register(User, UserAdmin)
admin.site.register(Email, EmailAdmin)
