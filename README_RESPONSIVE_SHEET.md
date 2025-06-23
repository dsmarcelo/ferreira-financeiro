# Responsive Sheet with Mobile Keyboard Handling

This project includes a responsive sheet component that automatically adapts to different screen sizes and handles mobile keyboard interactions gracefully using the [shadcn/ui Drawer component](https://ui.shadcn.com/docs/components/drawer).

## Features

- **Responsive Design**: Uses drawer on desktop and mobile with different behaviors
- **Mobile Keyboard Handling**: Automatically adjusts height when mobile keyboard appears
- **Built on Vaul**: Uses the modern [Vaul drawer library](https://github.com/emilkowalski/vaul) for smooth animations
- **Visual Handle**: Includes automatic drag handle indicator on mobile
- **Smooth Animations**: Native slide animations with gesture support
- **Accessible**: Proper ARIA labels and keyboard navigation

## Components

### ResponsiveSheet

The main component that provides responsive behavior:

```tsx
import ResponsiveSheet from "@/app/_components/responsive-sheet";

function MyComponent() {
  return (
    <ResponsiveSheet
      triggerButton={<Button>Open Sheet</Button>}
      title="My Sheet"
      description="Sheet description"
      maxWidth="sm:max-w-[600px]"
    >
      {/* Your content */}
    </ResponsiveSheet>
  );
}
```

### MobileDrawer

Specialized mobile drawer with keyboard handling:

```tsx
import { MobileDrawer } from "@/app/_components/mobile-drawer";

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <MobileDrawer
      open={open}
      onOpenChange={setOpen}
      title="Mobile Drawer"
      description="Description"
    >
      {/* Your content */}
    </MobileDrawer>
  );
}
```

### useViewportHeight Hook

Enhanced hook for mobile keyboard detection:

```tsx
import { useViewportHeight } from "@/hooks/use-viewport-height";

function MyComponent() {
  const { height, isKeyboardOpen, getMobileDialogHeight } = useViewportHeight();

  const mobileMaxHeight = getMobileDialogHeight(40, 300);
  // Returns undefined when keyboard is closed, calculated height when open
}
```

## How It Works

### Desktop Behavior
- Uses standard drawer component with trigger
- Appears as bottom drawer with smooth animations
- Standard drawer behavior with gesture support

### Mobile Behavior
- Uses specialized `MobileDrawer` component
- Slides up from bottom of screen
- Automatically adjusts height when keyboard appears
- Includes visual drag handle indicator
- Maintains minimum height for usability
- Gesture-based interactions (swipe to close)

### Keyboard Detection
1. Monitors viewport height changes using both:
   - Visual Viewport API (modern browsers)
   - Window resize events (fallback)
2. Detects keyboard when viewport height drops significantly
3. Calculates optimal drawer height with configurable padding
4. Applies height dynamically via inline styles

## Props

### ResponsiveSheet Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `triggerButton` | `React.ReactNode` | - | Element that triggers the sheet |
| `children` | `React.ReactNode` | - | Sheet content |
| `title` | `string` | - | Sheet title |
| `description` | `string` | - | Sheet description |
| `isOpen` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Open state change handler |
| `maxWidth` | `string` | `"sm:max-w-[600px]"` | Desktop drawer max width |

### MobileDrawer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Open state |
| `onOpenChange` | `(open: boolean) => void` | - | Open state change handler |
| `children` | `React.ReactNode` | - | Drawer content |
| `title` | `string` | - | Drawer title |
| `description` | `string` | - | Drawer description |

## Usage Examples

### Basic Sheet
```tsx
<ResponsiveSheet
  triggerButton={<Button>Open</Button>}
  title="Basic Sheet"
>
  <p>Sheet content goes here</p>
</ResponsiveSheet>
```

### Form Sheet with Custom Sizing
```tsx
<ResponsiveSheet
  triggerButton={<Button>Create Category</Button>}
  title="Create New Category"
  description="Fill out the form below"
  maxWidth="sm:max-w-[500px]"
>
  <CreateCategoryForm />
</ResponsiveSheet>
```

### Controlled Sheet
```tsx
function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <ResponsiveSheet
      triggerButton={<Button>Open</Button>}
      title="Controlled Sheet"
      isOpen={open}
      onOpenChange={setOpen}
    >
      <p>Content</p>
    </ResponsiveSheet>
  );
}
```

## Styling

### Mobile Drawer Customization
The mobile drawer includes these features:
- Automatic visual handle indicator (provided by Vaul)
- Smooth slide animations with spring physics
- Gesture support (swipe to close)
- Dynamic height adjustment for keyboard

### Desktop Drawer Customization
Uses standard drawer styling with configurable max width and responsive behavior.

## Browser Support

- **Modern browsers**: Visual Viewport API for accurate keyboard detection
- **Older browsers**: Fallback to window resize events
- **Mobile browsers**: Tested on iOS Safari, Chrome Mobile, Firefox Mobile
- **Gesture support**: Native touch gestures on mobile devices

## Best Practices

1. **Use appropriate padding**: 40-60px for forms, 20-30px for simple content
2. **Set minimum heights**: Ensure drawers remain usable on small screens
3. **Test on real devices**: Virtual keyboards and gestures behave differently
4. **Consider content length**: Long forms work better with keyboard handling enabled
5. **Leverage gestures**: Users can swipe down to close on mobile

## Migration from Dialog

To migrate existing dialogs to responsive sheets:

```tsx
// Before
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {children}
  </DialogContent>
</Dialog>

// After
<ResponsiveSheet
  triggerButton={<Button>Open</Button>}
  title="Title"
>
  {children}
</ResponsiveSheet>
```

## Technical Details

- **Built on Vaul**: Uses the modern Vaul library for drawer functionality
- **Visual Viewport API**: Provides accurate keyboard detection
- **Spring Animations**: Smooth, physics-based animations
- **Accessibility**: Full ARIA support and keyboard navigation
- **Performance**: Efficient re-renders and optimized event listeners

## Components Updated

- `CreateCategoryDialog`: Now uses ResponsiveSheet with drawer-based mobile UX
- `MobileDrawer`: Replaces the previous `MobileBottomSheet` component
- Form components work seamlessly within the responsive drawer layout