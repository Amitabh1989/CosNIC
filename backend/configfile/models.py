from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils import timezone

# https://testdriven.io/blog/drf-serializers/

# Create your models here.

"""
SITS:
    SIT_1:
        SIT_VERSIONS:
            stream: '231.1'
            old_version: 231.1.116.0543
            current_version: 231.1.118.0
"""


# class SITVersionModel(models.Model):
#     """
#     SIT_VERSIONS:
#         stream: '231.1'
#         old_version: 231.1.116.0543
#         current_version: 231.1.118.0
#     """

#     stream = models.CharField(max_length=100)
#     old_version = models.CharField(max_length=100)
#     current_version = models.CharField(max_length=100)


# class SITModel(models.Model):
#     """
#     Many-to-Many (ManyToManyField):
#     Each record in the first table can be linked to many records in the second table, and vice versa.
#     Example: A student can enroll in many courses, and each course can have many students.
#     """

#     sit_versions = models.ManyToManyField(SITVersionModel)


# class STATModel(models.Model):
#     stat_cli_path = models.CharField(max_length=550)
#     xml_file_paths = models.CharField(max_length=550)


# class TestSuiteFilePath(models.Model):
#     test_suite_file_path = models.CharField(max_length=550)


# class TestSuiteFileName(models.Model):
#     test_suite_file_name = models.CharField(max_length=550)


# class TestSuitesPathModel(models.Model):
#     test_suite_file_path = ArrayField(models.CharField(max_length=550), default=list)
#     test_suite_file_name = ArrayField(models.CharField(max_length=550), default=list)


# class SUTClientConfigModel(models.Model):
#     config_file_path = models.CharField(max_length=500)
#     config_path = models.CharField(max_length=500)


# class TestConfigModel(models.Model):
#     test_config_file_path = models.CharField(max_length=550)
#     test_config_path = models.CharField(max_length=550)


# class CTRLModel(models.Model):
#     ctrl_path = models.CharField(
#         max_length=550,
#         default="\\Lib\\Python\\Python38\\Lib\\site-packages\\controller\\",
#     )


# class PythonPathModel(models.Model):
#     stat_py_path = models.CharField(max_length=550)


# class WaitConfigModel(models.Model):
#     time = models.IntegerField()
#     days = models.IntegerField()
#     wait_on_failure = models.BooleanField()
#     continue_on_test_suite_failure = models.BooleanField()


# class EmailOptionsModel(models.Model):
#     user_email = models.EmailField()
#     recipient_list = ArrayField(models.EmailField(), default=list)


# class ConfigurationModel(models.Model):
#     name = models.CharField(max_length=100, null=True, blank=True)
#     sit = models.ForeignKey(SITModel, on_delete=models.CASCADE)
#     stat = models.ForeignKey(STATModel, on_delete=models.CASCADE)
#     test_suites = models.ForeignKey(TestSuitesPathModel, on_delete=models.CASCADE)
#     sut_client_config = models.ForeignKey(
#         SUTClientConfigModel, on_delete=models.CASCADE
#     )
#     test_config = models.ForeignKey(TestConfigModel, on_delete=models.CASCADE)
#     ctrl_pkg = models.ForeignKey(CTRLModel, on_delete=models.CASCADE)
#     python_path = models.ForeignKey(PythonPathModel, on_delete=models.CASCADE)
#     wait_config = models.ForeignKey(WaitConfigModel, on_delete=models.CASCADE)
#     email_options = models.ForeignKey(EmailOptionsModel, on_delete=models.CASCADE)


class SITVersionModel(models.Model):
    stream = models.CharField(max_length=100)
    old_version = models.CharField(max_length=100)
    current_version = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.stream}: {self.old_version} -> {self.current_version}"


class SITModel(models.Model):
    sit_versions = models.ManyToManyField(SITVersionModel)

    def __str__(self):
        return f"SIT Model with {self.sit_versions.count()} versions"


