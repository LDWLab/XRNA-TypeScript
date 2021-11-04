from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('singleNucleotideContextMenu/<int:rnaComplexIndex>/<int:rnaMoleculeIndex>/<int:nucleotideIndex>', views.singleNucleotideContextMenu)
]