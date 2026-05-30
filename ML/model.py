import zipfile
import json
import shutil
from pathlib import Path

MODEL_PATH = Path("prediction/foodrescue_model.keras")
BACKUP_PATH = Path("prediction/foodrescue_model_backup.keras")
TEMP_PATH = Path("prediction/foodrescue_model_fixed.keras")

shutil.copy(MODEL_PATH, BACKUP_PATH)

def remove_quantization_config(obj):
    if isinstance(obj, dict):
        obj.pop("quantization_config", None)
        for value in obj.values():
            remove_quantization_config(value)
    elif isinstance(obj, list):
        for item in obj:
            remove_quantization_config(item)

with zipfile.ZipFile(MODEL_PATH, "r") as zin:
    with zipfile.ZipFile(TEMP_PATH, "w") as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)

            if item.filename == "config.json":
                config = json.loads(data.decode("utf-8"))
                remove_quantization_config(config)
                data = json.dumps(config).encode("utf-8")

            zout.writestr(item, data)

shutil.move(TEMP_PATH, MODEL_PATH)

print("Model berhasil diperbaiki.")
print("Backup tersimpan di:", BACKUP_PATH)