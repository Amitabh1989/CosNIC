from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from rest_framework import permissions, status, viewsets
from rest_framework.authentication import BasicAuthentication, SessionAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    ConfigurationModel,
    CTRLModel,
    EmailOptionsModel,
    PythonPathModel,
    SITModel,
    SITVersionModel,
    STATModel,
    SUTClientConfigModel,
    TestConfigModel,
    # TestSuiteModel,
    TestSuitesPathModel,
    WaitConfigModel,
    YamlFormatConfigFileModel,
)
from .serializers import (
    ConfigurationSerializer,
    CTRLSerializer,
    EmailOptionsSerializer,
    PythonPathSerializer,
    SITSerializer,
    SITVersionSerializer,
    STATSerializer,
    SUTClientConfigSerializer,
    TestConfigSerializer,
    TestSuiteSerializer,
    WaitConfigSerializer,
    YamlFormatConfigFileModelSerializer,
)

# Create your views here.


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.method in permissions.SAFE_METHODS or request.user.is_authenticated
        )


class ConfigurationView(viewsets.ModelViewSet):
    queryset = ConfigurationModel.objects.all()
    serializer_class = ConfigurationSerializer


class EmailOptionsView(viewsets.ModelViewSet):
    queryset = EmailOptionsModel.objects.all()
    serializer_class = EmailOptionsSerializer


class DownloadConfigFile(APIView):
    permission_classes = []

    def get(self, request, pk=None, *args, **kwargs):
        config = get_object_or_404(ConfigurationModel, pk=pk)
        serializer = ConfigurationSerializer(config)
        response = JsonResponse(serializer.data, status=status.HTTP_200_OK)
        response["Content-Disposition"] = f'attachment; filename="config_{pk}.json"'
        return response


class YamlConfigFileViewSet(viewsets.ModelViewSet):
    queryset = YamlFormatConfigFileModel.objects.all()
    serializer_class = YamlFormatConfigFileModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    # authentication_classes = [SessionAuthentication, BasicAuthentication]
    # authentication_classes = [SessionAuthentication, BasicAuthentication]

    def create(self, request, *args, **kwargs):
        user = request.user
        print(f"User of the request is  : {request.user}")
        data_to_serialize = {
            # "user": user,
            "content": request.data.get("content"),
            "name": request.data.get("name"),
            "description": request.data.get("description"),
        }
        serializer = self.serializer_class(
            data=data_to_serialize, context={"user": user}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        data_to_send = {
            **serializer.data,
            "id": serializer.instance.id,
            "version": serializer.instance.version,
            "modified_at": serializer.instance.modified_at,
        }
        return Response(data_to_send, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        # user = request.user
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        print("Config file serializer data is ", serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None, *args, **kwargs):
        print("request is ", request)
        record = self.get_object()
        serializer = self.get_serializer(record)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, pk=None, *args, **kwargs):
        print("request is ", request.data)
        print("request user ", request.user)
        record = self.get_object()
        serializer = self.get_serializer(record, data=request.data)
        # serializer.is_valid(raise_exception=True)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            print("Validation errors: ", e.detail)  # Print the validation errors
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None, *args, **kwargs):
        obj = self.get_object(id=pk)
        obj.delete()
        return Response({"message": "Deleted"}, status=status.HTTP_200_OK)
