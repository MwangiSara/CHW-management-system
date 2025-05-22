from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Commodity
from .serializer import CommoditySerializer, CommodityListSerializer


# Create your views here.
class CommodityListView(generics.ListAPIView):
    queryset = Commodity.objects.filter(is_active=True)
    serializer_class = CommodityListSerializer
    permission_classes = [permissions.IsAuthenticated]

class CommodityDetailView(generics.RetrieveAPIView):
    queryset = Commodity.objects.filter(is_active=True)
    serializer_class = CommoditySerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def commodity_categories(request):
    categories = Commodity.objects.filter(is_active=True).values_list('category', flat=True).distinct()
    return Response(list(categories))


