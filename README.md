# FCAI - SOFRA | Egyptian Culinary Excellence

FCAI-SOFRA is a dynamic web application dedicated to showcasing the rich culinary heritage of Egypt. It features recipes from celebrated Egyptian chefs, allowing users to discover, search, and save their favorite dishes in a modern, responsive environment.

## 🚀 Key Features

- **Immersive Entry Page:** A full-screen, high-impact welcome experience for new visitors.
- **Dynamic Chef Profiles:** Dedicated pages for each chef featuring their biography, quick facts, and full recipe catalog.
- **Server-Side Search:** A robust, database-driven search engine that filters by dish name, ingredients, or chef.
- **Recipe Management:** Full CRUD (Create, Read, Update, Delete) capabilities for authorized chefs/staff.
- **User System:** Role-based authentication (Regular User vs. Chef/Staff) with personalized "My Favorites" saving.
- **Modern UI:** Adaptive Dark/Light mode theme with high-contrast hero sections.

## 🛠️ Tech Stack

- **Backend:** Python 3.x, Django 5.x
- **Frontend:** Vanilla CSS (Custom properties, Grid, Flexbox), JavaScript (ES6+)
- **Database:** SQLite (Default for development)
- **Icons/Fonts:** FontAwesome 6, Google Fonts (Playfair Display, DM Sans)

## 📥 Getting Started

### 1. Prerequisites
Ensure you have Python installed. It is recommended to use a virtual environment.

### 2. Installation
```bash
# Clone the repository (or navigate to the folder)
cd WebTechnology-Assignment1

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install django
```

### 3. Database Setup
```bash
# Apply migrations
python manage.py migrate

# Load initial chef data
python manage.py load_chefs
```

### 4. Running the Server
```bash
python manage.py runserver
```
Visit `http://127.0.0.1:8000` to view the application.

## 📂 Project Structure

- `recipes/`: Core application logic (Models, Views, URLs).
- `root_config/`: Django project settings and routing.
- `static/`: Global CSS, JS, and asset files.
- `templates/`: Django HTML templates (Base, Home, Search, Profiles).
- `media/`: User-uploaded recipe images.

---
*Developed for Web Technology Course - Assignment 1*
