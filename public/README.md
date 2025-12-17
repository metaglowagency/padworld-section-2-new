# PADWORLD ASSET GUIDE

The application is configured to automatically look for the files listed below in this `public/` folder.
If a file is found, it will be used. If not, the app will fall back to the default design (Unsplash images).

---

## 1. HERO VISUAL
The Hero section looks for these files in priority order:
1. **Video**: `hero_bg.mp4`
2. **Image**: `hero_bg.jpg` (Fallback if video fails or is missing)

---

## 2. AUDIO
- **Background Music**: `padworld_theme.mp3`
- **Podcast/Briefing**: `padworld_podcast.mp3` (Upload your NotebookLM export here!)

---

## 3. SECTION DIVIDERS (IMAGES)
Upload images with these exact names to replace the dividers.
For best results, use JPG images with a resolution of at least 1920x1080.

| Section | Filename | Description |
| :--- | :--- | :--- |
| **1. The Arena** | `section_1_court.jpg` | Smart Court, Stadium, Architecture |
| **2. Optical Engine** | `section_2_vision.jpg` | Camera Lens, Optical Data, HUD |
| **3. Fair Play** | `section_3_referee.jpg` | Laser Lines, Geometry, Accuracy |
| **4. Super App** | `section_4_chat.jpg` | AI Brain, Network, Connection |
| **5. Deep Data** | `section_5_analytics.jpg` | Data Grid, Charts, Matrix |

---

## 4. VISION SCENARIOS
Upload images with these exact names to replace the preset scenarios in the "Pad Vision" section.
These should be high-quality action shots.

| Scenario | Filename | Description |
| :--- | :--- | :--- |
| **Scenario 1** | `vision_scenario_1_smash.jpg` | Player jumping for an overhead smash (Action shot). **Also the default Main Target.** |
| **Scenario 2** | `vision_scenario_2_volley.jpg` | Player close to the net blocking a ball (Volley) |
| **Scenario 3** | `vision_scenario_3_serve.jpg` | Player in the motion of serving |

---

## 5. DEMO SCREENS
Backgrounds for the interactive demo sections.

| Component | Filename | Description |
| :--- | :--- | :--- |
| **Auto-Referee** | `referee_demo.jpg` | Close up of a court line or ball bounce for the VAR simulation. |
| **Analytics Heatmap** | `analytics_heatmap.jpg` | Top-down view of a court for the heatmap visualization. |
| **Booking App** | `app_court.jpg` | Photo of a padel court used in the booking app UI card. |
