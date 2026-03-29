# Design System Strategy: The Sonic Kineticism

## 1. Overview & Creative North Star: "The Neon Pulse"
This design system is engineered to capture the high-stakes, high-energy atmosphere of a headline DJ set. We are moving away from the static, boxy layouts of traditional software and toward a **"Neon Pulse"** aesthetic—an interface that feels like it’s vibrating with the music.

The North Star of this system is **Kinetic Depth**. We achieve this not through heavy shadows or rigid grids, but through intentional asymmetry, overlapping neon light-trails, and a "layered glass" architecture. By utilizing the interaction between deep blacks and vibrant neons, we create a UI that feels "tech-forward" and immersive, mimicking the glow of professional DJ equipment in a dark club.

---

## 2. Colors: High-Voltage Contrast
The palette is rooted in a deep, obsidian base (`#0e0e13`) to allow our three "Energy Channels"—Electric Purple, Cyan, and Lime—to cut through the interface with maximum luminance.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections. Sectioning must be achieved through background shifts. For example, a track-list container should be `surface-container-low` sitting atop a `surface` background. The eye should perceive boundaries through tonal change, not physical lines.

### Surface Hierarchy & Nesting
To avoid a flat "mobile app" feel, treat the UI as a series of stacked, semi-transparent acrylic sheets.
*   **Base:** `surface` (#0e0e13)
*   **Sectioning:** `surface-container-low` (#131318) for secondary panels.
*   **Active Elements:** `surface-container-high` (#1f1f26) for cards or decks currently in focus.
*   **Nesting:** Place `surface-container-lowest` elements inside `surface-container-high` areas to create "carved out" slots for sliders and knobs.

### The "Glass & Gradient" Rule
Standard flat colors lack "soul." 
*   **Floating Elements:** Use `surface-variant` with a `backdrop-blur` of 12px-20px. 
*   **CTAs:** Use a 45-degree gradient from `primary` (#d394ff) to `primary-container` (#cb80ff). This adds a three-dimensional "glow" that mimics LED backlit buttons.

---

## 3. Typography: The Editorial Beat
We utilize two distinct voices: **Space Grotesk** for the "Energy" (Headings) and **Manrope** for the "Data" (UI/Body).

*   **Display & Headlines (Space Grotesk):** These are your "Pounders." Use `display-lg` for track titles and level-up moments. The bold, wide stance of Space Grotesk provides the "punchy" feel requested.
*   **Titles & Body (Manrope):** Clean, geometric, and highly legible. Use `title-md` for metadata (BPM, Key) and `body-md` for instructional text. 
*   **Hierarchy Note:** Always pair a `headline-lg` in `on-surface` with a `label-md` in `on-surface-variant` to create immediate visual hierarchy without needing extra font weights.

---

## 4. Elevation & Depth: Tonal Layering
We reject the "Drop Shadow" in favor of **Ambient Glows.**

*   **The Layering Principle:** Depth is a gradient of light. Instead of a shadow, use a subtle `surface-bright` (#2c2b33) inner glow on active containers to make them "pop" toward the user.
*   **Ambient Shadows:** For floating modals, use a shadow with a blur of `40px` at 6% opacity, using the `primary` (#d394ff) color instead of black. This creates a "neon halo" effect.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline-variant` (#48474d) at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** All overlays must use a semi-transparent `surface-container` color. This ensures the "Neon Pulse" of the background (like moving sound waves) is never fully blocked, keeping the user immersed in the "game."

---

## 5. Components: The Instrument Rack

### Buttons (The "Trigger Pads")
*   **Primary:** Gradient of `primary` to `primary_dim`. Roundedness: `full`. Add a `0 0 15px` outer glow of the same color on hover.
*   **Secondary:** `surface-container-highest` with `on-surface` text. No border.
*   **Tertiary:** Transparent background, `secondary` (#00fbfb) text, `label-md` uppercase.

### Cards & Lists (The "Track Deck")
*   **Rule:** Forbid divider lines.
*   **Spacing:** Use `spacing-6` (1.5rem) between list items. 
*   **State:** Use a `tertiary` (#69fd5d) left-accent bar (4px wide, `rounded-sm`) to indicate a "Perfect Streak" or "Active Track."

### Input Fields (The "Console Controls")
*   **Base:** `surface-container-low`.
*   **Active State:** The bottom edge glows with a 2px `secondary` (#00fbfb) line.
*   **Error:** Use `error` (#ff6e84) with a subtle `error_container` glow behind the text.

### Custom Component: The Waveform Slider
*   **Track:** `surface-variant`.
*   **Progress:** `secondary_dim` to `secondary` gradient.
*   **Thumb:** A `primary` circle with a `spacing-1` white core, creating a "Luminous Knob" look.

---

## 6. Do's and Don'ts

### Do
*   **Do** use the `spacing-10` and `spacing-12` scales to create "breathing room" around high-energy elements.
*   **Do** use `rounded-xl` (1.5rem) for main containers to keep the "tech-forward" feel soft and premium.
*   **Do** use Lime Green (`tertiary`) exclusively for "Success," "On-Beat," or "High Energy" states.

### Don't
*   **Don't** use pure white (#FFFFFF). Use `on-surface` (#f8f5fd) to prevent ocular fatigue in dark mode.
*   **Don't** use 100% opaque borders. They break the "Neon Pulse" immersion.
*   **Don't** stack more than three levels of surface containers. If you need a fourth level, use a Glassmorphism blur instead of a color shift.
*   **Don't** use standard "Drop Shadows." If it doesn't look like light emitting from a screen, don't use it.