import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Recipe, Favorite
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

@login_required
@require_http_methods(["GET"])
def list_favorites(request):
    favs = (
        Favorite.objects
        .filter(user=request.user)
        .select_related('recipe')
        .order_by('-saved_at')
    )
    data = [
        {
            "recipe_id":   f.recipe.recipe_id,
            "name":        f.recipe.name,
            "course":      f.recipe.course,
            "description": f.recipe.description,
            "image_url":   f.recipe.image_url or "",
            "chef":        f.recipe.chef or "",
        }
        for f in favs
    ]
    return JsonResponse({"favorites": data})


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def toggle_favorite(request):
    body = json.loads(request.body)
    recipe_id = body.get("recipe_id")

    recipe = get_object_or_404(Recipe, recipe_id=recipe_id)

    fav, created = Favorite.objects.get_or_create(user=request.user, recipe=recipe)
    if not created:
        fav.delete()
        return JsonResponse({"status": "removed", "recipe_id": recipe_id})

    return JsonResponse({"status": "added", "recipe_id": recipe_id})
