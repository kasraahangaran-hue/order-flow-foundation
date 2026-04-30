import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Play, ShoppingBag, MessageCircle } from "lucide-react";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface CarouselCard {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  /**
   * Asset type for this card. The Intro card is the only video — the
   * Steps are static images. Engineering wires `assetUrl` to either a
   * <video> element (when assetType === "video") or an <img> element
   * (when assetType === "image"). For now both render as colored
   * placeholders distinguished by `placeholderBg`.
   */
  assetType: "video" | "image";
  // Placeholder bg color so testers can see swiping works.
  placeholderBg: string;
}

// HANDOFF — Carousel assets:
// All cards currently render as colored placeholders. In production the
// Intro card plays a <video> (autoplay muted loop) and Steps 1-4 are
// static <img> elements, all sourced from the marketing CDN.
//
// To wire:
//   - Replace the placeholder div with a conditional render:
//     {card.assetType === "video"
//       ? <video autoPlay muted playsInline loop src={card.assetUrl} className="..." />
//       : <img src={card.assetUrl} alt={card.title} className="..." />}
//   - Add an `assetUrl` field to each entry in CARDS below pointing at
//     the matching CDN asset.
// Image tile is a fixed 154px tall × 256px (steps) / 265px (intro) wide
// box with object-cover; source video is 1920x1080 (16:9).
const CARDS: CarouselCard[] = [
  {
    id: "intro",
    eyebrow: "INTRO",
    title: "Ordering on Washmen",
    body: "Discover how easy it is to do your laundry with Washmen",
    assetType: "video",
    placeholderBg: "bg-washmen-light-aqua",
  },
  {
    id: "step-1",
    eyebrow: "STEP 1",
    title: "Prepare Your Laundry",
    body: "Put your laundry in separate bags. You can use any bag you have at home",
    assetType: "image",
    placeholderBg: "bg-washmen-light-green",
  },
  {
    id: "step-2",
    eyebrow: "STEP 2",
    title: "Leave Bags Outside",
    body: "Leave your laundry at your doorstep or hand them to the driver",
    assetType: "image",
    placeholderBg: "bg-washmen-light-pink",
  },
  {
    id: "step-3",
    eyebrow: "STEP 3",
    title: "Cleaned at Our Facility",
    body: "Your items are cared for at our global-award winning facility",
    assetType: "image",
    placeholderBg: "bg-washmen-secondary-100",
  },
  {
    id: "step-4",
    eyebrow: "STEP 4",
    title: "Delivery",
    body: "Your clean clothes are delivered back to you.\n\nLaundry Bags will be included for your next order",
    assetType: "image",
    placeholderBg: "bg-washmen-light-red",
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    haptics.light();
    navigate(-1);
  };

  const handlePlaceOrder = () => {
    haptics.medium();
    navigate("/laundry/prepare-your-bags");
  };

  const handleViewPricing = () => {
    haptics.light();
    // HANDOFF: Pricing page is native — wire to nativeBridge.openSheet
    // when the integration lands. For now this is a no-op.
  };

  const handleContactCs = () => {
    haptics.light();
    // HANDOFF: Open WhatsApp deep link to Washmen customer service. The
    // exact wa.me link or template message lives with the support team.
    // For now this is a no-op.
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    // Each card stride: 256 (width) + 8 (gap) = 264.
    // Intro card is 9px wider but using the steps stride is close enough
    // for active-dot tracking.
    const stride = 264;
    const idx = Math.round(el.scrollLeft / stride);
    if (idx !== activeCard && idx >= 0 && idx < CARDS.length) {
      setActiveCard(idx);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-washmen-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-washmen-bg">
        <div className="flex h-14 items-center gap-6 px-4">
          <button
            type="button"
            onClick={handleBack}
            className="press-effect -ml-2 flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-washmen-primary" />
          </button>
          <h1 className="text-[20px] font-bold leading-[24px] tracking-[0.4px] text-washmen-primary">
            How It Works
          </h1>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 pb-8">
        {/* Carousel — fixed-pixel cards (256/265px wide), 8px gap */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto px-4"
        >
          {CARDS.map((card, idx) => (
            <div
              key={card.id}
              className={cn(
                "flex shrink-0 snap-start flex-col",
                idx === 0 ? "w-[265px]" : "w-[256px]",
              )}
            >
              {/* Image/video tile — 154px tall; intro radius 10px, steps 8px */}
              <div
                className={cn(
                  "relative h-[154px] w-full overflow-hidden",
                  idx === 0 ? "rounded-[10px]" : "rounded-[8px]",
                  card.placeholderBg,
                )}
              >
                {card.assetType === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-washmen-primary">
                      <Play className="h-5 w-5 fill-white text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="mt-3 flex flex-col">
                <p className="text-[10px] font-bold uppercase leading-[12px] tracking-[0.3px] text-washmen-primary">
                  {card.eyebrow}
                </p>
                <h2 className="text-[16px] font-bold leading-[34px] tracking-[0.4px] text-washmen-primary">
                  {card.title}
                </h2>
                <p className="whitespace-pre-line text-[16px] font-light leading-[21px] tracking-[0.4px] text-washmen-slate-grey">
                  {card.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="mt-4 flex justify-center gap-1.5">
          {CARDS.map((card, i) => (
            <span
              key={card.id}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activeCard
                  ? "w-4 bg-washmen-primary"
                  : "w-1.5 bg-washmen-primary/25",
              )}
            />
          ))}
        </div>

        {/* Ready? section */}
        <section className="mt-8 px-4">
          <h2 className="mb-3 text-[20px] font-bold leading-[24px] tracking-[0.4px] text-washmen-primary">
            Ready?
          </h2>
          <div className="flex flex-col gap-3">
            {/* Place a Washmen Order */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="press-effect flex h-12 w-full items-center justify-between rounded-[6px] bg-washmen-light-blue pl-4 pr-2 text-left"
            >
              <span className="text-base font-semibold text-washmen-primary">
                Place a Washmen Order
              </span>
              {/* Figma uses a small grey rounded-square tile (#F2F3F8), not a circle. */}
              <span className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-washmen-pale-grey">
                <ArrowRight className="h-4 w-4 text-washmen-primary" />
              </span>
            </button>

            {/* View Pricing */}
            <button
              type="button"
              onClick={handleViewPricing}
              className="press-effect flex h-12 w-full items-center justify-between rounded-[6px] bg-washmen-light-blue pl-4 pr-2 text-left"
            >
              <span className="text-base font-semibold text-washmen-primary">
                View Pricing
              </span>
              {/* HANDOFF: Figma uses a custom shopping-bag-with-tag icon
                  (the "nav pricing" component). Lucide ShoppingBag is a
                  stand-in. Swap for the custom asset when available. */}
              <ShoppingBag className="mr-2 h-5 w-5 text-washmen-primary" />
            </button>

            {/* Contact Customer Service */}
            <button
              type="button"
              onClick={handleContactCs}
              className="press-effect flex h-12 w-full items-center justify-between rounded-[6px] bg-washmen-light-blue pl-4 pr-2 text-left"
            >
              <span className="text-base font-semibold text-washmen-primary">
                Contact Customer Service
              </span>
              {/* HANDOFF: Figma uses an outline WhatsApp glyph (no fill,
                  primary blue). Lucide MessageCircle is a stand-in. Swap
                  for the official WhatsApp outline SVG. */}
              <MessageCircle className="mr-2 h-5 w-5 text-washmen-primary" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
