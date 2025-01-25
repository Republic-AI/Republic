import os
from dotenv import load_dotenv
from src.app import app

load_dotenv()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)