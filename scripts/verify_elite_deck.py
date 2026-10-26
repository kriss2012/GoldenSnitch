import pptx

prs = pptx.Presentation("Golden Snitch (ScoutIQ) – Pitch Deck.pptx")
print(f"Presentation has {len(prs.slides)} slides. Dimensions: {prs.slide_width.inches:.3f} x {prs.slide_height.inches:.3f} in")

all_passed = True
for idx, slide in enumerate(prs.slides):
    print(f"\n--- Checking Slide {idx+1} ---")
    shapes = list(slide.shapes)
    images = [s for s in shapes if s.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE]
    text_boxes = [s for s in shapes if s.has_text_frame]
    print(f"Shapes: {len(shapes)} (Images: {len(images)}, Text Boxes: {len(text_boxes)})")
    
    # Check bounds
    for s in shapes:
        l = s.left / 914400.0
        t = s.top / 914400.0
        w = s.width / 914400.0
        h = s.height / 914400.0
        r = l + w
        b = t + h
        if r > 13.34 or b > 7.51:
            print(f"  ERROR: Shape '{s.name}' out of bounds! Right={r:.2f}, Bottom={b:.2f}")
            all_passed = False
            
    # Check title & subtitle gap
    titles = [s for s in text_boxes if abs(s.top / 914400.0 - 0.50) < 0.05]
    subtitles = [s for s in text_boxes if abs(s.top / 914400.0 - 1.08) < 0.05]
    if titles and subtitles:
        t_bot = (titles[0].top + titles[0].height) / 914400.0
        s_top = subtitles[0].top / 914400.0
        gap = s_top - t_bot
        print(f"  Title/Subtitle gap: {gap:.3f} inches (Non-overlapping: {gap > 0})")
        if gap < 0:
            print("  ERROR: Title and Subtitle overlap!")
            all_passed = False
            
    # Check speaker notes
    notes = slide.notes_slide.notes_text_frame.text.strip()
    print(f"  Speaker Notes: {len(notes)} chars (Has 4 sections: {'1. OPENING' in notes and '4. TRANSITION' in notes})")
    if not ('1. OPENING' in notes and '4. TRANSITION' in notes):
        print("  ERROR: Missing required 4-part speaker notes structure!")
        all_passed = False

if all_passed:
    print("\n>>> ALL QUALITY AUDITS PASSED WITH ZERO ERRORS! <<<")
else:
    print("\n>>> QUALITY AUDIT FAILED <<<")
