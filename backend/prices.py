# prices.py — Product price database for Smart Retail Checkout
# Maps YOLO class names to prices in INR

PRODUCT_PRICES = {
    # Snacks & Namkeen
    "Lays": 20, "lays": 20,
    "Bingo": 20, "bingo": 20,
    "Kurkure": 20, "kurkure": 20,
    "Haldirams": 30, "haldirams": 30,
    "Bikaji": 30, "bikaji": 30,
    "Too Yumm": 20, "too yumm": 20,
    "Pringles": 99, "pringles": 99,
    "Doritos": 99, "doritos": 99,
    "Act II Popcorn": 50, "act ii popcorn": 50,
    "Makhana": 120, "makhana": 120,
    "Pistachios": 250, "pistachios": 250,
    "Cashew": 200, "cashew": 200,

    # Instant Noodles & Pasta
    "Maggi": 14, "maggi": 14,
    "Yippee": 14, "yippee": 14,
    "Top Ramen": 14, "top ramen": 14,
    "Knorr": 30, "knorr": 30,

    # Biscuits & Cookies
    "Parle": 10, "parle": 10,
    "Parle-G": 10, "parle-g": 10,
    "Britannia": 30, "britannia": 30,
    "Oreo": 30, "oreo": 30,
    "Sunfeast": 30, "sunfeast": 30,
    "Hide & Seek": 40, "hide & seek": 40,
    "Good Day": 30, "good day": 30,
    "Marie Gold": 25, "marie gold": 25,
    "Bourbon": 30, "bourbon": 30,
    "Monaco": 30, "monaco": 30,

    # Dairy
    "Amul": 55, "amul": 55,
    "Mother Dairy": 55, "mother dairy": 55,
    "Milkybar": 40, "milkybar": 40,
    "KitKat": 40, "kitkat": 40,
    "Dairy Milk": 40, "dairy milk": 40,

    # Beverages
    "Tropicana": 90, "tropicana": 90,
    "Real": 85, "real": 85,
    "Frooti": 20, "frooti": 20,
    "Maaza": 20, "maaza": 20,
    "Limca": 35, "limca": 35,
    "Sprite": 40, "sprite": 40,
    "Coca Cola": 40, "coca cola": 40,
    "Pepsi": 40, "pepsi": 40,
    "Thums Up": 40, "thums up": 40,
    "Red Bull": 125, "red bull": 125,
    "Nescafe": 2, "nescafe": 2,
    "Bru": 2, "bru": 2,
    "Horlicks": 220, "horlicks": 220,
    "Boost": 220, "boost": 220,
    "Complan": 250, "complan": 250,

    # Spices & Condiments
    "MDH": 45, "mdh": 45,
    "Catch Table Salt": 45, "catch table salt": 45,
    "Everest": 45, "everest": 45,
    "Patanjali": 30, "patanjali": 30,
    "Maggi Sauce": 85, "maggi sauce": 85,
    "Kissan Jam": 120, "kissan jam": 120,
    "Lossan": 120, "lossan": 120,

    # Personal Care
    "Dettol": 75, "dettol": 75,
    "Colgate": 55, "colgate": 55,
    "Pepsodent": 55, "pepsodent": 55,
    "Closeup": 55, "closeup": 55,
    "Dove": 85, "dove": 85,
    "Lux": 45, "lux": 45,
    "Lifebuoy": 45, "lifebuoy": 45,
    "Nivea": 120, "nivea": 120,
    "Vaseline": 110, "vaseline": 110,
    "Himalaya": 75, "himalaya": 75,
    "Pantene": 175, "pantene": 175,
    "Head & Shoulders": 175, "head & shoulders": 175,
    "Sunsilk": 120, "sunsilk": 120,

    # Household
    "Vim": 45, "vim": 45,
    "Lizol": 85, "lizol": 85,
    "Harpic": 85, "harpic": 85,
    "SurfExcel": 180, "surfexcel": 180,
    "Ariel": 180, "ariel": 180,
    "Tide": 150, "tide": 150,
    "Comfort": 85, "comfort": 85,
    "Rin": 50, "rin": 50,
    "Scotch Brite": 35, "scotch brite": 35,
    "Mortein": 120, "mortein": 120,
    "Good Knight": 75, "good knight": 75,
    "Odomos": 85, "odomos": 85,

    # Cereals & Breakfast
    "Kelloggs": 180, "kelloggs": 180,
    "Muesli": 250, "muesli": 250,
    "Quaker Oats": 120, "quaker oats": 120,
    "Bagrry": 180, "bagrry": 180,

    # Health & Nutrition
    "Glucon D": 110, "glucon d": 110,
    "Revital": 450, "revital": 450,
    "Whipping Cream": 85, "whipping cream": 85,
    "Whiskas": 80, "whiskas": 80,
}

DEFAULT_PRICE = 50  # Default price for unrecognized products
GST_RATE = 0.05     # 5% GST


def get_price(product_name: str) -> int:
    """Get price for a product, case-insensitive lookup."""
    # Try exact match first
    if product_name in PRODUCT_PRICES:
        return PRODUCT_PRICES[product_name]
    # Try lowercase match
    if product_name.lower() in PRODUCT_PRICES:
        return PRODUCT_PRICES[product_name.lower()]
    # Try partial match
    for key in PRODUCT_PRICES:
        if key.lower() in product_name.lower() or product_name.lower() in key.lower():
            return PRODUCT_PRICES[key]
    return DEFAULT_PRICE
