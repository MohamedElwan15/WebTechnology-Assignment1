from django.db import models


class Recipe(models.Model):
    recipe_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    course = models.CharField(max_length=100)
    description = models.TextField()

    image_url = models.CharField(max_length=500, blank=True, null=True)

    chef = models.CharField(max_length=200, blank=True, null=True)
    chef_img = models.CharField(max_length=500, blank=True, null=True)

    featured = models.BooleanField(default=False)

    ingredients = models.JSONField(default=list)
    steps = models.JSONField(default=list)

    def __str__(self):
        return self.name