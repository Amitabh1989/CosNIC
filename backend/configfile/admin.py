from django.contrib import admin

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
    TestSuiteFileName,
    TestSuiteFilePath,
    # TestSuiteModel,
    TestSuitesPathModel,
    WaitConfigModel,
    YamlFormatConfigFileModel,
    # RecipientModel
)


class ConfigurationModelAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "sit", "stat"]


class YamlConfigAdmin(admin.ModelAdmin):
    list_display = ["id", "name"]
    list_display_links = ["id", "name"]


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
admin.site.register(YamlFormatConfigFileModel, YamlConfigAdmin)
