from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Recipe, Favorite, Chef
from django.db import models
import json
import uuid

def home(request):
    if not request.user.is_authenticated and not request.GET.get('guest'):
        return render(request, 'entry_page.html')
        
    featured_recipes = Recipe.objects.filter(featured=True)[:3]
    context = {
        'featured_recipes': featured_recipes
    }
    return render(request, 'homepage.html', context)

def recipesList(request):
    all_recipes = Recipe.objects.all()
    
    # Filter by course if provided
    course = request.GET.get('course', 'all')
    if course != 'all':
        all_recipes = all_recipes.filter(course=course)
    
    context = {
        'recipes': all_recipes,
        'active_course': course
    }
    return render(request, 'recList.html', context)

def recipeDetail(request, recipe_id):
    recipe = get_object_or_404(Recipe, recipe_id=recipe_id)
    context = {
        'recipe': recipe
    }
    return render(request, 'recipeInfo.html', context)

def search(request):
    query = request.GET.get('query', '')
    course = request.GET.get('course', 'all')
    chef_slug = request.GET.get('chef', 'all')
    
    results = Recipe.objects.all().select_related('chef')
    
    if query:
        results = results.filter(
            models.Q(name__icontains=query) | 
            models.Q(description__icontains=query) |
            models.Q(chef__name__icontains=query) |
            models.Q(chef_name_legacy__icontains=query)
        )
    
    if course != 'all':
        results = results.filter(course=course)
        
    if chef_slug != 'all':
        if chef_slug == '__selfmade__':
            results = results.filter(chef__isnull=True, chef_name_legacy__isnull=True)
        else:
            # Try to find chef by slug first
            chef_obj = Chef.objects.filter(slug=chef_slug).first()
            if chef_obj:
                # Match both by ForeignKey and by legacy name
                results = results.filter(
                    models.Q(chef=chef_obj) | 
                    models.Q(chef__slug=chef_slug) | 
                    models.Q(chef_name_legacy=chef_obj.name)
                )
            else:
                # Fallback: try matching by slug or name directly
                results = results.filter(
                    models.Q(chef__slug=chef_slug) | 
                    models.Q(chef__name=chef_slug)
                )

    context = {
        'query': query,
        'results': results,
        'active_course': course,
        'active_chef': chef_slug,
        'chefs': Chef.objects.all()
    }
    return render(request, 'search.html', context)

def recipe_list_api(request):
    recipes = Recipe.objects.all().select_related('chef')
    data = []
    for r in recipes:
        data.append({
            "id": r.recipe_id,
            "name": r.name,
            "course": r.course,
            "description": r.description,
            "imageUrl": r.get_image_url,
            "chef": r.get_chef_name,
            "chefImg": r.get_chef_img,
            "chefSlug": r.chef.slug if r.chef else None,
            "ingredients": r.ingredients,
            "steps": r.steps,
        })
    return JsonResponse(data, safe=False)

def chef_list_api(request):
    chefs = Chef.objects.all()
    data = [
        {
            "id": c.slug,
            "name": c.name,
            "specialty": c.specialty,
            "img": c.img,
        }
        for c in chefs
    ]
    return JsonResponse(data, safe=False)

def chef_detail(request, slug):
    chef = get_object_or_404(Chef, slug=slug)
    # Get all recipes by this chef (both via ForeignKey and legacy name)
    recipes = Recipe.objects.filter(models.Q(chef=chef) | models.Q(chef_name_legacy=chef.name))
    return render(request, 'chef_profile.html', {'chef': chef, 'recipes': recipes})

@login_required
def favorites_page(request):
    return render(request, 'favorites.html')

# --- Admin Views ---

@staff_member_required
def admin_dashboard(request):
    recipes = Recipe.objects.all()
    return render(request, 'admin_dashboard.html', {'recipes': recipes})

@staff_member_required
def admin_recipe_upsert(request, recipe_id=None):
    recipe = None
    chefs = Chef.objects.all()
    if recipe_id:
        recipe = get_object_or_404(Recipe, recipe_id=recipe_id)

    if request.method == 'POST':
        name = request.POST.get('RecipeName')
        course = request.POST.get('Courses')
        description = request.POST.get('Description')
        chef_id = request.POST.get('chefSelect')
        
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
        
        if chef_id:
            recipe.chef = get_object_or_404(Chef, id=chef_id)
        else:
            recipe.chef = None
            
        recipe.ingredients = ingredients
        recipe.steps = steps
        
        # Image handling
        if 'recipe_img' in request.FILES:
            recipe.image = request.FILES['recipe_img']
        
        recipe.save()
        messages.success(request, 'Recipe saved successfully!')
        return redirect('admin_dashboard')

    return render(request, 'admin_recipe_form.html', {'recipe': recipe, 'chefs': chefs})

@login_required
def admin_delete_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe, recipe_id=recipe_id, creator=request.user)
    if request.method == 'POST':
        recipe.delete()
        messages.success(request, 'Recipe deleted.')
    return redirect('admin_dashboard')

# --- Auth Views ---

def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')
        
    next_url = request.GET.get('next', 'home')
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            
            # If 'next' was provided, use it. Otherwise role-based.
            requested_next = request.POST.get('next')
            if requested_next and requested_next != 'None':
                return redirect(requested_next)
                
            if user.is_staff:
                return redirect('admin_dashboard')
            return redirect('home')
        else:
            messages.error(request, 'Invalid username or password.')
    else:
        form = AuthenticationForm()
        
    return render(request, 'login.html', {'form': form, 'next': next_url})

def signup_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Handle admin registration
            if request.POST.get('is_admin'):
                user.is_staff = True
                user.save()
            
            login(request, user)
            messages.success(request, f'Welcome, {user.username}! Your account has been created.')
            
            if user.is_staff:
                return redirect('admin_dashboard')
            return redirect('home')
        else:
            messages.error(request, 'Signup failed. Please correct the errors below.')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('home')

# --- Favorite API Views ---

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
            "image_url":   f.recipe.get_image_url,
            "chef":        f.recipe.get_chef_name,
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
