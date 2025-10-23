# UI Wireframes & Design Specifications

## Design System

### Color Palette

#### Primary Colors
```
Primary Green:   #10B981 (Savings, Growth, Success)
Primary Dark:    #059669
Primary Light:   #D1FAE5

Secondary Blue:  #3B82F6 (Trust, Security)
Secondary Dark:  #1E40AF
Secondary Light: #DBEAFE

Accent Orange:   #F59E0B (Actions, CTAs)
Accent Dark:     #D97706
Accent Light:    #FEF3C7
```

#### Neutral Colors
```
Background:      #FFFFFF
Background Alt:  #F9FAFB
Surface:         #FFFFFF
Surface Border:  #E5E7EB

Text Primary:    #111827
Text Secondary:  #6B7280
Text Disabled:   #9CA3AF
```

#### Status Colors
```
Success:         #10B981
Warning:         #F59E0B
Error:           #EF4444
Info:            #3B82F6
```

### Typography

#### Font Family
- **Primary**: Inter (System: -apple-system, SF Pro, Roboto)
- **Numbers**: Tabular figures for alignment

#### Font Sizes
```
Heading 1: 28px / Bold / 34px line-height
Heading 2: 24px / Bold / 30px line-height
Heading 3: 20px / Semibold / 26px line-height
Heading 4: 18px / Semibold / 24px line-height

Body Large: 16px / Regular / 24px line-height
Body: 14px / Regular / 20px line-height
Body Small: 12px / Regular / 18px line-height

Caption: 11px / Regular / 16px line-height
Button: 16px / Semibold / 24px line-height
```

### Spacing System
```
4px   (xs)   - Tiny gaps
8px   (sm)   - Small gaps, icon padding
12px  (md)   - Medium gaps
16px  (lg)   - Default padding
20px  (xl)   - Card padding
24px  (2xl)  - Section spacing
32px  (3xl)  - Large section spacing
48px  (4xl)  - Extra large spacing
```

### Border Radius
```
Small:  4px  - Buttons, inputs
Medium: 8px  - Cards, containers
Large:  12px - Modal, sheets
XLarge: 16px - Images, featured cards
Full:   9999px - Pills, badges
```

### Shadows
```
Small:  0 1px 2px rgba(0,0,0,0.05)
Medium: 0 4px 6px rgba(0,0,0,0.1)
Large:  0 10px 15px rgba(0,0,0,0.1)
```

---

## Screen Wireframes

### 1. Splash Screen

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│          [App Logo]             │
│                                 │
│         SaveInvest              │
│    Save Smart, Invest Easy      │
│                                 │
│                                 │
│         Loading...              │
│          ━━━━━                  │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Design Specs:**
- **Background**: Gradient (Primary Green to Secondary Blue)
- **Logo**: Centered, 120x120px
- **App Name**: Heading 1, White, centered
- **Tagline**: Body, White 80% opacity, centered
- **Loading Bar**: Indeterminate progress, white

---

### 2. Welcome/Onboarding Screens (5 screens, swipeable)

#### Screen 1: Auto-Save Feature
```
┌─────────────────────────────────┐
│ Skip                            │
│                                 │
│     [Illustration: Coins        │
│      dropping into wallet]      │
│                                 │
│                                 │
│   Save Automatically            │
│   on Every Payment              │
│                                 │
│  Set your savings percentage    │
│  and watch your money grow      │
│  without thinking about it      │
│                                 │
│        ○ ● ○ ○ ○               │
│                                 │
│         [ Next → ]              │
└─────────────────────────────────┘
```

#### Screen 2-5: Similar pattern for other features

**Design Specs:**
- **Illustration**: 240x240px, centered, colorful
- **Title**: Heading 2, Text Primary, centered, 24px top margin
- **Description**: Body, Text Secondary, centered, 16px top margin
- **Pagination Dots**: 8px circles, 8px apart, active = Primary Green
- **Next Button**: Full width, Primary, 24px margin
- **Skip Button**: Text link, top right, Text Secondary

---

### 3. Registration Screen

```
┌─────────────────────────────────┐
│ ← Back                          │
│                                 │
│    Create Your Account          │
│                                 │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📱 Mobile Number        │   │
│  │ +91 |_______________|  │   │
│  └─────────────────────────┘   │
│                                 │
│  We'll send you an OTP to       │
│  verify your number             │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
│   ┌─────────────────────────┐  │
│   │   Send OTP              │  │
│   └─────────────────────────┘  │
│                                 │
│   By continuing, you agree to   │
│   Terms & Privacy Policy        │
└─────────────────────────────────┘
```

**Design Specs:**
- **Back Button**: Icon + text, 16px padding
- **Title**: Heading 2, Text Primary, 32px top margin
- **Input Field**:
  - Height: 56px
  - Border: 1px solid Surface Border
  - Radius: 8px
  - Padding: 16px
  - Focus: Border = Primary Green, 2px
  - Icon: 20x20px, left aligned, Text Secondary
