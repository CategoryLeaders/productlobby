# ProductLobby UI Audit Plan - Implementation Subtasks

**Parent Task**: Full UI audit — review all buttons and UX elements against style guide
**Project**: ProductLobby (Asana Project GID: 1213389148110065)
**Reference Document**: Design System Component Library Guide (`/src/components/ui/COMPONENT_GUIDE.md`)

---

## Overview

This audit will systematically review all UI elements across the ProductLobby application against the established design system and style guide. The ProductLobby application is a large, multi-feature platform with 75+ pages and a comprehensive component library.

**Key Design Tokens & Standards:**
- **Primary Color**: violet-600
- **Accent Color**: lime-500
- **Success**: green-700 | Warning: amber-700 | Error: red-700
- **Button Variants**: primary, secondary, accent, ghost, outline, destructive
- **Button Sizes**: sm, default, lg
- **Focus States**: `focus:ring-2 focus:ring-violet-600 focus:ring-offset-2`
- **Disabled States**: `disabled:opacity-50 disabled:cursor-not-allowed`
- **Card Variants**: default, elevated, highlighted, interactive

---

## Subtask Breakdown

### PL-AUDIT.01: Navigation & Layout Components
**Status**: Pending
**Type**: Component audit
**Priority**: High
**Effort**: Medium

**Description**:
Audit all navigation and layout shell components to ensure consistent styling and accessibility standards.

**Files to Review**:
- `/src/components/shared/navbar.tsx` - Main navigation bar
- `/src/components/shared/mobile-nav.tsx` - Mobile navigation
- `/src/components/shared/sidebar.tsx` - Sidebar navigation
- `/src/components/shared/footer.tsx` - Footer component
- `/src/components/shared/page-header.tsx` - Page header component
- `/src/app/layout.tsx` - Root layout wrapper
- `/src/components/shared/dashboard-layout.tsx` - Dashboard layout

**Audit Checklist**:
- [ ] Navbar buttons use correct variants (primary for CTA, ghost for secondary actions)
- [ ] Navbar has proper focus states for keyboard navigation
- [ ] Mobile nav is responsive and accessible
- [ ] Sidebar styling matches design tokens (color, spacing, fonts)
- [ ] Footer has proper semantic structure (nav, links, copyright)
- [ ] All navigation links have hover states and active indicators
- [ ] Accessibility: ARIA labels for navigation regions (role="navigation")
- [ ] Accessibility: Skip-to-content link present and functional
- [ ] Mobile nav button (hamburger) has proper aria-expanded attribute
- [ ] All nav items have sufficient color contrast (WCAG AA minimum)

**Acceptance Criteria**:
- All navigation components comply with design system
- Button variants and sizes match style guide
- Responsive behavior verified on mobile/tablet/desktop
- Keyboard navigation fully functional (Tab, Enter, Escape)
- ARIA labels and roles properly applied
- All interactive elements have visible focus indicators

---

### PL-AUDIT.02: Campaign Pages & Components
**Status**: Pending
**Type**: Feature audit
**Priority**: High
**Effort**: Large

**Description**:
Audit all campaign-related pages and components including browse, detail view, create wizard, insights, and comparison features.

**Files to Review**:
- **Pages**: `/src/app/(main)/campaigns/`
  - `page.tsx` - Campaign browse/list page
  - `[slug]/page.tsx` - Campaign detail page
  - `new/page.tsx` - Campaign creation page
  - `compare/` - Campaign comparison page
- **Components**: `/src/components/campaigns/` (includes 50+ campaign-specific components)
  - `campaign-card.tsx` - Campaign listing cards
  - `responsive-campaign-card.tsx` - Responsive variant
  - `campaign-recommendations.tsx` - Recommendations section
  - `campaign-update-card.tsx` - Update cards
  - `campaign-updates-feed.tsx` - Feed display
  - `campaign-image-gallery.tsx` - Image gallery
  - `campaign-wizard/` - Multi-step creation form
  - `compare-bar.tsx` - Comparison UI
  - `competitor-comparison.tsx` - Competitor analysis visualization
  - Various analytics and insights components

