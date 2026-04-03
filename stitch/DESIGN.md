# Design System Specification: The Ethereal Academic

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**
This design system moves beyond functional utility to create a high-end editorial environment for learning. It is designed to feel like a premium, distraction-free sanctuary. We achieve this by rejecting the "boxed" nature of traditional SaaS interfaces in favor of **Organic Fluidity**. 

By utilizing intentional asymmetry, expansive whitespace, and a "Soft Minimalism" philosophy, we transform a course tracker into a serene digital workspace. The system breaks the template look by prioritizing tonal depth over structural lines, ensuring the user's focus remains entirely on their educational progress.

---

## 2. Colors: Tonal Atmosphere
Our palette is a sophisticated interplay of cool pastels and crisp neutrals. We avoid high-contrast aggression to maintain a "flow state" for the learner.

### Core Palette
- **Primary (Blue Focus):** `#346482` (Text/Action) | `#abdafd` (Container)
- **Secondary (Mint Growth):** `#4a6641` (Success/Action) | `#cbecbc` (Container)
- **Tertiary (Lavender Insight):** `#69558e` (Specialty/Nurture) | `#d6beff` (Container)

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To define boundaries, designers must use background color shifts. 
- *Application:* A `surface-container-low` (#f1f4f5) card should sit on a `surface` (#f8f9fa) background. The change in hex code provides all the "structure" needed. 

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of fine, semi-translucent paper.
1. **Base:** `surface` (#f8f9fa)
2. **Structural Sections:** `surface-container-low` (#f1f4f5)
3. **Interactive Elements/Cards:** `surface-container-lowest` (#ffffff)
4. **Active/Pop-over:** `surface-bright` (#f8f9fa)

### The Glass & Gradient Rule
To add "soul," use subtle linear gradients (135°) for primary CTAs, transitioning from `primary` (#346482) to `primary_dim` (#265875). For floating navigation or headers, apply **Glassmorphism**: `surface` at 70% opacity with a 20px backdrop-blur.

---

## 3. Typography: Editorial Clarity
We pair the geometric precision of **Manrope** for displays with the hyper-legibility of **Inter** for utility.

- **Display (Manrope):** Large, airy, and thin. Use `display-lg` (3.5rem) for "Welcome Back" or "Streak Milestones" to create an authoritative, editorial feel.
- **Headlines (Manrope):** `headline-md` (1.75rem) should be used sparingly to introduce new modules.
- **Body & Labels (Inter):** All functional text uses Inter. Use `body-md` (0.875rem) for standard descriptions. The tighter tracking and higher x-height of Inter ensure readability even at small scales.

*Identity Tip:* Use `on_surface_variant` (#5a6062) for body text rather than pure black to maintain the soft, high-end aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
In this design system, shadows are an atmospheric byproduct, not a structural tool.

### The Layering Principle
Depth is achieved by "stacking" surface tiers. Place a `surface_container_lowest` (#ffffff) card atop a `surface_container_low` (#f1f4f5) background. This creates a natural, soft lift without a single pixel of shadow.

### Ambient Shadows
If an element must "float" (e.g., a modal or floating action button):
- **Blur:** 32px to 64px.
- **Opacity:** 4% - 6%.
- **Color:** Use `on_surface` (#2d3335) but tinted with the `primary` hue. Avoid "dead" grey shadows.

### The Ghost Border
For accessibility in input fields, use a "Ghost Border": `outline_variant` (#adb3b5) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Light & Approachable

### The Activity Heatmap (The Signature Component)
Instead of the harsh greens of GitHub, use a stepped pastel gradient for the course tracker:
- **Level 0:** `surface_container_high` (#e5e9eb)
- **Level 1:** `secondary_fixed` (#cbecbc)
- **Level 2:** `secondary_fixed_dim` (#bddeaf)
- **Level 3:** `secondary` (#4a6641)
- **Level 4:** `on_secondary_container` (#3d5934)

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_dim`), `xl` (1.5rem) roundedness, no border.
- **Secondary:** `surface_container_highest` (#dee3e6) fill with `primary` text.
- **Tertiary:** Ghost style; text only with `primary` color, switching to a subtle `surface_variant` background on hover.

### Progress Cards
**Rule: Forbid dividers.** Separate course titles from progress bars using a 24px vertical spacing (`md` spacing scale). 
- **The "Glass Progress":** The background of a progress bar should be `primary_container` (#abdafd) at 30% opacity, with the active fill being the solid `primary` color.

### Input Fields
Soft, pill-shaped (`full` roundedness). Use `surface_container_lowest` as the fill. The label should sit 8px above the input in `label-md` uppercase for an architectural look.

---

## 6. Do's and Don'ts

### Do
- **Do** use asymmetrical padding (e.g., 64px top, 32px bottom) on hero sections to create a custom, "designed" feel.
- **Do** leverage `surface_tint` to provide a very faint wash over large white areas.
- **Do** use `xl` (1.5rem) or `full` corner radius for all primary containers to maintain the "approachable" brand promise.

### Don't
- **Don't** use 1px solid borders at 100% opacity. They shatter the "Ethereal" illusion.
- **Don't** use pure black (#000000). It is too heavy for the pastel ecosystem; use `on_background` (#2d3335) instead.
- **Don't** crowd the interface. If a screen feels full, increase the `surface` whitespace by 20%.