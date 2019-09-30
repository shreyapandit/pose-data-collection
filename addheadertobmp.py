#!/usr/bin/python

import sys
import os
#from __future__ import absolute_import, division, print_function

from PIL import Image

def add_header_to_bmp(filename,input_folder,output_folder):
    print('adding header to file:',filename,input_folder,output_folder)
    with open(input_folder+"/"+filename, 'rb') as data_file:
        raw_data = data_file.read()
        image = Image.frombuffer('RGBA', (1920, 1080), raw_data)
        image = image.transpose(Image.FLIP_TOP_BOTTOM)
        image.save(output_folder+"/"+filename)

    
input_folder = sys.argv[1]
output_folder= sys.argv[2]

print ('Number of arguments:', len(sys.argv), 'arguments.')
print ('Argument List:', str(sys.argv))
print ('folder with bmp images:-' , str(input_folder))
print ('output folder with corrected bmp image:-'  , str(output_folder))

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

for filename in os.listdir(input_folder):
    if filename.endswith(".bmp"): 
        add_header_to_bmp(filename,input_folder,output_folder)
         