**Audit Checklist**:
- [ ] Campaign card layouts are consistent
- [ ] Button styling in cards (View, Compare, Share) matches guide
- [ ] Badge usage for campaign status (Active, Closed, Draft) is consistent
- [ ] Campaign wizard form inputs use correct Input component variants
- [ ] Tabs component styling in campaign detail (Overview, Updates, Analysis)
- [ ] Modal dialogs have proper styling and focus trapping
- [ ] Image gallery has proper alt text and loading states
- [ ] Analytics charts/visualizations have readable labels
- [ ] Comparison view layout is clear and accessible
- [ ] All CTAs use button instead of styled links

**Acceptance Criteria**:
- All campaign pages follow design system layout patterns
- Form inputs and controls match component library specs
- Cards and lists use consistent spacing and visual hierarchy
- Buttons use correct variants for primary/secondary actions
- Data visualizations are accessible (tables with headers, proper labeling)
- Responsive design verified for all viewport sizes

---

### PL-AUDIT.03: Brand Pages & Components
**Status**: Pending
**Type**: Feature audit
**Priority**: High
**Effort**: Medium

**Description**:
Audit all brand-related pages and components including brand list, brand detail, brand showcase, and brand-specific analytics.

**Files to Review**:
- **Pages**: `/src/app/(main)/brands/`
  - `page.tsx` - Brand list/browse
  - `[slug]/` - Brand detail page
  - `claim/` - Brand claim page
- **Pages**: `/src/app/(main)/brand-showcase/`
- **Components**: `/src/components/brands/` and `/src/components/brand/`
  - Brand listing components
  - Brand detail header and layout
  - Brand verification/claim flows
  - Brand profile components

**Audit Checklist**:
- [ ] Brand cards have consistent styling and sizing
- [ ] Brand logos display correctly with proper aspect ratios
- [ ] Verification badge styling is consistent with design tokens
- [ ] Brand detail header layout is responsive
- [ ] Claim/verification flows use proper modal/form styling
- [ ] Status badges (Verified, Pending, Unverified) use correct variants
- [ ] Action buttons (Edit, Share, Claim) are styled consistently
- [ ] Color contrast adequate for brand name and metadata text

**Acceptance Criteria**:
- Brand pages use consistent card layouts and spacing
- All buttons follow design system variants
- Badge indicators properly styled for brand status
- Verification flows are clear and accessible
- Links vs buttons are properly semantically used

---

### PL-AUDIT.04: User Pages & Authentication
**Status**: Pending
**Type**: Feature audit
**Priority**: High
**Effort**: Medium

**Description**:
Audit all authentication and user profile pages including login, signup, password reset, profile settings, and user dashboard.

**Files to Review**:
- **Pages**: `/src/app/(auth)/`
  - `login/page.tsx` - Login form
  - `signup/page.tsx` - Registration form
  - `verify/page.tsx` - Email verification
- **Pages**: `/src/app/(main)/profile/` - User profile pages
- **Pages**: `/src/app/(main)/settings/` - Settings pages
- **Pages**: `/src/app/(main)/dashboard/` - User dashboard
- **Components**: `/src/components/auth/`
  - Auth form components
  - Social login buttons
  - `social-login-buttons.tsx`

**Audit Checklist**:
- [ ] Login/signup forms use Input component with proper labels
- [ ] Form validation error messages are styled consistently (red text, error icons)
- [ ] Submit buttons use correct size and variant (primary, full-width)
- [ ] Password fields have proper type="password" (no console logs)
- [ ] Social login buttons match OAuth provider guidelines
- [ ] Form inputs have proper placeholder and label hierarchy
- [ ] Loading states show spinner during submission
- [ ] Error states display error messages with proper spacing
- [ ] Terms/privacy links are properly marked (not as buttons)
- [ ] Remember-me checkbox properly styled

**Acceptance Criteria**:
- Auth forms use consistent Input/Textarea components
- Error and success states clearly distinguished
- Loading spinners display during async operations
- All form buttons use proper button component (not styled links)
- Focus management works correctly (focus on first error, submit after success)
- Accessibility: form labels properly associated with inputs

---

### PL-AUDIT.05: Shared/Reusable Components Library
**Status**: Pending
**Type**: Component audit
**Priority**: Critical
**Effort**: Large

**Description**:
Audit the core UI component library to ensure all components comply with design tokens and accessibility standards. These are the foundation components used throughout the app.

