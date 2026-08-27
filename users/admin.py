from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Fields', {'fields': ('user_role', 'phone_number', 'region', 'district')}),
    )
    list_display = ('username', 'full_name', 'phone_number', 'user_role', 'region')
    list_filter = ('user_role', 'region', 'is_staff', 'is_superuser')
    search_fields = ('username', 'full_name', 'phone_number')

admin.site.register(User, CustomUserAdmin)
