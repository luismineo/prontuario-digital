from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Student
from .serializers import StudentSerializer
from authentication.permissions import IsAdminUser, AdminWriteHealthProfRead


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.filter(active=True).order_by("name")
    serializer_class = StudentSerializer
    permission_classes = [AdminWriteHealthProfRead]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        student = self.get_object()
        if student.active:
            student.updated_by = request.user
            student.soft_delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(
                {"detail": "Student already inactive"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["get"], permission_classes=[IsAdminUser])
    def inactive(self, request):
        students = Student.objects.filter(active=False).order_by("name")
        serializer = self.get_serializer(students, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["put"], permission_classes=[IsAdminUser])
    def restore(self, request, pk=None):
        student = self.get_object()
        if not student.active:
            student.active = True
            student.updated_by = request.user
            student.save()
            serializer = self.get_serializer(student)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {"detail": "Student is already active"},
                status=status.HTTP_400_BAD_REQUEST,
            )
