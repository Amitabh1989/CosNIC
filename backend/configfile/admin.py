from django.contrib import admin
from .models import (
    SITVersionModel,
    SITModel,
    STATModel,
    # TestSuiteModel,
    TestSuitesPathModel,
    SUTClientConfigModel,
    TestConfigModel,
    CTRLModel,
    PythonPathModel,
    WaitConfigModel,
    ConfigurationModel,
    EmailOptionsModel,
    TestSuiteFilePath,
    TestSuiteFileName,
    # RecipientModel
)


class ConfigurationModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'sit', 'stat']

# Register your models here.
admin.site.register(SITVersionModel)
admin.site.register(SITModel)
admin.site.register(STATModel)
admin.site.register(TestSuitesPathModel)
admin.site.register(SUTClientConfigModel)
admin.site.register(TestConfigModel)
admin.site.register(CTRLModel)
admin.site.register(PythonPathModel)
admin.site.register(WaitConfigModel)
admin.site.register(ConfigurationModel, ConfigurationModelAdmin)
admin.site.register(EmailOptionsModel)
admin.site.register(TestSuiteFilePath)
admin.site.register(TestSuiteFileName)


