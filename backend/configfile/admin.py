from django.contrib import admin
from .models import (
    SITVersionModel,
    SITModel,
    STATModel,
    TestSuiteModel,
    SUTClientConfigModel,
    TestConfigModel,
    CTRLModel,
    PythonPathModel,
    WaitConfigModel,
    ConfigurationModel,
)

# Register your models here.
admin.site.register(SITVersionModel)
admin.site.register(SITModel)
admin.site.register(STATModel)
admin.site.register(TestSuiteModel)
admin.site.register(SUTClientConfigModel)
admin.site.register(TestConfigModel)
admin.site.register(CTRLModel)
admin.site.register(PythonPathModel)
admin.site.register(WaitConfigModel)
admin.site.register(ConfigurationModel)