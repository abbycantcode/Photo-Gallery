from flask import Flask, render_template, jsonify, request
import os

app = Flask(__name__)

PER_PAGE = 20  # Number of images per page

def get_sorted_images():
    image_files = [filename for filename in os.listdir('static/screenshots') if filename.endswith('.png')]
    sorted_images = sorted(image_files, key=lambda filename: os.path.getsize(f'static/screenshots/{filename}'))
    return sorted_images

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_images')
def get_images():
    page = int(request.args.get('page', 1))
    sorted_images = get_sorted_images() if request.args.get('sort') == 'size' else [filename for filename in os.listdir('static/screenshots') if filename.endswith('.png')]
    start_index = (page - 1) * PER_PAGE
    end_index = start_index + PER_PAGE
    images_on_page = sorted_images[start_index:end_index]
    return jsonify(images_on_page)

@app.route('/get_total_pages')
def get_total_pages():
    sorted = request.args.get('sorted', 'False').lower() == 'true'
    image_files = get_sorted_images() if sorted else [filename for filename in os.listdir('static/screenshots') if filename.endswith('.png')]
    total_pages = (len(image_files) + PER_PAGE - 1) // PER_PAGE
    return jsonify({'total_pages': total_pages})

if __name__ == '__main__':
    app.run(debug=True)
