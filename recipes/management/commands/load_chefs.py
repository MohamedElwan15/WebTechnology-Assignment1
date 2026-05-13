from django.core.management.base import BaseCommand
from recipes.models import Chef, Recipe
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Populate Chef data and link existing recipes'

    def handle(self, *args, **options):
        chefs_data = [
            {
                "name": "Chef El Sherbiny",
                "specialty": "Egyptian & Oriental Cuisine",
                "img": "https://assets.minly.com/assets/avatars/zPtgfPwF2LsozVn2g6MEl.jpg",
                "eyebrow": "Master Chef",
                "biography": (
                    "Chef El Sherbiny, whose full name is Abdel-Samea Mohamed Ali El-Sherbiny, is one of the most recognized and beloved chefs in Egypt and the wider Arab world. "
                    "His passion for cooking was not self-discovered — it was inherited. His father served as executive chef at the Armed Forces Officers Club in Zamalek... "
                    "El Sherbiny pursued his culinary education formally, graduating from the Faculty of Tourism and Hotel Management in Italy."
                ),
                "philosophy": (
                    "El Sherbiny believes that food presentation is as important as flavor. He has long argued that Egyptian and oriental cuisine deserves "
                    "the same visual care and refinement given to French or Italian cooking."
                ),
                "facts": {
                    "Full Name": "Abdel-Samea Mohamed Ali El-Sherbiny",
                    "Nationality": "Egyptian",
                    "Specialty": "Oriental Egyptian Cuisine, East-West Fusion Presentation",
                    "Education": "Faculty of Tourism and Hotel Management, Italy",
                    "Notable Positions": "Master Chef, Ramses Hilton Hotel, Cairo",
                    "Television": "Egyptian satellite TV cooking shows"
                }
            },
            {
                "name": "Chef Hassan",
                "specialty": "Grills & Main Courses",
                "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJYSpXwt07ODmH4Lw1r8uQLuTHqijHV-bZmA&s",
                "eyebrow": "Grill Master",
                "biography": (
                    "Chef Hassan has built his reputation on a philosophy that is as straightforward as his cooking: "
                    "the best food starts with honest ingredients, treated with respect and seasoned with knowledge passed down through generations."
                ),
                "philosophy": (
                    "For Chef Hassan, authenticity is not nostalgia — it is a standard. He is a firm believer that the flavors of traditional Egyptian cooking "
                    "require no modernization, only proper execution."
                ),
                "facts": {
                    "Name": "Chef Hassan",
                    "Nationality": "Egyptian",
                    "Specialty": "Grilled Meats, Slow-Cooked Stews, Traditional Egyptian Main Dishes",
                    "Style": "Bold spices, open-fire cooking, rustic Egyptian tradition",
                    "Known For": "Kofta, Ouzi, Hawawshi, and hearty rice-based dishes"
                }
            },
            {
                "name": "Chef Nadia El Sayed",
                "specialty": "Desserts, Pastries & International Cuisine",
                "img": "https://yt3.googleusercontent.com/wEwWYlGQVCpenDDdkc_CNYQiFHzzixW6Bd7gGlGrOlbnq3XpPzytMa3mOq48Wxcj_qOx1xmXOw=s900-c-k-c0x00ffffff-no-rj",
                "eyebrow": "Digital Culinary Icon",
                "biography": (
                    "Chef Nadia El Sayed is one of Egypt's most prominent and widely followed culinary figures. "
                    "Though she now lives and works from the United States — based in Los Angeles, California — her audience remains overwhelmingly Egyptian."
                ),
                "philosophy": (
                    "Nadia El Sayed's philosophy centers on inclusivity and practicality. She believes that great food should not be gated behind "
                    "hard-to-find ingredients or expensive equipment."
                ),
                "facts": {
                    "Full Name": "Nadia El Sayed",
                    "Nationality": "Egyptian",
                    "Based In": "Los Angeles, California, United States",
                    "Specialty": "Desserts, Pastries, International Cuisine with Egyptian Adaptations",
                    "Known For": "Accessible, precise recipes with Egyptian ingredient alternatives",
                    "Following": "Over 35 million across social platforms"
                }
            }
        ]

        for data in chefs_data:
            chef, created = Chef.objects.get_or_create(
                slug=slugify(data['name']),
                defaults={
                    'name': data['name'],
                    'specialty': data['specialty'],
                    'img': data['img'],
                    'eyebrow': data['eyebrow'],
                    'biography': data['biography'],
                    'philosophy': data['philosophy'],
                    'facts': data['facts'],
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created chef: {chef.name}'))
            else:
                self.stdout.write(f'Chef already exists: {chef.name}')

            # Link recipes
            updated_count = Recipe.objects.filter(chef_name_legacy=chef.name).update(chef=chef)
            self.stdout.write(f'Linked {updated_count} recipes to {chef.name}')

        self.stdout.write(self.style.SUCCESS('Finished loading chefs.'))
