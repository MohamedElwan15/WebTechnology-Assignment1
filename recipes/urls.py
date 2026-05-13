from django.urls import path
from django.contrib import admin
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('all-recipes/', views.recipesList, name='all_recipes'),
    path('recipe/<str:recipe_id>/', views.recipeDetail, name='recipe_detail'),
    path('api/favorites/', views.list_favorites, name='list_favorites'),
    path('api/favorites/toggle/', views.toggle_favorite, name='toggle_favorite'),
]
