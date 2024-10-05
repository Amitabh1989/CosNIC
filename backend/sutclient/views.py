from typing import Never
from django.contrib.contenttypes.models import ContentType
from django.core.serializers import serialize
from django.shortcuts import render
from models import Config, YamlConfigFile
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from tasks import save_config_to_venv
from .serializers import YamlConfigFileSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

# Create your views here.


class DownloadSUTClientFile(APIView):
    def get(self, request, *args, **kwargs):
        config_id = request.data.get("config_id", False)
        # config = Config.objects.first()
        if config_id:
            try:
                # Generate temporary filename for the YAML file
                filename = f"config_{config_id}.yaml"
                save_config_to_yaml(config_id, filename)

                # Open the generated YAML file and read its content
                with open(filename, 'r') as file:
                yaml_data = file.read()

                response = Response(yaml_data, content_type="application/octet-stream", status=status.HTTP_200_OK)
                response["Content-Disposition"] = 'attachment; filename="config.yaml"'
                return response

            except Config.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            finally:
                # Clean up the temporary YAML file (optional)
                # os.remove(filename)
                pass

        return Response(status=status.HTTP_400_BAD_REQUEST)  # Handle missing config_id


class YamlConfigFileViewSet(viewsets.ModelViewSet):
    queryset = YamlConfigFile.objects.all()
    serializer_class = YamlConfigFileSerializer
    # http_method_names = ['get', 'post', 'head', 'options', 'put', 'delete']
    lookup_field = 'id'
    lookup_url_kwarg = 'id'
    permission_classes = [IsAuthenticated]
    # authentication_classes = [SessionAuthentication, BasicAuthentication]

    def list(self, request, *args, **kwargs):
        queryset: Never = self.get_queryset()
        serializer: Never = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None, *args, **kwargs):
        print("Request is : {request}")
        print("PK is : {pk}")
        record = self.get_object(id=pk)
        serializer = self.get_serializer(record)
        return Response(serializer.data)

    def update(self, request, pk=None, *args, **kwargs):
        record = self.get_object(id=pk)
        serializer: Never = self.get_serializer(record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        record = self.get_object(id=pk)
        record.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


