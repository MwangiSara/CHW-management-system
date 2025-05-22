from rest_framework import serializers
from .models import Commodity


class CommoditySerializer(serializers.ModelSerializer):
    class Meta:
        model = Commodity
        fields = ['id', 'name', 'description', 'unit_of_measure', 'category',
                 'max_quantity_per_request', 'max_monthly_allocation', 'is_active',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class CommodityListSerializer(serializers.ModelSerializer):
    """Simplified serializer for dropdown lists"""
    class Meta:
        model = Commodity
        fields = ['id', 'name', 'unit_of_measure', 'max_quantity_per_request', 'max_monthly_allocation']