**Files to Review**:
- `/src/components/ui/` - Core component library (25+ components)
  - `button.tsx` - Button component (all variants, sizes)
  - `card.tsx` - Card component (all variants)
  - `input.tsx` - Text input
  - `textarea.tsx` - Text area
  - `badge.tsx` - Status/label badges
  - `avatar.tsx` - User avatars
  - `checkbox.tsx` - Checkbox control
  - `radio-group.tsx` - Radio group control
  - `select.tsx` - Dropdown select
  - `dialog.tsx` - Modal dialog
  - `dropdown-menu.tsx` - Menu dropdown
  - `tabs.tsx` - Tabbed interface
  - `tooltip.tsx` - Tooltips
  - `alert.tsx` - Alert messages
  - `progress.tsx` - Progress bar
  - `spinner.tsx` - Loading spinner
  - `toast.tsx` - Toast notifications
  - `toggle-switch.tsx` - Toggle switch
  - `label.tsx` - Form label
  - `skeleton.tsx` - Loading skeleton
  - `modal.tsx` - Modal component
  - `empty-state.tsx` - Empty state placeholder
  - `logo.tsx` - Logo component
  - `chip-selector.tsx` - Chip/tag selector

**Audit Checklist**:
- [ ] Button: All variants render correctly (primary, secondary, accent, ghost, outline, destructive)
- [ ] Button: All sizes display correctly (sm, default, lg)
- [ ] Button: Disabled state applies opacity-50 and cursor-not-allowed
- [ ] Button: Loading state shows spinner
- [ ] Button: Focus ring displays (ring-2 ring-violet-600 ring-offset-2)
- [ ] Card: All variants styled correctly (default, elevated, highlighted, interactive)
- [ ] Card: Proper spacing inside CardContent, CardHeader, CardFooter
- [ ] Input: Label, placeholder, error text display properly
- [ ] Input: Error state shows red border/text
- [ ] Input: Helper text displays below input
- [ ] Input: Disabled state is clearly visible
- [ ] Textarea: Auto-grow feature works
- [ ] Badge: All variants display correctly (success, warning, error, outline)
- [ ] Avatar: Image loads, fallback initials display
- [ ] Checkbox/Radio: Proper checked/unchecked states
- [ ] Select: Dropdown opens/closes, items selectable
- [ ] Dialog: Focus trapped inside, escape closes
- [ ] Dropdown: Menu items click properly, separators render
- [ ] Tabs: Tab switching works, active tab highlighted
- [ ] Tooltip: Shows on hover, positions correctly
- [ ] Alert: Different severity levels styled differently
- [ ] Progress: Value displays, label optional
- [ ] Spinner: Renders with proper animation
- [ ] Toast: Auto-dismisses, proper styling per type
- [ ] Toggle: Switch state changes visually
- [ ] All components: Color contrast meets WCAG AA

**Acceptance Criteria**:
- All components render without console warnings
- All variants and sizes work as documented
- Focus states visible on all interactive components
- Disabled states clearly distinguished
- All text has sufficient color contrast
- Components properly export from index.ts

---

### PL-AUDIT.06: Responsive Design & Mobile Optimization
**Status**: Pending
**Type**: Cross-cutting audit
**Priority**: High
**Effort**: Large

**Description**:
Audit responsive design implementation across all pages and components. Verify proper behavior at mobile (320px), tablet (768px), and desktop (1024px+) breakpoints.

**Files to Review**:
- Key pages at various breakpoints:
  - `/src/app/(main)/campaigns/page.tsx` - Campaign list responsive
  - `/src/app/(main)/campaigns/[slug]/page.tsx` - Campaign detail responsive
  - `/src/app/(main)/brands/page.tsx` - Brand list responsive
  - `/src/app/(main)/dashboard/` - Dashboard layout responsive
  - `/src/app/(main)/profile/` - Profile page responsive
- Key components:
  - `/src/components/shared/navbar.tsx` - Mobile nav toggle
  - `/src/components/shared/mobile-nav.tsx` - Mobile nav menu
  - `/src/components/shared/sidebar.tsx` - Sidebar visibility
  - `responsive-campaign-card.tsx` - Responsive card variant

