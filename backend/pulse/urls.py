from django.urls import path

from .views import index, index_dynamic

urlpatterns = [
    path("", index, name="index"),
    path("<int:page_number>/", index_dynamic, name="index_paged"),
]
