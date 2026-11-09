"""Use this machine's Python with the project's bundled Django dependencies."""
import os
from pathlib import Path
import runpy
import sys


project = Path(__file__).resolve().parent
backend = project / "backend"
dependencies = backend / ".venv" / "Lib" / "site-packages"
if dependencies.is_dir():
    sys.path.insert(0, str(dependencies))
sys.path.insert(0, str(backend))
os.chdir(backend)
sys.argv[0] = str(backend / "manage.py")
runpy.run_path(str(backend / "manage.py"), run_name="__main__")
