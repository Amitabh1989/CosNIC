from django.contrib import admin

from .models import (
    CDCheckout,
    Client,
    ClientSit,
    Config,
    Dup,
    FwUpgradeType,
    FwVersion,
    Interface,
    Ipmi,
    Npar,
    PrePostValidation,
    Rmii,
    Sit,
    SPLPkgFilePath,
    Sut,
    SwitchConfig,
    Switches,
    YamlConfigFile,
)

# Register your models here.
# admin.site.register(Switches)
# admin.site.register(SwitchConfig)
# admin.site.register(Interface)
# admin.site.register(Ipmi)
# admin.site.register(Sut)
# admin.site.register(Client)
# admin.site.register(Sit)
# admin.site.register(Dup)
# admin.site.register(ClientSit)
# admin.site.register(FwVersion)
# admin.site.register(FwUpgradeType)
# admin.site.register(Rmii)
# admin.site.register(CDCheckout)
# admin.site.register(SPLPkgFilePath)
# admin.site.register(Npar)
# admin.site.register(PrePostValidation)
# admin.site.register(Config)


class YamlFileAdmin(admin.ModelAdmin):
    list_display = ("id", "file", "created_at")
    list_filter = ("created_at",)
    search_fields = ("id", "file", "created_at")
    ordering = ("created_at",)


admin.site.register(YamlConfigFile, YamlFileAdmin)