- **Helper Text**: Body Small, Text Secondary, 8px top margin
- **Button**:
  - Height: 56px
  - Radius: 8px
  - Background: Primary Green
  - Text: Button style, White
  - Full width
  - 24px bottom margin
- **Footer Text**: Caption, Text Secondary, centered

---

### 4. OTP Verification Screen

```
┌─────────────────────────────────┐
│ ← Back                          │
│                                 │
│    Verify Your Number           │
│                                 │
│  We sent a code to              │
│  +91 98765-43210  [Edit]        │
│                                 │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐       │
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │       │
│  └───┘ └───┘ └───┘ └───┘       │
│                                 │
│  ┌───┐ ┌───┐                    │
│  │ 5 │ │ 6 │                    │
│  └───┘ └───┘                    │
│                                 │
│  Resend code in 00:58           │
│                                 │
│                                 │
│                                 │
│                                 │
│   ┌─────────────────────────┐  │
│   │   Verify & Continue     │  │
│   └─────────────────────────┘  │
│                                 │
│   Didn't receive? Resend Code   │
└─────────────────────────────────┘
```

**Design Specs:**
- **OTP Input Boxes**:
  - Size: 56x56px each
  - Border: 2px solid Surface Border
  - Radius: 8px
  - Spacing: 12px between boxes
  - Font: Heading 3, Text Primary
  - Focus: Border = Primary Green
  - Auto-focus next box on input
- **Edit Link**: Body Small, Primary Green
- **Resend Timer**: Body Small, Text Secondary, countdown
- **Resend Link**: Body, Primary Green (enabled after timer)

---

### 5. Profile Creation Screen

```
┌─────────────────────────────────┐
│ ← Back           Step 1 of 3    │
│                                 │
│    Tell Us About You            │
│                                 │
│  ┌─────────────────────────┐   │
│  │    [Profile Photo]      │   │
│  │       📷 Add Photo      │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Full Name               │   │
│  │ ___________________     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Email Address           │   │
│  │ ___________________     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Date of Birth           │   │
│  │ DD/MM/YYYY       📅     │   │
│  └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐  │
│   │   Continue              │  │
│   └─────────────────────────┘  │
└─────────────────────────────────┘
```

**Design Specs:**
- **Progress Indicator**: "Step 1 of 3", Body Small, Text Secondary, top right
- **Profile Photo**:
  - Size: 100x100px
  - Border: 2px dashed Surface Border
  - Radius: Full (circle)
  - Icon: 24x24px camera, Text Secondary
  - Tap to upload/take photo
- **Input Fields**: Same as registration
- **Date Picker**: Native date picker on tap

---

### 6. PIN Creation Screen

```
┌─────────────────────────────────┐
│ ← Back           Step 2 of 3    │
│                                 │
│    Create Your PIN              │
│                                 │
│  Your PIN will be used to       │
│  authorize payments             │
│                                 │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐       │
│  │ ● │ │ ● │ │ ● │ │ ○ │       │
│  └───┘ └───┘ └───┘ └───┘       │
│                                 │
│  ┌───┐ ┌───┐                    │
│  │ ○ │ │ ○ │                    │
│  └───┘ └───┘                    │
│                                 │
│                                 │
│  ┌─────────────────────────┐   │
│  │   1     2     3         │   │
│  │                         │   │
│  │   4     5     6         │   │
│  │                         │   │
│  │   7     8     9         │   │
│  │                         │   │
│  │   ⌫     0     ✓         │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Design Specs:**
- **PIN Display Dots**:
  - Size: 16x16px circles
  - Empty: Border 2px, Surface Border
  - Filled: Background Primary Green
  - Spacing: 16px between dots
- **Number Pad**:
  - Button size: 72x72px
  - Radius: Full (circle)
  - Background: Surface
  - Active: Background Alt
  - Font: Heading 3, Text Primary
  - Grid: 4 columns, 12px gap

---

### 7. Biometric Setup Screen

```
┌─────────────────────────────────┐
│ ← Back           Step 3 of 3    │
│                                 │
│    Enable Biometric             │
│                                 │
│         [Fingerprint            │
│          Icon Large]            │
│                                 │
│                                 │
│  Quick & Secure Login           │
│                                 │
│  Use your fingerprint to        │
│  login quickly and authorize    │
│  transactions securely          │
│                                 │
│                                 │
│                                 │
│   ┌─────────────────────────┐  │
│   │   Enable Fingerprint    │  │
│   └─────────────────────────┘  │
│                                 │
│   ┌─────────────────────────┐  │
│   │   Skip for Now          │  │
│   └─────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**Design Specs:**
- **Icon**: 120x120px, Primary Green, centered
- **Primary Button**: Background Primary Green
- **Secondary Button**: Background transparent, Border 1px Primary Green, Text Primary Green

---

### 8. Home Dashboard (Main Screen)

