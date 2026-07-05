---
name: Academic Core
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#005e6e'
  on-tertiary: '#ffffff'
  tertiary-container: '#00788c'
  on-tertiary-container: '#d7f6ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 0.75rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  container-max: 1440px
  gutter: 1.5rem
  sidebar-expanded: 260px
  sidebar-collapsed: 72px
---

## Brand & Style
The design system is engineered for high-performance academic administration, balancing the rigor of institutional data with the approachability of a modern SaaS platform. The brand personality is **Trustworthy, Efficient, and Human-Centric**, ensuring that students feel supported while administrators feel in control.

The visual style follows a **Modern Corporate** aesthetic with subtle **Glassmorphic** accents. It prioritizes clarity through generous whitespace, a refined color palette, and high-quality typography. The interface uses soft layering to separate complex data sets, moving away from dense, legacy "tables-only" views toward an airy, card-based dashboard experience that reduces cognitive load for teachers and students alike.

## Colors
This design system utilizes a structured palette designed for long-term readability and rapid status recognition. 

- **Primary & Secondary:** A pairing of Vivid Blue and Indigo used for primary actions, active navigation states, and branding.
- **Tertiary:** Cyan is reserved for data visualization highlights and student-facing motivational elements.
- **Neutrals:** The system uses a "Slate" scale for neutrals (e.g., `#f8fafc` for backgrounds, `#0f172a` for primary text) to maintain a professional, cool-toned atmosphere that feels more premium than pure black/gray.
- **Semantic Palette:** Extended status colors are used specifically for attendance and submission workflows. In dark mode, these colors shift to their 400-level equivalents to maintain accessibility and vibrancy against dark surfaces.

## Typography
The typography strategy utilizes **Geist** for structural elements (headings, labels, navigation) to provide a technical, modern edge, while **Inter** is used for all body text and data entry to ensure maximum legibility and cross-platform consistency.

- **Weight Usage:** Use Semibold (600) for section headers and Medium (500) for interactive labels.
- **Data Tables:** Use `body-sm` for tabular data with tabular lining figures enabled in CSS to ensure numbers align vertically.
- **Scaling:** On mobile devices, `display` and `headline-lg` styles should scale down by approximately 20% to maintain visual balance within narrower viewports.

## Layout & Spacing
The design system employs a **Fluid Grid** model based on an 8px spacing rhythm. Layouts should be constructed using a 12-column grid for desktop dashboards, transitioning to a single-column stack for mobile.

- **Dashboard Shell:** Features a fixed-position, collapsible sidebar on the left. The main content area uses dynamic padding (32px on desktop, 16px on mobile).
- **Component Padding:** Internal card padding should be consistent at `lg` (24px) for desktop to prevent data-heavy views from feeling cramped.
- **Margins:** Vertical rhythm is maintained by using `xl` spacing between major sections and `md` spacing between related card elements.

## Elevation & Depth
This design system uses a **Tonal Layering** approach combined with **Ambient Shadows** to create a sense of hierarchy without overwhelming the user with heavy borders.

1.  **Level 0 (Background):** Slate-50 (Light) or Slate-950 (Dark). The canvas on which everything sits.
2.  **Level 1 (Cards/Sidebar):** Pure white with a 4px blur, 2% opacity shadow. This is the primary surface for content.
3.  **Level 2 (Modals/Dropdowns):** Elevated surfaces with a more pronounced 12px blur, 8% opacity shadow.
4.  **Glassmorphism:** Reserved specifically for the Login/Onboarding background and the Sidebar backdrop on mobile. Use `backdrop-filter: blur(12px)` with a semi-transparent white (60%) or slate (40%) fill.

## Shapes
The shape language is defined by **Rounded XL** corners to soften the "institutional" feel of the system. 

- **Primary Containers:** Standard cards and main dashboard sections use `rounded-xl` (1.5rem/24px).
- **UI Elements:** Buttons and input fields use `rounded-lg` (1rem/16px) for a modern, friendly touch.
- **Badges:** Attendance and status badges use `rounded-full` (pill-shaped) to distinguish them from interactive buttons.
- **Sidebar:** The active state indicator in the navigation should use a one-sided rounded shape or a fully pill-shaped "capsule" to highlight the selection.

## Components
- **Buttons:** Primary buttons use a solid gradient from `primary` to `secondary`. Secondary buttons use a subtle ghost style with a 1px border. All buttons include a subtle `hover` lift effect (translate-y -1px).
- **Status Badges:** Use a "soft-fill" approach: 10% opacity of the status color for the background with 100% opacity for the text. Label-sm typography should be used.
- **Input Fields:** Large, 48px height fields with a Slate-100 background. On focus, the border transitions to Primary-500 with a subtle glow (ring).
- **Interactive Charts:** Utilize the Tertiary (Cyan) and Secondary (Indigo) colors for data series. Use rounded caps on bar charts and smooth tension (spline) on line charts.
- **Cards:** White surfaces with a 1px Slate-100 border to ensure definition on all monitor types. Content should be grouped with clear Geist-font subtitles.
- **Attendance Indicators:** Circular icons for 'Hadir' (Checkmark), 'Alpha' (X), and 'Izin/Sakit' (Calendar/Clock) to ensure color-blind accessibility.