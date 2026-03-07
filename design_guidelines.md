# Mekness Limited - Comprehensive Design Guidelines

## Design Approach
**Reference-Based**: Luxury fintech platforms (Revolut Metal, Stripe Dashboard) merged with futuristic trading interfaces (TradingView, Bloomberg Terminal). Creating a premium, high-tech forex trading experience that balances sophistication with cutting-edge technology.

## Brand Identity & Color System

### Primary Palette
- **Metallic Gold**: #D4AF37 - CTAs, accents, highlights, borders, glows
- **Pure Black**: #000000 - Primary backgrounds, depth foundation
- **Off-White**: #F5F5F5 - Primary text, maximum readability
- **Charcoal**: #111111 - Secondary backgrounds, card layers
- **Graphite Gray**: #2B2B2B - Borders, dividers, subtle separations

### Semantic Colors
- **Success/Profit**: #10B981 (Emerald)
- **Error/Loss**: #EF4444 (Crimson)
- **Warning**: #F59E0B (Amber)

### Material Effects
- **Glass Morphism**: Black cards with 10-15% opacity, backdrop-blur-xl (12px)
- **Gold Glow**: 0 0 20px rgba(212, 175, 55, 0.2)
- **Depth Layering**: Stacked black layers with 2-4px offsets creating floating elevation
- **Gradient Overlays**: Linear gold to transparent for premium accents

## Typography System

### Font Stack
- **Primary (UI/Data)**: "Inter" - Clean, highly legible, professional
- **Accent (Headlines)**: "Poppins" - Bold, confident, modern

### Type Scale
- **Hero Display**: 64px / 4rem (Poppins Bold) - responsive clamp(2.5rem, 5vw, 4rem)
- **Page Title**: 48px / 3rem (Poppins SemiBold)
- **Section Heading**: 32px / 2rem (Poppins Medium)
- **Card Title**: 24px / 1.5rem (Inter SemiBold)
- **Body Large**: 18px / 1.125rem (Inter Regular)
- **Body**: 16px / 1rem (Inter Regular)
- **Small**: 14px / 0.875rem (Inter Regular)
- **Data/Numbers**: 14-24px (Inter Medium) - tabular numbers enabled

## Layout System

### Spacing Primitives (Tailwind)
Core units: **p-2, p-4, p-6, p-8, p-12, p-16** creating consistent rhythm throughout.

**Section Padding**: py-12 (mobile) → py-20 (tablet) → py-32 (desktop)
**Card Padding**: p-6 (mobile) → p-8 (desktop)
**Element Gaps**: gap-4 (tight), gap-6 (standard), gap-8 (spacious)

### Grid System
- **Feature Grids**: 1 column (mobile) → 2 columns (md:) → 3 columns (lg:)
- **Stat Cards**: 2 columns (mobile) → 3-4 columns (desktop)
- **Data Tables**: Full-width with horizontal scroll on mobile
- **Dashboard**: Sidebar 280px (desktop), full drawer (mobile)

### Container Widths
- **Full Sections**: w-full with inner max-w-7xl (1280px)
- **Content Areas**: max-w-6xl (1152px)
- **Forms/Modals**: max-w-2xl (672px)

## Component Library

### Navigation
**Top Bar**: Fixed position, glass black background, 72px height, gold accent on active states, subtle bottom border (graphite gray).

**Sidebar** (Dashboard): 280px width, glass black panel, gold 2px left border on active/hover, collapsible to icon-only (64px), mobile drawer overlay.

**Logo Treatment**: Gold primary mark, 48px height in header, subtle glow effect on hover.

### Cards
**Primary Glass Card**: Black background with 15% opacity, backdrop-blur-xl, 1px gold border, rounded-xl (12px), p-6 standard padding, hover state adds gold glow.

