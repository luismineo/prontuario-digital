from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Student
from .serializers import StudentSerializer

# Create your views here.


@api_view(["GET", "POST"])
def student_list(request, format=None):
    if request.method == "GET":
        students = Student.objects.filter(active=True)
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
def student_detail(request, pk, format=None):
    try:
        student = Student.objects.get(pk=pk)
    except Student.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = StudentSerializer(student)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = StudentSerializer(student, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        if student.active:
            student.soft_delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(
                {"detail": "Student already inactive"},
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["GET"])
def inactive_student_list(request, format=None):
    if request.method == "GET":
        students = Student.objects.filter(active=False)
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)


@api_view(["PUT"])
def restore_inactive_student(request, pk, format=None):
    try:
        student = Student.objects.get(pk=pk)
    except Student.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "PUT":
        if not student.active:
            student.active = True
            student.save()
            serializer = StudentSerializer(student) # serializa sem os dados da requisição
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {"detail": "Student is alredy active"},
                status=status.HTTP_400_BAD_REQUEST,
            )
