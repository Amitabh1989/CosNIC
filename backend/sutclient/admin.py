from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Switches)
admin.site.register(SwitchConfig)
admin.site.register(Interface)
admin.site.register(Ipmi)
admin.site.register(Sut)
admin.site.register(Client)
admin.site.register(Sit)
admin.site.register(Dup)
admin.site.register(ClientSit)
admin.site.register(FwVersion)
admin.site.register(FwUpgradeType)
admin.site.register(Rmii)
admin.site.register(CDCheckout)
admin.site.register(SPLPkgFilePath)
admin.site.register(Npar)
admin.site.register(PrePostValidation)
admin.site.register(Config)