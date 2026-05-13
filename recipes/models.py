from django.db import models
from django.contrib.auth.models import User

class Recipe(models.Model):
    recipe_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    course = models.CharField(max_length=100)
    description = models.TextField()

    # Use ImageField for better Django integration
    image = models.ImageField(upload_to='recipes/', blank=True, null=True)
    # Keep image_url for legacy/external images
    image_url = models.CharField(max_length=500, blank=True, null=True)

    chef = models.CharField(max_length=200, blank=True, null=True)
    chef_img = models.CharField(max_length=500, blank=True, null=True)

    featured = models.BooleanField(default=False)

    ingredients = models.JSONField(default=list)
    steps = models.JSONField(default=list)

    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipes', null=True, blank=True)

    def __str__(self):
        return self.name

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