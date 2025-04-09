from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from students import views

urlpatterns = [
    path("students/", views.student_list),
    path("students/<uuid:pk>/", views.student_detail),
    path("students/inactive/", views.inactive_student_list),
    path("students/<uuid:pk>/restore/", views.restore_inactive_student),
]

urlpatterns = format_suffix_patterns(urlpatterns)
