# Smart Retail Checkout

An AI-powered checkout application that detects grocery products from uploaded images and automatically generates a combined bill.

The project uses a custom YOLO model for product detection, FastAPI for inference and billing, and React for the checkout interface.

![Smart Retail Checkout home screen](Screenshots/home.png)

## Highlights

- Upload one or multiple grocery images
- Detect products using a custom YOLO model
- Adjust the detection confidence threshold
- Combine duplicate products across images
- Calculate item totals, 5% GST, and the final amount
- Print the generated bill directly from the browser
- Use the responsive interface on desktop and mobile screens

## How it works

1. The shopper uploads one or more product images.
2. The frontend sends each image to the FastAPI detection endpoint.
3. YOLO identifies products and returns their labels and confidence scores.
4. The application combines detected items, looks up their prices, and generates one bill.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Axios, CSS |
| Backend | FastAPI, Uvicorn, Python |
| AI/ML | Ultralytics YOLO, PyTorch, Pillow |
| Billing | Python price map with 5% GST |

## Project structure

```text
SmartRetailCheckout/
|-- backend/
|   |-- best.pt              # Trained YOLO weights (not tracked by Git)
|   |-- main.py              # API and inference logic
|   |-- prices.py            # Product prices and GST rate
|   `-- requirements.txt
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- App.css
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
|-- Screenshots/
`-- README.md
```

## Prerequisites

Install the following before starting:

- Python 3.10 or newer
- Node.js 20 or newer
- npm
- A trained YOLO weights file named `best.pt`

> `backend/best.pt` is required at runtime and is intentionally excluded from Git because model files are usually large.

## Quick start

### 1. Clone the repository

```powershell
git clone https://github.com/hitesh-2005/Smart_Retail_Checkout_System.git
cd Smart_Retail_Checkout_System
```

Place your trained model at:

```text
backend/best.pt
```

### 2. Start the backend

Run these commands in the first PowerShell terminal:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

Useful backend pages:

- Health check: `http://localhost:8000/health`
- Interactive API documentation: `http://localhost:8000/docs`

### 3. Start the frontend

Open a second PowerShell terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | API status and model availability |
| `GET` | `/health` | Backend and model health check |
| `GET` | `/classes` | List classes supported by the loaded model |
| `POST` | `/detect` | Detect products in an uploaded image and generate bill data |

The `/detect` endpoint accepts:

- `file`: an uploaded image
- `confidence`: a value between `0.10` and `0.90` (default: `0.60`)

## Quality checks

Run the frontend checks before committing changes:

```powershell
cd frontend
npm run lint
npm run build
```

## Screenshots

### Product detection

![Detected grocery products with confidence scores](Screenshots/detection.png)

### Generated bill

![Generated smart retail bill](Screenshots/bill.png)

### Printable bill

![Printable bill view](Screenshots/pdf_bill.png)

## Configuration

- Frontend API URL: `frontend/src/App.jsx`
- Model location: `backend/best.pt`
- Product prices and GST: `backend/prices.py`
- Allowed frontend origins: `backend/main.py`

If you change the backend port, update `API_URL` in `frontend/src/App.jsx` as well.

## Troubleshooting

### The backend reports `Model not loaded`

Confirm that the model exists at `backend/best.pt` and restart the backend.

### The frontend reports `Detection failed`

Make sure the FastAPI server is running on port `8000`, then check `http://localhost:8000/health`.

### PowerShell blocks virtual environment activation

The commands above call the virtual environment's Python executable directly, so activation is not required.

### Installation is slow

PyTorch and Ultralytics are large dependencies. The first backend installation can take several minutes depending on the system and connection.

## Future improvements

- Real-time webcam detection
- Inventory management
- Barcode and QR support
- Persistent sales history and analytics
- Digital payments

## Author

Built by [Hitesh Gupta](https://github.com/hitesh-2005).
