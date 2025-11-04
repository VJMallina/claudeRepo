# SaveInvest SVG Assets

This directory contains all export-ready SVG assets for the SaveInvest application.

## Directory Structure

```
assets/
├── icons/              # UI icons (24x24px default)
├── illustrations/      # Onboarding and empty state illustrations
├── logos/             # Brand logos and variations
└── README.md          # This file
```

## Icons

All icons are 24x24px by default (except large variants) and use `currentColor` for easy theming.

### Navigation Icons (Bottom Tab)
- `home.svg` - Home/Dashboard
- `wallet.svg` - Savings Wallet (also used for Pay)
- `investment.svg` - Investments/Portfolio
- `analytics.svg` - Analytics/Stats
- `profile.svg` - User Profile

### Action Icons
- `qr-scan.svg` - QR Code Scanner
- `plus.svg` - Add/Create
- `edit.svg` - Edit
- `delete.svg` - Delete/Remove
- `download.svg` - Download
- `share.svg` - Share
- `search.svg` - Search
- `filter.svg` - Filter
- `calendar.svg` - Date Picker

### Navigation Icons
- `arrow-left.svg` - Back button
- `chevron-right.svg` - Forward/Menu item
- `chevron-down.svg` - Dropdown
- `menu.svg` - Hamburger menu
- `close.svg` - Close/Dismiss
- `notification.svg` - Bell with badge

### Status Icons
- `success-large.svg` - Success checkmark (80x80px)
- `error-large.svg` - Error X (80x80px)
- `arrow-up.svg` - Positive trend (16x16px)
- `arrow-down.svg` - Negative trend (16x16px)
- `info.svg` - Information

### Feature Icons
- `settings.svg` - Settings/Gear
- `eye.svg` - View/Show
- `lock.svg` - Security/Locked
- `goal.svg` - Target/Goal

## Illustrations

All illustrations are 240x240px for onboarding screens, 160x160px for empty states.

### Onboarding (240x240px)
- `onboarding-savings.svg` - Auto-save coins falling into wallet (animated)
- `onboarding-growth.svg` - Growth chart with trend arrow
- `onboarding-invest.svg` - Phone with tap-to-invest button
- `onboarding-goals.svg` - Target with achievement trophy
- `onboarding-secure.svg` - Shield with checkmark

### Empty States (160x160px)
- `empty-transactions.svg` - Empty transaction list
- `empty-goals.svg` - No goals created yet

## Logos

### Variations
- `logo-icon.svg` - Icon only (64x64px) - for app icon, favicon
- `logo-full.svg` - Icon + text + tagline (200x64px) - for splash screen
- `logo-wordmark.svg` - Text only (160x40px) - for headers

## Usage

### In React Native

```jsx
import { SvgXml } from 'react-native-svg';
import HomeIcon from './assets/icons/home.svg';

// Use as component
<HomeIcon width={24} height={24} color="#10B981" />

// Or with SvgXml
const xml = `...svg content...`;
<SvgXml xml={xml} width="24" height="24" />
```

### In Figma

1. **Import SVG:**
   - Drag and drop SVG files into Figma
   - Or use File → Place Image

2. **Edit Colors:**
   - All icons use `currentColor` which becomes black in Figma
   - Select icon → Change fill/stroke color as needed

3. **Resize:**
   - Icons are designed at 24x24px
   - Use constraints to maintain aspect ratio when resizing

4. **Create Components:**
   - Convert each icon to a component for reusability
   - Set up variants for different states (active/inactive)

### Color Theming

Icons use `currentColor` which inherits the text color. This allows easy theming:

```jsx
// Primary color
<HomeIcon color="#10B981" />

// Secondary color
<HomeIcon color="#3B82F6" />

// Text color
<HomeIcon color="#111827" />

// Inactive
<HomeIcon color="#9CA3AF" />
```

### Animations

Some illustrations include built-in CSS/SVG animations:
- `onboarding-savings.svg` - Coins falling
- `onboarding-goals.svg` - Pulsing dots
- `onboarding-invest.svg` - Tap ripple effect

To disable animations, remove `<animate>` tags from SVG.

## Design System Colors

Icons are designed to work with these brand colors:

| Color          | Hex       | Usage                    |
|----------------|-----------|--------------------------|
| Primary Green  | `#10B981` | Savings, Growth, Success |
| Secondary Blue | `#3B82F6` | Trust, Security          |
| Accent Orange  | `#F59E0B` | Actions, CTAs            |
| Text Primary   | `#111827` | Main text, icons         |
| Text Secondary | `#6B7280` | Secondary text, inactive |
| Text Disabled  | `#9CA3AF` | Disabled states          |
| Success        | `#10B981` | Positive indicators      |
| Error          | `#EF4444` | Negative indicators      |

## File Specifications

All SVG files:
- ✅ Clean, optimized code
- ✅ No embedded fonts
- ✅ Use currentColor for easy theming
- ✅ ViewBox properly set
- ✅ Stroke width: 2px (icons), 3px (illustrations)
- ✅ Rounded caps and joins
- ✅ No unnecessary groups or transforms

## Adding New Icons

When creating new icons:
1. Use 24x24px artboard
2. 2px stroke width
3. Rounded caps (`stroke-linecap="round"`)
4. Use `currentColor` for strokes/fills
5. Center the icon in viewBox
6. Optimize with SVGO before committing

## Tools

### Recommended Tools
- **Figma** - Design and export
- **SVGO** - Optimize SVGs
- **SVGOMG** - Web-based SVG optimizer (svgomg.net)

### Optimization

To optimize SVGs:
```bash
# Using SVGO CLI
npx svgo assets/icons/*.svg

# Or use SVGOMG web interface
# https://jakearchibald.github.io/svgomg/
```

## Credits

Icons inspired by:
- Feather Icons (https://feathericons.com/)
- Heroicons (https://heroicons.com/)
- Custom designed for SaveInvest

---

**Questions?** Check the main documentation or contact the design team.