**Elevated Card**: Solid black (#000000), gold border (1px), shadow-lg with layered offsets, subtle lift on hover (translate-y -2px).

**Stat Dashboard Card**: Compact centered layout, large metric (3rem, Poppins SemiBold), small label (0.875rem, gray-400), gold accent icon (24px), minimal padding (p-4).

### Buttons
**Primary CTA**: Gold background (#D4AF37), black text, px-8 py-4, font-semibold (Inter), rounded-lg, hover lifts 2px with increased shadow.

**Secondary**: Black background, 1px gold border, gold text, same dimensions, hover adds gold glow.

**Ghost/Tertiary**: Transparent background, gold text, hover shows gold border and subtle background.

**On-Image Buttons**: Add backdrop-blur-md and black background at 30% opacity beneath button content.

### Forms
**Input Fields**: Black background, 1px gold border, off-white text, p-4 padding, rounded-lg, focus state adds gold glow (2px outline offset 2px).

**Select/Dropdown**: Match input styling, gold chevron icon, options dropdown with glass black background.

**Labels**: Small (14px), gray-400, mb-2, uppercase tracking-wide for premium feel.

**Validation**: Success (emerald border), error (crimson border with message), inline icons.

### Tables
**Header Row**: Gold text (14px, semibold), 2px gold bottom border, bg-charcoal.

**Data Rows**: Off-white text, graphite gray borders (1px), hover shows charcoal background with subtle gold glow.

**Cells**: p-4 padding, align-left for text, align-right for numbers (tabular).

**Pagination**: Bottom-aligned, gold active page indicator, gray inactive, 8-10 rows default.

### Modals & Overlays
**Backdrop**: Black at 85% opacity, backdrop-blur-md.

**Modal Container**: Glass card styling, centered, max-w-2xl, rounded-2xl, spring animation entrance (scale 0.95→1, opacity 0→1, 300ms).

**Close Button**: Top-right, ghost button style, gold X icon.

## Visual Effects & Animations

### 3D Elements
**Particle Systems**: 150-300 gold particles, slow drift motion (30s loop), depth-based opacity, used in hero backgrounds.

**Chart Visualizations**: Animated 3D line graphs with gold gradient strokes, candlestick micro-bars with depth, floating effect with subtle rotation.

**Geometric Shapes**: Wireframe spheres/cubes in gold, slow rotation, strategic placement as accent elements.

### Animation Standards
**Page Transitions**: Fade-in from opacity 0, duration 400ms, ease-out.

**Scroll Reveals**: Elements slide from y: 30px when 20% in viewport, stagger children by 150ms, 800ms duration.

**Card Hover**: Subtle lift (translate-y -2px), increased shadow blur (20px→24px), scale 1.01, 200ms smooth transition.

**Button Interactions**: Lift 2px, shadow enhancement, 150ms spring transition, active state presses down 1px.

**Loading States**: Gold spinner (3s rotation) or skeleton screens matching card structure with shimmer effect.

### Performance Targets
- **Frame Rate**: Consistent 60fps
- **Animation Budget**: Maximum 3 simultaneous complex animations per viewport
- **Scroll Throttle**: 16ms debounce on scroll-triggered animations

## Page-Specific Layouts

### Landing Pages
**Hero Section**: Full viewport height (90vh), background uses either large hero image with dark gradient overlay OR 3D particle field, content 62/38 split (text left, visual right), centered on mobile.

**Features Section**: 3-column grid (lg:), glass cards with icons, gold hover glow, py-24 spacing.

**Live Stats Ticker**: Full-width horizontal scroll, gold gradient bar (2px), marquee animation showing real-time data.

**Social Proof**: 2-column grid showing metrics, client logos in grayscale with gold tint on hover.

**CTA Strip**: Gold gradient background, centered content, prominent primary button, contrasting text.

### Dashboard Application
**Dashboard Home**: 4 quick-action cards (2x2 grid desktop, stacked mobile), trading accounts table below, contact card in sidebar.

**Data Pages** (Documents, Transactions): Search/filter bar at top, sortable tables, 10 rows per page, export button (ghost style).

**Form Pages** (Create Account, Deposits): Single-column card layout, left-aligned labels, full-width inputs on mobile, grouped sections with subtle dividers.

**Statistics Pages** (IB Details): Date range picker (top-right), 6 stat cards grid, detailed tables below with filters.

## Icons & Assets

### Icon System
**Library**: Heroicons (outline style), 24px standard size, gold color (#D4AF37), consistent stroke-width.

**Usage**: Navigation (20px), cards (24px), stat cards (32px), buttons (18px inline).

### Images

**Hero Background Images**: Use abstract luxury imagery - dark atmospheric shots of modern architecture, sleek technology surfaces, or abstract golden light patterns. Images should be dark (underexposed) to maintain black theme, with subtle gold color grading. Overlay with 60% black gradient (top-to-bottom) to ensure text readability.

**Supporting Visuals**: Dashboard pages use generated 3D graphics and data visualizations rather than photography. Maintain premium aesthetic through code-generated particle effects, animated charts, and geometric shapes.

**Image Placement**: 
- Landing page hero: Full-width background image
- Feature sections: Optional supporting images in 50/50 split layouts
- No decorative images in dashboard application views

## Accessibility & States

**Focus Indicators**: 2px gold outline, 4px offset, high contrast against black.

**Interactive States**: Clear hover (elevation + glow), active (pressed appearance), disabled (50% opacity, no cursor).

**Notifications**: Toast messages slide from top-right, glass card styling, auto-dismiss 5s, color-coded borders (success: emerald, error: crimson).

**Color Contrast**: Minimum 7:1 ratio for text, off-white (#F5F5F5) on pure black exceeds WCAG AAA standards.

---

**Design Philosophy**: Create a world-class luxury trading platform through premium materials (glass, gold, deep blacks), purposeful animations that enhance rather than distract, and information density balanced with generous whitespace. Every interaction should feel sophisticated, responsive, and trustworthy.