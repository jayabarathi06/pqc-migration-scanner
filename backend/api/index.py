import sys
from pathlib import Path

# Ensure backend root directory is on Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import app
