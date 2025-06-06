from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        # Verifica se o usuário está autenticado e se tem o papel 'admin'
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsHealthProfessionalUser(permissions.BasePermission):
    def has_permission(self, request, view):
        # Verifica se o usuário está autenticado E se tem o papel 'health_prof'
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "health_prof"
        )


class IsAdminOrHealthProfessional(permissions.BasePermission):
    def has_permission(self, request, view):
        # mesma coisa aqui, mas é para as views que ambos os papeis podem usar
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.role == "health_prof")
        )