```
┌─────────────────────────────────┐
│ ☰  SaveInvest          🔔 👤   │
├─────────────────────────────────┤
│ Good Morning, Rahul! ☀️         │
│                                 │
│ ┌─────────────────────────────┐│
│ │ 💰 Savings Wallet           ││
│ │                             ││
│ │ ₹2,450.00                   ││
│ │ +₹150 today                 ││
│ │                             ││
│ │ [Add Money] [Invest Now]    ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ 📈 Portfolio                ││
│ │                             ││
│ │ ₹5,250  │  Returns: +5.0%   ││
│ │ ────────┴──────────────     ││
│ └─────────────────────────────┘│
│                                 │
│ Quick Actions                   │
│ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │ 💸  │ │ 📊  │ │ 🎯  │        │
│ │ Pay │ │Stats│ │Goal │        │
│ └─────┘ └─────┘ └─────┘        │
│                                 │
│ Recent Transactions             │
│ ┌─────────────────────────────┐│
│ │ 🏪 Cafe Coffee Day          ││
│ │ Today, 10:30 AM             ││
│ │                  -₹200  ✓   ││
│ │ Saved: ₹20                  ││
│ └─────────────────────────────┘│
│ ┌─────────────────────────────┐│
│ │ 🍕 Dominos Pizza            ││
│ │ Yesterday, 8:15 PM          ││
│ │                  -₹450  ✓   ││
│ │ Saved: ₹45                  ││
│ └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  🏠   💰   📈   📊   👤        │
│ Home  Pay Invest Stats Profile │
└─────────────────────────────────┘
```

**Design Specs:**

**Top Bar:**
- Height: 56px
- Background: White
- Menu icon: 24x24px, left 16px
- Notifications: Badge if unread, 24x24px
- Profile: Avatar 32x32px, right 16px

**Greeting Card:**
- Padding: 16px
- Font: Heading 4, Text Primary
- Emoji: 20x20px

**Savings Wallet Card:**
- Background: Gradient (Primary Green light to white)
- Padding: 20px
- Radius: 12px
- Shadow: Medium
- Amount: Heading 1, Text Primary
- Change: Body, Success Green, with ↑ icon
- Buttons: Side by side, 48% width each, 8px gap

**Portfolio Card:**
- Background: White
- Border: 1px Surface Border
- Padding: 20px
- Radius: 12px
- Amount & Returns: Side by side layout

**Quick Actions:**
- Grid: 3 columns
- Button size: 80x80px
- Background: Surface
- Radius: 12px
- Icon: 32x32px, centered
- Label: Body Small, Text Secondary, 4px top margin

**Transaction Cards:**
- Background: White
- Border: 1px Surface Border
- Padding: 16px
- Radius: 8px
- Margin: 8px between cards
- Icon: 40x40px, left aligned
- Merchant name: Body, Text Primary, Semibold
- Time: Caption, Text Secondary
- Amount: Body, Text Primary, Semibold, right aligned
- Saved amount: Caption, Success Green, below amount

**Bottom Navigation:**
- Height: 64px
- Background: White
- Border top: 1px Surface Border
- 5 tabs, equal width
- Icon: 24x24px
- Label: Caption
- Active: Primary Green
- Inactive: Text Secondary

---

### 9. Pay Screen (QR Scanner)

```
┌─────────────────────────────────┐
│ ✕ Close                         │
│                                 │
│ ┌─────────────────────────────┐│
│ │                             ││
│ │                             ││
│ │      ┌─────────────┐        ││
│ │      │             │        ││
│ │      │  QR  CODE   │        ││
│ │      │   SCANNER   │        ││
│ │      │  VIEWFINDER │        ││
│ │      └─────────────┘        ││
│ │                             ││
│ │                             ││
│ │  Place QR code in frame     ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ 💡 Turn on Flash            ││
│ └─────────────────────────────┘│
│                                 │
│        Other Options            │
│                                 │
│  ┌──────────┐  ┌──────────┐   │
│  │ Enter UPI│  │  Mobile  │   │
│  │    ID    │  │  Number  │   │
│  └──────────┘  └──────────┘   │
│                                 │
│  ┌────────────────────────┐    │
│  │   Recent Contacts      │    │
│  └────────────────────────┘    │
└─────────────────────────────────┘
```

**Design Specs:**
- **Camera View**: Full width, 400px height, radius 12px
- **Viewfinder**: 240x240px, white border 3px, centered with animation
- **Flash Toggle**: Background Surface, 48px height, radius 8px
- **Option Buttons**: 2 columns, 48px height, Background Surface

---

### 10. Payment Confirmation Screen

