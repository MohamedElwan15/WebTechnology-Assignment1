from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('all-recipes/', views.recipesList, name='all_recipes'),
    path('recipe/<str:recipe_id>/', views.recipeDetail, name='recipe_detail'),
    path('search/', views.search, name='search'),
    path('favorites/', views.favorites_page, name='favorites'),
    
    # Admin paths
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('dashboard/add/', views.admin_recipe_upsert, name='admin_add_recipe'),
    path('dashboard/edit/<str:recipe_id>/', views.admin_recipe_upsert, name='admin_edit_recipe'),
    path('dashboard/delete/<str:recipe_id>/', views.admin_delete_recipe, name='admin_delete_recipe'),
    
    # Auth paths
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),

    # Chef paths
    path('chef/<slug:slug>/', views.chef_detail, name='chef_detail'),

    # Favorite API paths
    path('api/recipes/', views.recipe_list_api, name='recipe_list_api'),
    path('api/chefs/', views.chef_list_api, name='chef_list_api'),
    path('api/favorites/', views.list_favorites, name='list_favorites'),
    path('api/favorites/toggle/', views.toggle_favorite, name='toggle_favorite'),
]
