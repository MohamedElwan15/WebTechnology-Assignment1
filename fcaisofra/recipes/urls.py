from django.urls import path
from django.contrib import admin
from . import views

urlpatterns = [
    path('all-recipes/', views.recipesList, name='all_recipes'),
    path('recipe/<str:recipe_id>/', views.recipeDetail, name='recipe_detail'),
]