"""Use this machine's Python with the project's bundled Django dependencies."""
import os
from pathlib import Path
import runpy
import site
import sys


project = Path(__file__).resolve().parent
backend = project / "backend"
dependencies = backend / ".venv" / "Lib" / "site-packages"
if dependencies.is_dir():
    sys.path.insert(0, str(dependencies))
    # Portable Python environments can contain native wheels built for another
    # interpreter. Prefer the machine's matching Pillow binary when that happens.
    try:
        import PIL._imaging  # noqa: F401
    except ImportError:
        user_packages = Path(site.getusersitepackages())
        if any((user_packages / "PIL").glob("_imaging*.pyd")):
            for module in tuple(sys.modules):
                if module == "PIL" or module.startswith("PIL."):
                    del sys.modules[module]
            sys.path.insert(0, str(user_packages))
            try:
                import PIL._imaging  # noqa: F401
                sys.path.remove(str(user_packages))
            except ImportError:
                sys.path.remove(str(user_packages))
                for module in tuple(sys.modules):
                    if module == "PIL" or module.startswith("PIL."):
                        del sys.modules[module]
sys.path.insert(0, str(backend))
os.chdir(backend)
sys.argv[0] = str(backend / "manage.py")
runpy.run_path(str(backend / "manage.py"), run_name="__main__")
