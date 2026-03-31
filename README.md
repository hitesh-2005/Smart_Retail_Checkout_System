# Smart Retail Checkout using YOLOv12

## Overview
Smart Retail Checkout is a computer vision-based project that detects grocery products automatically using a YOLO object detection model. The system identifies products such as Maggi, Lays, Kurkure, Dairy Milk, Soap, Milk, Good Day, etc., from an image and can be extended to generate an automatic bill.

---

## Features

- Automatic grocery item detection
- Detects multiple items in a single image
- Lightweight and fast YOLO-based model
- Reduced dataset training for lower execution time
- Custom image prediction support
- Can be extended for real-time checkout systems

---

## Dataset

Dataset Used: `Grocery_Items.v45i.yolov8.zip`

Dataset Structure:

```text
train/
│── images/
│── labels/

valid/
│── images/
│── labels/

test/
│── images/
│── labels/
