from django.conf.urls import url

from .views import (
    ArtistListView, ArtistDetailView
)


urlpatterns = [
    url(r'^$', ArtistListView.as_view(), name='list'),
    url(r'^(?P<slug>[\w-]+)/$', ArtistDetailView.as_view(), name='detail'),
]
