from django.shortcuts import render
from models import Config
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from tasks import save_config_to_venv
from rest_framework.response import Response
from django.core.serializers import serialize
from django.contrib.contenttypes.models import ContentType

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