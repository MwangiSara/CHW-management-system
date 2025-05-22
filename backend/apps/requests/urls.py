from django.urls import path
from . import views

urlpatterns = [
    path('', views.CommodityRequestListView.as_view(), name='request_list'),
    path('create/', views.CommodityRequestCreateView.as_view(), name='request_create'),
    path('<int:pk>/', views.CommodityRequestDetailView.as_view(), name='request_detail'),
    path('pending/', views.PendingRequestsView.as_view(), name='pending_requests'),
    path('<int:request_id>/logs/', views.RequestLogListView.as_view(), name='request_logs'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('allocation-status/', views.monthly_allocation_status, name='allocation_status'),
    path('analytics/', views.request_analytics, name='request_analytics'),
]