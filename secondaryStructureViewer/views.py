from django.http.response import HttpResponse
from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def singleNucleotideContextMenu(request, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex):
    return render(request, 'singleNucleotideContextMenu.html', context={
        'rnaComplexIndex': rnaComplexIndex,
        'rnaMoleculeIndex': rnaMoleculeIndex,
        'nucleotideIndex': nucleotideIndex
    })