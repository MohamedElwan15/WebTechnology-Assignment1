from django.contrib import admin
from .models import Recipe, Chef

@admin.register(Chef)
class ChefAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialty', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'chef', 'chef_name_legacy', 'creator', 'featured')
    search_fields = ('name', 'description', 'chef__name', 'chef_name_legacy')
    list_filter = ('course', 'featured', 'creator', 'chef')
