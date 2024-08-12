from .models import *
from rest_framework import serializers

class SwitchesSerializer(serializers.ModelSerializer):
    bond_modes = serializers.ListField(child=serializers.IntegerField())
    portchannel_no = serializers.ListField(child=serializers.IntegerField())
    
    class Meta:
        model = Switches
        fields = '__all__'

class SwitchConfigSerializer(serializers.ModelSerializer):
    bond_modes = serializers.ListField(child=serializers.IntegerField())
    portchannel_no = serializers.ListField(child=serializers.IntegerField())
    switches = SwitchesSerializer(many=True)
    
    class Meta:
        model = SwitchConfig
        fields = '__all__'