from django.contrib import admin
from .models import Student


# Register your models here.
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ["name", "cgm", "dob", "active"]
    search_fields = ["name", "cgm"]
    readonly_fields = ["id"]

    actions = ["restore_inactive_student"]

    def restore_inactive_student(self, request, queryset):
        queryset.update(active=True)
        self.message_user(
            request, f"{queryset.count()} estudantes restaurados com sucesso."
        )
        self.short_description = "Restaurar estudantes selecionados"

    def get_queryset(self, request):
        return Student.objects.all()
