from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import CommodityRequest, RequestLog
from .serializer import (
    CommodityRequestSerializer, 
    CommodityRequestCreateSerializer,
    CommodityRequestUpdateSerializer,
    RequestLogSerializer,
    DashboardStatsSerializer
)
from .permissions import IsOwnerOrApprover

# Create your views here.
class CommodityRequestListView(generics.ListAPIView):
    serializer_class = CommodityRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'CHW':
            return CommodityRequest.objects.filter(requester=user)
        elif user.role == 'CHA':
            return CommodityRequest.objects.filter(
                Q(approver=user) | Q(requester__supervisor=user)
            )
        else:  # Admin
            return CommodityRequest.objects.all()

class CommodityRequestCreateView(generics.CreateAPIView):
    serializer_class = CommodityRequestCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        request = serializer.save()
        # Create log entry
        RequestLog.objects.create(
            request=request,
            action='CREATED',
            performed_by=self.request.user,
            details={'quantity_requested': request.quantity_requested}
        )

class CommodityRequestDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CommodityRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrApprover]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'CHW':
            return CommodityRequest.objects.filter(requester=user)
        elif user.role == 'CHA':
            return CommodityRequest.objects.filter(
                Q(approver=user) | Q(requester__supervisor=user)
            )
        else:  # Admin
            return CommodityRequest.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return CommodityRequestUpdateSerializer
        return CommodityRequestSerializer
    
    def perform_update(self, serializer):
        old_status = self.get_object().status
        request = serializer.save()
        
        # Create log entry if status changed
        if old_status != request.status:
            RequestLog.objects.create(
                request=request,
                action=request.status,
                performed_by=self.request.user,
                details={
                    'old_status': old_status,
                    'new_status': request.status,
                    'quantity_approved': request.quantity_approved
                }
            )

class PendingRequestsView(generics.ListAPIView):
    serializer_class = CommodityRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'CHA':
            return CommodityRequest.objects.filter(
                approver=user,
                status='PENDING'
            ).order_by('created_at')
        return CommodityRequest.objects.none()

class RequestLogListView(generics.ListAPIView):
    serializer_class = RequestLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        request_id = self.kwargs.get('request_id')
        return RequestLog.objects.filter(request_id=request_id)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    
    # Base queryset based on user role
    if user.role == 'CHW':
        base_queryset = CommodityRequest.objects.filter(requester=user)
    elif user.role == 'CHA':
        base_queryset = CommodityRequest.objects.filter(
            Q(approver=user) | Q(requester__supervisor=user)
        )
    else:  # Admin
        base_queryset = CommodityRequest.objects.all()
    
    # Calculate stats
    total_requests = base_queryset.count()
    pending_requests = base_queryset.filter(status='PENDING').count()
    approved_requests = base_queryset.filter(status='APPROVED').count()
    rejected_requests = base_queryset.filter(status='REJECTED').count()
    
    # Monthly requests (current month)
    current_month = timezone.now().replace(day=1)
    monthly_requests = base_queryset.filter(created_at__gte=current_month).count()
    
    # Top commodities (last 30 days)
    last_30_days = timezone.now() - timedelta(days=30)
    top_commodities = base_queryset.filter(
        created_at__gte=last_30_days
    ).values(
        'commodity__name'
    ).annotate(
        request_count=Count('id'),
        total_quantity=Sum('quantity_requested')
    ).order_by('-request_count')[:5]
    
    # Recent requests (last 10)
    recent_requests = base_queryset.order_by('-created_at')[:10]
    
    stats = {
        'total_requests': total_requests,
        'pending_requests': pending_requests,
        'approved_requests': approved_requests,
        'rejected_requests': rejected_requests,
        'monthly_requests': monthly_requests,
        'top_commodities': list(top_commodities),
        'recent_requests': CommodityRequestSerializer(recent_requests, many=True).data
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def monthly_allocation_status(request):
    """Get current month's allocation status for CHW"""
    if request.user.role != 'CHW':
        return Response({'error': 'Only CHWs can check allocation status'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    current_month = timezone.now().replace(day=1)
    
    # Get all commodities and their usage this month
    from apps.commodities.models import Commodity
    commodities = Commodity.objects.filter(is_active=True)
    
    allocation_status = []
    for commodity in commodities:
        used = CommodityRequest.objects.filter(
            requester=request.user,
            commodity=commodity,
            created_at__gte=current_month,
            status__in=['APPROVED', 'DELIVERED']
        ).aggregate(total=Sum('quantity_approved'))['total'] or 0
        
        remaining = commodity.max_monthly_allocation - used
        
        allocation_status.append({
            'commodity_id': commodity.id,
            'commodity_name': commodity.name,
            'max_allocation': commodity.max_monthly_allocation,
            'used': used,
            'remaining': remaining,
            'percentage_used': (used / commodity.max_monthly_allocation) * 100 if commodity.max_monthly_allocation > 0 else 0
        })
    
    return Response(allocation_status)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def request_analytics(request):
    """Get analytics data for charts"""
    user = request.user
    
    # Base queryset
    if user.role == 'CHW':
        base_queryset = CommodityRequest.objects.filter(requester=user)
    elif user.role == 'CHA':
        base_queryset = CommodityRequest.objects.filter(
            Q(approver=user) | Q(requester__supervisor=user)
        )
    else:  # Admin
        base_queryset = CommodityRequest.objects.all()
    
    # Requests by status
    status_data = base_queryset.values('status').annotate(count=Count('id'))
    
    # Requests by month (last 6 months)
    six_months_ago = timezone.now() - timedelta(days=180)
    monthly_data = base_queryset.filter(
        created_at__gte=six_months_ago
    ).extra(
        select={'month': 'EXTRACT(month FROM created_at)', 'year': 'EXTRACT(year FROM created_at)'}
    ).values('month', 'year').annotate(count=Count('id')).order_by('year', 'month')
    
    # Top commodities
    commodity_data = base_queryset.values(
        'commodity__name'
    ).annotate(
        count=Count('id'),
        total_quantity=Sum('quantity_requested')
    ).order_by('-count')[:10]
    
    return Response({
        'status_distribution': list(status_data),
        'monthly_trends': list(monthly_data),
        'top_commodities': list(commodity_data)
    })