**Audit Checklist**:
- [ ] Mobile (320px): All content readable without horizontal scroll
- [ ] Mobile: Touch targets minimum 44x44 pixels
- [ ] Mobile: Navigation accessible (hamburger menu functional)
- [ ] Mobile: Form inputs have 16px font (prevents zoom)
- [ ] Tablet (768px): Layout adapts properly (2-column to flexible)
- [ ] Tablet: Navigation updates (sidebar may collapse)
- [ ] Desktop (1024px+): Full layout displays with sidebar
- [ ] Grid layouts use responsive classes (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- [ ] Text sizes readable at all breakpoints
- [ ] Images scale properly (no distortion)
- [ ] Modals/dialogs center properly on all screens
- [ ] Tables scroll horizontally on mobile if needed
- [ ] Spacing (padding/margin) scales appropriately

**Acceptance Criteria**:
- App functions on viewport sizes 320px to 2560px wide
- No horizontal scroll on any viewport
- Touch-friendly on mobile (44px+ touch targets)
- Navigation accessible on all sizes
- Content hierarchy clear on all breakpoints

---

### PL-AUDIT.07: Accessibility & WCAG Compliance
**Status**: Pending
**Type**: Cross-cutting audit
**Priority**: Critical
**Effort**: Large

**Description**:
Comprehensive accessibility audit covering WCAG 2.1 Level AA compliance across all UI elements. Focus on color contrast, keyboard navigation, ARIA labels, focus management, and screen reader support.

**Areas to Review**:
- All pages and components for accessibility issues
- Focus on: navbar, sidebars, modals, forms, buttons, cards, images

**Audit Checklist**:
- **Color Contrast**:
  - [ ] All text meets WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)
  - [ ] Button text vs background contrast adequate
  - [ ] Form labels and helper text contrast adequate
  - [ ] Focus rings visible against background
  - [ ] Disabled states still readable (not just opacity)

