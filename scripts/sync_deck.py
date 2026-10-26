import shutil
import time

src = "Golden_Snitch_Pitch_Deck_Enhanced.pptx"
dst = "Golden Snitch (ScoutIQ) – Pitch Deck.pptx"

try:
    shutil.copyfile(src, dst)
    print(f"SUCCESS: Synchronized '{src}' -> '{dst}'.")
except PermissionError:
    print(f"NOTICE: '{dst}' is currently open in PowerPoint. Please close PowerPoint and re-run this script to overwrite.")
