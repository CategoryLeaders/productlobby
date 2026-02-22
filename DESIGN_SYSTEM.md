# ProductLobby Design System Component Library

## Overview

A comprehensive, production-ready React component library for ProductLobby built with:
- **React 18.3** with TypeScript
- **Tailwind CSS 3.4** for styling
- **Radix UI** for accessible primitives
- **Lucide React** for icons
- **Poppins** (headings) and **Inter** (body) fonts
- **Violet (#9333EA)** primary and **Lime (#84CC16)** accent colors

All components use `forwardRef`, support `className` overrides via the `cn()` utility, and follow consistent accessibility and design patterns.

## Files Created/Updated

### Core Components

1. **button.tsx** - Button with 6 variants and 3 sizes
2. **card.tsx** - Card system with Header, Title, Description, Content, Footer
3. **input.tsx** - Text input with validation, labels, and help text
4. **textarea.tsx** - Multi-line textarea with auto-grow support
5. **badge.tsx** - Status badges with 5 variants
6. **avatar.tsx** - User avatars with fallbacks (Radix UI)
7. **progress.tsx** - Progress bar with optional label (Radix UI)
8. **tabs.tsx** - Tab navigation with clean underline style (Radix UI)
9. **dialog.tsx** - Modal dialog with proper animations (Radix UI)
10. **select.tsx** - Dropdown select component (Radix UI)
11. **tooltip.tsx** - Hover tooltips (Radix UI)
12. **dropdown-menu.tsx** - Context menus with submenus (Radix UI)
13. **spinner.tsx** - Loading spinner with brand colors
14. **toast.tsx** - Toast notifications with context API
15. **index.ts** - Barrel export file with all components

### Documentation

- **COMPONENT_GUIDE.md** - Quick reference for each component
- **DESIGN_SYSTEM.md** - This file

## Component Specifications

### Button
```
Variants: primary, secondary, accent, ghost, outline, destructive
Sizes: sm (h-8), default (h-10), lg (h-12)
States: hover, active (scale-0.98), disabled, loading
Focus: ring-2 ring-violet-600 ring-offset-2
Features: asChild (Slot), spinner during loading
```

### Card
```
Variants: default, elevated, highlighted, interactive
Subcomponents: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
Spacing: Proper padding with p-6 base, pt-0/pb-0 variants
```

### Input
```
Height: 40px (default), 48px (lg)
Padding: 10px left-right, 12.5px top-bottom
Border: gray-300, focus: violet-600 with ring-3 ring-violet-100
Error State: border-red-500
Features: label, error message, helper text, size variants
Text Size: 16px base (prevents iOS zoom)
```

### Textarea
```
Same as Input but multi-line
Min Height: 80px
Features: auto-grow with overflow hidden, full validation support
```

### Badge
```
Variants: default, success, warning, error, outline
Sizes: sm, default
Shape: rounded-full (pill)
Color Scheme: Matched to brand palette
```

### Avatar
```
Built on: @radix-ui/react-avatar
Sizes: sm (h-8), default (h-10), lg (h-12)
Fallback: violet-100 background, violet-700 text
Features: Image support with object-cover, initials
```

### Progress
```
Built on: @radix-ui/react-progress
Track: bg-gray-100 h-2 rounded-full
Indicator: bg-violet-600 rounded-full transition-all
Features: Optional label, percentage display
```

### Tabs
```
Built on: @radix-ui/react-tabs
Style: Underline pattern (border-b-2) on active
Active Color: text-violet-700, border-violet-600
Inactive Color: text-gray-500
Hover: text-gray-700
```

### Dialog
```
Built on: @radix-ui/react-dialog
Overlay: bg-black/50 backdrop-blur-sm
Content: bg-white rounded-xl shadow-elevated-lg p-6 max-w-lg
Animation: fade-in overlay, slide-up content
Parts: Trigger, Content, Header, Title, Description, Footer, Close
```

### Select
```
Built on: @radix-ui/react-select
Trigger: Styled like input with ChevronDown icon
Content: Rounded-lg with shadow-elevated border
Items: Hover effect bg-violet-50, check icon indicator
Features: Groups, separators, keyboard navigation
```

### Tooltip
```
Built on: @radix-ui/react-tooltip
Style: bg-gray-900 text-white text-xs px-2 py-1 rounded-md
Animation: fade-in
Requires: TooltipProvider wrapper
```

### Dropdown Menu
```
Built on: @radix-ui/react-dropdown-menu
Content: bg-white rounded-lg shadow-elevated-lg
Items: Hover bg-violet-50, p-1 spacing
Features: Checkboxes, radio items, labels, separators, submenus
Icons: Check, ChevronRight for navigation
```

### Spinner
```
Shape: SVG circle with animated path
Colors: violet fill with lime gradient accent
Sizes: sm (h-4), default (h-6), lg (h-8)
Animation: CSS animate-spin
```

### Toast
```
Context-based with useToast hook
Variants: default, success, error, warning
Position: fixed bottom-4 right-4 z-9999
Auto-dismiss: Configurable duration (default 5s)
Icons: CheckCircle2, AlertCircle, Info, AlertTriangle
Features: Action button, dismissible
Animation: slide-up fade-in
Requires: ToastProvider in root layout
```

## Design Tokens

### Color Palette
- **Primary**: violet-600 (#9333ea)
- **Secondary**: violet-100 (#f3e8ff)
- **Accent**: lime-500 (#84cc16)
- **Success**: green-700 (#15803d)
- **Warning**: amber-700 (#b45309)
- **Error**: red-700 (#b91c1c)
- **Neutral Background**: white, gray-50, gray-100
- **Neutral Text**: foreground (#1f2937), gray-600, gray-500
- **Borders**: gray-100, gray-200, gray-300

### Typography
- **Headings**: Poppins (font-display)
- **Body**: Inter (font-sans)
- **Base Size**: 16px (inputs/textareas to prevent iOS zoom)
- **Form Text**: text-sm for labels and help text

### Spacing
- **Input Padding**: px-3.5 py-2.5 (horizontal-vertical consistency)
- **Card Padding**: p-6 base
- **Button Padding**: sm: px-3, default: px-5, lg: px-7
- **Gap/Spacing Units**: Based on Tailwind spacing scale

### Border Radius
- **sm**: 0.25rem (buttons small)
- **md**: 0.375rem (inputs)
- **lg**: 0.5rem (buttons, cards)
- **xl**: 0.75rem (dialogs)
- **2xl**: 1rem (modals)

### Shadows
- **card**: 0 1px 3px 0 rgba(0,0,0,0.1)
- **card-hover**: 0 10px 15px -3px rgba(0,0,0,0.1)
- **elevated**: 0 4px 6px -1px rgba(0,0,0,0.1)
- **elevated-lg**: 0 20px 25px -5px rgba(0,0,0,0.1)

### Focus States
All interactive elements:
- `focus:ring-2 focus:ring-violet-600 focus:ring-offset-2`

### Disabled States
All interactive elements:
- `disabled:opacity-50 disabled:cursor-not-allowed`

### Animations
- **fade-in**: 0.3s ease-out
- **slide-up**: 0.4s ease-out
- **pulse-subtle**: 2s infinite
- **bounce-gentle**: 2s ease-in-out infinite

## Accessibility Features

- Full keyboard navigation on all interactive components
- ARIA labels and roles properly set
- Color contrast meets WCAG AA standards
- Focus indicators visible on all focusable elements
- Screen reader announcements for dynamic content
- Semantic HTML structure
- Proper heading hierarchy
- Form labels associated with inputs
- Error messages linked to invalid fields

## Usage Examples

### Basic Form
```tsx
import { Button, Input, Textarea, Badge, Card, CardContent } from '@/components/ui'

export function ContactForm() {
  const [status, setStatus] = useState('')

  return (
    <Card>
      <CardContent className="pt-6">
        <Input label="Email" type="email" error={error} />
        <Textarea label="Message" autoGrow />
        <div className="flex items-center gap-3">
          <Button loading={loading}>Send</Button>
          {status && <Badge variant="success">{status}</Badge>}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Tabs & Dialog
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent, Dialog, DialogTrigger, DialogContent, Button } from '@/components/ui'

export function Settings() {
  return (
    <Dialog>
      <DialogTrigger>Open Settings</DialogTrigger>
      <DialogContent>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value="general">General settings</TabsContent>
          <TabsContent value="advanced">Advanced settings</TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
```

## Dependencies

All required dependencies are already installed:
- @radix-ui/react-avatar
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-progress
- @radix-ui/react-select
- @radix-ui/react-tabs
- @radix-ui/react-tooltip
- clsx
- tailwind-merge
- lucide-react

## File Structure

```
src/components/ui/
├── avatar.tsx
├── badge.tsx
├── button.tsx
├── card.tsx
├── chip-selector.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── empty-state.tsx
├── index.ts
├── input.tsx
├── logo.tsx
├── modal.tsx
├── progress.tsx
├── select.tsx
├── skeleton.tsx
├── spinner.tsx
├── tabs.tsx
├── textarea.tsx
├── toast.tsx
├── tooltip.tsx
├── COMPONENT_GUIDE.md
└── [This file would go in root]
```

## Importing Components

```tsx
// Individual imports
import { Button, Card, Input } from '@/components/ui'

// Or grouped
import {
  Button,
  Card,
  CardContent,
  Input,
  Textarea,
  Badge,
} from '@/components/ui'

// Card subcomponents
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
```

## Customization

Components support className overrides via the `cn()` utility:

```tsx
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'

<Button className={cn('my-custom-class', condition && 'conditional-class')} />
```

The `cn()` utility intelligently merges Tailwind classes, preventing conflicts.

## Notes

- All components are marked with `'use client'` for Next.js App Router
- TypeScript interfaces are exported for type safety
- Components follow React best practices (memoization where needed)
- Consistent prop naming across components
- All sizes and variants are enumerated types
- Loading states include visual feedback
- Error states are consistently styled
- Animations use defined keyframes from tailwind.config.js

---

For detailed usage of each component, see COMPONENT_GUIDE.md
