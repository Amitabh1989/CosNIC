from django.db import models

# Create your models here.

"""
SITS:
    SIT_1:
        SIT_VERSIONS:
            stream: '231.1'
            old_version: 231.1.116.0543
            current_version: 231.1.118.0
"""


class SITVersionModel(models.Model):
    """
    SIT_VERSIONS:
        stream: '231.1'
        old_version: 231.1.116.0543
        current_version: 231.1.118.0
    """

    stream = models.CharField(max_length=100)
    old_version = models.CharField(max_length=100)
    current_version = models.CharField(max_length=100)


class SITModel(models.Model):
    sit_versions = models.ManyToManyField(SITVersionModel)


class STATModel(models.Model):
    stat_cli_path = models.CharField(max_length=550)
    xml_file_paths = models.CharField(max_length=550)


class TestSuiteModel(models.Model):
    test_suite_file_path = models.CharField(max_length=550)
    test_suite_file_name = models.CharField(max_length=550)


class SUTClientConfigModel(models.Model):
    config_file_path = models.CharField(max_length=500)
    config_path = models.CharField(max_length=500)


class TestConfigModel(models.Model):
    test_config_file_path = models.CharField(max_length=550)
    test_config_path = models.CharField(max_length=550)


class CTRLModel(models.Model):
    ctrl_path = models.CharField(max_length=550)


class PythonPathModel(models.Model):
    stat_py_path = models.CharField(max_length=550)


class WaitConfigModel(models.Model):
    time = models.IntegerField()
    days = models.IntegerField()
    wait_on_failure = models.BooleanField()
    continue_on_test_suite_failure = models.BooleanField()


class EmailOptionsModel(models.Model):
    user_email = models.EmailField()
    recipient_list = (
        models.EmailField()
    )  # You might want to handle this as a list of emails in a custom way


class ConfigurationModel(models.Model):
    sit = models.ForeignKey(SITModel, on_delete=models.CASCADE)
    stat = models.ForeignKey(STATModel, on_delete=models.CASCADE)
    test_suites = models.ForeignKey(TestSuiteModel, on_delete=models.CASCADE)
    sut_client_config = models.ForeignKey(
        SUTClientConfigModel, on_delete=models.CASCADE
    )
    test_config = models.ForeignKey(TestConfigModel, on_delete=models.CASCADE)
    ctrl_pkg = models.ForeignKey(CTRLModel, on_delete=models.CASCADE)
    python_path = models.ForeignKey(PythonPathModel, on_delete=models.CASCADE)
    wait_config = models.ForeignKey(WaitConfigModel, on_delete=models.CASCADE)
    email_options = models.ForeignKey(EmailOptionsModel, on_delete=models.CASCADE)
