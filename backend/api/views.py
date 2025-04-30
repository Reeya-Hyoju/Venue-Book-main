from datetime import datetime
from django.conf import settings
import requests
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.decorators import action
from .serializers import UserSerializer, NoteSerializer, UserSerializers, BookingStatusSerializer, showProfileSerializer, VenueSerializer, BookingSerializer, VenueRegisterSerializer
from .models import Note, UserProfile, Venue, Booking
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Note, UserProfile
from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.authentication import SessionAuthentication
from django.http import JsonResponse
from rest_framework.parsers import JSONParser
from django.shortcuts import render, get_object_or_404
from django.views.decorators.http import require_GET
from django.contrib.auth.decorators import login_required
from .models import CanceledBooking


from .serializers import CanceledBookingSerializer


class CanceledBookingViewSet(APIView):
    serializer_class = CanceledBookingSerializer
    permission_classes = [AllowAny]

    def get_queryset(self, user_id=None):
        queryset = CanceledBooking.objects.all()

        # Filter by user_id if it's provided
        if user_id is not None:
            queryset = queryset.filter(user_id=user_id)

        return queryset

    def get(self, request, *args, **kwargs):
        # Check if user_id is passed in the URL
        user_id = self.kwargs.get('user_id', None)
        queryset = self.get_queryset(user_id)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        # Handle POST request to create a new canceled booking
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShowProfile(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        serializer = showProfileSerializer(request.user)
        return Response(serializer.data)


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserProfileViewSet(generics.CreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserSerializers
    permission_classes = [AllowAny]


class UserProfileDetailView(APIView):
    """
    View to retrieve a specific user profile by username.
    """
    permission_classes = [AllowAny]

    def get(self, request, username, *args, **kwargs):
        try:
            # Retrieve the user profile by username
            user_profile = get_object_or_404(UserProfile, username=username)

            # Serialize the user profile
            serializer = UserSerializers(user_profile)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            # Log the error for debugging
            print(
                f"Error retrieving user profile for username {username}: {str(e)}")
            return Response(
                {"error": f"Unable to retrieve profile for username {username}"},
                status=status.HTTP_404_NOT_FOUND
            )


class VenueViewId(APIView):
    permission_classes = [AllowAny]

    def get(self, request, venueid):
        venue = Venue.objects.filter(venueid=venueid).first()
        if venue:
            serializer = VenueSerializer(venue)
            return Response(serializer.data)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)


class VenueViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer


class VenueViewList(APIView):
    permission_classes = [AllowAny]

    def get(self, request, venueownerid=None):
        # Check if 'id' query parameter is passed to get a single venue
        venue_id = request.query_params.get('id')
        if venue_id:
            venue = Venue.objects.filter(pk=venue_id).first()
            if venue:
                serializer = VenueSerializer(venue)
                return Response(serializer.data)
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        # If venueownerid is in the path, filter by it
        if venueownerid:
            venues = Venue.objects.filter(venueownerid=venueownerid)
        else:
            venues = Venue.objects.all()

        serializer = VenueSerializer(venues, many=True)
        return Response(serializer.data)


class UserBookingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id=None):
        # Check if 'id' query parameter is passed to get a single booking
        booking_id = request.query_params.get('id')
        if booking_id:
            booking = Booking.objects.filter(pk=booking_id).first()
            if booking:
                serializer = BookingSerializer(booking)
                return Response(serializer.data)
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        # If user_id is in the path, filter by it
        if user_id:
            bookings = Booking.objects.filter(user=user_id)
        else:
            # Get user_id from query parameters if not in path
            query_user_id = request.query_params.get('user_id')
            if query_user_id:
                bookings = Booking.objects.filter(user=query_user_id)
            else:
                bookings = Booking.objects.all()

        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    def put(self, request, pk=None):
        booking = get_object_or_404(Booking, pk=pk)
        serializer = BookingStatusSerializer(
            booking, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk=None):
        return self.put(request, pk)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return BookingStatusSerializer
        return BookingSerializer

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()

            # Log what we're receiving
            print(f"Update request data: {request.data}")

            serializer = self.get_serializer(
                instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            return Response(serializer.data)
        except Exception as e:
            # Log the error
            print(f"Error updating booking: {str(e)}")
            return Response(
                {"detail": f"Error updating booking: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class VenueListCreate(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueRegisterSerializer
    permission_classes = [AllowAny]


class KhaltiPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get("user")
        venue_id = request.data.get("venue")
        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date")
        # in paisa (eg: Rs 100 = 10000 paisa)
        amount = request.data.get("amount")

        if not all([user_id, venue_id, start_date, end_date, amount]):
            return Response({"detail": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Parse the dates
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if venue is already booked for any overlapping dates
        overlapping_bookings = Booking.objects.filter(
            venue_id=venue_id,
            start_date__lte=end_date_obj,
            end_date__gte=start_date_obj
        ).exists()

        if overlapping_bookings:
            return Response(
                {"detail": "Venue already booked for the selected dates."},
                status=status.HTTP_400_BAD_REQUEST
            )

        payload = {
            "return_url": "http://localhost:5173/payment-success",  # after payment where to go
            "website_url": "http://localhost:5173",
            "amount": amount,
            "purchase_order_id": f"order-{user_id}-{venue_id}",
            "purchase_order_name": "Venue Booking",
            "customer_info": {
                "name": request.user.username,
                "email": request.user.email,
                "phone": "9800000000",  # Dummy phone, make dynamic if needed
            }
        }

        khalti_url = "https://a.khalti.com/api/v2/epayment/initiate/"
        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}"
        }
        response = requests.post(khalti_url, json=payload, headers=headers)

        if response.status_code == 200:
            data = response.json()
            return Response({"payment_url": data["payment_url"]})
        else:
            return Response({"detail": "Khalti payment initiation failed"}, status=status.HTTP_400_BAD_REQUEST)
