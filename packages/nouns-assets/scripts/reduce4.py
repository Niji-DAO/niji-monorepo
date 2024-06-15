import os
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans


def transparent_background(image, bg_color, tolerance=10):
    image = image.convert("RGBA")
    data = image.getdata()

    newData = []
    for item in data:
        # 背景色との差が許容範囲内なら透明にする
        if all(abs(item[i] - bg_color[i]) <= tolerance for i in range(3)):
            newData.append((255, 255, 255, 0))  # 透明
        else:
            newData.append(item)  # そのまま
    image.putdata(newData)
    return image


def reduce_colors(image, num_colors):
    if not isinstance(num_colors, int):
        raise ValueError("num_colors must be an integer")
    result = image.quantize(colors=num_colors)
    return result.convert('RGBA')


def load_images(directory):
    images = {}
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.png') and not file == '.gitkeep':
                full_path = os.path.join(root, file)
                images[full_path] = Image.open(full_path).convert('RGBA')
    return images


def create_common_palette(images, n_colors=16):
    all_pixels = np.vstack([np.array(image.resize(
        (32, 32)).getdata()) for image in images.values()])
    kmeans = KMeans(n_clusters=n_colors, random_state=42)
    kmeans.fit(all_pixels)
    palette = kmeans.cluster_centers_.astype(int)
    return palette


def replace_colors_with_palette(image, palette):
    image_array = np.array(image)
    reshaped_image = image_array.reshape(-1, 4)  # RGBAのため4チャンネル

    palette_rgb = palette[:, :3]
    closest_colors = np.array([
        min(palette_rgb, key=lambda color: np.linalg.norm(color - pixel[:3]))
        for pixel in reshaped_image
    ])

    new_image_array = np.concatenate(
        [closest_colors, reshaped_image[:, 3:]], axis=1)
    return Image.fromarray(new_image_array.reshape(
        image_array.shape).astype('uint8'), 'RGBA')


def process_images(directory, num_colors=8):
    images = load_images(directory)
    common_palette = create_common_palette(images, num_colors)

    for path, image in images.items():
        original_count = len(set(image.getdata()))
        processed_image = transparent_background(image, image.getpixel((0, 0)))
        processed_image = reduce_colors(processed_image, num_colors)
        processed_image = replace_colors_with_palette(
            processed_image, common_palette)
        new_count = len(set(processed_image.getdata()))
        processed_image.save(path)  # Use the full path for saving
        print(f"{os.path.basename(path)}: Original colors - \
            {original_count}, New colors - {new_count}")


parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rel_dir = "images/v32v9/"
process_images(os.path.join(parent_dir, rel_dir), 8)
