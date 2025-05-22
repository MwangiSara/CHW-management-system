from rest_framework import permissions

class IsOwnerOrApprover(permissions.BasePermission):
    """
    Permission to only allow owners of a request or their approvers to access it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for owner and approver
        if request.user == obj.requester or request.user == obj.approver:
            return True
        
        # Write permissions only for approver (CHA)
        if request.method in ['PUT', 'PATCH']:
            return request.user == obj.approver and request.user.role == 'CHA'
        
        # Admin can access everything
        return request.user.role == 'ADMIN'

class IsCHAOrAdmin(permissions.BasePermission):
    """
    Permission to only allow CHAs and Admins.
    """
    
    def has_permission(self, request, view):
        return request.user.role in ['CHA', 'ADMIN']

class IsCHWOnly(permissions.BasePermission):
    """
    Permission to only allow CHWs.
    """
    
    def has_permission(self, request, view):
        return request.user.role == 'CHW'