- **Keyboard Navigation**:
  - [ ] All interactive elements focusable with Tab key
  - [ ] Tab order logical and predictable
  - [ ] Modals trap focus (can't tab outside)
  - [ ] Escape key closes modals
  - [ ] Enter activates buttons
  - [ ] Space toggles checkboxes/switches
  - [ ] Arrow keys navigate menus/dropdowns/tabs

- **ARIA & Semantic HTML**:
  - [ ] Buttons use <button> or role="button", not <div> styled as button
  - [ ] Links use <a> tags, not styled buttons
  - [ ] Form inputs have associated <label> elements
  - [ ] Required fields marked with aria-required="true"
  - [ ] Error messages linked to inputs with aria-describedby
  - [ ] Page regions have proper ARIA landmarks (role="navigation", role="main", etc.)
  - [ ] Headings use proper hierarchy (h1, h2, h3...)
  - [ ] Images have alt text (or alt="" with role="presentation" if decorative)
  - [ ] Icons without text have aria-label or aria-hidden="true"
  - [ ] Skip to content link present

- **Focus Management**:
  - [ ] Focus visible on all interactive elements
  - [ ] Focus ring color is violet-600 with 2px width
  - [ ] Focus doesn't disappear on hover
  - [ ] Focus returns to trigger when modal closes
  - [ ] First form input receives focus on page load

- **Screen Reader Support**:
  - [ ] Page structure navigable (landmark regions)
  - [ ] Headings provide proper outline
  - [ ] Form fields labeled and associated correctly
  - [ ] Button purposes clear from text alone
  - [ ] Icon-only buttons have labels
  - [ ] Loading states announced (aria-live regions)
  - [ ] Error messages announced to screen readers

- **Animations & Motion**:
  - [ ] Animations respect prefers-reduced-motion
  - [ ] No auto-playing videos or infinite loops
  - [ ] Animations don't cause seizure risk

**Files to Specifically Check**:
- `/src/components/ui/button.tsx` - Focus ring styling
- `/src/components/ui/input.tsx` - Label association
- `/src/components/ui/dialog.tsx` - Focus trapping
- `/src/components/ui/dropdown-menu.tsx` - Keyboard nav
- `/src/components/shared/navbar.tsx` - Navigation landmark
- `/src/components/shared/sidebar.tsx` - Sidebar navigation
- `/src/components/campaigns/campaign-card.tsx` - Card button semantics
- All form pages - Label and error associations

**Acceptance Criteria**:
- All interactive elements keyboard accessible
- WCAG 2.1 Level AA color contrast achieved
- Proper semantic HTML and ARIA usage
- Focus management works correctly
- Screen readers can navigate all content
- Animations respect motion preferences

---

### PL-AUDIT.08: Form Inputs & Interactive Components
**Status**: Pending
**Type**: Component audit
**Priority**: High
**Effort**: Medium

**Description**:
Audit all form inputs and interactive controls for consistency, proper error handling, loading states, and validation feedback.

**Files to Review**:
- **Form Components**:
  - `/src/components/ui/input.tsx` - Text input component
  - `/src/components/ui/textarea.tsx` - Textarea component
  - `/src/components/ui/checkbox.tsx` - Checkbox control
  - `/src/components/ui/radio-group.tsx` - Radio buttons
  - `/src/components/ui/select.tsx` - Dropdown select
  - `/src/components/ui/toggle-switch.tsx` - Toggle control
  - `/src/components/ui/label.tsx` - Form labels

- **Form Pages & Sections**:
  - Auth forms (login, signup)
  - Campaign wizard/creation forms
  - Profile edit forms
  - Settings forms
  - Search/filter forms

**Audit Checklist**:
- [ ] Input fields have associated labels (not just placeholders)
- [ ] Placeholder text is not used as label substitute
- [ ] Error messages display in red text
- [ ] Error icons/indicators present
- [ ] Helper text displays below inputs (smaller font)
- [ ] Required field indicator present (asterisk or "required" text)
- [ ] Disabled inputs have clear visual difference
- [ ] Focus ring visible on all input types
- [ ] Validation happens on blur (not only on submit)
- [ ] Submit button shows loading state during form submission
- [ ] Form preserves input values on validation error
- [ ] Success message displays after form submit
- [ ] Select/dropdown has clear placeholder state
- [ ] Multi-select shows selected items clearly
- [ ] Textarea has auto-grow feature (if applicable)
- [ ] Checkbox/radio have proper labeling (click expands hit area)
- [ ] Form submit button disabled while loading

**Acceptance Criteria**:
- All form inputs use proper component from library
- Error/success states consistent across forms
- Labels always paired with inputs (proper association)
- Loading states show spinner
- All form validation feedback is clear and helpful

---

## Implementation Notes

### Design System Reference
- **Component Guide**: `/src/components/ui/COMPONENT_GUIDE.md`
- **Primary Colors**: violet-600 (primary), lime-500 (accent)
- **Status Colors**: green-700 (success), amber-700 (warning), red-700 (error)
- **Focus States**: Always use `focus:ring-2 focus:ring-violet-600 focus:ring-offset-2`
- **Disabled States**: Apply `disabled:opacity-50 disabled:cursor-not-allowed`

### Large Codebase Context
- **75+ Pages**: Located in `/src/app/(main)/` and `/src/app/(auth)/`
- **50+ Campaign Components**: Heavy focus on campaigns feature
- **25+ Shared Components**: Core UI library at `/src/components/ui/`
- **Multiple Feature Domains**: brands, campaigns, users, analytics, community, etc.

### Testing Approach
Each subtask should verify:
1. Visual consistency against style guide
2. Component prop usage matches documentation
3. Responsive design at 3+ breakpoints
4. Keyboard navigation works
5. Screen reader compatibility
6. No console warnings/errors

### Deliverables per Subtask
- List of issues found (screenshots recommended)
- List of files needing updates
- Severity level (critical/high/medium/low)
- Suggested fixes

---

## Task Ownership & Allocation

| Subtask | Focus Area | Estimated Effort |
|---------|-----------|-----------------|
| PL-AUDIT.01 | Navigation & Layout | Medium (4-6 hours) |
| PL-AUDIT.02 | Campaign Pages | Large (8-12 hours) |
| PL-AUDIT.03 | Brand Pages | Medium (4-6 hours) |
| PL-AUDIT.04 | User Pages & Auth | Medium (4-6 hours) |
| PL-AUDIT.05 | Component Library | Large (8-12 hours) |
| PL-AUDIT.06 | Responsive Design | Large (8-12 hours) |
| PL-AUDIT.07 | Accessibility | Large (10-15 hours) |
| PL-AUDIT.08 | Forms & Inputs | Medium (4-6 hours) |

**Total Estimated Effort**: 50-75 hours

---

## Success Criteria

All subtasks completed when:
- [ ] All listed files reviewed
- [ ] Checklists completed for each area
- [ ] Issues documented with severity levels
- [ ] Design system compliance verified
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Responsive design verified
- [ ] Team reviews findings and prioritizes fixes
