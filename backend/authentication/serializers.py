from rest_framework import serializers
from .models import User, HealthProfile


class HealthProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthProfile
        fields = ["specialty", "council_number"]


class UserSerializer(serializers.ModelSerializer):
    health_prof = HealthProfileSerializer(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "password",
            "health_prof",
        ]
        extra_kwargs = {
            "password": {"write_only": True, "style": {"input_type": "password"}}
        }

    def create(self, validated_data):
        profile_data = validated_data.pop("health_prof", None)
        # Usa create_user para garantir que a senha seja hasheada
        user = User.objects.create_user(**validated_data)

        # Se for profissional e houver dados, cria o perfil
        if user.role == "health_prof" and profile_data:
            HealthProfile.objects.create(user=user, **profile_data)
        # Se for profissional mas não houver dados, gera um erro
        elif user.role == "health_prof" and not profile_data:
            user.delete()  # Remove o usuário criado incorretamente
            raise serializers.ValidationError(
                "Dados do perfil profissional são obrigatórios."
            )

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("health_prof", None)
        password = validated_data.pop("password", None)

        instance = super().update(instance, validated_data)

        if password:
            instance.set_password(password)  # Hash da nova senha
            instance.save()

        # Atualiza ou cria o perfil profissional, se for o caso
        if instance.role == "health_prof":
            if profile_data:
                profile, created = HealthProfile.objects.update_or_create(
                    user=instance, defaults=profile_data
                )

        return instance
