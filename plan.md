

# WoodCraft Pro - Custom Furniture Manufacturing Platform

## Overview
A complete e-commerce and order management system for a wooden furniture company selling both standard catalog products and custom-made furniture. The platform automates pricing, order processing, and service order generation.

---

## Phase 1: Foundation & Database Setup

### Database Architecture
- **Products table** - Standard furniture items with images, variants, pricing, and stock
- **Wood types table** - Available wood options with pricing multipliers
- **Finishes table** - Finish options (natural, stained, lacquered) with costs
- **Extras table** - Additional options (carvings, hardware, cushions) with pricing
- **Cost sheet table** - Configurable base costs for materials, labor, and margins
- **Orders table** - All orders with status tracking and payment info
- **Order items table** - Line items for each order (standard or custom specs)
- **Service orders table** - Generated documentation for production
- **User profiles table** - Extended user data
- **User roles table** - Role management (customer, sales_manager)

### Authentication System
- Customer registration and login
- Role-based access control
- Protected admin routes

---

## Phase 2: Public Website

### Home Page
- Hero section with woodworking imagery
- Featured products carousel
- "Standard vs Custom" value proposition
- Call-to-action for customization
- Testimonials section

### Product Catalog
- Grid view of standard products
- Category filtering (tables, chairs, beds, cabinets, shelving)
- Price range filtering
- Search functionality
- Quick view modal

### Product Detail Pages
- Image gallery
- Variant selection (size, wood type, finish)
- Dynamic pricing based on selections
- Stock availability indicator
- Add to cart functionality
- Related products

### "Customize Your Furniture" Page
- Interactive customization wizard:
  1. **Select furniture type** (dining table, coffee table, bookshelf, bed frame, desk, cabinet)
  2. **Enter dimensions** (length, width, height with min/max limits)
  3. **Choose wood type** (oak, walnut, maple, cherry, pine - each with price impact)
  4. **Select finish** (natural, light stain, dark stain, painted, lacquered)
  5. **Add extras** (custom carvings, premium hardware, fabric elements, glass inserts)
- **Live price calculator** showing cost breakdown
- Preview summary before adding to cart

### Additional Pages
- **How It Works** - Step-by-step process explanation
- **About Us** - Company story, craftsmanship values
- **Contact** - Form with inquiry handling

---

## Phase 3: Cost Sheet Engine

### Admin-Configurable Pricing
- Base material costs per wood type (per cubic meter)
- Labor rate per hour
- Complexity multipliers by furniture type
- Finish costs per square meter
- Extra component pricing
- Profit margin percentage
- Overhead percentage

### Dynamic Calculation Formula
```
Total = (Material Cost + Labor Cost + Finish Cost + Extras) × (1 + Margin) × (1 + Overhead)
Deposit = Total × 0.5
```

### Cost Sheet Management Interface
- Edit all base values
- Preview price impact on sample configurations
- Price history tracking

---

## Phase 4: Shopping & Checkout

### Shopping Cart
- Add/remove items (standard and custom)
- Quantity adjustments for standard items
- Custom item specifications display
- Running total with deposit calculation
- Save cart for later (authenticated users)

### Checkout Flow
1. **Cart Review** - Final item confirmation
2. **Shipping Details** - Delivery address and contact
3. **Order Summary** - Total breakdown showing:
   - Subtotal
   - **Deposit Required (50%)**
   - Remaining Balance (due on delivery)
4. **Payment** - Simulated payment gateway
   - Credit card form (mock validation)
   - Payment confirmation
5. **Order Confirmation** - Receipt with order number

---

## Phase 5: Order Management & Automation

### Automatic Order Processing
- Order created with "Quote Generated" status
- Upon deposit payment → Status updates to "Deposit Paid"
- **Service Order auto-generated** containing:
  - Unique service order ID
  - Customer information
  - Complete technical specifications
  - Dimensions and materials
  - Total price and payment status
  - Estimated production timeline
  - QR code for tracking

### Order Status Workflow
1. Quote Generated
2. Deposit Paid ✓
3. In Production
4. Manufactured
5. Ready for Delivery
6. Delivered
7. Cancelled (with refund handling)

### Customer Order Tracking
- Order history page
- Status timeline visualization
- Payment status (deposit paid, balance due)
- Estimated delivery dates
- Download service order PDF

---

## Phase 6: Sales Manager Dashboard

### Dashboard Overview
- Today's orders count
- Pending quotes requiring action
- Revenue metrics (deposits received, outstanding balances)
- Production pipeline visualization

### Order Management
- Filterable order list (by status, date, customer)
- Order detail view with full specifications
- **Status update controls** (advance through workflow)
- Edit custom order specifications
- Adjust pricing (with reason logging)
- Cancel order with refund initiation

### Cost Sheet Administration
- Edit all pricing variables
- Bulk price updates
- Price simulation tool

### Service Order Management
- View all service orders
- Download as PDF
- Print-ready format
- Send to production (status update)

### Customer Management
- Customer list with order history
- Contact information
- Total lifetime value

---

## Phase 7: Notifications (Simulated)

### Email Notifications
- Order confirmation with deposit receipt
- Status change notifications
- Production started
- Ready for delivery
- Payment reminders for balance

*Displayed in-app as notification center with "would send email" simulation*

---

## Design Direction

### Visual Style
- **Warm, natural color palette** - Browns, creams, forest greens
- **Wood grain textures** as subtle backgrounds
- **Clean typography** - Serif headers, sans-serif body
- **High-quality furniture photography** (placeholder images)
- **Craftsman aesthetic** - Hand-drawn icons, organic shapes

### Mobile Experience
- Fully responsive design
- Touch-friendly customization controls
- Simplified checkout flow
- Bottom navigation for key actions

---

## Seed Data Included

### Sample Products (8-10 items)
- Dining tables (2 variants)
- Coffee tables (2 variants)  
- Bookshelves (2 variants)
- Bed frames (2 variants)
- Desks (2 variants)

### Pre-configured Cost Sheet
- Realistic pricing for all wood types
- Labor rates
- Finish costs
- Sample extras

### Demo Orders
- 3-4 orders in various status stages
- Mix of standard and custom items

### Demo Users
- Customer account for testing
- Sales Manager account for admin access

---

## Technical Implementation

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Lovable Cloud (Supabase) for database, auth, and edge functions
- **State Management**: React Query for server state
- **Forms**: React Hook Form with Zod validation
- **PDF Generation**: Client-side service order PDF creation
- **Image Handling**: Supabase Storage for product images

