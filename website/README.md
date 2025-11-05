# PiggySave - Demo Website

A professional, modern demo website showcasing the **PiggySave** mobile application - India's smartest savings and investment platform.

## 🎯 Overview

This website serves as a comprehensive demo and marketing site for PiggySave, featuring:
- Complete product overview
- Detailed feature descriptions
- Technology stack and integrations
- 60+ mobile app screens showcase
- Download section for app stores

## 🚀 Features Highlighted

### Core Features
- **Automatic Savings**: Save automatically from every UPI transaction
- **Smart Investment Portfolio**: 60+ investment products with real-time NAV tracking
- **Auto-Invest Rules (SIP)**: Systematic investment plans with intelligent triggers
- **Seamless UPI Payments**: QR scanning and UPI ID payments
- **Progressive KYC System**: 3-tier verification (Level 0, 1, 2)
- **Savings Goals**: Track financial goals with visual milestones
- **Automated Statements**: Daily/monthly PDF statements via email
- **Detailed Analytics**: Comprehensive savings and investment insights
- **Bank-Grade Security**: PIN, biometric, JWT authentication

### Technical Integrations
- **Payment**: Razorpay, UPI/NPCI
- **Verification**: Aadhaar eKYC, PAN verification, Liveness detection
- **Communication**: SMTP email, Push notifications, SMS gateway
- **Backend**: NestJS, PostgreSQL, Prisma ORM
- **Mobile**: React Native, Expo
- **Documents**: PDFKit, Nodemailer

## 📱 Mobile Screens Showcased

The website documents 60+ mobile screens across categories:
- Authentication & Security (4 screens)
- KYC & Onboarding (5 screens)
- Main Dashboard (5 screens)
- Savings Management (6 screens)
- Investment Management (6 screens)
- Auto-Invest/SIP (2 screens)
- UPI Payments (6 screens)
- Settings & Support (5 screens)
- Notifications (1 screen)

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Interactive features
- **Google Fonts**: Inter font family

### Design Features
- Fully responsive (mobile, tablet, desktop)
- Modern gradient backgrounds
- Smooth animations and transitions
- Interactive hover effects
- Scroll-triggered animations
- Mobile-first approach

## 📂 Project Structure

```
website/
├── index.html          # Main landing page
├── css/
│   └── style.css       # Comprehensive styling
├── js/
│   └── script.js       # Interactive features
├── images/             # Image assets (placeholder)
└── README.md           # This file
```

## 🎨 Design System

### Color Palette
- **Primary**: `#6366f1` (Indigo)
- **Primary Dark**: `#4f46e5`
- **Secondary**: `#ec4899` (Pink)
- **Success**: `#10b981` (Green)
- **Dark**: `#1f2937`
- **Gray**: `#6b7280`
- **Light**: `#f9fafb`

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: 700-800 weight
- **Body**: 400-500 weight
- **Base Size**: 16px

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Performance

- Lightweight (< 100KB total)
- Fast load times
- Optimized animations
- Lazy loading ready
- SEO-friendly markup

## 🚀 Getting Started

### Local Development

1. Clone the repository
2. Navigate to the website directory:
   ```bash
   cd website
   ```
3. Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js (http-server)
   npx http-server
   ```
4. Visit `http://localhost:8000`

### Deployment

This is a static website and can be deployed to:
- **Netlify**: Drag and drop deployment
- **Vercel**: Connect to Git repository
- **GitHub Pages**: Push to gh-pages branch
- **AWS S3**: Static website hosting
- **Firebase Hosting**: Fast CDN delivery

#### Quick Deploy Commands

**Netlify:**
```bash
netlify deploy --dir=website --prod
```

**Vercel:**
```bash
vercel website --prod
```

**GitHub Pages:**
```bash
git subtree push --prefix website origin gh-pages
```

## 🎯 Key Sections

### 1. Hero Section
- Eye-catching headline with gradient text
- Clear value proposition
- Call-to-action buttons
- Key statistics (₹500Cr+ savings, 1L+ users)
- Animated phone mockup

### 2. Features Section
- 9 detailed feature cards
- Comprehensive feature lists
- "Most Popular" badge for Smart Investment Portfolio
- Hover effects and animations

### 3. How It Works
- 3-step process visualization
- Clear action steps
- Feature highlights for each step

### 4. Integrations & Technology
- 6 integration categories
- 15+ technology partners
- Technical highlights (69+ API endpoints, 200+ tests)

### 5. App Screens Preview
- 60+ screens organized by category
- Icon-based visualization
- Screen descriptions
- Easy navigation

### 6. Download Section
- App Store and Google Play buttons
- Trust indicators (Secure, Zero Commission, Made in India)
- Call-to-action

### 7. Footer
- Company information
- Quick links
- Social media
- Legal links

## 🎭 Interactive Features

1. **Mobile Menu**: Responsive navigation for mobile devices
2. **Smooth Scrolling**: Anchor links with smooth scrolling
3. **Scroll Animations**: Elements fade in on scroll
4. **Navbar Effects**: Background changes on scroll
5. **Hover Effects**: Enhanced interactions on cards
6. **Phone Mockup 3D**: Tilt effect on mouse move
7. **Easter Egg**: Click logo 5 times for surprise!

## 📈 Analytics Integration

Ready to integrate with:
- Google Analytics
- Mixpanel
- Amplitude
- Custom analytics

## ♿ Accessibility

- Semantic HTML5 markup
- Proper heading hierarchy
- Alt text ready for images
- Keyboard navigation support
- ARIA labels ready
- Color contrast compliance

## 🔒 Security

- No external dependencies (except Google Fonts)
- No cookies or tracking by default
- HTTPS recommended for production
- Content Security Policy ready

## 📱 Mobile Optimization

- Responsive breakpoints: 480px, 768px, 1024px
- Touch-friendly buttons and links
- Mobile-first CSS
- Optimized for small screens
- Fast loading on mobile networks

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `style.css`:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #ec4899;
    /* ... more variables */
}
```

### Adding New Sections
Follow the existing HTML structure and add corresponding CSS.

### Changing Content
Edit `index.html` directly - all content is self-contained.

## 📝 TODO / Future Enhancements

- [ ] Add actual app screenshots/mockups
- [ ] Integrate real analytics
- [ ] Add testimonials section
- [ ] Create pricing page
- [ ] Add blog section
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Video demo section
- [ ] Live chat integration
- [ ] Cookie consent banner

## 🤝 Contributing

This website is part of the PiggySave project. For contributions:
1. Review the code
2. Make improvements
3. Test across devices
4. Submit changes

## 📄 License

Proprietary - All rights reserved by PiggySave

## 📞 Contact

For questions or support:
- Email: dev@piggysave.app
- Website: https://piggysave.app (when live)

## 🎉 Credits

- Design & Development: PiggySave Team
- Icons: Emoji (Unicode)
- Fonts: Google Fonts (Inter)
- Framework: Vanilla HTML/CSS/JS

---

**Made with ❤️ in India** 🇮🇳
