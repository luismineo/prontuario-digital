import uuid
from django.db import models
from django.core.validators import RegexValidator

# Create your models here.


class Student(models.Model):
    GENDER_CHOICES = (("M", "Male"), ("F", "Female"), ("O", "Other"))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    name = models.CharField(max_length=200)
    cgm = models.CharField(max_length=10)
    dob = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)

    guardian = models.CharField(max_length=100)
    guardian_cpf = models.CharField(
        max_length=11,
        validators=[
            RegexValidator(
                r"^\d{11}$", message=("Invalid CPF. Must contain exactly 11 digits.")
            )
        ],
    )

    address = models.CharField(max_length=200)
    cep = models.CharField(
        max_length=8,
        validators=[
            RegexValidator(
                r"^\d{8}$",
                message=("Invalid postal code. Must contain exactly 8 digits."),
            )
        ],
    )
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)

    def save(self, *args, **kwargs):
        self.guardian_cpf = "".join(filter(str.isdigit, self.guardian_cpf))
        self.cep = "".join(filter(str.isdigit, self.cep))
        super().save(*args, **kwargs)

    def soft_delete(self):
        self.active = False
        self.save()

    def __str__(self):
        return self.name
