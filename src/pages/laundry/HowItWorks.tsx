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
  // Placeholder bg color so testers can see swiping works.
  placeholderBg: string;
}

// HANDOFF — Video assets:
// Each card is currently a colored placeholder. In production each is an
// autoplay-muted-loop <video> from the marketing CDN. To wire:
//   - Replace the placeholder div in the card with:
//     <video src={card.videoUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
//   - Add a `videoUrl` field to each entry in CARDS below.
const CARDS: CarouselCard[] = [
  {
    id: "intro",
    eyebrow: "INTRO",
    title: "Ordering on Washmen",
    body: "Discover how easy it is to do your laundry with Washmen",
    placeholderBg: "bg-washmen-light-aqua",
  },
  {
    id: "step-1",
    eyebrow: "STEP 1",
    title: "Prepare Your Laundry",
    body: "Put your laundry in separate bags. You can use any bag you have at home",
    placeholderBg: "bg-washmen-light-green",
  },
  {
    id: "step-2",
    eyebrow: "STEP 2",
    title: "Leave Bags Outside",
    body: "Leave your laundry at your doorstep or hand them to the driver",
    placeholderBg: "bg-washmen-light-pink",
  },
  {
    id: "step-3",
    eyebrow: "STEP 3",
    title: "Cleaned at Our Facility",
    body: "Your items are cared for at our global-award winning facility.",
    placeholderBg: "bg-washmen-secondary-100",
  },
  {
    id: "step-4",
    eyebrow: "STEP 4",
    title: "Delivery",
    body: "Your clean clothes are delivered back to you. Laundry Bags will be included for your next order",
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
    // Cards are 88% of the viewport width with snap-start. Each card's
    // scroll offset = cardWidth * idx. Use clientWidth * 0.88 as the step.
    const step = el.clientWidth * 0.88;
    if (step <= 0) return;
    const idx = Math.round(el.scrollLeft / step);
    if (idx !== activeCard && idx >= 0 && idx < CARDS.length) {
      setActiveCard(idx);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            type="button"
            onClick={handleBack}
            className="press-effect -ml-2 flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-washmen-primary" />
          </button>
          <h1 className="text-lg font-semibold text-washmen-primary">
            How It Works
          </h1>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 pb-8">
        {/* Video carousel */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {CARDS.map((card, idx) => (
            <div
              key={card.id}
              className={cn(
                "flex w-[88%] shrink-0 snap-start flex-col",
                idx === 0 ? "pl-4 pr-2" : "pr-2",
                idx === CARDS.length - 1 && "pr-4",
              )}
            >
              {/* Video placeholder */}
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-[16px]",
                  card.placeholderBg,
                )}
                style={{ aspectRatio: "16 / 9" }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-washmen-primary">
                    <Play className="h-5 w-5 fill-white text-white" />
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div className="mt-4 flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-washmen-primary">
                  {card.eyebrow}
                </p>
                <h2 className="text-lg font-semibold text-washmen-primary">
                  {card.title}
                </h2>
                <p className="text-sm leading-relaxed text-washmen-primary">
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
          <h2 className="mb-3 text-base font-semibold text-washmen-primary">
            Ready?
          </h2>
          <div className="flex flex-col gap-3">
            {/* Place a Washmen Order */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="press-effect flex h-[60px] w-full items-center justify-between rounded-[14px] bg-washmen-secondary-100 px-4 text-left"
            >
              <span className="text-base font-semibold text-washmen-primary">
                Place a Washmen Order
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background">
                <ArrowRight className="h-4 w-4 text-washmen-primary" />
              </span>
            </button>

            {/* View Pricing */}
            <button
              type="button"
              onClick={handleViewPricing}
              className="press-effect flex h-[60px] w-full items-center justify-between rounded-[14px] bg-washmen-secondary-100 px-4 text-left"
            >
              <span className="text-base font-semibold text-washmen-primary">
                View Pricing
              </span>
              {/* HANDOFF: Figma uses a custom shopping-bag-with-$ icon.
                  Lucide ShoppingBag is the closest stand-in. Swap for the
                  custom asset when available. */}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background">
                <ShoppingBag className="h-4 w-4 text-washmen-primary" />
              </span>
            </button>

            {/* Contact Customer Service */}
            <button
              type="button"
              onClick={handleContactCs}
              className="press-effect flex h-[60px] w-full items-center justify-between rounded-[14px] bg-washmen-secondary-100 px-4 text-left"
            >
              <span className="text-base font-semibold text-washmen-primary">
                Contact Customer Service
              </span>
              {/* HANDOFF: Figma uses the WhatsApp brand logo. Using
                  Lucide MessageCircle on a brand-green background as a
                  stand-in — swap for the official WhatsApp SVG when
                  available. */}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-washmen-primary-green">
                <MessageCircle className="h-4 w-4 fill-white text-white" />
              </span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
