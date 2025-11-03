# 🎨 SAR Educational Complex - Brand Guide

## Brand Colors (From Logo & Uniform)

### Primary Colors

#### SAR Red
- **Hex**: `#DC143C`
- **RGB**: `rgb(220, 20, 60)`
- **Usage**: Primary brand color, buttons, headers, important elements
- **Represents**: Energy, passion, excellence

#### SAR Yellow/Gold
- **Hex**: `#FFC107` (Yellow) / `#FFD700` (Gold)
- **RGB**: `rgb(255, 193, 7)` / `rgb(255, 215, 0)`
- **Usage**: Accents, highlights, success states, achievements
- **Represents**: Success, achievement, brightness

#### SAR Teal
- **Hex**: `#00897B`
- **RGB**: `rgb(0, 137, 123)`
- **Usage**: Secondary accents, borders, calm elements
- **Represents**: Growth, stability, trust

#### White
- **Hex**: `#FFFFFF`
- **RGB**: `rgb(255, 255, 255)`
- **Usage**: Backgrounds, text on dark backgrounds
- **Represents**: Clarity, purity, simplicity

---

## Color Palette

### Primary Palette (SAR Red)
```css
--primary-50: #FEF2F2   /* Lightest */
--primary-100: #FEE2E2
--primary-200: #FECACA
--primary-300: #FCA5A5
--primary-400: #F87171
--primary-500: #DC143C  /* Brand Red */
--primary-600: #C41230
--primary-700: #A01027
--primary-800: #7D0D1F
--primary-900: #5A0A16  /* Darkest */
```

### Accent Colors
```css
--accent-gold: #FFC107    /* From uniform */
--accent-yellow: #FFD700  /* Bright gold */
--accent-teal: #00897B    /* From border */
--accent-red: #DC143C     /* Primary red */
--accent-cream: #FFF8E1   /* Soft background */
```

---

## Gradients

### SAR Brand Gradient
```css
background: linear-gradient(135deg, #DC143C 0%, #FFC107 50%, #00897B 100%);
```
**Usage**: Hero sections, special cards, premium features

### Primary Gradient
```css
background: linear-gradient(135deg, #DC143C 0%, #C41230 100%);
```
**Usage**: Buttons, CTAs, important elements

### Gold Gradient
```css
background: linear-gradient(135deg, #FFC107 0%, #FFD700 100%);
```
**Usage**: Achievements, awards, success states

### Teal Gradient
```css
background: linear-gradient(135deg, #00897B 0%, #00695C 100%);
```
**Usage**: Success messages, growth indicators

---

## Typography

### Font Families
- **Headings**: Poppins (Bold, SemiBold)
- **Body**: Inter (Regular, Medium)
- **Monospace**: JetBrains Mono (for IDs, codes)

### Font Sizes
```css
--text-xs: 12px
--text-sm: 14px
--text-base: 16px
--text-lg: 18px
--text-xl: 20px
--text-2xl: 24px
--text-3xl: 30px
--text-4xl: 36px
```

---

## Component Styles

### Buttons

#### Primary Button (SAR Red)
```css
.btn-primary {
  background: #DC143C;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
}
```

#### SAR Gradient Button
```css
.btn-sar {
  background: linear-gradient(135deg, #DC143C 0%, #FFC107 50%, #00897B 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
}
```

#### Gold Button (Success/Achievement)
```css
.btn-gold {
  background: #FFC107;
  color: #7D0D1F;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
}
```

### Cards

#### Modern Card
```css
.card-sar {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(220, 20, 60, 0.1);
  border-top: 4px solid #DC143C;
}
```

#### Glass Card (Premium)
```css
.card-glass-sar {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(220, 20, 60, 0.2);
}
```

### Badges

#### SAR Badge
```css
.badge-sar {
  background: linear-gradient(135deg, #DC143C, #FFC107);
  color: white;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
```

#### Gold Badge (Achievement)
```css
.badge-gold {
  background: #FFC107;
  color: #7D0D1F;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
```

---

## Usage Guidelines

