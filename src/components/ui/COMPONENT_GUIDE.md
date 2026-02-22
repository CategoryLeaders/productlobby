# ProductLobby Design System Component Library Guide

## Quick Start

All components are located in `/src/components/ui/` and exported from `index.ts`.

### Basic Usage

```tsx
import { Button, Card, CardContent, Input, Badge } from '@/components/ui'

export function Example() {
  return (
    <Card>
      <CardContent className="pt-6">
        <Input placeholder="Enter name" />
        <Button variant="primary">Submit</Button>
        <Badge variant="success">Active</Badge>
      </CardContent>
    </Card>
  )
}
```

## Component Reference

### Button
```tsx
<Button variant="primary" size="default" loading={false}>
  Click Me
</Button>
```
**Variants**: primary | secondary | accent | ghost | outline | destructive
**Sizes**: sm | default | lg

### Card & Related
```tsx
<Card variant="default">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```
**Card Variants**: default | elevated | highlighted | interactive

### Input & Textarea
```tsx
<Input 
  label="Email" 
  error="Invalid email" 
  helperText="Enter a valid email"
  size="default"
/>

<Textarea 
  label="Message" 
  autoGrow 
  placeholder="Type here..."
/>
```

### Badge
```tsx
<Badge variant="success" size="default">Active</Badge>
```
**Variants**: default | success | warning | error | outline
**Sizes**: sm | default

### Avatar
```tsx
<Avatar size="default" src="/image.jpg" alt="User" initials="AB" />
```
**Sizes**: sm | default | lg

### Progress
```tsx
<Progress value={65} max={100} label="Progress" showPercentage />
```

### Tabs
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Dialog
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose>Close</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Select
```tsx
<Select>
  <SelectTrigger>Choose option</SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Tooltip
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Dropdown Menu
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuCheckboxItem checked>Item 2</DropdownMenuCheckboxItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Spinner
```tsx
<Spinner size="default" />
```
**Sizes**: sm | default | lg

### Toast
```tsx
const { addToast } = useToast()

// Need ToastProvider wrapper in root layout
<ToastProvider>
  <App />
</ToastProvider>

// Usage
addToast('Success!', 'success', 5000)
addToast('Error!', 'error')
addToast('Info', 'info', 0) // No auto-dismiss
```

## Design Tokens

### Colors Used
- **Primary**: violet-600
- **Accent**: lime-500
- **Success**: green-700
- **Warning**: amber-700
- **Error**: red-700
- **Background**: white, gray-50, gray-100
- **Text**: foreground (#1F2937), gray-600, gray-500

### Focus States
All interactive elements have:
- `focus:ring-2 focus:ring-violet-600 focus:ring-offset-2`

### Disabled States
All inputs have:
- `disabled:opacity-50 disabled:cursor-not-allowed`

### Animations
- fade-in: 0.3s ease-out
- slide-up: 0.4s ease-out
- animate-spin: for loaders

## Accessibility

All components include:
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader support

## Props

Most components support:
- `className` - Custom Tailwind classes (merged intelligently)
- `disabled` - Disabled state
- `ref` - Forward ref support
- All standard HTML attributes

## Notes

- Use `cn()` helper for class merging: `cn('base-class', condition && 'extra-class')`
- Component sizing is consistent: sm < default < lg
- All focus states use violet-600 ring
- Text inputs default to 16px to prevent iOS zoom
- Loading states use built-in spinner
- Form components support error states with red styling
