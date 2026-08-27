import glob
from mltracker import run_tracking

images = glob.glob('media/scans/*.webp') + glob.glob('media/scans/*.jpg') + glob.glob('media/scans/*.png')

if not images:
    print('No scan images found in media/scans/ - skipping end-to-end test.')
else:
    img = images[0]
    print(f'Testing with: {img}')
    result = run_tracking([img], 'tomato')
    print('total_plants:  ', result['total_plants'])
    print('disease_flags: ', result['disease_flags'])
    print('mota_approx:   ', result['mota_approx'])
    print('detections:    ', len(result['tracked_detections']), 'items')
    if result['tracked_detections']:
        print('sample det:    ', result['tracked_detections'][0])
    print('SUCCESS')
