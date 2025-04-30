from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()

router.register(r'venue', views.VenueViewSet, basename='venue')
router.register(r'bookings', views.BookingViewSet)
router.register(r'venueRegister', views.VenueListCreate,
                basename='venueRegister')


urlpatterns = [
     path("notes/", views.NoteListCreate.as_view(), name="note-list"),
     path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
     path('register/', views.UserProfileViewSet.as_view(), name='register'),
     path("userDetails/", views.ShowProfile.as_view(), name="user-detail"),
     path('userProfiles/', views.UserProfileDetailView.as_view(),
          name='user-profile'),
     path('userProfiles/<str:username>/', views.UserProfileDetailView.as_view(),
          name='user-profile'),
     path('venues/', views.VenueViewList.as_view(), name='venues-list'),
     path('venues/owner/<int:venueownerid>/', views.VenueViewList.as_view(),
          name='venues'),

     path('canceled/', views.CanceledBookingViewSet.as_view(), name='canceled-bookings'),
     path('canceled/<int:user_id>/', views.CanceledBookingViewSet.as_view(),
          name='canceled-bookings'),

     path('venues/id/<int:venueid>/', views.VenueViewId.as_view(),
          name='venues'),
     path('userbookings/<int:user_id>/', views.UserBookingView.as_view(),
          name='userbooking'),
     path('create-khalti-payment/', views.KhaltiPaymentView.as_view(), name='khalti-payment'),

     path('', include(router.urls))
]
