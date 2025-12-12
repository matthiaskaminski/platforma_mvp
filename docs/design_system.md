
# Liru.app Design System Guidelines

Based on the core Dashboard implementation, use these guidelines for all new pages to ensure consistency.

## 1. Layout & Spacing

### Main Page Containers
-   **Padding:** Default content padding is handled by `ClientLayout`. Do **not** add extra margin/padding to the root `div` of your page unless overriding.
    -   Value: `p-6` (mobile) / `p-8` (desktop)
-   **Page Container:**
    ```tsx
    <div className="flex flex-col h-full gap-3 pb-3">
    {/* gap-3 matches dashboard aesthetic */}
    ```

### Grids & Flex Gaps
-   **Page Layout Gaps:** `gap-3` (12px). Use for separation between main layout columns and sections.
-   **Inner Component Gaps:** `gap-2` (8px). Use for internal grids like stats tiles or small card sets.
    -   *Why:* Matches the tighter inner spacing of dashboard widgets.
-   **Section Separation:** `mb-3` or `gap-3`.

### Cards & Containers
-   **Background:** `bg-[#151515]` (or `bg-[var(--color-card)]`).
-   **Border Radius:** `rounded-2xl`.
-   **Padding:** `p-4` (Standard tile padding).
-   **Toolbar Height:** `min-h-[80px]` (For main page headers/toolbars).
-   **No Backgrounds:** For lists/grids (like products), use **transparent** backgrounds directly on the page background, do not wrap in a dark container unless it's a specific "Section" (like Budget or Calendar).

## 2. Typography

### Headers
-   **Page Title:** `text-[28px] font-bold tracking-tight text-[#E5E5E5]`
    -   Example: "Cześć, Sonya! 👋"
-   **Section Title:** `text-[20px] font-medium`
    -   Example: "Budżet", "Visualizacje"

### Body Text
-   **Standard Text:** `text-[16px]` (e.g., Room names).
-   **Subtext / Labels:** `text-sm text-muted-foreground font-medium`.
-   **Status Text:** `text-[14px] font-medium text-[#EDEDED]` (Neutral text) with `w-2.5 h-2.5` colored dot.

## 3. Colors (Dark Theme)

-   **Background:** `bg-[#0E0E0E]` (Main app bg)
-   **Card Surface:** `bg-[#151515]`
-   **Interactive Surface:** `bg-[#1B1B1B]` (Hover: `bg-[#232323]`)
-   **Borders:** **Avoid borders.** If necessary, use `border-white/5`.
-   **Primary Accent:** `#E5E5E5` (Headings) / `#91E8B2` (Success/Active) / `#E8B491` (Warn).

## 4. Components

### Buttons
-   **Action Button (Icon+Text):**
    ```tsx
    <button className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
    ```
-   **Icon Button (Secondary):**
    ```tsx
    <button className="flex items-center gap-2 bg-[#1B1B1B] border border-white/5 hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
    ```
-   **Pill Button (Small):**
    ```tsx
    <button className="text-sm bg-[#232323] hover:bg-[#2a2a2a] px-3 py-1 rounded-full text-white transition-colors">
    ```

### Status Dots
-   **Size:** `w-2.5 h-2.5` (or `w-2 h-2` for small contexts).
-   **Glow:** `shadow-[0_0_8px_rgba(R,G,B,0.5)]` matching the color.

## 5. Component Usage Philosophy

-   **Components First:** Always use `src/components/ui` components (`Button`, `Card`, `Badge`, `Input`) for UI elements. Do not build these from scratch with Tailwind.
-   **Tailwind for Layout:** Use Tailwind classes only for **layout** (`flex`, `grid`, `gap`...), **spacing** (`m-*`, `p-*`), and **dimensions** (`w-*`, `h-*`).
-   **Consistency:** If a component doesn't fit your Use Case, check if it can be solved with a `variant` before adding custom styles.

## Checklist for New Pages
1.  [ ] Are gaps strictly `gap-3`?
2.  [ ] Are container radii `rounded-2xl`?
3.  [ ] Is the bottom margin `pb-3` applied?
4.  [ ] Are action buttons using the specific dark grey styles defined above?
5.  [ ] Is the content background transparent where appropriate (e.g. lists)?
