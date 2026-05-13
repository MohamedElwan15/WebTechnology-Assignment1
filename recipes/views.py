from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib import messages
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Recipe, Favorite
from django.shortcuts import render, get_object_or_404
from .models import Recipe
import json
import uuid

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

# --- Admin Views ---

@login_required
def admin_dashboard(request):
    recipes = Recipe.objects.filter(creator=request.user)
    return render(request, 'admin_dashboard.html', {'recipes': recipes})

@login_required
def admin_recipe_upsert(request, recipe_id=None):
    recipe = None
    if recipe_id:
        recipe = get_object_or_404(Recipe, recipe_id=recipe_id, creator=request.user)

    if request.method == 'POST':
        name = request.POST.get('RecipeName')
        course = request.POST.get('Courses')
        description = request.POST.get('Description')
        chef = request.POST.get('chefSelect')
        
        # Collect ingredients
        ingredients = []
        ing_names = request.POST.getlist('ing_name[]')
        ing_qtys = request.POST.getlist('ing_qty[]')
        for n, q in zip(ing_names, ing_qtys):
            if n.strip():
                ingredients.append({'name': n.strip(), 'qty': q.strip()})
        
        # Collect steps
        steps = [s.strip() for s in request.POST.getlist('step[]') if s.strip()]

        if not recipe:
            recipe = Recipe(recipe_id=str(uuid.uuid4())[:8], creator=request.user)
        
        recipe.name = name
        recipe.course = course
        recipe.description = description
        recipe.chef = chef
        recipe.ingredients = ingredients
        recipe.steps = steps
        
        # Image handling
        if 'recipe_img' in request.FILES:
            recipe.image = request.FILES['recipe_img']
        
        recipe.save()
        messages.success(request, 'Recipe saved successfully!')
        return redirect('admin_dashboard')

    return render(request, 'admin_recipe_form.html', {'recipe': recipe})

@login_required
def admin_delete_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe, recipe_id=recipe_id, creator=request.user)
    if request.method == 'POST':
        recipe.delete()
        messages.success(request, 'Recipe deleted.')
    return redirect('admin_dashboard')

# --- Auth Views ---

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('admin_dashboard')
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})

def signup_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('admin_dashboard')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('home')
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
