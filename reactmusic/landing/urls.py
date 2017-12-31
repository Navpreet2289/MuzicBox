from django.conf.urls import url

from .views import (
    MainPageView
)

urlpatterns = [
    url(r'^$', MainPageView.as_view(), name='main_page'),
]
