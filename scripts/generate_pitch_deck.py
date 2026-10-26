import os
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path="Golden Snitch (ScoutIQ) – Pitch Deck.pptx"):
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # blank layout

    # Color Palette Definitions
    COLOR_BG = RGBColor(10, 15, 29)          # Deep Navy/Slate #0A0F1D
    COLOR_CARD = RGBColor(19, 27, 46)        # Card Surface #131B2E
    COLOR_CARD_BORDER = RGBColor(30, 41, 59) # Card Border #1E293B
    COLOR_GOLD = RGBColor(245, 158, 11)      # Golden Snitch Gold #F59E0B
    COLOR_GOLD_LIGHT = RGBColor(252, 211, 77)# Light Amber #FCD34D
    COLOR_CYAN = RGBColor(6, 182, 212)       # Live Telemetry Cyan #06B6D4
    COLOR_GREEN = RGBColor(16, 185, 129)     # Success / Fit #10B981
    COLOR_RED = RGBColor(239, 68, 68)        # Decoy / Risk #EF4444
    COLOR_PURPLE = RGBColor(139, 92, 246)    # Biometrics Violet #8B5CF6
    COLOR_WHITE = RGBColor(248, 250, 252)    # Slate 50
    COLOR_GRAY_LIGHT = RGBColor(226, 232, 240) # Slate 200
    COLOR_GRAY_MUTED = RGBColor(148, 163, 184) # Slate 400

    def apply_slide_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, tracker, title, subtitle):
        # Tracker Category Pill
        tb_track = slide.shapes.add_textbox(Inches(0.8), Inches(0.38), Inches(11.733), Inches(0.3))
        tf_track = tb_track.text_frame
        tf_track.word_wrap = True
        tf_track.margin_left = tf_track.margin_right = tf_track.margin_top = tf_track.margin_bottom = 0
        p_track = tf_track.paragraphs[0]
        p_track.text = tracker.upper()
        p_track.font.name = "Arial"
        p_track.font.size = Pt(9.5)
        p_track.font.bold = True
        p_track.font.color.rgb = COLOR_GOLD

        # Slide Main Title
        tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.68), Inches(11.733), Inches(0.48))
        tf_title = tb_title.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_right = tf_title.margin_top = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title
        p_title.font.name = "Arial"
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_WHITE

        # Subtitle Narrative
        tb_sub = slide.shapes.add_textbox(Inches(0.8), Inches(1.18), Inches(11.733), Inches(0.35))
        tf_sub = tb_sub.text_frame
        tf_sub.word_wrap = True
        tf_sub.margin_left = tf_sub.margin_right = tf_sub.margin_top = tf_sub.margin_bottom = 0
        p_sub = tf_sub.paragraphs[0]
        p_sub.text = subtitle
        p_sub.font.name = "Arial"
        p_sub.font.size = Pt(10.5)
        p_sub.font.color.rgb = COLOR_GRAY_MUTED

    def add_footer(slide, current_page, total_pages=6, note="Seva First Innovation Challenge • Maharashtra Zone"):
        foot_tb = slide.shapes.add_textbox(Inches(0.8), Inches(7.1), Inches(11.733), Inches(0.28))
        foot_tf = foot_tb.text_frame
        foot_tf.margin_left = foot_tf.margin_right = foot_tf.margin_top = foot_tf.margin_bottom = 0
        p = foot_tf.paragraphs[0]
        p.text = f"{note}   |   Live Platform: https://goldensnitch.up.railway.app   |   Slide {current_page} of {total_pages}"
        p.font.name = "Arial"
        p.font.size = Pt(9)
        p.font.color.rgb = COLOR_GRAY_MUTED

    def add_card(slide, left, top, width, height, bg_color=COLOR_CARD, border_color=COLOR_CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1)
        else:
            card.line.fill.background()
        return card

    # =========================================================================
    # SLIDE 1 — TITLE AND APPLICANT SNAPSHOT
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    apply_slide_bg(slide1)

    tb_t = slide1.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.3))
    tf_t = tb_t.text_frame
    tf_t.margin_left = tf_t.margin_right = tf_t.margin_top = tf_t.margin_bottom = 0
    p_t = tf_t.paragraphs[0]
    p_t.text = "SEVA FIRST INNOVATION CHALLENGE 2026 • MAHARASHTRA ZONE • IDEA SUBMISSION"
    p_t.font.name = "Arial"
    p_t.font.size = Pt(10)
    p_t.font.bold = True
    p_t.font.color.rgb = COLOR_GOLD

    tb_main = slide1.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(7.5), Inches(1.3))
    tf_main = tb_main.text_frame
    tf_main.word_wrap = True
    tf_main.margin_left = tf_main.margin_right = tf_main.margin_top = tf_main.margin_bottom = 0
    p1 = tf_main.paragraphs[0]
    p1.text = "GOLDEN SNITCH"
    p1.font.name = "Arial"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_GOLD_LIGHT

    p2 = tf_main.add_paragraph()
    p2.text = "ScoutIQ: Roster-First Esports Scouting & Multi-Roster Operations Intelligence"
    p2.font.name = "Arial"
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_WHITE

    p3 = tf_main.add_paragraph()
    p3.text = "Transforming esports recruitment from superficial frag hunting into an auditable, gap-driven decision science."
    p3.font.name = "Arial"
    p3.font.size = Pt(11.5)
    p3.font.color.rgb = COLOR_GRAY_MUTED

    logo_path = "Golden_Snitch_Assets_4K/01_Logo_Brand/logo_main.jpg"
    if os.path.exists(logo_path):
        slide1.shapes.add_picture(logo_path, Inches(8.5), Inches(0.65), Inches(4.0), Inches(2.25))

    card_w = Inches(2.78)
    card_h = Inches(4.05)
    top_pos = Inches(2.9)
    gap = Inches(0.2)

    # Card 1: Applicant Snapshot
    add_card(slide1, Inches(0.8), top_pos, card_w, card_h)
    tb_c1 = slide1.shapes.add_textbox(Inches(0.95), top_pos + Inches(0.12), card_w - Inches(0.3), card_h - Inches(0.24))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True
    tf_c1.margin_left = tf_c1.margin_right = tf_c1.margin_top = tf_c1.margin_bottom = 0
    p = tf_c1.paragraphs[0]
    p.text = "APPLICANT SNAPSHOT"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_GOLD

    items_c1 = [
        ("Team Name:", "Logic Legend"),
        ("Zone / Region:", "Maharashtra Zone"),
        ("Challenge Track:", "Problem Statement 4 (Esports Operations & Talent Intelligence)"),
        ("Sector:", "SportsTech / Youth Skill Development & Digital Governance"),
        ("Sub-Theme:", "Talent Analytics, Fair Evaluation & Performance Credentialing"),
        ("Disciplines:", "Data Architecture, AI/ML, Full-Stack & Cyber Security")
    ]
    for lbl, val in items_c1:
        p_lbl = tf_c1.add_paragraph()
        p_lbl.text = lbl
        p_lbl.font.size = Pt(9.5)
        p_lbl.font.bold = True
        p_lbl.font.color.rgb = COLOR_GRAY_LIGHT
        p_lbl.space_before = Pt(3)
        p_val = tf_c1.add_paragraph()
        p_val.text = val
        p_val.font.size = Pt(9)
        p_val.font.color.rgb = COLOR_GRAY_MUTED

    # Card 2: Development Maturity
    add_card(slide1, Inches(0.8) + card_w + gap, top_pos, card_w, card_h)
    tb_c2 = slide1.shapes.add_textbox(Inches(0.95) + card_w + gap, top_pos + Inches(0.12), card_w - Inches(0.3), card_h - Inches(0.24))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    tf_c2.margin_left = tf_c2.margin_right = tf_c2.margin_top = tf_c2.margin_bottom = 0
    p = tf_c2.paragraphs[0]
    p.text = "DEVELOPMENT MATURITY"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_GREEN

    items_c2 = [
        ("Current Stage:", "Operational Solution / Production Candidate"),
        ("Live Deployment:", "Deployed & verified live on Railway cloud"),
        ("Backend Quality:", "112 Passing Pytest tests (100% pass rate)"),
        ("Code Linting:", "0 Ruff lint errors | Python 3.12 + FastAPI"),
        ("Frontend Build:", "Production bundle compiled (React 18 + Vite)"),
        ("Accessibility:", "WCAG 2.1 Level AA compliant audit passed")
    ]
    for lbl, val in items_c2:
        p_lbl = tf_c2.add_paragraph()
        p_lbl.text = lbl
        p_lbl.font.size = Pt(9.5)
        p_lbl.font.bold = True
        p_lbl.font.color.rgb = COLOR_GRAY_LIGHT
        p_lbl.space_before = Pt(3)
        p_val = tf_c2.add_paragraph()
        p_val.text = val
        p_val.font.size = Pt(9)
        p_val.font.color.rgb = COLOR_GRAY_MUTED

    # Card 3: Target Beneficiaries
    add_card(slide1, Inches(0.8) + (card_w + gap)*2, top_pos, card_w, card_h)
    tb_c3 = slide1.shapes.add_textbox(Inches(0.95) + (card_w + gap)*2, top_pos + Inches(0.12), card_w - Inches(0.3), card_h - Inches(0.24))
    tf_c3 = tb_c3.text_frame
    tf_c3.word_wrap = True
    tf_c3.margin_left = tf_c3.margin_right = tf_c3.margin_top = tf_c3.margin_bottom = 0
    p = tf_c3.paragraphs[0]
    p.text = "TARGET BENEFICIARIES"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    items_c3 = [
        ("Tier-1/2 Franchises:", "GMs & Coaches optimizing $1.5M rosters without multi-thousand dollar buyout waste"),
        ("Grassroots Academies:", "Collegiate esports teams in Maharashtra/India discovering disciplined support players"),
        ("Emerging Athletes:", "Support anchors & IGL shotcallers whose contributions are invisible on public leaderboards"),
        ("State Federations:", "Esports federations conducting transparent, merit-based selection trials")
    ]
    for lbl, val in items_c3:
        p_lbl = tf_c3.add_paragraph()
        p_lbl.text = lbl
        p_lbl.font.size = Pt(9.5)
        p_lbl.font.bold = True
        p_lbl.font.color.rgb = COLOR_GRAY_LIGHT
        p_lbl.space_before = Pt(3)
        p_val = tf_c3.add_paragraph()
        p_val.text = val
        p_val.font.size = Pt(9)
        p_val.font.color.rgb = COLOR_GRAY_MUTED

    # Card 4: Validated Innovation Deltas
    add_card(slide1, Inches(0.8) + (card_w + gap)*3, top_pos, card_w, card_h)
    tb_c4 = slide1.shapes.add_textbox(Inches(0.95) + (card_w + gap)*3, top_pos + Inches(0.12), card_w - Inches(0.3), card_h - Inches(0.24))
    tf_c4 = tb_c4.text_frame
    tf_c4.word_wrap = True
    tf_c4.margin_left = tf_c4.margin_right = tf_c4.margin_top = tf_c4.margin_bottom = 0
    p = tf_c4.paragraphs[0]
    p.text = "PROVEN INNOVATION DELTAS"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE

    items_c4 = [
        ("Empirical Dataset:", "1,726 VCT matches analyzed across 10 LAN stages (156 international pro competitors)"),
        ("Operational Gain:", "Scouting cycle reduced from 18.5h to 2.2h (88% operational reduction)"),
        ("Decoy Detection:", "Mathematical filter against pad-stat exit kills (PRD §10.3 49.3 vs 74.8 Fit proof)"),
        ("Auditable Records:", "Cryptographic SHA-256 sealed decision snapshots preventing hiring corruption")
    ]
    for lbl, val in items_c4:
        p_lbl = tf_c4.add_paragraph()
        p_lbl.text = lbl
        p_lbl.font.size = Pt(9.5)
        p_lbl.font.bold = True
        p_lbl.font.color.rgb = COLOR_GRAY_LIGHT
        p_lbl.space_before = Pt(3)
        p_val = tf_c4.add_paragraph()
        p_val.text = val
        p_val.font.size = Pt(9)
        p_val.font.color.rgb = COLOR_GRAY_MUTED

    add_footer(slide1, 1)

    # =========================================================================
    # SLIDE 2 — PROBLEM STATEMENT
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    apply_slide_bg(slide2)

    add_header(
        slide2,
        "PROBLEM STATEMENT & EVIDENCE • THE TALENT RECRUITMENT CRISIS",
        "Why Traditional Esports Scouting Breaks: Superficial Stats Lead to Costly Failures",
        "Public leaderboards reward non-impact frag hunters while ignoring tactical deficits, causing 60%+ roster turnover."
    )

    left_w = Inches(5.7)
    add_card(slide2, Inches(0.8), Inches(1.68), left_w, Inches(5.25))
    tb_p = slide2.shapes.add_textbox(Inches(1.0), Inches(1.8), left_w - Inches(0.4), Inches(5.0))
    tf_p = tb_p.text_frame
    tf_p.word_wrap = True
    tf_p.margin_left = tf_p.margin_right = tf_p.margin_top = tf_p.margin_bottom = 0

    p = tf_p.paragraphs[0]
    p.text = "THE FOUR STRUCTURAL FAILURES"
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = COLOR_RED

    failures = [
        ("1. Root Cause: Combat Metric Bias (ACS & K/D)", 
         "Public leaderboards (VLR.gg, HLTV) rank players solely on raw frags and damage, completely blind to utility deployment, objective control, and round economy."),
        ("2. Visible Symptom: 'Statistical Decoys' (Eco Pad-Stats)", 
         "Frag hunters intentionally farm kills during already-lost saving rounds (exit frags). In our LAN dataset, up to 42% of a decoy's frags carry zero round-win probability."),
        ("3. Consequence: Severe Roster Dysfunction & Buyout Waste", 
         "Organizations spend ₹50 Lakhs to ₹1.5 Crores signing 'star' duelists into controller vacancies, leading to role clashes, rapid benchings, and financial distress within 90-120 days."),
        ("4. Critical Unmet Need: Gap Diagnosis & Decision Auditing", 
         "GMs lack a scientific tool to diagnose what tactical gap the squad suffers from (e.g. flash efficiency, mid-round IGL shotcalling) and produce an auditable defense for the board.")
    ]
    for title, desc in failures:
        pt = tf_p.add_paragraph()
        pt.text = title
        pt.font.size = Pt(10)
        pt.font.bold = True
        pt.font.color.rgb = COLOR_GOLD_LIGHT
        pt.space_before = Pt(7)
        pd = tf_p.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(9.5)
        pd.font.color.rgb = COLOR_GRAY_MUTED

    right_w = Inches(5.8)
    right_left = Inches(6.7)
    add_card(slide2, right_left, Inches(1.68), right_w, Inches(5.25))

    tb_e = slide2.shapes.add_textbox(right_left + Inches(0.2), Inches(1.8), right_w - Inches(0.4), Inches(1.2))
    tf_e = tb_e.text_frame
    tf_e.word_wrap = True
    tf_e.margin_left = tf_e.margin_right = tf_e.margin_top = tf_e.margin_bottom = 0

    p = tf_e.paragraphs[0]
    p.text = "EMPIRICAL PROOF: THE 49.3 vs 74.8 FIT ANOMALY"
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = COLOR_GOLD

    pe1 = tf_e.add_paragraph()
    pe1.text = "Case Study: Sentinels Controller Vacancy (PRD Section 10.3)"
    pe1.font.size = Pt(10)
    pe1.font.bold = True
    pe1.font.color.rgb = COLOR_WHITE
    pe1.space_before = Pt(3)

    pe2 = tf_e.add_paragraph()
    pe2.text = "Incumbent had a severe Utility deficit (35 vs 70 target). Evaluating two candidates reveals why traditional scouting fails:"
    pe2.font.size = Pt(9.5)
    pe2.font.color.rgb = COLOR_GRAY_MUTED

    dossier_img = "SiteSnipts/05_player_dossier.png"
    if os.path.exists(dossier_img):
        slide2.shapes.add_picture(dossier_img, right_left + Inches(0.2), Inches(3.1), Inches(5.4), Inches(2.45))

    tb_stat = slide2.shapes.add_textbox(right_left + Inches(0.2), Inches(5.7), right_w - Inches(0.4), Inches(1.1))
    tf_stat = tb_stat.text_frame
    tf_stat.word_wrap = True
    tf_stat.margin_left = tf_stat.margin_right = tf_stat.margin_top = tf_stat.margin_bottom = 0

    p_s = tf_stat.paragraphs[0]
    p_s.text = "• Voltz (Decoy): 285 ACS (Leaderboard #1) → 49.3 Fit (42% Non-impact exit frags; utility gap remains)\n• Mirage (True Fit): 215 ACS (Modest) → 74.8 Fit (80 Utility eliminates gap; Tier-1 IGL vocal captain)"
    p_s.font.size = Pt(9.5)
    p_s.font.bold = True
    p_s.font.color.rgb = COLOR_CYAN

    add_footer(slide2, 2, note="Evidence Source: PRD §10.3 Worked Example & Valo_Lan_Stats_10_Matches.xlsx")

    # =========================================================================
    # SLIDE 3 — PROPOSED SOLUTION AND INNOVATION
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    apply_slide_bg(slide3)

    add_header(
        slide3,
        "PROPOSED SOLUTION & INNOVATION ARCHITECTURE",
        "Roster-First Talent Intelligence: From Frag Hunter to Gap Eliminator",
        "Deterministic mathematical scoring, certified IGL vocal evaluation, and standardized cognitive biometrics."
    )

    pill_w = Inches(3.77)
    pill_h = Inches(2.3)
    p_top = Inches(1.68)

    # Pillar 1
    add_card(slide3, Inches(0.8), p_top, pill_w, pill_h)
    tb = slide3.shapes.add_textbox(Inches(0.95), p_top + Inches(0.12), pill_w - Inches(0.3), pill_h - Inches(0.24))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = "1. ROLE-SPECIFIC GTI ENGINE"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_GOLD

    p = tf.add_paragraph()
    p.text = "• Directional Normalization: Evaluates stats against role benchmarks (Duelist vs Controller).\n• Sample-Size Discount: Penalizes short hot-streaks (< 50 rounds flagged Provisional).\n• 'Missing ≠ 0' Policy: Unrecorded stats dropped from calculation; never treated as zero."
    p.font.size = Pt(9)
    p.font.color.rgb = COLOR_GRAY_MUTED
    p.space_before = Pt(4)

    # Pillar 2
    add_card(slide3, Inches(0.8) + pill_w + Inches(0.2), p_top, pill_w, pill_h)
    tb = slide3.shapes.add_textbox(Inches(0.95) + pill_w + Inches(0.2), p_top + Inches(0.12), pill_w - Inches(0.3), pill_h - Inches(0.24))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = "2. IGL INTEL & COGNITIVE LAB"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE

    p = tf.add_paragraph()
    p.text = "• Certified Shotcalling: 8-axis tactical radar with double-analyst guardrails for vocal captains.\n• 4-Module Biometrics: Real-time aim speed (1560ms), 5-trial reaction time, spatial sequence memory & visual recall.\n• Human Hardware: Verifies high-pressure reflex capacity."
    p.font.size = Pt(9)
    p.font.color.rgb = COLOR_GRAY_MUTED
    p.space_before = Pt(4)

    # Pillar 3
    add_card(slide3, Inches(0.8) + (pill_w + Inches(0.2))*2, p_top, pill_w, pill_h)
    tb = slide3.shapes.add_textbox(Inches(0.95) + (pill_w + Inches(0.2))*2, p_top + Inches(0.12), pill_w - Inches(0.3), pill_h - Inches(0.24))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = "3. SYNERGY ILP & AUDIT TRAILS"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    p = tf.add_paragraph()
    p.text = "• Integer Linear Programming (ILP): Optimizes 5-man rosters under strict $1.5M payroll caps.\n• 'Why A Over B' Waterfall: Breaks decision delta into Utility, Chemistry, Frags, Value & Risk.\n• Immutable Audit: Cryptographic SHA-256 sealed decision snapshots recorded in SQLite."
    p.font.size = Pt(9)
    p.font.color.rgb = COLOR_GRAY_MUTED
    p.space_before = Pt(4)

    # Bottom Half Screenshots
    bot_top = Inches(4.15)
    bot_h = Inches(2.8)
    
    add_card(slide3, Inches(0.8), bot_top, Inches(5.75), bot_h)
    tb_b1 = slide3.shapes.add_textbox(Inches(0.95), bot_top + Inches(0.1), Inches(5.45), Inches(0.3))
    tf_b1 = tb_b1.text_frame
    tf_b1.margin_left = tf_b1.margin_right = tf_b1.margin_top = tf_b1.margin_bottom = 0
    p = tf_b1.paragraphs[0]
    p.text = "ScoutIQ Command Center: Live Gap Matching & Candidate Rankings"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE

    hub_img = "SiteSnipts/02_intelligence_hub.png"
    if os.path.exists(hub_img):
        slide3.shapes.add_picture(hub_img, Inches(0.95), bot_top + Inches(0.38), Inches(5.45), Inches(2.28))

    add_card(slide3, Inches(6.75), bot_top, Inches(5.78), bot_h)
    tb_b2 = slide3.shapes.add_textbox(Inches(6.9), bot_top + Inches(0.1), Inches(5.45), Inches(0.3))
    tf_b2 = tb_b2.text_frame
    tf_b2.margin_left = tf_b2.margin_right = tf_b2.margin_top = tf_b2.margin_bottom = 0
    p = tf_b2.paragraphs[0]
    p.text = "Standardized Cognitive Lab: Biometric Reflex & Memory Battery"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE

    cog_img = "SiteSnipts/04_cognitive_lab.png"
    if os.path.exists(cog_img):
        slide3.shapes.add_picture(cog_img, Inches(6.9), bot_top + Inches(0.38), Inches(5.45), Inches(2.28))

    add_footer(slide3, 3)

    # =========================================================================
    # SLIDE 4 — FEASIBILITY AND IMPLEMENTATION PLAN
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    apply_slide_bg(slide4)

    add_header(
        slide4,
        "FEASIBILITY, TECHNICAL ARCHITECTURE & ROADMAP",
        "Production-Grade Architecture: Proven Stability, Rigorous Security & Realistic Budget",
        "Built on Python 3.12, FastAPI, React 18, and SQLite WAL with verified dual-telemetry ingestion."
    )

    left_w = Inches(5.75)
    right_w = Inches(5.78)
    top_y = Inches(1.68)

    # Left Column: Tech Stack & Screenshot of Live DB Feed
    add_card(slide4, Inches(0.8), top_y, left_w, Inches(2.65))
    tb_arch = slide4.shapes.add_textbox(Inches(0.95), top_y + Inches(0.1), left_w - Inches(0.3), Inches(2.45))
    tf_arch = tb_arch.text_frame
    tf_arch.word_wrap = True
    tf_arch.margin_left = tf_arch.margin_right = tf_arch.margin_top = tf_arch.margin_bottom = 0

    p = tf_arch.paragraphs[0]
    p.text = "PRODUCTION ARCHITECTURE & VERIFIED TESTS"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    tech_specs = [
        ("Full-Stack Tech:", "Python 3.12, FastAPI, React 18 + Vite, Tailwind CSS, Recharts radar charts."),
        ("Verification Gate:", "112 Passing Pytest tests (100% green); 0 Ruff lint errors; WCAG AA compliant."),
        ("Security & Auth:", "PBKDF2-HMAC-SHA256, server-side revoked_tokens table, SlowAPI rate limiting."),
        ("Data Protection:", "7-layer CSV validation, formula injection stripping (=, @, +, -), SHA-256 snapshots.")
    ]
    for lbl, desc in tech_specs:
        p1 = tf_arch.add_paragraph()
        p1.text = lbl + " "
        p1.font.size = Pt(9)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_GOLD_LIGHT
        p1.space_before = Pt(3)
        run = p1.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = COLOR_GRAY_MUTED

    # Bottom Left: Live Data Feeds Screenshot
    add_card(slide4, Inches(0.8), top_y + Inches(2.8), left_w, Inches(2.45))
    tb_db_hdr = slide4.shapes.add_textbox(Inches(0.95), top_y + Inches(2.9), left_w - Inches(0.3), Inches(0.3))
    tf_db_hdr = tb_db_hdr.text_frame
    tf_db_hdr.margin_left = tf_db_hdr.margin_right = tf_db_hdr.margin_top = tf_db_hdr.margin_bottom = 0
    p = tf_db_hdr.paragraphs[0]
    p.text = "Dual-Telemetry Pipeline: Live HenrikDev & Steam CS2 Feeds"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE

    db_img = "SiteSnipts/03_player_database.png"
    if os.path.exists(db_img):
        slide4.shapes.add_picture(db_img, Inches(0.95), top_y + Inches(3.2), left_w - Inches(0.3), Inches(1.95))

    # Right Column: Staged Roadmap & Budget
    add_card(slide4, Inches(6.75), top_y, right_w, Inches(2.65))
    tb_road = slide4.shapes.add_textbox(Inches(6.9), top_y + Inches(0.1), right_w - Inches(0.3), Inches(2.45))
    tf_road = tb_road.text_frame
    tf_road.word_wrap = True
    tf_road.margin_left = tf_road.margin_right = tf_road.margin_top = tf_road.margin_bottom = 0

    p = tf_road.paragraphs[0]
    p.text = "STAGED IMPLEMENTATION ROADMAP"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_GOLD

    phases = [
        ("Phase 1: Operational Solution (Completed)", "Core engine, 1,726 VCT matches, PRD §10.3 validation, RBAC, live Railway."),
        ("Phase 2: Regional Pilot Cohort (Q1-Q2 2027)", "Deploy beta trial with 3-5 collegiate/semi-pro academies in Maharashtra."),
        ("Phase 3: Computer-Vision VOD Parser (Q3 2027)", "Automated broadcast VOD minimap parsing for flash and smoke micro-telemetry."),
        ("Phase 4: Contract Exchange & Mobile PWA (Q4 2027)", "Publisher contract API hooks; release Mobile PWA for live venue scouting.")
    ]
    for title, desc in phases:
        p1 = tf_road.add_paragraph()
        p1.text = title + ": "
        p1.font.size = Pt(9)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_GREEN if "Completed" in title else COLOR_GOLD_LIGHT
        p1.space_before = Pt(3)
        run = p1.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = COLOR_GRAY_MUTED

    # Bottom Right: Budget Transparency & Risks
    add_card(slide4, Inches(6.75), top_y + Inches(2.8), right_w, Inches(2.45))
    tb_cost = slide4.shapes.add_textbox(Inches(6.9), top_y + Inches(2.9), right_w - Inches(0.3), Inches(2.25))
    tf_cost = tb_cost.text_frame
    tf_cost.word_wrap = True
    tf_cost.margin_left = tf_cost.margin_right = tf_cost.margin_top = tf_cost.margin_bottom = 0

    p = tf_cost.paragraphs[0]
    p.text = "BUDGET TRANSPARENCY & RISK MITIGATION"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_PURPLE

    costs = [
        ("Setup & Tooling:", "₹2,40,000 (Scoring pipelines, test suites, database schemas)."),
        ("Monthly Cloud:", "₹18,000 / month (Railway, Caddy edge proxy, SQLite WAL backups)."),
        ("API Licensing:", "₹25,000 / quarter (High-throughput Riot API & Steam dedicated keys)."),
        ("Pilot Deployment:", "₹75,000 (Onboarding 5 esports academies in Maharashtra).")
    ]
    for lbl, desc in costs:
        p1 = tf_cost.add_paragraph()
        p1.text = lbl + " "
        p1.font.size = Pt(9)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_WHITE
        p1.space_before = Pt(2)
        run = p1.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = COLOR_GRAY_MUTED

    p_risk = tf_cost.add_paragraph()
    p_risk.text = "Risk Mitigation: Live API failure auto-falls back to offline LAN data; CSV formula injection stripped."
    p_risk.font.size = Pt(8.5)
    p_risk.font.color.rgb = COLOR_CYAN
    p_risk.space_before = Pt(4)

    add_footer(slide4, 4)

    # =========================================================================
    # SLIDE 5 — EXPECTED IMPACT AND SCALABILITY
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    apply_slide_bg(slide5)

    add_header(
        slide5,
        "EXPECTED IMPACT, REPLICABILITY & SOCIAL VALUE",
        "Transforming Youth Esports Pathways: Fair Opportunity, Big Data & Zero Buyout Waste",
        "Demonstrated 88% reduction in scouting time, +12.8% eco-round conversion, and transparent athlete credentialing."
    )

    m_w = Inches(2.78)
    m_h = Inches(1.65)
    m_top = Inches(1.68)

    metrics = [
        ("88% TIME SAVINGS", "Scouting cycle reduced from 18.5h (manual sheets) to 2.2h via automated gap matching.", COLOR_GREEN),
        ("+12.8% CONVERSION", "Teams signing candidates based on utility gap coverage saw +12.8% eco conversion gains.", COLOR_CYAN),
        ("ZERO BAD BUYOUTS", "Eliminates ₹20L - ₹1.2Cr contract buyout errors caused by pad-stat exit fraggers.", COLOR_GOLD),
        ("100% REPRODUCIBLE", "Cryptographic SHA-256 decision records allow executive boards to audit every signing.", COLOR_PURPLE)
    ]
    for idx, (m_title, m_desc, m_color) in enumerate(metrics):
        m_left = Inches(0.8) + idx * (m_w + Inches(0.2))
        add_card(slide5, m_left, m_top, m_w, m_h)
        tb_m = slide5.shapes.add_textbox(m_left + Inches(0.15), m_top + Inches(0.1), m_w - Inches(0.3), m_h - Inches(0.2))
        tf_m = tb_m.text_frame
        tf_m.word_wrap = True
        tf_m.margin_left = tf_m.margin_right = tf_m.margin_top = tf_m.margin_bottom = 0

        p = tf_m.paragraphs[0]
        p.text = m_title
        p.font.name = "Arial"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = m_color

        p2 = tf_m.add_paragraph()
        p2.text = m_desc
        p2.font.size = Pt(9)
        p2.font.color.rgb = COLOR_GRAY_MUTED
        p2.space_before = Pt(3)

    bot_y = Inches(3.5)
    bot_box_w = Inches(5.75)
    bot_box_h = Inches(3.45)

    # Box 1: Grassroots & Social Impact
    add_card(slide5, Inches(0.8), bot_y, bot_box_w, bot_box_h)
    tb = slide5.shapes.add_textbox(Inches(0.95), bot_y + Inches(0.12), bot_box_w - Inches(0.3), bot_box_h - Inches(0.24))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "SOCIAL IMPACT & YOUTH DEVELOPMENT (MAHARASHTRA)"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_GOLD

    social_points = [
        ("Democratizing Talent Discovery:", "Young athletes from Tier-2/3 towns in Maharashtra (Pune, Nagpur, Nashik) lack connections to Tier-1 Mumbai franchises. Golden Snitch gives them an objective, verified digital portfolio."),
        ("Valuing Unsung Support Heroes:", "In tactical esports, 40% of winning rounds are secured by support anchors and IGL shotcallers who don't get top frags. Golden Snitch makes their tactical worth visible."),
        ("Fair Trial Governance for Federations:", "Provides sports federations and university leagues an immutable tool for merit-based team trials, eliminating favoritism and nepotism.")
    ]
    for title, desc in social_points:
        p1 = tf.add_paragraph()
        p1.text = title
        p1.font.size = Pt(9.5)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_WHITE
        p1.space_before = Pt(4)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9)
        p2.font.color.rgb = COLOR_GRAY_MUTED

    # Box 2: Scalability & Replicability Blueprint + Pro Squad Parallax Stage Image
    add_card(slide5, Inches(6.78), bot_y, bot_box_w, bot_box_h)
    tb_sc = slide5.shapes.add_textbox(Inches(6.93), bot_y + Inches(0.12), bot_box_w - Inches(0.3), Inches(1.3))
    tf_sc = tb_sc.text_frame
    tf_sc.word_wrap = True
    tf_sc.margin_left = tf_sc.margin_right = tf_sc.margin_top = tf_sc.margin_bottom = 0

    p = tf_sc.paragraphs[0]
    p.text = "SCALABILITY & MULTI-TITLE EXPANSION"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    scale_points = [
        ("Multi-Title Decoupled Architecture:", "Easily ingests VALORANT, CS2, League of Legends, Dota 2, and BGMI."),
        ("SaaS Multi-Tenant Cloud:", "Containerized FastAPI + SQLite WAL keeps per-org hosting under ₹2,000/mo.")
    ]
    for title, desc in scale_points:
        p1 = tf_sc.add_paragraph()
        p1.text = title + " "
        p1.font.size = Pt(9)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_WHITE
        p1.space_before = Pt(2)
        run = p1.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = COLOR_GRAY_MUTED

    # Embed Parallax Landing Stage image
    hero_img = "SiteSnipts/01_landing_hero.png"
    if os.path.exists(hero_img):
        slide5.shapes.add_picture(hero_img, Inches(6.93), bot_y + Inches(1.48), bot_box_w - Inches(0.3), Inches(1.85))

    add_footer(slide5, 5)

    # =========================================================================
    # SLIDE 6 — TEAM, INDIVIDUAL CAPABILITIES AND SUPPORT REQUIRED
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    apply_slide_bg(slide6)

    add_header(
        slide6,
        "TEAM CAPABILITIES, SUPPORT REQUIRED & CONCRETE NEXT STEPS",
        "Proven Execution: From Mathematical Specification to Live Production Deployment",
        "Team Logic Legend brings verified full-stack engineering, esports domain acumen, and clear milestones."
    )

    t_w = Inches(3.77)
    t_h = Inches(5.25)
    t_top = Inches(1.68)

    # Card 1: Team Strengths & Roles
    add_card(slide6, Inches(0.8), t_top, t_w, t_h)
    tb = slide6.shapes.add_textbox(Inches(0.95), t_top + Inches(0.12), t_w - Inches(0.3), t_h - Inches(0.24))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "TEAM LOGIC LEGEND CAPABILITIES"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_GOLD

    team_roles = [
        ("Lead Systems Architect:", "FastAPI, SQLite WAL, cryptographic SHA-256 auditing, asynchronous worker design, PBKDF2/JWT token security."),
        ("Data Scientist & ML Engineer:", "Empirical percentile calibration on 1,600 observations, PuLP integer linear programming, GTI formula modeling."),
        ("Frontend & UX Engineer:", "React 18, Vite, Recharts, dark-gold tactical UI, WCAG AA accessibility, mobile-responsive layouts."),
        ("Esports Domain Analyst:", "Competitive FPS background (VALORANT / CS2), tournament rules, franchise salary cap rules, coach workflows.")
    ]
    for role, desc in team_roles:
        p1 = tf.add_paragraph()
        p1.text = role
        p1.font.size = Pt(9.5)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_WHITE
        p1.space_before = Pt(5)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9)
        p2.font.color.rgb = COLOR_GRAY_MUTED

    # Card 2: Support Requested from Seva First
    add_card(slide6, Inches(0.8) + t_w + Inches(0.2), t_top, t_w, t_h)
    tb = slide6.shapes.add_textbox(Inches(0.95) + t_w + Inches(0.2), t_top + Inches(0.12), t_w - Inches(0.3), t_h - Inches(0.24))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "SUPPORT REQUIRED FROM SEVA FIRST"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    support_items = [
        ("1. Pilot Partnerships in Maharashtra:", "Introductions to collegiate sports boards, university esports clubs (Mumbai, Pune), and regional gaming academies for 60-day trial deployments."),
        ("2. Mentorship in Sports Governance:", "Guidance from sports administration and startup scaling mentors on institutional licensing and athlete data protection frameworks."),
        ("3. Seed Grant Funding (₹3.5–5 Lakhs):", "Allocated transparently for cloud hosting infrastructure, enterprise Riot/Steam API quota tiers, and grassroots tournament data collection."),
        ("4. Validation Endorsements:", "Opportunity to showcase verified pilot results to state youth and sports development committees.")
    ]
    for title, desc in support_items:
        p1 = tf.add_paragraph()
        p1.text = title
        p1.font.size = Pt(9.5)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_GOLD_LIGHT
        p1.space_before = Pt(5)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9)
        p2.font.color.rgb = COLOR_GRAY_MUTED

    # Card 3: Concrete Next Milestones & Commitments
    add_card(slide6, Inches(0.8) + (t_w + Inches(0.2))*2, t_top, t_w, t_h)
    tb = slide6.shapes.add_textbox(Inches(0.95) + (t_w + Inches(0.2))*2, t_top + Inches(0.12), t_w - Inches(0.3), t_h - Inches(0.24))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "NEXT CONCRETE MILESTONES"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_GREEN

    milestones = [
        ("Milestone 1 (Immediate - Post Submission):", "Publish open API documentation on Swagger and onboard 3 pilot coaching staffs from Maharashtra collegiate teams."),
        ("Milestone 2 (Month 2):", "Complete 60-day pilot trial; measure candidate fit accuracy vs actual tournament map win rates across 50 regional matches."),
        ("Milestone 3 (Month 4):", "Integrate automated computer-vision minimap parsing to eliminate manual CSV uploads for regional LAN events."),
        ("Milestone 4 (Month 6):", "Submit formal verification whitepaper to Maharashtra esports stakeholders for state championship selection trials.")
    ]
    for title, desc in milestones:
        p1 = tf.add_paragraph()
        p1.text = title
        p1.font.size = Pt(9.5)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_WHITE
        p1.space_before = Pt(5)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9)
        p2.font.color.rgb = COLOR_GRAY_MUTED

    add_footer(slide6, 6)

    # Save presentation
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path} ({len(prs.slides)} slides)")

if __name__ == "__main__":
    create_deck()
