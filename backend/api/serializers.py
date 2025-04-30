from .models import Booking, UserProfile
from .models import Venue
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, UserProfile, Venue, Booking, CanceledBooking

class CanceledBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CanceledBooking
        fields = '__all__'

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data


class showProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
        ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}


class UserSerializers(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    is_venue_owner = serializers.BooleanField()
    email = serializers.CharField(
        required=True)
    username = serializers.CharField(
        required=True)
    address = serializers.CharField(
        required=False)  # or TextField if needed
    phoneNumber = serializers.CharField(required=False)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email',
                  'address', 'phoneNumber', 'is_venue_owner']


class VenueSerializer(serializers.ModelSerializer):
    booked_dates = serializers.SerializerMethodField()

    class Meta:
        model = Venue
        fields = ['venueid', 'venuename', 'venueaddress', 'review', 'features',
                  'status', 'description', 'imageurl', 'venueownerid', 'min_price', 'max_price', 'max_capacity', 'booked_dates']

    def get_booked_dates(self, obj):
        bookings = Booking.objects.filter(venue=obj).select_related('user')

        booked_data = []
        for booking in bookings:
            try:
                user_profile = UserProfile.objects.get(id=booking.user.id)
                user_info = {
                    "username": user_profile.username,
                    "email": user_profile.email,
                    "phoneNumber": user_profile.phoneNumber,
                }
            except UserProfile.DoesNotExist:
                user_info = {"username": "Unknown",
                             "email": "N/A", "phoneNumber": "N/A"}

            booked_data.append({
                "id": booking.id,
                "start_date": booking.start_date,
                "end_date": booking.end_date,
                "user": user_info
            })

        return booked_data


class BookingSerializer(serializers.ModelSerializer):
    user_info = serializers.SerializerMethodField()
    venue_name = serializers.CharField(source='venue.venuename', read_only=True)
    venue_address = serializers.CharField(source='venue.venueaddress', read_only=True)

    class Meta:
        model = Booking
        fields = ["id", "venue", "start_date",
                  "end_date", "user", "user_info", "verified",'venue_name', 'venue_address']

    def get_user_info(self, obj):
        try:
            user_profile = UserProfile.objects.get(id=obj.user.id)
            return {
                "username": user_profile.username,
                "email": user_profile.email,
                "phoneNumber": user_profile.phoneNumber,
            }
        except UserProfile.DoesNotExist:
            return {"username": "Unknown", "email": "N/A", "phoneNumber": "N/A"}

    def validate(self, data):
        venue = data["venue"]
        start_date = data["start_date"]
        end_date = data["end_date"]

        # Check for conflicting bookings
        existing_booking = Booking.objects.filter(
            venue=venue,
            start_date__lte=end_date,
            end_date__gte=start_date
        ).exists()

        if existing_booking:
            raise serializers.ValidationError(
                "This venue is already booked for the selected dates.")

        return data


class BookingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        # Only allowing the 'verified' field to be updated
        fields = ['verified']

    def validate(self, data):
        # Additional validation if needed
        return data


class VenueRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        exclude = ['review', 'status']


class VenueListSerializer(serializers.ModelSerializer):
    booked_dates = serializers.SerializerMethodField()

    class Meta:
        model = Venue
        fields = ['venueid', 'venuename', 'venueaddress', 'review', 'features',
                  'status', 'description', 'imageurl', 'venueownerid', 'min_price', 'max_price', 'max_capacity', 'booked_dates']

    def get_booked_dates(self, obj):
        bookings = Booking.objects.filter(venue=obj).select_related('user')

        booked_data = []
        for booking in bookings:
            try:
                user_profile = UserProfile.objects.get(id=booking.user.id)
                user_info = {
                    "username": user_profile.username,
                    "email": user_profile.email,
                    "phoneNumber": user_profile.phoneNumber,
                }
            except UserProfile.DoesNotExist:
                user_info = {"username": "Unknown",
                             "email": "N/A", "phoneNumber": "N/A"}

            booked_data.append({
                "start_date": booking.start_date,
                "end_date": booking.end_date,
                "user": user_info
            })

        return booked_data
