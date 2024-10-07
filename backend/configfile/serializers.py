# from rest_framework import serializers
# from .models import *
# class SITVersionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = SITVersionModel
#         fields = "__all__"
# class SITSerializer(serializers.ModelSerializer):
#     sit_versions = SITVersionSerializer(many=True)
#     class Meta:
#         model = SITModel
#         fields = "__all__"
#     def create(self, validated_data):
#         sit_versions_data = validated_data.pop("sit_versions")
#         sit = SITModel.objects.create()
#         # Here, we have created an instance for SIT where all SIT versions sit.
#         # Each instance of the SITVersion have an association to SIT Model by using the sit attribute.
#         for sit_version_data in sit_versions_data:
#             sit_version = SITVersionModel.objects.create(**sit_version_data)
#             sit.sit_versions.add(sit_version)
#         return sit
#     def update(self, instance, validated_data):
#         # here, we need to do a couple of things.
#         # We already know what instance is being casked from the user.
#         # Take the instance object and clear its values.
#         # Take the validated_data and then use get_or_create to update/create the SITVersion object.
#         # Add the sit_versions to the instance object.
#         sit_versions_data = validated_data.pop("sit_versions")
#         instance.sit_versions.clear()
#         for sit_version_data in sit_versions_data:
#             sit_version, created = SITVersionModel.objects.get_or_create(
#                 **sit_version_data
#             )
#             instance.sit_versions.add(sit_version)
#         # Update and save any other fields in the instance
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()
#         return instance
# class STATSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = STATModel
#         fields = "__all__"
# # New serialization for Many to Many relationship with File Path and name
# class TestSuiteFilePathSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TestSuiteFilePath
#         fields = "__all__"
# class TestSuiteFileNameSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TestSuiteFileName
#         fields = "__all__"
# class TestSuiteSerializer(serializers.ModelSerializer):
#     test_suite_file_path = serializers.ListField(
#         child=serializers.CharField(max_length=550)
#     )
#     test_suite_file_name = serializers.ListField(
#         child=serializers.CharField(max_length=550)
#     )
#     class Meta:
#         model = TestSuitesPathModel
#         fields = "__all__"
# class SUTClientConfigSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = SUTClientConfigModel
#         fields = "__all__"
# class TestConfigSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TestConfigModel
#         fields = "__all__"
# class CTRLSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CTRLModel
#         fields = "__all__"
# class PythonPathSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PythonPathModel
#         fields = "__all__"
# class WaitConfigSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = WaitConfigModel
#         fields = "__all__"
# class EmailOptionsSerializer(serializers.ModelSerializer):
#     recipient_list = serializers.ListField(child=serializers.EmailField())
#     # recipient_list = serializers.ListField(child=serializers.EmailField())
#     # recipient_list = RecipientSerializer(many=True)
#     class Meta:
#         model = EmailOptionsModel
#         fields = "__all__"
#     def create(self, validated_data):
#         user_email = validated_data.get("user_email")
#         instance = EmailOptionsModel.objects.create(user_email=user_email)
#         recipient_list = validated_data.get("recipient_list")
#         print(f"Email received : {recipient_list}")
#         # for recipients in recipient_list:
#         #     instance.recipient_list.add(recipients)
#         instance.recipient_list = recipient_list
#         return instance
#     def update(self, instance, validated_data):
#         user_email = validated_data.get("user_email", instance.user_email)
#         recipient_list = validated_data.get("recipient_list", instance.recipient_list)
#         instance.user_email = user_email
#         instance.recipient_list.clear()
#         instance.recipient_list = recipient_list
#         instance.save()
# class ConfigurationSerializer(serializers.Serializer):
#     sit = SITSerializer()
#     stat = STATSerializer()
#     test_suites = TestSuiteSerializer()
#     sut_client_config = SUTClientConfigSerializer()
#     test_config = TestConfigSerializer()
#     ctrl_pkg = CTRLSerializer()
#     python_path = PythonPathSerializer()
#     wait_config = WaitConfigSerializer()
#     email_options = EmailOptionsSerializer()
#     class Meta:
#         model = ConfigurationModel
#         fields = "__all__"
#     def create(self, validated_data):
#         with transaction.atomic():
#             sit_data = validated_data.pop("sit")
#             sit = SITSerializer.create(SITSerializer(), validated_data=sit_data)
#             stat_data = validated_data.pop("stat")
#             stat = STATSerializer.create(STATSerializer(), validated_data=stat_data)
#             test_suites_data = validated_data.pop("test_suites")
#             test_suites = TestSuiteSerializer.create(
#                 TestSuiteSerializer(), validated_data=test_suites_data
#             )
#             sut_client_config_data = validated_data.pop("sut_client_config")
#             # SUTClientConfigModel
#             sut_client_config = SUTClientConfigSerializer.create(
#                 SUTClientConfigSerializer(), validated_data=sut_client_config_data
#             )
#             test_config_data = validated_data.pop("test_config")
#             test_config = TestConfigSerializer.create(
#                 TestConfigSerializer(), validated_data=test_config_data
#             )
#             ctrl_pkg_data = validated_data.pop("ctrl_pkg")
#             ctrl_pkg = CTRLSerializer.create(
#                 CTRLSerializer(), validated_data=ctrl_pkg_data
#             )
#             python_path_data = validated_data.pop("python_path")
#             python_path = PythonPathSerializer.create(
#                 PythonPathSerializer(), validated_data=python_path_data
#             )
#             wait_config_data = validated_data.pop("wait_config")
#             wait_config = WaitConfigSerializer.create(
#                 WaitConfigSerializer(), validated_data=wait_config_data
#             )
#             email_options_data = validated_data.pop("email_options")
#             email_options = EmailOptionsSerializer.create(
#                 EmailOptionsSerializer(), validated_data=email_options_data
#             )
#             # Create the Configuration instance with the related objects
#             configuration = ConfigurationModel.objects.create(
#                 sit=sit,
#                 stat=stat,
#                 sut_client_config=sut_client_config,
#                 test_config=test_config,
#                 ctrl_pkg=ctrl_pkg,
#                 python_path=python_path,
#                 wait_config=wait_config,
#                 email_options=email_options,
#                 test_suites=test_suites,
#             )
#         print("Atomic transaction successful, configuration file saved!")
#         return configuration
#     def update(self, instance, validated_data):
#         with transaction.atomic():
#             sit_data = validated_data.pop("sit")
#             SITSerializer.update(SITSerializer(), instance.sit, validated_data=sit_data)
#             stat_data = validated_data.pop("stat")
#             STATSerializer.update(
#                 STATSerializer(), instance.stat, validated_data=stat_data
#             )
#             test_suites_data = validated_data.pop("test_suites")
#             instance.test_suites.clear()
#             test_suites = TestSuiteSerializer.update(
#                 TestSuiteSerializer(),
#                 instance.test_suites,
#                 validated_data=test_suites_data,
#             )
#             sut_client_config_data = validated_data.pop("sut_client_config")
#             TestSuiteSerializer.update(
#                 TestSuiteSerializer(),
#                 instance.sut_client_config_data,
#                 validated_data=sut_client_config_data,
#             )
#             test_config_data = validated_data.pop("test_config")
#             TestConfigSerializer.update(
#                 TestConfigSerializer(),
#                 instance.test_config_data,
#                 validated_data=test_config_data,
#             )
#             ctrl_pkg_data = validated_data.pop("ctrl_pkg")
#             CTRLSerializer.update(
#                 CTRLSerializer(), instance.ctrl_pkg_data, validated_data=ctrl_pkg_data
#             )
#             python_path_data = validated_data.pop("python_path")
#             PythonPathSerializer.update(
#                 PythonPathSerializer(),
#                 instance.python_path_data,
#                 validated_data=python_path_data,
#             )
#             wait_config_data = validated_data.pop("wait_config")
#             WaitConfigSerializer.update(
#                 WaitConfigSerializer(),
#                 instance.wait_config_data,
#                 validated_data=wait_config_data,
#             )
#             email_options_data = validated_data.pop("email_options")
#             EmailOptionsSerializer.update(
#                 EmailOptionsSerializer(),
#                 instance.email_options_data,
#                 validated_data=email_options_data,
#             )
#             # Update the main configuration instance
#             for attr, value in instance.items():
#                 setattr(instance, attr, value)
#             instance.save()
#         return instance
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import *


class SITVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SITVersionModel
        fields = "__all__"


class SITSerializer(serializers.ModelSerializer):
    sit_versions = SITVersionSerializer(many=True)

    class Meta:
        model = SITModel
        fields = "__all__"

    def create(self, validated_data):
        sit_versions_data = validated_data.pop("sit_versions")
        sit = SITModel.objects.create(**validated_data)
        for sit_version_data in sit_versions_data:
            sit_version = SITVersionModel.objects.create(**sit_version_data)
            sit.sit_versions.add(sit_version)
        return sit

    def update(self, instance, validated_data):
        sit_versions_data = validated_data.pop("sit_versions")
        instance.sit_versions.clear()
        for sit_version_data in sit_versions_data:
            sit_version, _ = SITVersionModel.objects.get_or_create(**sit_version_data)
            instance.sit_versions.add(sit_version)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class STATSerializer(serializers.ModelSerializer):
    class Meta:
        model = STATModel
        fields = "__all__"


class TestSuiteFilePathSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestSuiteFilePath
        fields = "__all__"


class TestSuiteFileNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestSuiteFileName
        fields = "__all__"


class TestSuiteSerializer(serializers.ModelSerializer):
    test_suite_file_path = serializers.ListField(
        child=serializers.CharField(max_length=550)
    )
    test_suite_file_name = serializers.ListField(
        child=serializers.CharField(max_length=550)
    )

    class Meta:
        model = TestSuitesPathModel
        fields = "__all__"


class SUTClientConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SUTClientConfigModel
        fields = "__all__"


class TestConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestConfigModel
        fields = "__all__"


class CTRLSerializer(serializers.ModelSerializer):
    class Meta:
        model = CTRLModel
        fields = "__all__"


class PythonPathSerializer(serializers.ModelSerializer):
    class Meta:
        model = PythonPathModel
        fields = "__all__"


class WaitConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaitConfigModel
        fields = "__all__"


class EmailOptionsSerializer(serializers.ModelSerializer):
    recipient_list = serializers.ListField(child=serializers.EmailField())

    class Meta:
        model = EmailOptionsModel
        fields = "__all__"

    def create(self, validated_data):
        recipient_list = validated_data.pop("recipient_list", [])
        instance = EmailOptionsModel.objects.create(**validated_data)
        instance.recipient_list = recipient_list
        instance.save()
        return instance

    def update(self, instance, validated_data):
        instance.user_email = validated_data.get("user_email", instance.user_email)
        instance.recipient_list = validated_data.get(
            "recipient_list", instance.recipient_list
        )
        instance.save()
        return instance


class ConfigurationSerializer(serializers.ModelSerializer):
    sit = SITSerializer()
    stat = STATSerializer()
    test_suites = TestSuiteSerializer()
    sut_client_config = SUTClientConfigSerializer()
    test_config = TestConfigSerializer()
    ctrl_pkg = CTRLSerializer()
    python_path = PythonPathSerializer()
    wait_config = WaitConfigSerializer()
    email_options = EmailOptionsSerializer()

    class Meta:
        model = ConfigurationModel
        fields = "__all__"

    def create(self, validated_data):
        with transaction.atomic():
            sit_data = validated_data.pop("sit")
            sit = SITSerializer.create(SITSerializer(), validated_data=sit_data)

            stat_data = validated_data.pop("stat")
            stat = STATSerializer.create(STATSerializer(), validated_data=stat_data)

            test_suites_data = validated_data.pop("test_suites")
            test_suites = TestSuiteSerializer.create(
                TestSuiteSerializer(), validated_data=test_suites_data
            )

            sut_client_config_data = validated_data.pop("sut_client_config")
            sut_client_config = SUTClientConfigSerializer.create(
                SUTClientConfigSerializer(), validated_data=sut_client_config_data
            )

            test_config_data = validated_data.pop("test_config")
            test_config = TestConfigSerializer.create(
                TestConfigSerializer(), validated_data=test_config_data
            )

            ctrl_pkg_data = validated_data.pop("ctrl_pkg")
            ctrl_pkg = CTRLSerializer.create(
                CTRLSerializer(), validated_data=ctrl_pkg_data
            )

            python_path_data = validated_data.pop("python_path")
            python_path = PythonPathSerializer.create(
                PythonPathSerializer(), validated_data=python_path_data
            )

            wait_config_data = validated_data.pop("wait_config")
            wait_config = WaitConfigSerializer.create(
                WaitConfigSerializer(), validated_data=wait_config_data
            )

            email_options_data = validated_data.pop("email_options")
            email_options = EmailOptionsSerializer.create(
                EmailOptionsSerializer(), validated_data=email_options_data
            )

            configuration = ConfigurationModel.objects.create(
                sit=sit,
                stat=stat,
                sut_client_config=sut_client_config,
                test_config=test_config,
                ctrl_pkg=ctrl_pkg,
                python_path=python_path,
                wait_config=wait_config,
                email_options=email_options,
                test_suites=test_suites,
            )

        return configuration

    def update(self, instance, validated_data):
        with transaction.atomic():
            sit_data = validated_data.pop("sit")
            SITSerializer.update(SITSerializer(), instance.sit, validated_data=sit_data)

            stat_data = validated_data.pop("stat")
            STATSerializer.update(
                STATSerializer(), instance.stat, validated_data=stat_data
            )

            test_suites_data = validated_data.pop("test_suites")
            TestSuiteSerializer.update(
                TestSuiteSerializer(),
                instance.test_suites,
                validated_data=test_suites_data,
            )

            sut_client_config_data = validated_data.pop("sut_client_config")
            SUTClientConfigSerializer.update(
                SUTClientConfigSerializer(),
                instance.sut_client_config,
                validated_data=sut_client_config_data,
            )

            test_config_data = validated_data.pop("test_config")
            TestConfigSerializer.update(
                TestConfigSerializer(),
                instance.test_config,
                validated_data=test_config_data,
            )

            ctrl_pkg_data = validated_data.pop("ctrl_pkg")
            CTRLSerializer.update(
                CTRLSerializer(), instance.ctrl_pkg, validated_data=ctrl_pkg_data
            )

            python_path_data = validated_data.pop("python_path")
            PythonPathSerializer.update(
                PythonPathSerializer(),
                instance.python_path,
                validated_data=python_path_data,
            )

            wait_config_data = validated_data.pop("wait_config")
            WaitConfigSerializer.update(
                WaitConfigSerializer(),
                instance.wait_config,
                validated_data=wait_config_data,
            )

            email_options_data = validated_data.pop("email_options")
            EmailOptionsSerializer.update(
                EmailOptionsSerializer(),
                instance.email_options,
                validated_data=email_options_data,
            )

            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            instance.save()

        return instance


class YamlFormatConfigFileModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = YamlFormatConfigFileModel
        fields = ["name", "content", "description", "id", "modified_at"]
        read_only_fields = ["id", "modified_at"]

    def create(self, validated_data):
        # user = validated_data.pop("user")
        user = self.context["user"]
        print("Validated data is : ", validated_data)
        instance = YamlFormatConfigFileModel.objects.create(user=user, **validated_data)
        return instance

    def update(self, instance, validated_data):
        with transaction.atomic():
            instance.name = validated_data.get("name", instance.name)
            instance.content = validated_data.get("content", instance.content)
            # instance.modified_at = timezone.now()
            instance.description = validated_data.get(
                "description", instance.description
            )
            instance.save()
        return instance