```
┌─────────────────────────────────┐
│ ✕ Close                         │
│                                 │
│    Paying to                    │
│    Cafe Coffee Day              │
│                                 │
│ ┌─────────────────────────────┐│
│ │                             ││
│ │        ₹ 1,000              ││
│ │        ̅ ̅ ̅ ̅ ̅ ̅ ̅              ││
│ │                             ││
│ │ 💡 You'll save: ₹100 (10%)  ││
│ │ New balance: ₹2,550         ││
│ │                             ││
│ └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────┐   │
│  │ Add Note (Optional)     │   │
│  │ ___________________     │   │
│  └─────────────────────────┘   │
│                                 │
│  Payment from                   │
│  ┌─────────────────────────┐   │
│  │ 🏦 SBI Bank ****4567  ▼ │   │
│  └─────────────────────────┘   │
│                                 │
│                                 │
│   ┌─────────────────────────┐  │
│   │   Pay ₹1,000            │  │
│   └─────────────────────────┘  │
│                                 │
│   Secured by SaveInvest         │
└─────────────────────────────────┘
```

**Design Specs:**
- **Amount Display**:
  - Font: 48px, Bold, Text Primary
  - Editable (underlined when focused)
  - Center aligned
- **Savings Preview Box**:
  - Background: Success Light (green tint)
  - Padding: 16px
  - Radius: 8px
  - Icon: 20x20px lightbulb
  - Text: Body, Success Dark
- **Bank Selector**: Dropdown, 56px height
- **Pay Button**: Large, 56px height, prominent

---

### 11. Payment Success Screen

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│         ✓                       │
│      (Animated)                 │
│                                 │
│   Payment Successful!           │
│                                 │
│        ₹1,000                   │
│   paid to Cafe Coffee Day       │
│                                 │
│ ┌─────────────────────────────┐│
│ │ 🎉 ₹100 saved automatically!││
│ │ New savings: ₹2,550         ││
│ └─────────────────────────────┘│
│                                 │
│  Transaction Details            │
│  ┌─────────────────────────┐   │
│  │ UTR: 123456789012       │   │
│  │ Date: 21 Oct, 10:30 AM  │   │
│  │ From: SBI ****4567      │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌──────────┐  ┌──────────┐   │
│  │Download  │  │  Share   │   │
│  │ Receipt  │  │ Receipt  │   │
│  └──────────┘  └──────────┘   │
│                                 │
│   ┌─────────────────────────┐  │
│   │   Done                  │  │
│   └─────────────────────────┘  │
└─────────────────────────────────┘
```

**Design Specs:**
- **Success Icon**:
  - Size: 80x80px
  - Color: Success Green
  - Animated: Scale + fade in
  - Checkmark with circular background
- **Confetti Animation**: Optional, celebratory
- **Savings Highlight Box**: Same style as preview, but with celebration icon
- **Action Buttons**: 2 columns, secondary style (outlined)

---

### 12. Savings Wallet Screen

```
┌─────────────────────────────────┐
│ ← Back        Savings Wallet    │
│                                 │
│ ┌─────────────────────────────┐│
│ │ Current Balance             ││
│ │                             ││
│ │ ₹2,450.00                   ││
│ │                             ││
│ │ Total Saved: ₹12,340        ││
│ │ This Month: ₹850            ││
│ │ 🔥 15-day streak            ││
│ │                             ││
│ │ [Add]  [Invest]  [Withdraw] ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ Savings Analytics           ││
│ │ ┌─────────────────────────┐ ││
│ │ │  [Trend Graph]          │ ││
│ │ │  Last 30 days           │ ││
│ │ └─────────────────────────┘ ││
│ │                             ││
│ │ Avg per transaction: ₹75    ││
│ │ Projected annual: ₹30,000   ││
│ └─────────────────────────────┘│
│                                 │
│ Recent Transactions             │
│ ┌─────────────────────────────┐│
│ │ ⬆️ Auto-save       +₹100    ││
│ │ From payment TXN123         ││
│ │ Today, 10:30 AM             ││
│ └─────────────────────────────┘│
│ ┌─────────────────────────────┐│
│ │ ⬆️ Manual deposit  +₹500    ││
│ │ Via UPI                     ││
│ │ Yesterday, 5:00 PM          ││
│ └─────────────────────────────┘│
└─────────────────────────────────┘
```

**Design Specs:**
- **Balance Card**: Large, prominent, gradient background
- **Stats Row**: 3 items side by side, small text
- **Streak**: Flame emoji + text, highlighted
- **Action Buttons**: 3 equal width, 32% each, 8px gap
- **Graph**: Line chart, 200px height, 7 days visible
- **Transaction Items**: Left aligned icon + text, right aligned amount with color (green = credit, red = debit)

---

### 13. Savings Configuration Screen

```
┌─────────────────────────────────┐
│ ← Back    Savings Settings      │
│                                 │
│  Auto-Save         [ON/OFF]     │
│                                 │
│  Savings Percentage             │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │ ●─────────────○         │   │
│  │ 1%           15%    50% │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────────┐│
│  │ 💡 Preview                  ││
│  │ ₹1,000 payment = ₹150 saved ││
│  └─────────────────────────────┘│
│                                 │
│  Advanced Settings              │
│  ┌─────────────────────────┐   │
│  │ Min Transaction Amount  │   │
│  │ ₹ 10 _______________    │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Max Savings/Transaction │   │
│  │ ₹ 500 ______________    │   │
│  └─────────────────────────┘   │
│                                 │
│  Frequency                      │
│  ○ Every transaction            │
│  ○ Daily                        │
│  ○ Weekly                       │
│                                 │
│   ┌─────────────────────────┐  │
│   │   Save Settings         │  │
│   └─────────────────────────┘  │
└─────────────────────────────────┘
```

**Design Specs:**
- **Toggle Switch**:
  - Width: 51px, Height: 31px
  - ON: Background Primary Green
  - OFF: Background Surface Border
  - Animated transition
- **Slider**:
  - Track: 4px height, Surface Border
  - Active Track: Primary Green
  - Thumb: 24x24px circle, White with shadow
  - Labels: Caption, Text Secondary, below track
- **Preview Box**: Success Light background, Body text
- **Radio Buttons**: 20x20px, Primary Green when selected

---

### 14. Create Goal Screen

```
┌─────────────────────────────────┐
│ ✕ Close                         │
│                                 │
│    Create Savings Goal          │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Goal Name               │   │
│  │ Vacation Fund______     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Target Amount           │   │
│  │ ₹ 50,000___________     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Target Date             │   │
│  │ 31/12/2025       📅     │   │
│  └─────────────────────────┘   │
│                                 │
│  Choose Icon                    │
│  ✈️  🏖️  🎓  💍  🏠  🚗         │
│                                 │
│  ┌─────────────────────────────┐│
│  │ 💡 You'll need to save      ││
│  │    ₹200 daily to reach goal ││
│  └─────────────────────────────┘│
│                                 │
│   ┌─────────────────────────┐  │
│   │   Create Goal           │  │
│   └─────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**Design Specs:**
- **Icon Selector**:
  - Size: 48x48px each
  - 6 per row
  - Active: Border 2px Primary Green, scale 1.1
  - Inactive: Opacity 50%
