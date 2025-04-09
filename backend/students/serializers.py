from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            "id",
            "name",
            "cgm",
            "dob",
            "gender",
            "guardian",
            "guardian_cpf",
            "address",
            "cep",
            "city",
            "state",
            "created_at",
            "updated_at",
            "active",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
