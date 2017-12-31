from django.conf.urls import url, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin


urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    url(r'^oauth/', include('social_django.urls', namespace='social')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^ckeditor/', include('ckeditor_uploader.urls')),
    url(r'^api/v0/', include('reactmusic.audios.urls', namespace='base')),
    url(r'^api/v0/accounts/', include('reactmusic.accounts.urls', namespace='accounts')),
    url(r'^api/v0/artists/', include('reactmusic.artists.urls', namespace='artists')),
    url(r'^admin/', admin.site.urls),
    url(r'^(?:.*)/?$', include('reactmusic.landing.urls', namespace='landing')),
]

# if settings.DEBUG:
#     import debug_toolbar
#     urlpatterns = [
#         url(r'^__debug__/', include(debug_toolbar.urls)),
#     ] + urlpatterns