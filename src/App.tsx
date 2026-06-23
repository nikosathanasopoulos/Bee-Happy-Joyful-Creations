/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Phone,
  Mail,
  ShoppingBag,
  Plus,
  Minus,
  X,
  Search,
  Check,
  FileText,
  Info,
  Heart,
  Flame,
  Shield,
  Award,
  MapPin,
  ClipboardCheck,
  Menu,
  Droplet,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { PRODUCTS, DIY_INGREDIENTS, HERO_IMAGE } from './data';
import { Product, DIYIngredient, CartItem } from './types';

// Static Image Imports for absolute path safety across environments
import herbalWaxSalve from './assets/images/herbal_wax_salve_1782197007682.jpg';
import soapSpringGarden from './assets/images/soap_spring_garden_1782198290883.jpg';
import creamFacialHydration from './assets/images/cream_facial_hydration_1782198304461.jpg';
import boatSoapsOriginal from './assets/images/boat_soaps_1782197026244.jpg';
import beeswaxCandles from './assets/images/beeswax_candles_1782197042129.jpg';

export default function App() {
  // Navigation & Category states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // DIY Creator state
  const [diyBase, setDiyBase] = useState<string>('base-beeswax');
  const [diyOils, setDiyOils] = useState<string[]>(['oil-lavender']);
  const [diyPurpose, setDiyPurpose] = useState<string>('purpose-moisturizing');
  const [diySuccessMessage, setDiySuccessMessage] = useState<boolean>(false);

  // Product Selection Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Customer checkout state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    notes: ''
  });
  const [orderSubmitted, setOrderSubmitted] = useState<boolean>(false);
  const [submittedOrderText, setSubmittedOrderText] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Filter products based on search & category
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.ingredients.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
          product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Total cart amount
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Handler: Add regular product to cart
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          price: product.priceValue,
          quantity: 1,
          image: product.image,
          categoryLabel: product.categoryLabel,
          isCustomDIY: false
        }
      ];
    });

    // Elegant toast or indicator effect could go here
  };

  // Handler: Add custom DIY salve to cart
  const addDiyToCart = () => {
    const baseObj = DIY_INGREDIENTS.find((i) => i.id === diyBase);
    const oilObjs = diyOils.map((oId) => DIY_INGREDIENTS.find((i) => i.id === oId)).filter(Boolean) as DIYIngredient[];
    const purposeObj = DIY_INGREDIENTS.find((i) => i.id === diyPurpose);

    if (!baseObj || !purposeObj) return;

    const customId = `diy-${diyBase}-${diyOils.slice().sort().join('-')}-${diyPurpose}`;
    const customName = `Κεραλοιφή "Προσωπική Δημιουργία" (${purposeObj.name})`;
    const oilsText = oilObjs.map((o) => o.name).join(', ') || 'Χωρίς επιπλέον αιθέρια έλαια';

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === customId);
      if (existing) {
        return prevCart.map((item) =>
            item.id === customId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: customId,
          name: customName,
          price: 10.00, // custom items flat rate
          quantity: 1,
          image: herbalWaxSalve, // uses the salve visual
          categoryLabel: 'Κεραλοιφές (DIY)',
          isCustomDIY: true,
          diyDetails: {
            base: baseObj.name,
            oils: oilObjs.map((o) => o.name),
            purpose: purposeObj.name
          }
        }
      ];
    });

    setDiySuccessMessage(true);
    setTimeout(() => setDiySuccessMessage(false), 3500);
  };

  // Handler: Update quantity
  const updateQuantity = (id: string, amount: number) => {
    setCart((prevCart) => {
      return prevCart
          .map((item) => {
            if (item.id === id) {
              const nextQty = item.quantity + amount;
              return nextQty > 0 ? { ...item, quantity: nextQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Toggle Oils Selection (Max 3)
  const handleOilToggle = (id: string) => {
    setDiyOils((prevOils) => {
      if (prevOils.includes(id)) {
        return prevOils.filter((o) => o !== id);
      }
      if (prevOils.length >= 3) {
        // limit to max 3
        return [...prevOils.slice(1), id];
      }
      return [...prevOils, id];
    });
  };

  // Construct and send preorder
  const generateOrderText = () => {
    let text = `📦 *Νέο Ενδιαφέρον Παραγγελίας - Bee Happy Joyful Creations*\n\n`;
    text += `👤 *Στοιχεία Πελάτη:*\n`;
    text += `• Όνομα: ${customerInfo.name || 'Μη Διαθέσιμο'}\n`;
    text += `• Τηλέφωνο: ${customerInfo.phone || 'Μη Διαθέσιμο'}\n`;
    if (customerInfo.notes) {
      text += `• Σημειώσεις: ${customerInfo.notes}\n`;
    }
    text += `\n🛍️ *Επιλεγμένα Προϊόντα:*\n`;

    cart.forEach((item) => {
      text += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
      text += `👉 *${item.name}*\n`;
      text += `   🏷️ Κατηγορία: ${item.categoryLabel}\n`;
      text += `   🔢 Ποσότητα: ${item.quantity} x ${item.price.toFixed(2)} €\n`;
      if (item.isCustomDIY && item.diyDetails) {
        text += `   🧪 Σύνθεση:\n`;
        text += `     - Βάση: ${item.diyDetails.base}\n`;
        text += `     - Έλαια: ${item.diyDetails.oils.join(', ') || 'Κανένα'}\n`;
        text += `     - Σκοπός: ${item.diyDetails.purpose}\n`;
      }
    });

    text += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
    text += `💰 *Συνολικό Ποσό: ${cartTotal.toFixed(2)} €*\n\n`;
    text += `*Σημείωση:* Η συναλλαγή ολοκληρώνεται κατόπιν επικοινωνίας για την επιβεβαίωση των λεπτομερειών αποστολής και διαθεσιμότητας.`;
    return text;
  };

  const submitOrder = (method: 'whatsapp' | 'email' | 'copy') => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert('Παρακαλούμε συμπληρώστε το Όνομα και το Τηλέφωνό σας για την παραγγελία.');
      return;
    }

    const orderText = generateOrderText();
    setSubmittedOrderText(orderText);
    setOrderSubmitted(true);

    if (method === 'whatsapp') {
      const encoded = encodeURIComponent(orderText);
      const url = `https://api.whatsapp.com/send?phone=306900000000&text=${encoded}`;
      window.open(url, '_blank', 'referrerPolicy=no-referrer');
    } else if (method === 'email') {
      const encodedSubject = encodeURIComponent('Ενδιαφέρον Παραγγελίας - Bee Happy Joyful Creations');
      const encodedBody = encodeURIComponent(orderText);
      const mailto = `mailto:info@beehappycreations.gr?subject=${encodedSubject}&body=${encodedBody}`;
      window.open(mailto, '_blank', 'referrerPolicy=no-referrer');
    } else if (method === 'copy') {
      navigator.clipboard.writeText(orderText);
      // alert code handled gracefully in UI
    }
  };

  // Quick helper to jump to customizer
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // Dynamic visual preview details for DIY customizer
  const activeBaseObj = DIY_INGREDIENTS.find((i) => i.id === diyBase);
  const activeOilsObj = diyOils.map((oId) => DIY_INGREDIENTS.find((i) => i.id === oId)).filter(Boolean) as DIYIngredient[];
  const activePurposeObj = DIY_INGREDIENTS.find((i) => i.id === diyPurpose);

  return (
      <div className="min-h-screen bg-[#FDFDF9] text-[#2F2A24] sans-body selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">

        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-[#FCFBF7]/90 backdrop-blur-md border-b border-[#EFECE6] transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

            {/* Brand Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} id="logo-header">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-amber-950 shadow-md">
                <span className="font-bold text-xl font-display">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#231E19] font-display">
                  Bee Happy
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-amber-700 font-medium">
                  Joyful Creations
                </p>
              </div>
            </div>

            {/* Nav Links - Desktop */}
            <nav className="hidden md:flex space-x-8 text-sm font-medium">
              <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-amber-600 transition-colors">Αρχική</button>
              <button onClick={() => scrollToSection('products')} className="hover:text-amber-600 transition-colors">Τα Προϊόντα μας</button>
              <button onClick={() => scrollToSection('philosophy')} className="hover:text-amber-600 transition-colors">Η Φιλοσοφία μας</button>
              <button onClick={() => scrollToSection('diy-room')} className="hover:text-amber-600 transition-colors flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Sparkles className="w-3.5 h-3.5" /> DIY Κεραλοιφή
              </button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-amber-600 transition-colors">Επικοινωνία</button>
            </nav>

            {/* Action buttons & Cart */}
            <div className="flex items-center space-x-4">
              <button
                  id="cart-btn"
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2.5 rounded-full hover:bg-amber-50 transition-colors duration-200 text-[#443E36] focus:outline-none focus:ring-2 focus:ring-amber-500 border border-transparent hover:border-amber-200"
                  aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        key={cartCount}
                        className="absolute -top-1 -right-1 bg-amber-600 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                    >
                      {cartCount}
                    </motion.span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-[#F3EFE7] text-[#443E36] transition-colors"
                  id="mobile-menu-btn"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="md:hidden bg-[#FCFBF7] border-t border-[#EFECE6] px-4 py-4 space-y-3"
                >
                  <button onClick={() => { window.scrollTo({top: 0, behavior: 'smooth'}); setMobileMenuOpen(false); }} className="block w-full text-left py-2 font-medium hover:text-amber-600">Αρχική</button>
                  <button onClick={() => scrollToSection('products')} className="block w-full text-left py-2 font-medium hover:text-amber-600">Τα Προϊόντα μας</button>
                  <button onClick={() => scrollToSection('philosophy')} className="block w-full text-left py-2 font-medium hover:text-amber-600">Η Φιλοσοφία μας</button>
                  <button onClick={() => scrollToSection('diy-room')} className="block w-full text-left py-2 font-semibold text-amber-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> DIY Κεραλοιφή
                  </button>
                  <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 font-medium hover:text-amber-600">Επικοινωνία</button>
                </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* HERO SECTION */}
        <section className="relative bg-[#FAF6EE] pt-4 pb-20 lg:pt-10 lg:pb-32 overflow-hidden border-b border-[#EFECE6]" id="home">
          {/* Background blobs */}
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Slogan details */}
              <div className="lg:col-span-7 flex flex-col space-y-8 text-center lg:text-left">

                <div className="inline-flex items-center space-x-2 bg-amber-100/75 border border-amber-200 px-3 py-1.5 rounded-full text-amber-800 text-xs font-semibold self-center lg:self-start">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>100% Φυσικές Χειροποίητες Δημιουργίες</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1E1914] leading-tight font-display">
                    Bee Happy <br />
                    <span className="text-amber-600 text-3xl sm:text-4xl lg:text-5xl font-normal block mt-2">
                    Joyful Creations
                  </span>
                  </h1>
                  <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-earth-600 leading-relaxed font-light">
                    Ανακαλύψτε τη θεραπευτική δύναμη της ελληνικής φύσης. Παραδοσιακές
                    <strong className="text-[#3A322C] font-semibold"> κεραλοιφές</strong> με βιολογικό μελισσοκέρι,
                    <strong className="text-[#3A322C] font-semibold"> χειροποίητα σαπούνια</strong> ελαιολάδου, φυτικές κρέμες,
                    μοναδικά αρώματα και αγνά κεριά. Όλα φτιαγμένα στο χέρι, με μεράκι και φυσικά εκχυλίσματα βοτάνων.
                  </p>
                </div>

                {/* USP elements */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E8E3D9]">
                  <div className="flex flex-col items-center lg:items-start p-2">
                    <span className="text-amber-600 font-bold font-display text-2xl">100%</span>
                    <span className="text-xs text-earth-650 font-medium">Φυσικά Συστατικά</span>
                  </div>
                  <div className="flex flex-col items-center lg:items-start p-2">
                    <span className="text-amber-600 font-bold font-display text-2xl">Αγνό</span>
                    <span className="text-xs text-earth-650 font-medium">Μελισσοκέρι</span>
                  </div>
                  <div className="flex flex-col items-center lg:items-start p-2">
                    <span className="text-amber-600 font-bold font-display text-2xl">Extra</span>
                    <span className="text-xs text-earth-650 font-medium">Παρθένο Ελαιόλαδο</span>
                  </div>
                  <div className="flex flex-col items-center lg:items-start p-2">
                    <span className="text-amber-600 font-bold font-display text-2xl">Χειρ-</span>
                    <span className="text-xs text-earth-650 font-medium">οποίητο στην Ελλάδα</span>
                  </div>
                </div>

                {/* Call to action */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button
                      onClick={() => scrollToSection('products')}
                      className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Δείτε τη Συλλογή
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                      onClick={() => scrollToSection('diy-room')}
                      className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-amber-50 text-amber-900 border border-amber-500/30 hover:border-amber-500 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Σχεδιάστε δική σας Κεραλοιφή
                  </button>
                </div>

              </div>

              {/* Photo illustration frame */}
              <div className="lg:col-span-5 relative flex justify-center">
                {/* Back decorative frame */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-amber-100/10 rounded-2xl rotate-3 scale-102 blur-sm"></div>

                <div className="relative w-full max-w-[420px] bg-[#FAF6EE] p-3 rounded-2xl border border-amber-200/60 shadow-xl overflow-hidden group">
                  <div className="aspect-[4/5] rounded-xl overflow-hidden relative">
                    <img
                        src={HERO_IMAGE}
                        alt="Bee Happy Joyful Creations - Φυσικά Καλλυντικά"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                    />

                    {/* Glowing tag overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#231E19]/60 via-transparent to-transparent"></div>

                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <p className="text-xs font-semibold text-amber-300 tracking-wider uppercase mb-1">Premium Πρώτες Ύλες</p>
                      <h3 className="font-display text-lg font-bold">Αγνό Μελισσοκέρι & Βότανα</h3>
                      <p className="text-xs text-stone-200 mt-1 font-light">Φωτογραφία από το εργαστήριό μας</p>
                    </div>
                  </div>
                </div>

                {/* Floating review badge */}
                <div className="absolute -bottom-6 -right-6 md:right-0 bg-white border border-amber-200 p-3.5 rounded-xl shadow-lg flex items-center gap-3 max-w-[200px]">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Εγγύηση</p>
                    <p className="text-xs text-[#2A241F] font-bold">100% Φυσικό & Αγνό</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CORE STATS CARD ROW - Quick overview */}
        <section className="bg-white py-12 border-b border-[#EFECE6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 border border-orange-100">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#201B17]">Φτιαγμένο με Αγάπη</h4>
                  <p className="text-xs text-earth-500 leading-relaxed">Κάθε σαπούνι και κερί χύνεται και σμιλεύεται ξεχωριστά, διασφαλίζοντας μοναδική ποιότητα.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
                  <Droplet className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#201B17]">Βιολογικά Έλαια</h4>
                  <p className="text-xs text-earth-500 leading-relaxed">Βάση από εξαιρετικό παρθένο ελαιόλαδο και 100% καθαρά, φυσικά αιθέρια έλαια βοτάνων.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#201B17]">Απαλλαγμένο από Χημικά</h4>
                  <p className="text-xs text-earth-500 leading-relaxed">Χωρίς συνθετικά αρώματα, parabens ή σκληρά θειικά άλατα. Αγνό και ασφαλές για όλη την οικογένεια.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PRODUCT CATALOG SECTIONS (FILTERABLE) */}
        <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="products">

          {/* Section Header */}
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block font-display">Η Συλλογή μασ</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1814] serif-heading">
              Φυσικές Χειροποίητες Δημιουργίες
            </h2>
            <p className="max-w-2xl mx-auto text-sm text-earth-500 leading-relaxed font-light">
              Κεραλοιφές, χειροποίητα σαπούνια, κρέμες και αρώματα εμπλουτισμένα με τα καλύτερα
              συστατικά της ελληνικής γης. Αναζητήστε τα προϊόντα μας και δείτε τις πραγματικές φωτογραφίες τους.
            </p>
          </div>

          {/* Filter controls + Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-[#FAF8F2] p-4 rounded-xl border border-[#ECE6DB]">

            {/* Categories Tab pills */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none shrink-0" id="category-filter-bar">
              {[
                { id: 'all', label: 'Όλα' },
                { id: 'salve', label: 'Κεραλοιφές' },
                { id: 'soap', label: 'Σαπούνια' },
                { id: 'cream', label: 'Κρέμες' },
                { id: 'perfume', label: 'Αρώματα' },
                { id: 'candle', label: 'Κεριά' }
              ].map((cat) => (
                  <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                          selectedCategory === cat.id
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-transparent text-earth-650 hover:bg-amber-50'
                      }`}
                  >
                    {cat.label}
                  </button>
              ))}
            </div>

            {/* Search bar input placeholder */}
            <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-earth-450">
              <Search className="w-4 h-4" />
            </span>
              <input
                  type="text"
                  placeholder="Αναζήτηση συστατικού η προϊόντος..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-xs border border-[#DFD9CE] focus:border-amber-500 focus:outline-none bg-white transition-colors"
              />
              {searchQuery && (
                  <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-earth-400 hover:text-earth-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
              )}
            </div>
          </div>

          {/* Dynamic Bento-style catalog grid */}
          {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((p) => (
                      <motion.div
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          key={p.id}
                          className="bg-white rounded-xl border border-[#ECE8DF] overflow-hidden shadow-sm hover:shadow-lg hover:border-amber-300 transition-all duration-300 flex flex-col group"
                      >

                        {/* Image container frame */}
                        <div className="relative aspect-square sm:aspect-[4/3] bg-stone-50 overflow-hidden shrink-0">
                          <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                          />

                          {/* Visual match badge */}
                          {p.isOriginalPhoto && (
                              <div className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <Check className="w-3 h-3 text-white" />
                                <span>Φυσική Φωτογραφία</span>
                              </div>
                          )}

                          {/* Category Label overlay */}
                          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-amber-950 px-2 py-0.5 rounded-md text-[10px] font-bold border border-amber-100">
                            {p.categoryLabel}
                          </div>
                        </div>

                        {/* Body textual Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">

                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-[#1C1814] group-hover:text-amber-700 transition-colors text-base sm:text-lg">
                                {p.name}
                              </h3>
                            </div>
                            <p className="text-xs text-earth-500 leading-relaxed line-clamp-2">
                              {p.description}
                            </p>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {p.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="bg-amber-50 text-amber-800 text-[9px] px-2 py-0.5 rounded-full border border-amber-100/50">
                          {tag}
                        </span>
                            ))}
                          </div>

                          {/* Actions bar */}
                          <div className="pt-4 border-t border-[#F1ECE4] flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-earth-400 uppercase tracking-widest font-normal">Τιμή</span>
                              <span className="font-extrabold text-[#38312B] font-display text-lg">{p.price}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                  onClick={() => setSelectedProduct(p)}
                                  className="px-3.5 py-2.5 bg-transparent hover:bg-amber-50 border border-[#DDD6C8] hover:border-amber-400 text-[#443E36] font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Info className="w-3.5 h-3.5" />
                                Λεπτομέρειες
                              </button>
                              <button
                                  onClick={() => addToCart(p)}
                                  className="p-2.5 bg-amber-600 hover:bg-amber-750 text-white rounded-lg transition-colors shadow-sm hover:shadow-md cursor-pointer text-xs flex items-center gap-1 px-4 font-semibold"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Προσθήκη</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                  ))}
                </AnimatePresence>
              </div>
          ) : (
              <div className="text-center bg-[#FAF8F4] py-16 px-4 rounded-xl border border-dashed border-[#DFDACF]">
                <HelpCircle className="w-12 h-12 text-earth-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#353029]">Δεν βρέθηκαν προϊόντα</h3>
                <p className="text-xs text-earth-500 mt-2 max-w-sm mx-auto">
                  Δοκιμάστε να αλλάξετε τους όρους αναζήτησης ή επιλέξτε μια διαφορετική κατηγορία προϊόντων.
                </p>
                <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="mt-4 text-xs font-bold text-amber-700 underline"
                >
                  Επαναφορά Φίλτρων
                </button>
              </div>
          )}

        </section>

        {/* INTERACTIVE DIY WAX SALVE CREATOR */}
        <section className="bg-gradient-to-b from-[#FAF7F0] to-[#FCF9F3] py-20 lg:py-28 border-y border-[#EDE8DE]" id="diy-room">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="text-center space-y-4 mb-16">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block font-display">Custom Εργαστήρι</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1814] serif-heading">
                Δημιουργήστε τη Δική σας Κεραλοιφή
              </h2>
              <p className="max-w-2xl mx-auto text-sm text-earth-500 leading-relaxed font-light">
                Επιλέξτε τη βάση, προσθέστε μέχρι και 3 πολύτιμα αιθέρια έλαια και προσαρμόστε τη θεραπευτική
                δράση της κεραλοιφής σας. Δείτε τη σύνθεση να αλλάζει δυναμικά στο εργαστηριακό μας βάζο!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">

              {/* Visual preview of the Jar - Left */}
              <div className="lg:col-span-5 bg-white border border-[#E9E4DB] rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100/30 rounded-full blur-2xl pointer-events-none"></div>

                <div className="text-center space-y-2 relative">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full inline-block">
                  Ζωντανή Προεπισκόπηση
                </span>
                  <h3 className="font-display font-bold text-lg text-[#201C17]">Η Προσωπική σας Συνταγή</h3>
                </div>

                {/* Magical interactive jar illustration */}
                <div className="my-10 py-6 flex flex-col items-center justify-center relative">

                  {/* Visual jar silhouette container */}
                  <div className="w-48 h-56 rounded-t-3xl rounded-b-[40px] border-4 border-stone-800 relative bg-stone-900/5 shadow-inner flex items-center justify-center overflow-hidden">

                    {/* Glass neck details */}
                    <div className="absolute top-0 w-32 h-6 border-b-4 border-stone-800 bg-[#E0DBCF] z-10"></div>

                    {/* Dynamic Colored Liquid Base */}
                    <div
                        className="absolute bottom-0 w-full rounded-b-[36px] transition-all duration-700 ease-in-out"
                        style={{
                          height: '70%',
                          backgroundColor: activeBaseObj ? activeBaseObj.color : '#F59E0B',
                          opacity: 0.75
                        }}
                    >
                      {/* Ripple/wave pattern interior */}
                      <div className="w-full h-4 bg-white/20 absolute top-0 blur-xs"></div>
                    </div>

                    {/* Oils color blending overlay (multiple gradients combined) */}
                    {activeOilsObj.map((oil, idx) => (
                        <motion.div
                            key={oil.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.25 }}
                            className="absolute w-12 h-12 rounded-full blur-md"
                            style={{
                              backgroundColor: oil.color,
                              bottom: `${20 + idx * 25}%`,
                              left: idx % 2 === 0 ? '20%' : '55%',
                            }}
                        />
                    ))}

                    {/* Bubbles or particle effects within the cream */}
                    <div className="absolute inset-x-0 bottom-4 flex justify-around pointer-events-none">
                      <span className="w-2.5 h-2.5 bg-white/40 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce delay-300"></span>
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-500"></span>
                    </div>

                    {/* Dynamic purpose badge reading */}
                    <div className="absolute z-10 bottom-8 text-center bg-stone-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-[10px] max-w-[85%] border border-white/20 shadow-sm leading-snug">
                      <p className="font-bold text-amber-300 uppercase tracking-widest text-[8px] mb-0.5">Κύριος Σκοπός</p>
                      {activePurposeObj ? activePurposeObj.name : 'Επιλογή Σκοπού'}
                    </div>

                  </div>

                  {/* Decorative Jar Cap */}
                  <div className="w-36 h-4 bg-amber-900/95 border-2 border-stone-800 rounded-lg -mt-57 z-20 relative"></div>
                </div>

                {/* Dynamic Benefits board */}
                <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#EDE7DF] space-y-2.5">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-earth-450">Ιδιότητες Σύνθεσης</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                      <span className="font-medium text-[#38312B]">{activeBaseObj?.benefit}</span>
                    </div>
                    {activeOilsObj.map((oil) => (
                        <div key={oil.id} className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" style={{ backgroundColor: oil.color }}></span>
                          <span className="text-earth-650">{oil.benefit}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 text-xs border-t border-[#EAE4D8] pt-1.5 mt-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="font-semibold text-emerald-800">{activePurposeObj?.benefit}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Selector Options Controls - Right */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-8">

                {/* Step 1: Base picker */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#353029] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">1</span>
                    Επιλέξτε τη Φυσική Βάση της Κεραλοιφής:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="base-picker-group">
                    {DIY_INGREDIENTS.filter((i) => i.type === 'base').map((base) => (
                        <button
                            key={base.id}
                            onClick={() => setDiyBase(base.id)}
                            className={`text-left p-3.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer ${
                                diyBase === base.id
                                    ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                                    : 'border-[#E2DCD2] bg-white hover:bg-neutral-50'
                            }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-[#1F1914]">{base.name}</span>
                            {diyBase === base.id && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                          </div>
                          <p className="text-earth-500 text-[11px] leading-relaxed">{base.description}</p>
                        </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Oils picker */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#353029] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">2</span>
                      Προσθέστε Φυσικά Αιθέρια Έλαια (Μέχρι 3):
                    </h4>
                    <span className="text-[10px] text-earth-450 bg-stone-100 px-2 py-0.5 rounded-md">
                    {diyOils.length}/3 επιλεγμένα
                  </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="oil-picker-group">
                    {DIY_INGREDIENTS.filter((i) => i.type === 'oil').map((oil) => {
                      const isSelected = diyOils.includes(oil.id);
                      return (
                          <button
                              key={oil.id}
                              onClick={() => handleOilToggle(oil.id)}
                              className={`text-left p-3.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer ${
                                  isSelected
                                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                                      : 'border-[#E2DCD2] bg-white hover:bg-neutral-50'
                              }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[#1F1914] flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: oil.color }}></span>
                            {oil.name}
                          </span>
                              {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                            </div>
                            <p className="text-earth-500 text-[11px] leading-relaxed">{oil.description}</p>
                          </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Purpose picker */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#353029] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">3</span>
                    Επιλέξτε τον Κύριο Θεραπευτικό Σκοπό:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" id="purpose-picker-group">
                    {DIY_INGREDIENTS.filter((i) => i.type === 'purpose').map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setDiyPurpose(p.id)}
                            className={`text-left p-3.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer ${
                                diyPurpose === p.id
                                    ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                                    : 'border-[#E2DCD2] bg-white hover:bg-neutral-50'
                            }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-[#1F1914]">{p.name}</span>
                            {diyPurpose === p.id && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                          </div>
                          <p className="text-earth-500 text-[10px] leading-snug">{p.description}</p>
                        </button>
                    ))}
                  </div>
                </div>

                {/* DIY Order validation CTA code */}
                <div className="pt-6 border-t border-[#EDE7DE] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-earth-450 uppercase tracking-widest font-semibold">Κόστος Προσαρμοσμένης Κεραλοιφής</p>
                    <span className="text-2xl font-extrabold text-amber-900 font-display">10,00 €</span>
                  </div>

                  <div className="w-full sm:w-auto flex flex-col items-stretch relative">
                    <button
                        onClick={addDiyToCart}
                        className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Προσθήκη της Δημιουργίας μου
                    </button>

                    <AnimatePresence>
                      {diySuccessMessage && (
                          <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="absolute top-14 left-0 right-0 bg-emerald-600 text-white text-[11px] py-2 px-3 rounded-lg text-center font-bold flex items-center justify-center gap-1.5 shadow-md z-30"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Προστέθηκε επιτυχώς στο Καλάθι!
                          </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* PHILOSOPHY STORY SECTION */}
        <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="philosophy">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Detailed text */}
            <div className="lg:col-span-6 space-y-8">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block font-display">Η Φιλοσοφία μασ</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#161310] serif-heading">
                Αγνές Ύλες, Φροντίδα με Σεβασμό
              </h2>

              <p className="text-sm text-earth-550 leading-relaxed font-light">
                Στο <strong className="font-semibold text-amber-800">Bee Happy Joyful Creations</strong> πιστεύουμε ότι η φύση διαθέτει όλες τις απαντήσεις για την περιποίηση και την ευεξία μας.
                Κάθε δημιουργία μας ξεκινά από την αγάπη για τη μέλισσα και τα μοναδικά προϊόντα της κυψέλης.
                Συνδυάζουμε το αγνότερο κερί μέλισσας με έξτρα παρθένο ελαιόλαδο και πολύτιμα εκχυλίσματα βοτάνων από την ελληνική ύπαιθρο.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-1">✓</span>
                  <div>
                    <h4 className="font-bold text-[#27211C] text-sm sm:text-base">100% Παραδοσιακή Τεχνογνωσία</h4>
                    <p className="text-xs text-earth-500 mt-0.5 leading-relaxed">Βασιζόμαστε σε παραδοσιακές συνταγές, εξελιγμένες με σύγχρονες μελέτες αρωματοθεραπείας για μέγιστη ασφάλεια και απόδοση.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-1">✓</span>
                  <div>
                    <h4 className="font-bold text-[#27211C] text-sm sm:text-base">Οικολογική Συνείδηση</h4>
                    <p className="text-xs text-earth-500 mt-0.5 leading-relaxed">Παράγουμε σε μικρές παρτίδες, χρησιμοποιώντας ανακυκλώσιμα και βιοδιασπώμενα υλικά, σεβόμενοι το περιβάλλον.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-1">✓</span>
                  <div>
                    <h4 className="font-bold text-[#27211C] text-sm sm:text-base">Μηδενικά Συνθετικά Πρόσθετα</h4>
                    <p className="text-xs text-earth-500 mt-0.5 leading-relaxed">Οι κεραλοιφές και τα σαπούνια μας δεν περιέχουν καθόλου χημικές χρωστικές, συντηρητικά ή τεχνητά αρώματα.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button onClick={() => scrollToSection('contact')} className="px-6 py-3 border-2 border-amber-600 hover:bg-amber-50 text-amber-900 text-xs tracking-wider uppercase font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2">
                  Γνωρίστε μας από κοντά
                </button>
              </div>
            </div>

            {/* Graphical visual showcase layout */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">

              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-[#EBE7DF] bg-stone-50 aspect-square relative shadow-sm hover:shadow-md transition-shadow">
                  <img
                      src={soapSpringGarden}
                      alt="Φυσικά Βότανα"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-end p-3 text-white">
                    <p className="text-xs font-bold leading-tight">Εκχυλίσματα Βοτάνων</p>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#EBE7DF] bg-stone-50 aspect-[3/4] relative shadow-sm hover:shadow-md transition-shadow">
                  <img
                      src={creamFacialHydration}
                      alt="Φυσικά Έλαια"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-4 text-white">
                    <p className="text-xs font-bold leading-tight">Ενυδατικές Κρέμες</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="rounded-xl overflow-hidden border border-[#EBE7DF] bg-stone-50 aspect-[3/4] relative shadow-sm hover:shadow-md transition-shadow">
                  <img
                      src={boatSoapsOriginal}
                      alt="Χειροποίητα Σαπούνια"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-3 text-white">
                    <p className="text-xs font-bold leading-tight">Artisanal Σαπούνια</p>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#EBE7DF] bg-stone-50 aspect-square relative shadow-sm hover:shadow-md transition-shadow">
                  <img
                      src={beeswaxCandles}
                      alt="Κεριά Μελισσοκέρι"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-end p-3 text-white">
                    <p className="text-xs font-bold leading-tight">Κεριά Μελισσοκέρι</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* FOOTER & CONTACT AREA */}
        <footer className="bg-[#1C1916] text-[#DCD7D0] pt-20 pb-12 overflow-hidden border-t-2 border-amber-500/35" id="contact">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-stone-800">

              {/* Column 1: Brand Info */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-amber-950 shadow-md">
                    <span className="font-bold text-xl font-display">B</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight font-display text-white">
                      Bee Happy
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-amber-400 font-medium">
                      Joyful Creations
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed font-light max-w-sm">
                  Φροντίζουμε για την υγεία της επιδερμίδας σας με παραδοσιακές δημιουργίες βασισμένες στο μελισσοκέρι και το ελαιόλαδο. 100% αγνά και χειροποίητα προϊόντα για κάθε μέλος της οικογένειάς σας.
                </p>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center gap-3 text-xs">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Αθήνα, Ελλάδα (Αποστολή σε όλη τη χώρα)</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    <a href="mailto:info@beehappycreations.gr" className="hover:text-amber-400 transition-colors">info@beehappycreations.gr</a>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>+30 690 000 0000</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Quick Links */}
              <div className="lg:col-span-3 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Κατηγοριεσ</h4>
                <ul className="space-y-2 text-xs">
                  <li><button onClick={() => { setSelectedCategory('salve'); scrollToSection('products'); }} className="hover:text-amber-400 transition-colors">Κεραλοιφές</button></li>
                  <li><button onClick={() => { setSelectedCategory('soap'); scrollToSection('products'); }} className="hover:text-amber-400 transition-colors">Σαπούνια Χειροποίητα</button></li>
                  <li><button onClick={() => { setSelectedCategory('cream'); scrollToSection('products'); }} className="hover:text-amber-400 transition-colors">Κρέμες Προσώπου</button></li>
                  <li><button onClick={() => { setSelectedCategory('perfume'); scrollToSection('products'); }} className="hover:text-amber-400 transition-colors font-light">Φυσικά Αρώματα</button></li>
                  <li><button onClick={() => { setSelectedCategory('candle'); scrollToSection('products'); }} className="hover:text-amber-400 transition-colors font-light">Κεριά Μελισσοκέρι</button></li>
                </ul>
              </div>

              {/* Column 3: Friendly Inquiry Request Informer */}
              <div className="lg:col-span-4 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Πωσ να παραγγειλετε</h4>
                <p className="text-xs text-stone-400 leading-relaxed font-light">
                  Όλες οι δημιουργίες μας είναι μοναδικές και παράγονται σε περιορισμένο αριθμό.
                  Προσθέστε τα επιθυμητά προϊόντα στο καλάθι σας και στείλτε μας το αίτημά σας απευθείας μέσω WhatsApp ή Email.
                  Θα επικοινωνήσουμε μαζί σας άμεσα για την ολοκλήρωση.
                </p>
                <div className="flex items-center gap-2 text-stone-300 bg-stone-900 border border-stone-800 p-3 rounded-lg text-xs">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Απάντηση σε λιγότερο από 2 ώρες</span>
                </div>
              </div>

            </div>

            {/* Subfooter */}
            <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
              <p>© {new Date().getFullYear()} Bee Happy Joyful Creations. Όλα τα δικαιώματα διατηρούνται.</p>
              <p>Σχεδιασμένο με αγάπη για τη φύση και τη μέλισσα 🍯</p>
            </div>
          </div>
        </footer>

        {/* PANEL: DYNAMIC CART SLIDE-OVER */}
        <AnimatePresence>
          {isCartOpen && (
              <div className="fixed inset-0 z-50 overflow-hidden" id="cart-sidebar-container">
                {/* Backdrop opacity */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsCartOpen(false)}
                    className="absolute inset-0 bg-stone-950"
                />

                <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
                  <motion.div
                      initial={{ translateX: '100%' }}
                      animate={{ translateX: 0 }}
                      exit={{ translateX: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                      className="w-screen max-w-md bg-white flex flex-col justify-between shadow-2xl"
                  >

                    {/* Header of Drawer */}
                    <div className="p-6 border-b border-[#EFECE6] flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-[#241F1A]">
                        <ShoppingBag className="w-5 h-5 text-amber-600" />
                        <h3 className="font-bold text-lg font-display">Καλάθι Δημιουργιών</h3>
                        <span className="text-xs font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      {cartCount}
                    </span>
                      </div>
                      <button
                          onClick={() => setIsCartOpen(false)}
                          className="p-1.5 rounded-full hover:bg-stone-100 text-[#443E36] transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Items Scrollable Core body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {cart.length > 0 ? (
                          <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4 p-3 rounded-lg border border-[#EDE9DF] hover:border-amber-200 transition-colors bg-white relative">
                                  <div className="w-16 h-16 rounded-md overflow-hidden bg-stone-50 shrink-0 border border-[#F1ECE3]">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                  </div>

                                  <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                      <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">{item.categoryLabel}</p>
                                      <h4 className="font-bold text-[#2A241F] text-xs line-clamp-1">{item.name}</h4>

                                      {item.isCustomDIY && item.diyDetails && (
                                          <div className="text-[9px] text-[#7A7165] bg-stone-50 p-1.5 rounded-md mt-1 space-y-0.5 border border-stone-100 font-light">
                                            <p>• Βάση: {item.diyDetails.base}</p>
                                            <p>• Έλαια: {item.diyDetails.oils.join(', ') || 'Κανένα'}</p>
                                            <p>• Σκοπός: {item.diyDetails.purpose}</p>
                                          </div>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                      {/* Quantity Control Buttons */}
                                      <div className="flex items-center border border-stone-200 rounded-md overflow-hidden bg-[#FAF8F3]">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="p-1 hover:bg-stone-100 text-[#554E45] transition-colors"
                                        >
                                          <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="px-2.5 text-xs font-bold text-[#2A241F]">
                                  {item.quantity}
                                </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-1 hover:bg-stone-100 text-[#554E45] transition-colors"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      <span className="font-bold text-[#3A322A] text-xs">
                                {(item.price * item.quantity).toFixed(2)} €
                              </span>
                                    </div>

                                  </div>

                                  {/* Close delete button */}
                                  <button
                                      onClick={() => removeFromCart(item.id)}
                                      className="absolute top-2 right-2 text-earth-350 hover:text-earth-600 p-1 rounded"
                                      aria-label="Remove item"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                            ))}
                          </div>
                      ) : (
                          <div className="text-center py-24 space-y-4">
                            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mx-auto">
                              <ShoppingBag className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-[#3A322A]">Το καλάθι σας είναι άδειο</h4>
                            <p className="text-xs text-[#7C7469] max-w-xs mx-auto">
                              Περιηγηθείτε στις χειροποίητες δημιουργίες μας και προσθέστε τες στο καλάθι σας.
                            </p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase rounded-lg tracking-wider"
                            >
                              Συνεχιστε την Περιηγηση
                            </button>
                          </div>
                      )}
                    </div>

                    {/* Footer and Form details checkout */}
                    {cart.length > 0 && (
                        <div className="p-6 border-t border-[#EFECE6] bg-[#FAF8F3] space-y-6 shrink-0">

                          {/* Customer form input rules */}
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-[#3A322A] uppercase tracking-wider">Στοιχεία Επικοινωνίας</p>

                            <div className="space-y-2">
                              <input
                                  type="text"
                                  required
                                  placeholder="Ονοματεπώνυμο *"
                                  value={customerInfo.name}
                                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                  className="w-full bg-white border border-[#DFD9CE] focus:border-amber-500 focus:outline-none text-xs px-3.5 py-2.5 rounded-lg"
                              />
                              <input
                                  type="tel"
                                  required
                                  placeholder="Κινητό Τηλέφωνο (π.χ. 69...) *"
                                  value={customerInfo.phone}
                                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                  className="w-full bg-white border border-[#DFD9CE] focus:border-amber-500 focus:outline-none text-xs px-3.5 py-2.5 rounded-lg"
                              />
                              <textarea
                                  placeholder="Σημειώσεις / Διεύθυνση / Ειδικές οδηγίες"
                                  value={customerInfo.notes}
                                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                                  className="w-full bg-white border border-[#DFD9CE] focus:border-amber-500 focus:outline-none text-xs px-3.5 py-2.5 rounded-lg h-16 resize-none"
                              />
                            </div>
                          </div>

                          {/* Price readouts */}
                          <div className="space-y-2 border-t border-[#EAE4D8] pt-4">
                            <div className="flex justify-between text-xs text-earth-500">
                              <span>Υποσύνολο:</span>
                              <span>{cartTotal.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-xs text-earth-500">
                              <span>Έξοδα Αποστολής:</span>
                              <span className="text-emerald-700 font-semibold">Κατόπιν Συνεννόησης</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-dashed border-[#DFDACF] text-[#2F2A24]">
                              <span>Συνολικό Ποσό:</span>
                              <span className="text-lg font-extrabold text-[#38312B] font-display">{cartTotal.toFixed(2)} €</span>
                            </div>
                          </div>

                          {/* Order buttons */}
                          <div className="space-y-2 pt-2">
                            <button
                                onClick={() => submitOrder('whatsapp')}
                                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3.5 rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                            >
                              <Phone className="w-4 h-4" />
                              Αποστολη μεσω WhatsApp
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                  onClick={() => submitOrder('email')}
                                  className="bg-[#2B2723] hover:bg-[#3E3832] text-white font-semibold py-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#141210]"
                              >
                                <Mail className="w-4 h-4" />
                                Μέσω Email
                              </button>
                              <button
                                  onClick={() => submitOrder('copy')}
                                  className="bg-white hover:bg-stone-50 text-stone-900 border border-[#CECECE] font-semibold py-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                              >
                                <ClipboardCheck className="w-4 h-4 text-stone-600" />
                                Αντιγραφή
                              </button>
                            </div>
                          </div>

                        </div>
                    )}

                  </motion.div>
                </div>
              </div>
          )}
        </AnimatePresence>

        {/* MODAL: DETAIL LIGHTBOX FOR PRODUCTS */}
        <AnimatePresence>
          {selectedProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="detail-lightbox-modal">
                {/* Backdrop opacity */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedProduct(null)}
                    className="absolute inset-0 bg-stone-950"
                />

                {/* Modal Body Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row items-stretch max-h-[90vh]"
                >

                  {/* Product Visual - Left/Top */}
                  <div className="md:w-1/2 bg-stone-100 relative min-h-[250px] md:min-h-[auto] overflow-hidden flex items-center justify-center">
                    <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover absolute inset-0"
                        referrerPolicy="no-referrer"
                    />

                    {/* Visual validation label */}
                    {selectedProduct.isOriginalPhoto && (
                        <div className="absolute top-4 left-4 bg-amber-500 text-white text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full shadow-md">
                          Φυσική Φωτογραφία
                        </div>
                    )}
                  </div>

                  {/* Product Info Description - Right/Bottom */}
                  <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between space-y-6 max-h-[50vh] md:max-h-[80vh]">

                    <div className="space-y-4">

                      {/* Category labelling */}
                      <div>
                    <span className="text-[10px] bg-amber-50 text-amber-800 font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-amber-100">
                      {selectedProduct.categoryLabel}
                    </span>
                        <h3 className="font-display font-bold text-2xl text-[#1E1914] mt-3">
                          {selectedProduct.name}
                        </h3>
                      </div>

                      {/* Pricing tag */}
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xs text-earth-450">Τιμή:</span>
                        <span className="text-xl font-extrabold text-amber-900 font-display">{selectedProduct.price}</span>
                      </div>

                      {/* Paragraph info */}
                      <p className="text-xs text-earth-550 leading-relaxed">
                        {selectedProduct.detailedDescription}
                      </p>

                      {/* Active original photography trace context */}
                      {selectedProduct.isOriginalPhoto && selectedProduct.originalPhotoDescription && (
                          <div className="p-3 bg-neutral-50 rounded-lg border border-[#EDE8DE] space-y-1">
                            <p className="text-[9px] font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1">
                              <Info className="w-3.5 h-3.5" /> Περιγραφή Φωτογραφίας:
                            </p>
                            <p className="text-[11px] text-[#5A5249] italic leading-relaxed">
                              &ldquo;{selectedProduct.originalPhotoDescription}&rdquo;
                            </p>
                          </div>
                      )}

                      {/* Key Ingredients */}
                      <div className="space-y-1.5 pt-2">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-earth-450">Βασικά Συστατικά</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProduct.ingredients.map((ing, idx) => (
                              <span key={idx} className="bg-amber-50 text-amber-800 text-[10px] font-medium px-2.5 py-1 rounded-md border border-amber-100">
                          {ing}
                        </span>
                          ))}
                        </div>
                      </div>

                      {/* Usage Guide details */}
                      <div className="space-y-1 pt-2">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-earth-450">Τρόπος Χρήσης</p>
                        <p className="text-[11px] text-earth-550 leading-relaxed font-light">{selectedProduct.usage}</p>
                      </div>

                      {/* Features list bullet options */}
                      <div className="space-y-1.5 pt-2">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-earth-450">Ιδιότητες / Χαρακτηριστικά</p>
                        <ul className="space-y-1 text-xs text-earth-650">
                          {selectedProduct.features.map((feat, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{feat}</span>
                              </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Add to Cart button */}
                    <div className="pt-6 border-t border-[#F2EDE4] flex items-center justify-between gap-4">
                      <button
                          onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                          className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Προσθήκη στο καλάθι
                      </button>
                      <button
                          onClick={() => setSelectedProduct(null)}
                          className="px-5 py-3 border border-[#D8D2C6] hover:bg-neutral-50 text-earth-650 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Κλείσιμο
                      </button>
                    </div>

                  </div>

                  {/* Close Icon floating */}
                  <button
                      onClick={() => setSelectedProduct(null)}
                      className="absolute top-4 right-4 bg-white/80 hover:bg-white p-1.5 rounded-full border border-stone-200 text-stone-800 z-20 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>

                </motion.div>
              </div>
          )}
        </AnimatePresence>

        {/* CONFIRMATION DIALOG MODAL ONCE SUBMITTED */}
        <AnimatePresence>
          {orderSubmitted && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="order-completed-dialog">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setOrderSubmitted(false)}
                    className="absolute inset-0 bg-stone-950"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white max-w-md w-full rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative z-10 text-center"
                >

                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
                    <Check className="w-8 h-8 font-extrabold" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-2xl text-[#1C1814]">Το Αίτημά σας Στάλθηκε!</h3>
                    <p className="text-xs text-[#5E574F] max-w-sm mx-auto leading-relaxed">
                      Σας ευχαριστούμε θερμά για το ενδιαφέρον σας! Η παραγγελία σας καταγράφηκε με επιτυχία.
                      Θα επικοινωνήσουμε μαζί σας άμεσα για να επιβεβαιώσουμε τη διαθεσιμότητα και τα έξοδα αποστολής.
                    </p>
                  </div>

                  {/* Box of code copied */}
                  <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#EDE7DF] text-left space-y-2 max-h-[160px] overflow-y-auto">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Σύνοψη Αιτήματος Παραγγελίας</p>
                    <pre className="text-[10px] font-mono text-stone-700 whitespace-pre-wrap leading-relaxed font-medium">
                  {submittedOrderText}
                </pre>
                  </div>

                  <div className="space-y-2">
                    <button
                        onClick={() => { setOrderSubmitted(false); setCart([]); setIsCartOpen(false); }}
                        className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                      Ολοκληρωση & Εκκαθαριση Καλαθιου
                    </button>
                    <button
                        onClick={() => setOrderSubmitted(false)}
                        className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Επιστροφή στο Καλάθι
                    </button>
                  </div>

                </motion.div>
              </div>
          )}
        </AnimatePresence>

      </div>
  );
}