- **Calculation Box**: Auto-calculated, updates as user types
- **Full-screen Modal**: Slide up from bottom animation

---

### 15. Goal Tracking Screen

```
┌─────────────────────────────────┐
│ ← Back      Vacation Fund   ⋮   │
│                                 │
│          ✈️                     │
│                                 │
│    ₹12,500 / ₹50,000            │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│  ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░    │
│  25% complete                   │
│                                 │
│ ┌─────────────────────────────┐│
│ │ ⏰ 250 days remaining        ││
│ │ 💰 ₹37,500 left to save     ││
│ │ 📊 Need ₹200/day            ││
│ │ ✓  On track                 ││
│ └─────────────────────────────┘│
│                                 │
│  Recent Contributions           │
│  ┌─────────────────────────┐   │
│  │ Auto-save    +₹50       │   │
│  │ Today                   │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Auto-save    +₹30       │   │
│  │ Yesterday               │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────┐ ┌──────────┐  │
│  │ Add Money   │ │  Edit    │  │
│  └─────────────┘ └──────────┘  │
└─────────────────────────────────┘
```

**Design Specs:**
- **Progress Circle or Bar**:
  - Height: 12px
  - Background: Surface Border
  - Fill: Gradient Primary Green
  - Animated on load
  - Percentage label: Heading 4, below bar
- **Stats Cards**: Grid 2x2, Background Surface, rounded
- **On Track Badge**: Green if on pace, Orange if behind, with icon

---

### 16. Investment Products List

