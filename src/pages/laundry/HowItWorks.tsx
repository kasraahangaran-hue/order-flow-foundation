import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import viewPricingUrl from "@/assets/icons/view-pricing.svg";
import contactServiceUrl from "@/assets/icons/contact-customer-service.svg";
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
//   - Replace the placeholder div with a conditional render based on
//     card.assetType (<video> for "video", <img> for "image").
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

  return (
    <div className="animate-page-in flex h-full min-h-screen flex-col bg-subtle-bg">
      {/* Header — matches OrderLayout (px-6 pt-6 pb-0) but with a back
          chevron before the title since this is a sub-screen of the NU
          homepage flow rather than a numbered step. */}
      <header className="sticky top-0 z-10 bg-subtle-bg px-6 pt-[max(env(safe-area-inset-top),24px)] pb-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="press-effect -ml-1 flex h-6 w-6 items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-washmen-primary" />
          </button>
          <h1 className="text-lg font-bold text-washmen-primary">
            How It Works
          </h1>
        </div>
      </header>

      {/* Body — main has no horizontal padding so the carousel can extend
          edge-to-edge; the carousel applies its own px-6 gutter. The
          Ready? section below uses px-6 to match. */}
      <main className="flex-1 pb-8 pt-6">
        {/* Carousel — fixed-pixel cards (256/265px wide), 8px gap.
            Leading and trailing spacer elements provide the 24px gutter,
            because horizontal padding on overflow-x-auto containers gets
            inconsistently honored across browsers (especially Safari).
            Spacer divs as flex children always work. */}
        <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-pl-6 scroll-pr-6">
          <div className="w-6 shrink-0" aria-hidden />
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
                <p className="mt-1 text-[16px] font-bold leading-[24px] tracking-[0.4px] text-washmen-primary">
                  {card.title}
                </p>
                <p className="mt-1 whitespace-pre-line text-sm font-light leading-[20px] tracking-[0.1px] text-washmen-slate-grey">
                  {card.body}
                </p>
              </div>
            </div>
          ))}
          <div className="w-6 shrink-0" aria-hidden />
        </div>

        {/* Ready? section — same px-6 gutter as the rest of the app */}
        <section className="mt-8 px-6">
          <h2 className="mb-3 text-lg font-bold text-washmen-primary">
            Ready?
          </h2>
          <div className="flex flex-col gap-3">
            {/* Place a Washmen Order */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="press-effect flex h-[42px] w-full items-center justify-between rounded-[8px] bg-washmen-light-blue pl-4 pr-2 text-left"
            >
              <span className="text-sm font-semibold text-washmen-primary">
                Place a Washmen Order
              </span>
              {/* Figma uses a small grey rounded-square tile (#F2F3F8). */}
              <span className="flex h-8 w-7 items-center justify-center rounded-[4px] bg-washmen-pale-grey">
                <ArrowRight className="h-4 w-4 text-washmen-primary" />
              </span>
            </button>

            {/* View Pricing */}
            <button
              type="button"
              onClick={handleViewPricing}
              className="press-effect flex h-[42px] w-full items-center justify-between rounded-[8px] bg-washmen-light-blue pl-4 pr-4 text-left"
            >
              <span className="text-sm font-semibold text-washmen-primary">
                View Pricing
              </span>
              <img
                src={viewPricingUrl}
                alt=""
                className="h-5 w-5 shrink-0 select-none"
                draggable={false}
              />
            </button>

            {/* Contact Customer Service */}
            <button
              type="button"
              onClick={handleContactCs}
              className="press-effect flex h-[42px] w-full items-center justify-between rounded-[8px] bg-washmen-light-blue pl-4 pr-4 text-left"
            >
              <span className="text-sm font-semibold text-washmen-primary">
                Contact Customer Service
              </span>
              <img
                src={contactServiceUrl}
                alt=""
                className="h-5 w-5 shrink-0 select-none"
                draggable={false}
              />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
