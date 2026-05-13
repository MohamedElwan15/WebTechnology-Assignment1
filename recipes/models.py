from django.db import models
from django.contrib.auth.models import User


class Chef(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    specialty = models.CharField(max_length=200)
    img = models.CharField(max_length=500, blank=True, null=True) # External URL for now
    eyebrow = models.CharField(max_length=100, blank=True, null=True) # e.g. "Grill Master"
    biography = models.TextField(blank=True, null=True)
    philosophy = models.TextField(blank=True, null=True)
    facts = models.JSONField(default=dict, blank=True) # For Quick Facts table

    def __str__(self):
        return self.name

class Recipe(models.Model):
    recipe_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    course = models.CharField(max_length=100)
    description = models.TextField()

    # Use ImageField for better Django integration
    image = models.ImageField(upload_to='recipes/', blank=True, null=True)
    # Keep image_url for legacy/external images
    image_url = models.CharField(max_length=500, blank=True, null=True)

    chef = models.ForeignKey(Chef, on_delete=models.SET_NULL, related_name='recipes', null=True, blank=True)
    chef_name_legacy = models.CharField(max_length=200, blank=True, null=True)
    chef_img_legacy = models.CharField(max_length=500, blank=True, null=True)

    featured = models.BooleanField(default=False)

    ingredients = models.JSONField(default=list)
    steps = models.JSONField(default=list)

    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipes', null=True, blank=True)

    def __str__(self):
        return self.name

    @property
    def get_chef_name(self):
        if self.chef:
            return self.chef.name
        return self.chef_name_legacy or "Self-Made"

    @property
    def get_chef_img(self):
        if self.chef:
            return self.chef.img
        return self.chef_img_legacy or ""

    @property
    def get_image_url(self):
        if self.image:
            return self.image.url
        if self.image_url:
            if self.image_url.startswith('http'):
                return self.image_url
            # Handle relative paths like 'images/...' by prefixing with /static/
            return f"/static/{self.image_url}"
        return '/static/images/macarona.png' # Default image
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='favorited_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'recipe')

    def __str__(self):
        return f"{self.user.username} → {self.recipe.name}"
