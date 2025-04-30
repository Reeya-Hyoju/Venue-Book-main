from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class CanceledBooking(models.Model):

    venue_name = models.CharField(max_length=255, null=True)
    user_id = models.IntegerField()
    user_name = models.CharField(max_length=255, null=True)
    venue_address = models.CharField(max_length=255, null=True)

    start_date = models.DateField()
    end_date = models.DateField()
    canceled_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-canceled_at']

    def __str__(self):
        return str(self.user_id)
    
class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title


class UserProfile(models.Model): 
    username = models.TextField(blank=True, null=True)
    email = models.EmailField(max_length=254, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    phoneNumber = models.BigIntegerField(blank=True, null=True)
    is_venue_owner = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username


from django.db import models

from django.contrib.auth.models import User  # Import User model

class Venue(models.Model):
    venueid = models.AutoField(primary_key=True)
    venuename = models.CharField(max_length=255)
    venueaddress = models.CharField(max_length=255)
    review = models.TextField()
    features = models.TextField()
    status = models.BooleanField(default=True)
    description = models.TextField()
    imageurl = models.JSONField()
    venueownerid = models.ForeignKey(User, on_delete=models.CASCADE, default=3)
    min_price = models.DecimalField(max_digits=10, decimal_places=2, default=100)  # New field for minimum price
    max_price = models.DecimalField(max_digits=10, decimal_places=2, default=500)  # New field for maximum price
    max_capacity = models.IntegerField(default=100)

    class Meta:
        db_table = 'api_venue'
        managed = True

    def __str__(self):
        return self.venuename


    
class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    venue = models.ForeignKey("Venue", on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    verified = models.BooleanField(default=False)  # New field

    class Meta:
        unique_together = ("venue", "start_date", "end_date")

    def __str__(self):
        return f"{self.user.username} booked {self.venue.venuename} from {self.start_date} to {self.end_date}"

