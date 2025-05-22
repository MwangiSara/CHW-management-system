from django.urls import path
from . import views

urlpatterns = [
    path('', views.CommodityListView.as_view(), name='commodity_list'),
    path('<int:pk>/', views.CommodityDetailView.as_view(), name='commodity_detail'),
    path('categories/', views.commodity_categories, name='commodity_categories'),
]