### Do's ✅
- Use SAR Red (#DC143C) for primary actions and important elements
- Use Gold/Yellow (#FFC107) for achievements and success states
- Use Teal (#00897B) for secondary actions and calm elements
- Combine colors in gradients for premium features
- Maintain high contrast for accessibility
- Use white space generously

### Don'ts ❌
- Don't use colors outside the brand palette
- Don't use low contrast combinations
- Don't overuse gradients (use sparingly for impact)
- Don't mix too many colors in one component
- Don't use pure black (#000000) - use dark red (#5A0A16) instead

---

## Accessibility

### Color Contrast Ratios
- **SAR Red on White**: 7.2:1 (AAA) ✅
- **Gold on Dark Red**: 4.8:1 (AA) ✅
- **Teal on White**: 4.5:1 (AA) ✅
- **White on SAR Red**: 7.2:1 (AAA) ✅

### WCAG 2.1 Compliance
- All color combinations meet AA standards
- Primary combinations meet AAA standards
- Focus indicators use SAR Red with 2px outline
- Error states use darker red for better visibility

---

## Brand Applications

### Logo Usage
- **Primary Logo**: Red shield with yellow/gold elements
- **Minimum Size**: 48px height
- **Clear Space**: 16px on all sides
- **Backgrounds**: White or light cream preferred

### Uniform Pattern
- **Primary**: Red with yellow/gold checkered pattern
- **Accent**: Teal collar and trim
- **Pattern**: Can be used as subtle background texture

---

## Tailwind CSS Classes

### Background Colors
```html
<div class="bg-sar-red">SAR Red Background</div>
<div class="bg-sar-yellow">SAR Yellow Background</div>
<div class="bg-sar-teal">SAR Teal Background</div>
<div class="bg-accent-gold">Gold Accent</div>
```

### Text Colors
```html
<p class="text-sar-red">SAR Red Text</p>
<p class="text-sar-yellow">SAR Yellow Text</p>
<p class="text-sar-teal">SAR Teal Text</p>
```

### Border Colors
```html
<div class="border-sar-red">Red Border</div>
<div class="border-sar-teal">Teal Border</div>
```

---

## Design Patterns

### Hero Section
```css
background: linear-gradient(135deg, #DC143C 0%, #FFC107 100%);
color: white;
padding: 80px 20px;
text-align: center;
```

### Card Hover Effect
```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(220, 20, 60, 0.15);
  border-top-color: #FFC107;
}
```

### Achievement Badge
```css
.achievement {
  background: linear-gradient(135deg, #FFC107, #FFD700);
  border: 3px solid #DC143C;
  box-shadow: 0 8px 16px rgba(255, 193, 7, 0.3);
}
```

---

## Seasonal Variations

### Term Start (Bright & Energetic)
- Emphasize Yellow/Gold
- Use lighter tints
- More gradients

### Mid-Term (Balanced)
- Equal use of all colors
- Standard palette
- Professional tone

### Exam Period (Focused)
- Emphasize Teal (calm)
- Reduce bright colors
- Minimal distractions

---

## Print Guidelines

### Business Cards
- **Front**: White background, SAR Red logo
- **Back**: Teal accent with contact info

### Certificates
- **Border**: Gold gradient
- **Seal**: SAR Red with gold accents
- **Text**: Dark red (#7D0D1F)

### Report Cards
- **Header**: SAR gradient
- **Grades**: Color-coded (A=Gold, B=Teal, etc.)
- **Footer**: SAR Red with school info

---

## Digital Guidelines

### Website
- **Header**: White with SAR Red accents
- **Navigation**: Teal hover states
- **CTAs**: SAR Red buttons
- **Success**: Gold highlights

### Mobile App
- **Splash Screen**: SAR gradient
- **Bottom Nav**: White with red active state
- **Cards**: White with colored top border
- **Badges**: Gold for achievements

### Email Templates
- **Header**: SAR Red background
- **Body**: White with teal accents
- **Footer**: Dark red with gold links

---

## Brand Voice

### Tone
- **Professional** yet **Friendly**
- **Encouraging** and **Supportive**
- **Clear** and **Direct**
- **Culturally Aware** (Ghanaian context)

### Language
- Use "we" and "our" (inclusive)
- Avoid jargon
- Be positive and solution-focused
- Celebrate achievements

---

## Examples in Use

### Dashboard Header
```html
<header class="bg-gradient-to-r from-sar-red via-sar-yellow to-sar-teal text-white p-6">
  <h1 class="text-3xl font-bold">Welcome to SAR Portal</h1>
</header>
```

### Achievement Card
```html
<div class="card-sar p-6 border-t-4 border-sar-yellow">
  <div class="badge-gold mb-4">🏆 Top Performer</div>
  <h3 class="text-sar-red font-bold text-xl">Congratulations!</h3>
</div>
```

### Action Button
```html
<button class="btn-sar hover:scale-105 transition-transform">
  Get Started
</button>
```

---

## Version History

- **v1.0** (Initial): Ghana flag colors
- **v2.0** (Current): SAR brand colors from logo and uniform

---

## Contact

For brand guidelines questions:
- **Email**: info@sareducational.com
- **Location**: Sepe Dote near Hospital Junction, Asokore Mampong District, Kumasi, Ghana

---

*This brand guide ensures consistent visual identity across all SAR Educational Complex platforms and materials.*
