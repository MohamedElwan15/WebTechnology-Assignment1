import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from recipes.models import Recipe


class Command(BaseCommand):
    help = 'Load recipes from recipes.json into the Django database'

    def handle(self, *args, **kwargs):
        json_file_path = os.path.join(settings.BASE_DIR, 'recipes', 'recipes.json')

        if not os.path.exists(json_file_path):
            self.stdout.write(self.style.ERROR(f"Could not find recipes.json at {json_file_path}"))
            return

        with open(json_file_path, 'r', encoding='utf-8') as file:
            recipes_data = json.load(file)

        for item in recipes_data:

            recipe, created = Recipe.objects.get_or_create(
                recipe_id=item['id'],
                defaults={
                    'name': item['name'],
                    'course': item['course'],
                    'description': item['description'],
                    'image_url': item.get('imageUrl', ''),
                    'chef_name_legacy': item.get('chef', ''),
                    'chef_img_legacy': item.get('chefImg', ''),
                    'featured': item.get('featured', False),
                    'ingredients': item.get('ingredients', []),
                    'steps': item.get('steps', [])
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Successfully added recipe: {recipe.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Recipe already exists: {recipe.name}"))

        self.stdout.write(self.style.SUCCESS('Data import complete!'))