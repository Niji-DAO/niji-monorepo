import os
from PIL import Image
import numpy as np


def reduce_colors(image, n_colors=8):
    # 画像をRGBAに変換してnumpy配列にする
    image = image.convert('RGBA')
    data = np.array(image)

    # RGBデータのみを抽出し、色の範囲を減らす
    rgb_data = data[..., :3]
    quantized = (rgb_data // (256 // n_colors)) * (256 // n_colors)

    # 新しい画像データを作成し、透明度情報を保持
    new_data = np.insert(quantized, 3, data[..., 3], axis=2)
    new_image = Image.fromarray(new_data, 'RGBA')

    return new_image


def process_images(parent_dir, rel_dir):
    target_dir = os.path.join(parent_dir, rel_dir)
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith('.png') and not file.startswith('.gitkeep'):
                file_path = os.path.join(root, file)
                image = Image.open(file_path)

                # 変換前の色の数を計算（256色以上の場合はNoneが返るので対応）
                original_colors = image.getcolors(maxcolors=256)
                if original_colors is None:
                    original_color_count = "256+"
                else:
                    original_color_count = len(original_colors)

                # 色味を減らす
                reduced_image = reduce_colors(image)

                # 変換後の色の数を計算（同様に256色以上の場合はNoneが返るので対応）
                reduced_colors = reduced_image.getcolors(maxcolors=256)
                if reduced_colors is None:
                    reduced_color_count = "256+"
                else:
                    reduced_color_count = len(reduced_colors)

                # 画像を保存
                reduced_image.save(file_path)

                print(f'{file}: Original colors: {original_color_count}, \
                    Reduced colors: {reduced_color_count}')


parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rel_dir = "images/v96v2/"
process_images(parent_dir, rel_dir)
