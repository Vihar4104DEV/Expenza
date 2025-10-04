from dotenv import load_dotenv
from pathlib import Path

ENVS_FILES = {
    'development': '.env',
    'local': '.env.local',
    'production': '.env.master',
    'staging': '.env.staging',
}

ENV = 'development'

# Load environment variables FIRST before importing configs
BASE_DIR = Path(__file__).resolve().parent.parent.parent

print(f"Loading environment variables from {ENVS_FILES.get(ENV, '.env.local')}")
load_dotenv(dotenv_path=BASE_DIR / ENVS_FILES.get(ENV, '.env'), override=True)

