# Design System Document: The Editorial Stream

## 1. Overview & Creative North Star
**Creative North Star: "The Curated Chronicle"**

This design system moves away from the sterile, modular "dashboard" aesthetic and toward a high-end, editorial experience. It is inspired by the clarity of premium newsletters and the spatial intentionality of modern workspaces like Notion. 

To break the "template" look, we employ **Intentional Asymmetry**. Notifications aren't just rows in a grid; they are pieces of content with varying visual weights. We use high-contrast typography scales and generous "white space" (breathing room) to ensure the creator feels calm, not overwhelmed. The interface should feel like a well-laid-out Sunday paper—authoritative, clean, and effortlessly readable.

---

## 2. Colors & Surface Philosophy

### The Palette
We utilize a sophisticated Material-inspired palette that balances the energy of **Primary Coral (#ac2b31)** with the stability of **Secondary Teal (#006a66)**.

*   **Primary (Coral):** Used for critical actions and brand markers (e.g., `primary`).
*   **Secondary (Teal):** Used for growth metrics, "New" indicators, and success states (e.g., `secondary`).
*   **Surface/Background:** A range of off-whites (`surface` to `surface_container_highest`) to create depth.

### The "No-Line" Rule
**Strict Mandate:** 1px solid borders are prohibited for sectioning. 
Structure is defined through **Background Color Shifts**. To separate a sidebar from a main feed, use `surface_container_low` against a `surface` background. High-contrast lines create visual noise; tonal shifts create harmony.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper.
*   **Base Layer:** `surface` (The desk).
*   **Section Layer:** `surface_container_low` (The folder).
*   **Actionable Layer (Cards):** `surface_container_lowest` (#FFFFFF) (The sheet of paper).
This nesting creates a natural "lift" that guides the eye without requiring heavy outlines.

### The "Glass & Gradient" Rule
To add "soul," use subtle gradients on primary CTAs (transitioning from `primary` to `primary_container`). For floating elements like dropdowns or mobile navigation, apply **Glassmorphism**: use `surface_container_lowest` at 80% opacity with a `20px` backdrop-blur to keep the layout feeling integrated.

---

## 3. Typography
We use **Inter** as a system-ui powerhouse. The hierarchy is designed to mimic editorial headlines.

*   **Display (lg/md):** Used for "Big Numbers" (e.g., +1.2k new subscribers). Bold, tight tracking.
*   **Headline (sm/md):** Used for dashboard section titles. Color: `on_surface_variant` (#594140) to feel softer than pure black.
*   **Title (md/sm):** Used for notification headers. Bold, high readability.
*   **Body (md):** The workhorse. Used for notification content and descriptions.
*   **Label (sm):** Used for timestamps and metadata.

**Editorial Tip:** Use `headline-sm` for section headers with an asymmetrical left-margin to create a "breaking the grid" feel that directs the eye immediately to the content.

---

## 4. Elevation & Depth

### The Layering Principle
Avoid "shadow-overload." Depth is achieved primarily by stacking tokens:
*   Place a `surface_container_lowest` card atop a `surface_container_low` background. The slight shift in brightness provides all the separation needed.

### Ambient Shadows
When an element must float (e.g., a "New Notification" toast), use an **Ambient Shadow**:
*   **X:** 0, **Y:** 12px, **Blur:** 24px.
*   **Color:** `on_surface` at 4% opacity. 
*   This mimics natural light and prevents the "dirty" look of standard grey shadows.

### The "Ghost Border" Fallback
If accessibility requires a border (e.g., input fields), use a **Ghost Border**: `outline_variant` at 20% opacity. It should be felt, not seen.

---

## 5. Components

### Cards & Notification Items
*   **Style:** `md` (12px) rounded corners. 
*   **Constraint:** No dividers. Use `body-lg` vertical spacing between items.
*   **Signature Element:** Every notification card features a custom Coral bullet (`primary`) on the far left to denote the "unread" state, acting as a brand signature.

### Buttons
*   **Primary:** `primary` background with `on_primary` text. `md` corners.
*   **Secondary:** `secondary_container` background with `on_secondary_container` text. No border.
*   **Tertiary:** Ghost style. Only text in `primary` color.

### Inputs
*   **Surface:** `surface_container_highest` with a `Ghost Border`. 
*   **Focus State:** Transition the border to 100% `primary` opacity and add a subtle `primary_fixed` glow.

### The "Creator Insight" Chip
*   A custom component for this system. A small `tertiary_container` pill used to highlight specific notification types (e.g., "High Engagement" or "Top Supporter"). Uses `label-md` bold text.

---

## 6. Do’s and Don’ts

### Do:
*   **Use the Dot Grid:** The background `surface` should have a subtle 24px dot grid in `outline_variant` (10% opacity) to reinforce the "newsletter/notebook" atmosphere.
*   **Embrace Asymmetry:** Align your titles to the left but allow card metadata to float right with generous padding.
*   **Prioritize Readability:** Ensure `on_surface_variant` is used for secondary text to maintain a soft, professional contrast.

### Don’t:
*   **Don't use 1px lines:** Never use a solid line to separate two pieces of content. Use space or a background color shift.
*   **Don't use pure black:** Use `on_surface` (#1a1c1c) for text to keep the "Ink on Paper" feel.
*   **Don't crowd the edges:** High-end design requires "wasted" space. If a card feels full, increase the padding to `xl` (1.5rem).
*   **Don't use standard icons:** Use "Line Art" style icons with a 1.5px stroke width to match the weight of the Inter typeface.