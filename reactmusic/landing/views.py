from django.conf import settings
from django.views.generic import TemplateView
from django.core.urlresolvers import reverse_lazy

from braces.views import LoginRequiredMixin


class MainPageView(TemplateView):
    template_name = 'index.html'
