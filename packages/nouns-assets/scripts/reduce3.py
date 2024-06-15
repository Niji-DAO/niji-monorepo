import os
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans


# パレット作成用の関数
def create_palette(images, n_colors=16):
    all_pixels = np.vstack(
        [np.array(
            image.resize(
                (32, 32), Image.Resampling.LANCZOS)  # ここを修正
            ).reshape(-1, 3) for image in images])
    kmeans = KMeans(n_clusters=n_colors)
    kmeans.fit(all_pixels)
    palette = kmeans.cluster_centers_.astype(int)
    return palette


# 最も近い色に置き換える関数
def replace_colors(image, palette):
    image_array = np.array(image)
    reshaped_image = image_array.reshape(-1, 3)
    closest_colors = [
        min(
            palette, key=lambda color: np.linalg.norm(
                color - pixel)) for pixel in reshaped_image]
    new_image_array = np.array(closest_colors).reshape(image_array.shape)
    return Image.fromarray(new_image_array.astype('uint8'))


# 画像を読み込む関数
def load_images(directory):
    images = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.png') and not file == '.gitkeep':
                path = os.path.join(root, file)
                images.append(Image.open(path).convert('RGB'))  # ここを修正
    return images


# メイン処理
def process_images(base_dir, rel_dir):
    directory = os.path.join(base_dir, rel_dir)
    images = load_images(directory)
    palette = create_palette(images)

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.png') and not file == '.gitkeep':
                path = os.path.join(root, file)
                image = Image.open(path).convert('RGB')  # RGBに変換
                new_image = replace_colors(image, palette)
                new_image.save(path)

                # 変換前後の色の数を出力
                print(f'{file}: Before - {len(set(image.getdata()))}, \
After - {len(set(new_image.getdata()))}')


parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rel_dir = "images/v32v9/"
process_images(parent_dir, rel_dir)
