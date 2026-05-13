from django.contrib import admin
from .models import Recipe

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'chef', 'creator', 'featured')
    search_fields = ('name', 'description', 'chef')
    list_filter = ('course', 'featured', 'creator')
