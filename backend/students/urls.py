from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from students import views

urlpatterns = [
    path("api/students/", views.student_list),
    path("api/students/<uuid:pk>/", views.student_detail),
    path("api/students/inactive/", views.inactive_student_list),
    path("api/students/<uuid:pk>/restore/", views.restore_inactive_student),
]

urlpatterns = format_suffix_patterns(urlpatterns)
