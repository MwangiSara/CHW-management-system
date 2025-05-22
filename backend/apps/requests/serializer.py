from rest_framework import serializers
from django.utils import timezone
from django.db.models import Sum
from .models import CommodityRequest, RequestLog
from apps.commodities.serializer import CommodityListSerializer
from apps.authentication.serializer import UserSerializer


class CommodityRequestSerializer(serializers.ModelSerializer):
    commodity_name = serializers.CharField(source='commodity.name', read_only=True)
    commodity_unit = serializers.CharField(source='commodity.unit_of_measure', read_only=True)
    requester_name = serializers.CharField(source='requester.get_full_name', read_only=True)
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = CommodityRequest
        fields = ['id', 'requester', 'requester_name', 'approver', 'approver_name',
                 'commodity', 'commodity_name', 'commodity_unit', 
                 'quantity_requested', 'quantity_approved', 'status', 'status_display',
                 'reason_for_request', 'rejection_reason', 'notes',
                 'created_at', 'approved_at', 'delivered_at', 'updated_at']
        read_only_fields = ['id', 'requester', 'approver', 'commodity_name', 
                           'commodity_unit', 'requester_name', 'approver_name', 
                           'status_display', 'created_at', 'approved_at', 'delivered_at', 'updated_at']

class CommodityRequestCreateSerializer(serializers.ModelSerializer):
    monthly_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = CommodityRequest
        fields = ['commodity', 'quantity_requested', 'reason_for_request', 'monthly_remaining']
        
    def get_monthly_remaining(self, obj):
        """Calculate remaining monthly allocation for this commodity"""
        current_month = timezone.now().replace(day=1)
        monthly_used = CommodityRequest.objects.filter(
            requester=self.context['request'].user,
            commodity=obj.commodity,
            created_at__gte=current_month,
            status__in=['APPROVED', 'DELIVERED']
        ).aggregate(total=Sum('quantity_approved'))['total'] or 0
        
        return obj.commodity.max_monthly_allocation - monthly_used
    
    def validate(self, attrs):
        request = self.context['request']
        user = request.user
        commodity = attrs['commodity']
        quantity = attrs['quantity_requested']
        
        # Check if user is CHW
        if user.role != 'CHW':
            raise serializers.ValidationError("Only CHWs can create commodity requests.")
        
        # Check if commodity is active
        if not commodity.is_active:
            raise serializers.ValidationError("This commodity is not currently available.")
        
        # Check daily limit
        from datetime import date
        today = date.today()
        existing_request = CommodityRequest.objects.filter(
            requester=user,
            commodity=commodity,
            created_at__date=today,
            status__in=['PENDING', 'APPROVED']
        ).exists()
        
        if existing_request:
            raise serializers.ValidationError(
                f"You have already requested {commodity.name} today. Only one request per commodity per day is allowed."
            )
        
        # Check monthly limit
        current_month = timezone.now().replace(day=1)
        monthly_used = CommodityRequest.objects.filter(
            requester=user,
            commodity=commodity,
            created_at__gte=current_month,
            status__in=['APPROVED', 'DELIVERED']
        ).aggregate(total=Sum('quantity_approved'))['total'] or 0
        
        remaining = commodity.max_monthly_allocation - monthly_used
        if quantity > remaining:
            raise serializers.ValidationError(
                f"Monthly limit exceeded. You can only request {remaining} more {commodity.name} this month."
            )
        
        # Check per-request limit
        if quantity > commodity.max_quantity_per_request:
            raise serializers.ValidationError(
                f"Maximum {commodity.max_quantity_per_request} {commodity.name} allowed per request."
            )
        
        return attrs
    
    def create(self, validated_data):
        validated_data['requester'] = self.context['request'].user
        return super().create(validated_data)

class CommodityRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommodityRequest
        fields = ['status', 'quantity_approved', 'rejection_reason', 'notes']
    
    def validate(self, attrs):
        request = self.context['request']
        user = request.user
        
        # Only CHA can approve/reject requests
        if user.role != 'CHA':
            raise serializers.ValidationError("Only CHAs can update request status.")
        
        status = attrs.get('status')
        if status == 'APPROVED' and not attrs.get('quantity_approved'):
            raise serializers.ValidationError("Quantity approved is required when approving a request.")
        
        if status == 'REJECTED' and not attrs.get('rejection_reason'):
            raise serializers.ValidationError("Rejection reason is required when rejecting a request.")
        
        return attrs

class RequestLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = RequestLog
        fields = ['id', 'action', 'action_display', 'performed_by', 'performed_by_name', 
                 'details', 'timestamp']
        read_only_fields = ['id', 'action', 'action_display', 'performed_by', 
                           'performed_by_name', 'details', 'timestamp']

class DashboardStatsSerializer(serializers.Serializer):
    total_requests = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    approved_requests = serializers.IntegerField()
    rejected_requests = serializers.IntegerField()
    monthly_requests = serializers.IntegerField()
    top_commodities = serializers.ListField()
    recent_requests = CommodityRequestSerializer(many=True, read_only=True)