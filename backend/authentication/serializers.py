from rest_framework import serializers
from .models import User, HealthProfile


class HealthProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthProfile
        fields = ["specialty", "council_number"]


class UserSerializer(serializers.ModelSerializer):
    health_profile = HealthProfileSerializer(required=False, allow_null=True)

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
            "health_profile",
        ]
        extra_kwargs = {
            "password": {"write_only": True, "style": {"input_type": "password"}},
            "username": {"required": False},
        }

    def create(self, validated_data):
        """
        O pop aqui separa o health_profile do restante do payload
        Pq users não possuem esse campo, então causaria erro no create user
        Caso a chave esteja vazia o valor padrão é None
        """
        profile_data = validated_data.pop("health_profile", None)

        """
        Caso username não seja passado no payload
        Geração de username automático: nome.role 
        Usuário padrão do Django pede um username
        """
        if not validated_data.get("username"):
            role_map = {"admin": "adm", "manager": "man", "health_prof": "hp"}
            first_name = validated_data.get("first_name", "").lower()
            role = validated_data.get("role", "")

            base_username = f"{first_name}.{role_map.get(role, role)}"
            username = base_username
            counter = 1

            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            validated_data["username"] = username

        # Usa create_user para garantir que a senha seja hasheada
        user = User.objects.create_user(**validated_data)

        # Se for profissional e houver dados, cria o perfil na tabela de health_profile
        if user.role == "health_profile" and profile_data:
            HealthProfile.objects.create(user=user, **profile_data)
        # Se for profissional mas não houver dados, gera um erro
        elif user.role == "health_profile" and not profile_data:
            user.delete()  # Remove o usuário criado incorretamente
            raise serializers.ValidationError(
                "Dados do perfil profissional são obrigatórios."
            )

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("health_profile", None)
        password = validated_data.pop("password", None)

        instance = super().update(instance, validated_data)

        if password:
            instance.set_password(password)  # Hash da nova senha
            instance.save()

        # Atualiza ou cria o perfil profissional, se for o caso
        if instance.role == "health_profile":
            if profile_data:
                profile, created = HealthProfile.objects.update_or_create(
                    user=instance, defaults=profile_data
                )

        return instance