```
┌─────────────────────────────────┐
│ ← Back      Investments         │
│                                 │
│  Available Balance: ₹2,450      │
│                                 │
│  ┌─ Filter ─┐  ┌─ Sort ─┐      │
│                                 │
│ ┌─────────────────────────────┐│
│ │ 💧 Liquid Fund A            ││
│ │                             ││
│ │ Returns: 4.5% p.a.          ││
│ │ Risk: Low  Min: ₹100        ││
│ │                             ││
│ │              [Invest →]     ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ 📊 Short-Term Debt Fund B   ││
│ │                             ││
│ │ Returns: 7.0% p.a.          ││
│ │ Risk: Low-Med  Min: ₹500    ││
│ │                             ││
│ │              [Invest →]     ││
│ └─────────────────────────────┘│
│                                 │
│ ┌─────────────────────────────┐│
│ │ ✨ Digital Gold             ││
│ │                             ││
│ │ Price: ₹6,250/g             ││
│ │ Risk: Medium  Min: ₹10      ││
│ │                             ││
│ │              [Invest →]     ││
│ └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

**Design Specs:**
- **Filter/Sort Buttons**: Outlined, 48px height, Icon + text
- **Product Cards**:
  - Background: White
  - Border: 1px Surface Border
  - Padding: 16px
  - Radius: 12px
  - Shadow: Small
  - Margin: 12px vertical
- **Risk Badge**: Pill shape, color-coded (Green=Low, Orange=Med, Red=High)
- **Invest Button**: Text link style, Primary Green, right aligned

---

### 17. Investment Detail Screen

```
┌─────────────────────────────────┐
│ ✕ Close                         │
│                                 │
│  💧 Liquid Fund A               │
│                                 │
│ ┌─────────────────────────────┐│
│ │ Current NAV: ₹12.45         ││
│ │ 1Y Return: 5.2%  ⬆️         ││
│ └─────────────────────────────┘│
│                                 │
│  [Performance Graph - 1Y]       │
│  ┌─────────────────────────┐   │
│  │   /\      /\            │   │
│  │  /  \    /  \  /\       │   │
│  │ /    \  /    \/  \      │   │
│  └─────────────────────────┘   │
│  1M  3M  6M  [1Y]  3Y  5Y       │
│                                 │
│  Fund Details                   │
│  ┌─────────────────────────┐   │
│  │ Category    Liquid Fund │   │
│  │ Risk Level  Low         │   │
│  │ Fund Size   ₹5,000 Cr   │   │
│  │ Expense     0.25%       │   │
│  │ Exit Load   Nil         │   │
│  │ Min Amount  ₹100        │   │
│  └─────────────────────────┘   │
│                                 │
│  About This Fund                │
│  Low risk liquid fund with...   │
│  [Read More]                    │
│                                 │
│   ┌─────────────────────────┐  │
│   │   Invest Now            │  │
│   └─────────────────────────┘  │
└─────────────────────────────────┘
```

**Design Specs:**
- **NAV Card**: Prominent, gradient background
- **Graph**: 240px height, interactive, time period tabs
- **Details Table**: 2 columns, alternating row background
- **Tabs**: Pill buttons, active = Primary Green background

---

### 18. Investment Purchase Screen

```
┌─────────────────────────────────┐
│ ← Back                          │
│                                 │
│  Invest in Liquid Fund A        │
│                                 │
│  Available: ₹2,450              │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │   ₹  1,000              │   │
│  │   ̅ ̅ ̅ ̅ ̅ ̅ ̅              │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Quick Amounts                  │
│  [₹500] [₹1000] [₹2000] [All]   │
│                                 │
│ ┌─────────────────────────────┐│
│ │ Investment Summary          ││
│ │                             ││
│ │ Amount:          ₹1,000     ││
│ │ NAV:             ₹12.45     ││
│ │ Est. Units:      80.32      ││
│ │ ─────────────────────────   ││
│ │ Payment from: Savings Wallet││
│ │ New Balance:     ₹1,450     ││
│ │                             ││
│ │ ℹ️ Units credited in 1-2 days││
│ └─────────────────────────────┘│
│                                 │
│   ┌─────────────────────────┐  │
│   │   Confirm & Invest      │  │
│   └─────────────────────────┘  │
│                                 │
│   ☑️ I agree to Terms & Conditions│
└─────────────────────────────────┘
```

**Design Specs:**
- **Amount Input**: Large, 48px font, editable, underlined
- **Quick Amount Buttons**: Pills, 4 equal width, outlined
- **Summary Card**: Background Info Light, comprehensive breakdown
- **Checkbox**: 20x20px, Primary Green when checked
- **Terms Link**: Body Small, Primary Green

---

### 19. Portfolio Screen

```
┌─────────────────────────────────┐
│ ← Back       My Portfolio       │
│                                 │
│ ┌─────────────────────────────┐│
│ │ Total Invested  ₹5,000      ││
│ │ Current Value   ₹5,250      ││
│ │ Total Returns   +₹250 (+5%) ││
│ │ Today's Change  +₹15 (0.3%) ││
│ └─────────────────────────────┘│
│                                 │
│  Asset Allocation               │
│  ┌─────────────────────────┐   │
│  │    [Pie Chart]          │   │
│  │  ●●● 40% Liquid         │   │
│  │  ●●● 40% Debt           │   │
│  │  ●●● 20% Gold           │   │
│  └─────────────────────────┘   │
│                                 │
│  Holdings                       │
│ ┌─────────────────────────────┐│
│ │ 💧 Liquid Fund A            ││
│ │ Invested: ₹2,000            ││
│ │ Current:  ₹2,100  +₹100     ││
│ │ Returns: +5.0% ⬆️           ││
│ └─────────────────────────────┘│
│ ┌─────────────────────────────┐│
│ │ 📊 Debt Fund B              ││
│ │ Invested: ₹2,000            ││
│ │ Current:  ₹2,080  +₹80      ││
│ │ Returns: +4.0% ⬆️           ││
│ └─────────────────────────────┘│
│ ┌─────────────────────────────┐│
│ │ ✨ Digital Gold             ││
│ │ Invested: ₹1,000            ││
│ │ Current:  ₹1,070  +₹70      ││
│ │ Returns: +7.0% ⬆️           ││
│ └─────────────────────────────┘│
└─────────────────────────────────┘
```

**Design Specs:**
- **Summary Card**: Large, gradient, prominent returns
- **Pie Chart**: 160x160px, interactive, color-coded
- **Legend**: Dots + labels, below chart
- **Holding Cards**: Tap to view details, swipe for quick actions
- **Returns Color**: Green if positive, Red if negative, with arrow icons

---

### 20. Transaction History Screen

```
┌─────────────────────────────────┐
│ ← Back    Transactions   🔍     │
│                                 │
│  ┌─ Filter ─┐  ┌─ Date ─┐      │
│                                 │
│  October 2025                   │
│ ┌─────────────────────────────┐│
│ │ 🏪 Cafe Coffee Day          ││
│ │ Today, 10:30 AM             ││
│ │ Payment • Saved ₹20         ││
│ │                  -₹200  ✓   ││
│ └─────────────────────────────┘│
│ ┌─────────────────────────────┐│
│ │ 🍕 Dominos Pizza            ││
│ │ Today, 8:15 AM              ││
│ │ Payment • Saved ₹45         ││
│ │                  -₹450  ✓   ││
│ └─────────────────────────────┘│
│                                 │
│  Yesterday                      │
│ ┌─────────────────────────────┐│
│ │ 💰 Manual Deposit           ││
│ │ Yesterday, 5:00 PM          ││
│ │ To Savings Wallet           ││
│ │                  +₹500  ✓   ││
│ └─────────────────────────────┘│
│ ┌─────────────────────────────┐│
│ │ 📈 Investment               ││
│ │ Yesterday, 2:30 PM          ││
│ │ Liquid Fund A               ││
│ │                -₹1,000  ✓   ││
│ └─────────────────────────────┘│
│                                 │
│  [Load More...]                 │
└─────────────────────────────────┘
```

**Design Specs:**
- **Search Icon**: Top right, 24x24px
- **Filter Buttons**: Dropdown/sheet
- **Date Headers**: Caption, Text Secondary, 16px top margin
- **Transaction Cards**: Same as home screen
- **Type Labels**: Caption, Text Secondary, below merchant
- **Load More**: Text link, centered, 48px tap area

---

### 21. Transaction Detail Screen

```
┌─────────────────────────────────┐
│ ✕ Close                         │
│                                 │
│          ✓                      │
│     Payment Successful          │
│                                 │
│        ₹200.00                  │
│   to Cafe Coffee Day            │
│                                 │
│  Transaction Details            │
│  ┌─────────────────────────┐   │
│  │ Transaction ID          │   │
│  │ TXN123456789            │   │
│  │                         │   │
│  │ UTR Number              │   │
│  │ 987654321012            │   │
│  │                         │   │
│  │ Date & Time             │   │
│  │ 21 Oct 2025, 10:30 AM   │   │
│  │                         │   │
│  │ Payment Method          │   │
│  │ UPI - SBI ****4567      │   │
│  │                         │   │
│  │ Status                  │   │
│  │ Success ✓               │   │
│  │                         │   │
│  │ Auto-Saved              │   │
│  │ ₹20 (10%)               │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌──────────┐  ┌──────────┐   │
│  │Download  │  │  Share   │   │
│  │ Receipt  │  │ Receipt  │   │
│  └──────────┘  └──────────┘   │
│                                 │
│  [Report Issue]                 │
└─────────────────────────────────┘
```

**Design Specs:**
- **Modal**: Full screen or bottom sheet
- **Details Table**: Left-right layout, 16px padding per row
- **Copy Button**: Small icon next to IDs for easy copy
- **Report Link**: Text link, bottom, Text Secondary

---

### 22. Analytics Screen

```
┌─────────────────────────────────┐
│ ← Back       Analytics          │
│                                 │
│  [This Month ▼]                 │
│                                 │
│ ┌─────────────────────────────┐│
│ │ Total Spent    ₹25,000      ││
│ │ Total Saved    ₹2,500       ││
│ │ Savings Rate   10%          ││
│ │ Transactions   42           ││
│ └─────────────────────────────┘│
│                                 │
│  Spending Trend                 │
│  ┌─────────────────────────┐   │
│  │  [Bar Chart - 6 months] │   │
│  │   ███  ██  ███  ██  ███ │   │
│  │   Jun Jul Aug Sep Oct   │   │
│  └─────────────────────────┘   │
│                                 │
│  Savings Trend                  │
│  ┌─────────────────────────┐   │
│  │  [Line Chart - 30 days] │   │
│  │      /\      /\          │   │
│  │     /  \    /  \  /\     │   │
│  │    /    \  /    \/  \    │   │
│  └─────────────────────────┘   │
│                                 │
│  Insights                       │
│  💡 You're saving 20% more      │
│     than last month!            │
│                                 │
│  💰 Consider investing ₹2,450   │
│     from your savings           │
│                                 │
│  [Generate Report]              │
└─────────────────────────────────┘
```

**Design Specs:**
- **Time Period Selector**: Dropdown, top
- **Stats Grid**: 2x2, equal size
- **Charts**: Interactive, 200px height each, different colors
- **Insights Cards**: Background Info Light, Icon + text, 16px padding
- **Generate Report**: Outlined button, bottom

---

### 23. Profile Screen

```
┌─────────────────────────────────┐
│ ← Back        Profile           │
│                                 │
│  ┌─────────────────────────┐   │
│  │      [Avatar 80x80]     │   │
│  │                         │   │
│  │    Rahul Sharma         │   │
│  │ rahul@email.com         │   │
│  │ +91 98765-43210         │   │
│  │                         │   │
│  │ [Edit Profile]          │   │
│  └─────────────────────────┘   │
│                                 │
│  KYC Status                     │
│  ┌─────────────────────────┐   │
│  │ ✓ Verified              │   │
│  │ Completed on 15 Oct     │   │
│  └─────────────────────────┘   │
│                                 │
│  Account                        │
│  › Linked Bank Accounts         │
│  › UPI IDs                      │
│  › Transaction Limits           │
│                                 │
│  Settings                       │
│  › Security & PIN               │
│  › Notifications                │
│  › Language & Region            │
│  › Auto-Save Settings           │
│                                 │
│  Support                        │
│  › Help Center                  │
│  › Contact Support              │
│  › About SaveInvest             │
│                                 │
│  [Logout]                       │
└─────────────────────────────────┘
```

**Design Specs:**
- **Profile Card**: Centered, Background Surface, rounded
- **Avatar**: 80x80px circle, editable
- **Edit Button**: Text link, Primary Green
- **KYC Badge**: Success Green if verified, Warning if pending
- **Menu Items**: 56px height, with chevron right, tap area full width
- **Logout**: Destructive style, Error Red text

---

### 24. Settings - Notifications

```
┌─────────────────────────────────┐
│ ← Back    Notifications         │
│                                 │
│  Push Notifications             │
│  ┌─────────────────────────┐   │
│  │ Transaction Alerts  [ON]│   │
│  │ Savings Updates     [ON]│   │
│  │ Investment Updates  [ON]│   │
│  │ Security Alerts     [ON]│   │
│  │ (Cannot be disabled)    │   │
│  │ Goals Progress      [ON]│   │
│  │ Promotional        [OFF]│   │
│  └─────────────────────────┘   │
│                                 │
│  Email Notifications            │
│  ┌─────────────────────────┐   │
│  │ Weekly Summary      [ON]│   │
│  │ Monthly Report      [ON]│   │
│  │ Investment Updates [OFF]│   │
│  │ Promotional        [OFF]│   │
│  └─────────────────────────┘   │
│                                 │
│  SMS Notifications              │
│  ┌─────────────────────────┐   │
│  │ Transaction Alerts  [ON]│   │
│  │ Security Alerts     [ON]│   │
│  │ OTP Only           [OFF]│   │
│  └─────────────────────────┘   │
│                                 │
│  Quiet Hours                    │
│  ┌─────────────────────────┐   │
│  │ Enable             [ON] │   │
│  │ From: 10:00 PM          │   │
│  │ To:   8:00 AM           │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Design Specs:**
- **Section Headers**: Caption, Text Secondary, 24px top margin
- **Settings Cards**: Background White, Border Surface Border
- **Toggle Switches**: Right aligned, same specs as before
- **Disabled Items**: Opacity 50%, with explanatory text
- **Time Pickers**: Native time picker on tap

