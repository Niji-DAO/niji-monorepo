import os
from PIL import Image


def resize_image(image, size=(48, 48)):
    # 画像のサイズを変更（Image.ANTIALIASの代わりにImage.Resampling.LANCZOSを使用）
    resized_image = image.resize(size, Image.Resampling.LANCZOS)
    return resized_image


def process_images(parent_dir, rel_dir):
    target_dir = os.path.join(parent_dir, rel_dir)
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith('.png') and not file.startswith('.gitkeep'):
                file_path = os.path.join(root, file)
                image = Image.open(file_path)

                # 画像のサイズを変更
                resized_image = resize_image(image)

                # 画像を保存
                resized_image.save(file_path)

                print(f'Resized {file} to 48x48 pixels')


# 現在のスクリプトファイルの親ディレクトリを取得
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rel_dir = "images/v48/"
process_images(parent_dir, rel_dir)
