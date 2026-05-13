from django.shortcuts import render, get_object_or_404
from .models import Recipe

def home(request):
    featured_recipes = Recipe.objects.filter(featured=True)[:3]
    context = {
        'featured_recipes': featured_recipes
    }
    return render(request, 'homepage.html', context)

def recipesList(request):
    all_recipes = Recipe.objects.all()
    context = {
        'recipes': all_recipes
    }
    return render(request, 'recList.html', context)

def recipeDetail(request, recipe_id):
    recipe = get_object_or_404(Recipe, recipe_id=recipe_id)
    context = {
        'recipe': recipe
    }
    return render(request, 'recipeInfo.html', context)