---

## Component Library

### Buttons

#### Primary Button
```
Height: 56px
Radius: 8px
Background: #10B981 (Primary Green)
Text: 16px Semibold, White
Padding: 0 24px
Full width or min-width: 120px
Active: Opacity 90%
Disabled: Opacity 40%
```

#### Secondary Button
```
Same as primary but:
Background: Transparent
Border: 1px #10B981
Text: #10B981
```

#### Text Button
```
No background
Text: #10B981, 16px Semibold
Padding: 12px 16px
Underline on press
```

### Input Fields

```
Height: 56px
Border: 1px #E5E7EB
Radius: 8px
Padding: 16px
Font: 16px Regular
Placeholder: #9CA3AF
Focus: Border #10B981 2px
Error: Border #EF4444 2px
```

### Cards

```
Background: White
Border: 1px #E5E7EB
Radius: 12px
Padding: 20px
Shadow: 0 1px 3px rgba(0,0,0,0.1)
```

### Bottom Sheets

```
Radius (top): 16px
Max Height: 90vh
Background: White
Handle: 32x4px, #E5E7EB, centered
Overlay: rgba(0,0,0,0.5)
```

---

This wireframe document provides a complete visual guide for all 24+ screens in your MVP. Each screen includes:
- ASCII wireframes for quick visualization
- Detailed design specifications
- Component breakdowns
- Interaction states

Would you like me to:
1. Create more detailed prototypes in a specific format (Figma, Sketch)?
2. Generate React Native component code based on these designs?
3. Create additional screens for edge cases?
4. Export these as interactive prototypes?

Let me know what you'd like next! 🎨
