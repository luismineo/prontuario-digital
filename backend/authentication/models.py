from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.


class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Administrador"),
        ("manager", "Gestor"),
        ("health_prof", "Profissional da Saúde"),
    )

    role = models.CharField(max_length=11, choices=ROLE_CHOICES)

class HealthProfile(models.Model):
    ESPECIALITY_CHOICES = (
        ("psychologist", "Psicologia"),
        ("physiotherapist", "Fisioterapia"),
        ("social_worker", "Assistencia Social"),
        ("speech_therapist", "Fonoaudiologia"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    council_number = models.CharField(max_length=20)

