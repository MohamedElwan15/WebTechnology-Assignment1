from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User

class AuthTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.signup_url = reverse('signup')
        self.login_url = reverse('login')
        self.home_url = reverse('home')
        self.dashboard_url = reverse('admin_dashboard')

    def test_signup_regular_user(self):
        response = self.client.post(self.signup_url, {
            'username': 'newuser',
            'password1': 'Password123!',
            'password2': 'Password123!',
        })
        self.assertRedirects(response, self.home_url)
        self.assertTrue(User.objects.filter(username='newuser').exists())
        user = User.objects.get(username='newuser')
        self.assertFalse(user.is_staff)

    def test_signup_admin_user(self):
        response = self.client.post(self.signup_url, {
            'username': 'adminuser',
            'password1': 'Password123!',
            'password2': 'Password123!',
            'is_admin': 'on',
        })
        self.assertRedirects(response, self.dashboard_url)
        self.assertTrue(User.objects.filter(username='adminuser').exists())
        user = User.objects.get(username='adminuser')
        self.assertTrue(user.is_staff)

    def test_login_redirect_non_staff(self):
        user = User.objects.create_user(username='testuser', password='password123')
        response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'password123',
        })
        self.assertRedirects(response, self.home_url)

    def test_login_redirect_staff(self):
        user = User.objects.create_user(username='staffuser', password='password123', is_staff=True)
        response = self.client.post(self.login_url, {
            'username': 'staffuser',
            'password': 'password123',
        })
        self.assertRedirects(response, self.dashboard_url)

    def test_login_with_next(self):
        user = User.objects.create_user(username='testuser', password='password123')
        next_url = '/favorites/'
        response = self.client.post(f"{self.login_url}?next={next_url}", {
            'username': 'testuser',
            'password': 'password123',
            'next': next_url
        })
        self.assertRedirects(response, next_url)
