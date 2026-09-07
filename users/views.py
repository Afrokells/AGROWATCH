from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer
from .validators import normalize_and_validate_phone

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(pk=self.request.user.pk)

class LoginView(APIView):
    def post(self, request):
        phone_number = request.data.get('phone_number')
        password = request.data.get('password')
        
        user = authenticate(username=phone_number, password=password)
        phone_number = str(request.data.get('phone_number', '')).strip()
        password = str(request.data.get('password', '')).strip()

        if not phone_number or not password:
            return Response(
                {'error': 'Phone number and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Normalize phone if possible for flexible login (e.g. 024... or +233...)
        possible_usernames = [phone_number]
        try:
            norm = normalize_and_validate_phone(phone_number)
            if norm not in possible_usernames:
                possible_usernames.append(norm)
        except Exception:
            pass

        # Try authenticating across formats
        user = None
        for u_name in possible_usernames:
            user = authenticate(username=u_name, password=password)
            if user:
                break

        if not user:
            # Fallback check if username was created differently or direct match
            try:
                u = User.objects.get(phone_number=phone_number)
                if u.check_password(password):
                    user = u
            except User.DoesNotExist:
                pass
            # Direct match check
            for u_name in possible_usernames:
                try:
                    u = User.objects.get(phone_number=u_name)
                    if u.check_password(password):
                        user = u
                        break
                except User.DoesNotExist:
                    pass

        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
            return Response(
                {'error': 'Invalid phone number or password. Please verify your credentials.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        token, _ = Token.objects.get_or_create(user=user)
        serializer = UserSerializer(user)
        return Response({
            'token': token.key,
            'user': serializer.data
        })

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if 'password' in request.data:
                user.set_password(request.data['password'])
                user.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Format first readable error message
        errors = serializer.errors
        error_msg = "Registration validation failed."
        for field, err_list in errors.items():
            if isinstance(err_list, list) and len(err_list) > 0:
                error_msg = f"{err_list[0]}"
                break
            elif isinstance(err_list, str):
                error_msg = err_list
                break

        return Response(
            {"detail": error_msg, "errors": errors},
            status=status.HTTP_400_BAD_REQUEST
        )