class STATModel(models.Model):
    stat_cli_path = models.CharField(max_length=550)
    xml_file_paths = models.CharField(max_length=550)

    def __str__(self):
        return f"STAT: CLI Path - {self.stat_cli_path}"


class TestSuiteFilePath(models.Model):
    test_suite_file_path = models.CharField(max_length=550)

    def __str__(self):
        return self.test_suite_file_path


class TestSuiteFileName(models.Model):
    test_suite_file_name = models.CharField(max_length=550)

    def __str__(self):
        return self.test_suite_file_name


class TestSuitesPathModel(models.Model):
    test_suite_file_path = ArrayField(models.CharField(max_length=550), default=list)
    test_suite_file_name = ArrayField(models.CharField(max_length=550), default=list)

    def __str__(self):
        return f"{len(self.test_suite_file_path)} suites, {len(self.test_suite_file_name)} files"


class SUTClientConfigModel(models.Model):
    config_file_path = models.CharField(max_length=500)
    config_path = models.CharField(max_length=500)

    def __str__(self):
        return f"{self.config_file_path}"


class TestConfigModel(models.Model):
    test_config_file_path = models.CharField(max_length=550)
    test_config_path = models.CharField(max_length=550)

    def __str__(self):
        return f"{self.test_config_file_path}"


class CTRLModel(models.Model):
    ctrl_path = models.CharField(
        max_length=550,
        default="\\Lib\\Python\\Python38\\Lib\\site-packages\\controller\\",
    )

    def __str__(self):
        return f"{self.ctrl_path}"


class PythonPathModel(models.Model):
    stat_py_path = models.CharField(max_length=550)

    def __str__(self):
        return f"{self.stat_py_path}"


class WaitConfigModel(models.Model):
    time = models.IntegerField()
    days = models.IntegerField()
    wait_on_failure = models.BooleanField()
    continue_on_test_suite_failure = models.BooleanField()

    def __str__(self):
        return f"Time - {self.time} seconds, Days - {self.days}"


class EmailOptionsModel(models.Model):
    user_email = models.EmailField()
    recipient_list = ArrayField(models.EmailField(), default=list)

    def __str__(self):
        # return f"Email Options: {self.user_email} with {len(self.recipient_list)} recipients"
        return f"From : {self.user_email} to {len(self.recipient_list)} recipients"


class ConfigurationModel(models.Model):
    name = models.CharField(max_length=100, null=True, blank=True)
    sit = models.ForeignKey(SITModel, on_delete=models.CASCADE)
    stat = models.ForeignKey(STATModel, on_delete=models.CASCADE)
    test_suites = models.ForeignKey(TestSuitesPathModel, on_delete=models.CASCADE)
    sut_client_config = models.ForeignKey(
        SUTClientConfigModel, on_delete=models.CASCADE
    )
    test_config = models.ForeignKey(TestConfigModel, on_delete=models.CASCADE)
    ctrl_pkg = models.ForeignKey(CTRLModel, on_delete=models.CASCADE)
    python_path = models.ForeignKey(PythonPathModel, on_delete=models.CASCADE)
    wait_config = models.ForeignKey(WaitConfigModel, on_delete=models.CASCADE)
    email_options = models.ForeignKey(EmailOptionsModel, on_delete=models.CASCADE)

    def __str__(self):
        return f"Configuration: {self.name if self.name else 'Unnamed Configuration'}"


class YamlFormatConfigFileModel(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sutClientyml"
    )
    name = models.CharField(max_length=250, null=True, blank=False)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    version = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return (
            f"sutClientConfigFile text version {self.version} for {self.user.username}"
        )

    def save(self, *args, **kwargs):
        self.modified_at = timezone.now()

        # Only update version and name if this is the first save
        if not self.pk:
            self.version = (
                f"sutClientConfigFile_v{int(self.pk) + 1}" if self.pk else "1"
            )

        super(YamlFormatConfigFileModel, self).save(
            *args, **kwargs
        )  # Final save with updated values
