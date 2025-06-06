from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import viewsets
from .models import User
from .serializers import UserSerializer
from .permissions import IsAdminUser

# Create your views here.


class CustomAuthToken(ObtainAuthToken):
    # View de Login: Recebe email e senha, retorna Token.
    def post(self, request, *args, **kwargs):
        # Usa o serializer padrão do DRF
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)

        # Retorna o token e a role dele (importante para as pemissoes)
        return Response(
            {
                "token": token.key,
                "user_id": user.pk,
                "email": user.email,
                "role": user.role,
            }
        )


class UserViewSet(viewsets.ModelViewSet):
    # Endpoint para admins gerenciarem users
    queryset = User.objects.all().order_by("first_name")
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] 
