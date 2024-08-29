from .models import *
from rest_framework import serializers


class SwitchesSerializer(serializers.ModelSerializer):
    bond_modes = serializers.ListField(child=serializers.IntegerField())
    portchannel_no = serializers.ListField(child=serializers.IntegerField())

    class Meta:
        model = Switches
        fields = "__all__"


"""
When you’re setting up the guest list for the VIP party (i.e., SwitchConfig),
you’re using PrimaryKeyRelatedField. This field doesn’t need all the details
of the guests; it just needs their IDs.

So, when you write 
switches = serializers.PrimaryKeyRelatedField(many=True, queryset=Switches.objects.all()),
you’re telling the bouncer at the VIP party:

"Hey, here’s a list of IDs for the guests who can attend this VIP party.
Just check these IDs against the master guest list (Switches.objects.all()).
If the IDs match, let them into the party!" 🎫
"""


class SwitchConfigSerializer(serializers.ModelSerializer):
    bond_modes = serializers.ListField(child=serializers.IntegerField())
    portchannel_no = serializers.ListField(child=serializers.IntegerField())
    switches = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Switches.objects.all()
    )

    class Meta:
        model = SwitchConfig
        fields = "__all__"
