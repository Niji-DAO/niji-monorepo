import os
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans


def transparent_background(image, bg_color, tolerance=10):
    """背景色に近い色を透明にする"""
    image = image.convert("RGBA")
    datas = image.getdata()

    newData = []
    for item in datas:
        if all(abs(item[i] - bg_color[i]) <= tolerance for i in range(3)):
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    image.putdata(newData)
    return image


def reduce_colors(image, num_colors):
    """画像の色数を減らす"""
    result = image.quantize(colors=num_colors, method=Image.FASTOCTREE)
    return result.convert('RGBA')


def count_unique_colors(image):
    """ユニークな色の数をカウントする"""
    return len(set(image.getdata()))


def create_common_palette(images, n_colors=100):
    """共通パレットを作成する"""
    all_pixels = np.vstack([np.array(image.resize((32, 32)).getdata())
                            for image in images])
    kmeans = KMeans(n_clusters=n_colors, random_state=42)
    kmeans.fit(all_pixels)
    palette = kmeans.cluster_centers_.astype(int)
    return palette


def replace_colors_with_palette(image, palette):
    """画像の色を共通パレットに置き換える"""
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
    """画像の処理を実行し、結果を保存する"""
    images = []
    filenames = []
    for filename in os.listdir(directory):
        if filename.lower().endswith(('png', 'jpg', 'jpeg', 'gif')):
            image_path = os.path.join(directory, filename)
            image = Image.open(image_path).convert('RGBA')
            bg_color = image.getpixel((0, 0))
            transparent_image = transparent_background(image, bg_color)
            reduced_color_image = reduce_colors(transparent_image, num_colors)
            images.append(reduced_color_image)
            filenames.append(filename)
            print(f"{filename}: \
                Original colors - {count_unique_colors(image)}, "
                  f"Reduced colors \
                      - {count_unique_colors(reduced_color_image)}")

    common_palette = create_common_palette(images, n_colors=100)

    for image, filename in zip(images, filenames):
        new_image = replace_colors_with_palette(image, common_palette)
        new_filename = filename.rsplit('.', 1)[0] + '_new.png'
        new_image.save(os.path.join(directory, new_filename), "PNG")
        print(f"{new_filename}: Colors after palette replacement - "
              f"{count_unique_colors(new_image)}")


parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rel_dir = "images/v32v8/"
directory = os.path.join(parent_dir, rel_dir)
process_images(directory, num_colors=8)
