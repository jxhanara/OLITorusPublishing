import { type ReactNode } from "react";
import { cn } from "./ui/utils";

const shellClass =
  "relative px-5 pb-10 pt-6 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)] sm:px-10 md:px-16";

/** Shared lesson body after the hero / intro region (unchanged reference content). */
export function DiffCurriculumTailContent() {
  return (
    <>
      <h3 className="mt-10 text-xl font-normal leading-8 text-[var(--ol-text)]">The Three Primary Macronutrients</h3>
      <p className="mt-3 text-base leading-8 text-[var(--ol-text)]">
        There are three main nutrients that all plants need in relatively large amounts:{" "}
        <strong className="font-bold">nitrogen (N)</strong>, <strong className="font-bold">phosphorus (P)</strong>, and{" "}
        <strong className="font-bold">potassium (K)</strong>. These are often referred to as{" "}
        <strong className="font-bold">N-P-K</strong> on fertilizer packaging.
      </p>

      <p className="mt-6 text-base leading-8 text-[var(--ol-text)]">
        <strong className="font-bold">Nitrogen (N)</strong> is essential for leafy growth. It helps plants produce chlorophyll,
        the green pigment used in photosynthesis. When nitrogen is lacking, plants often appear pale or yellow, especially in
        older leaves. Leafy vegetables like lettuce and spinach require particularly high levels of nitrogen.
      </p>
      <p className="mt-6 text-base leading-8 text-[var(--ol-text)]">
        <strong className="font-bold">Phosphorus (P)</strong> supports strong root development and is crucial for flowering and
        fruiting. A phosphorus deficiency might cause purplish or dark green leaves and can delay flower or fruit production.
        It&apos;s especially important for seedlings and plants grown in containers.
      </p>
      <p className="mt-6 text-base leading-8 text-[var(--ol-text)]">
        <strong className="font-bold">Potassium (K)</strong> contributes to overall plant health. It helps regulate water use,
        supports photosynthesis, and strengthens resistance to disease and environmental stress. Without enough potassium,
        plants may have weak stems, scorched or curled leaf edges, or poor fruit quality.
      </p>

      <h3 className="mt-10 text-xl font-normal leading-8 text-[var(--ol-text)]">Secondary Nutrients and Micronutrients</h3>
      <p className="mt-3 text-base leading-8 text-[var(--ol-text)]">
        In addition to the &quot;big three,&quot; plants also benefit from{" "}
        <strong className="font-bold">secondary nutrients</strong> like{" "}
        <strong className="font-bold">calcium</strong>, <strong className="font-bold">magnesium</strong>, and{" "}
        <strong className="font-bold">sulfur</strong>, which are often present in adequate amounts in well-balanced soil.
        Beyond that, there are <strong className="font-bold">micronutrients</strong>—such as iron, boron, zinc, and
        manganese—that plants need in tiny amounts but are still essential for healthy functioning.
      </p>
      <p className="mt-6 text-base leading-8 text-[var(--ol-text)]">
        Micronutrient deficiencies are less common but can still occur, especially in sandy or overly acidic/alkaline soils.
        For example, iron deficiency often causes interveinal chlorosis—yellowing between the veins of leaves—especially in
        young growth.
      </p>

      <h3 className="mt-10 text-xl font-normal leading-8 text-[var(--ol-text)]">Sources of Nutrients</h3>
      <p className="mt-3 text-base leading-8 text-[var(--ol-text)]">
        Nutrients can come from <strong className="font-bold">natural soil</strong>,{" "}
        <strong className="font-bold">compost</strong>, or <strong className="font-bold">fertilizers</strong>—either synthetic
        or organic. Many gardeners prefer compost and slow-release organic fertilizers for their long-term benefits and
        minimal environmental impact.
      </p>
      <p className="mt-6 text-base leading-8 text-[var(--ol-text)]">
        When using synthetic fertilizers, it&apos;s important to follow the recommended dosage and timing, as over-fertilizing
        can harm plants or cause nutrient imbalances. A balanced fertilizer label might read &quot;10-10-10,&quot; indicating
        equal parts nitrogen, phosphorus, and potassium.
      </p>

      <h3 className="mt-10 text-xl font-normal leading-8 text-[var(--ol-text)]">Reading the Signs</h3>
      <p className="mt-3 text-base leading-8 text-[var(--ol-text)]">
        Plants are excellent communicators. When they&apos;re lacking nutrients, they often give clues. Yellowing leaves,
        poor flowering, slow growth, and weak stems are all symptoms worth investigating. Because these signs can also result
        from poor drainage, overwatering, or pests, it&apos;s important to consider the full context.
      </p>
      <p className="mt-6 text-base leading-8 text-[var(--ol-text)]">
        One simple way to monitor plant nutrition is to keep a <strong className="font-bold">garden journal</strong>. Record
        what you plant, when you feed or amend the soil, and how your plants respond. This habit helps you track what
        works—and spot problems early.
      </p>

      <div className="mt-10 overflow-hidden rounded-sm outline outline-1 outline-offset-[-1px] outline-[var(--ol-border)]">
        <div className="grid grid-cols-4 border-b border-[var(--ol-border)] bg-[var(--ol-panel)]">
          {["Nutrient", "Primary Role", "Deficiency Symptoms", "Common Fixes"].map((h) => (
            <div
              key={h}
              className="border-r border-[var(--ol-border)] px-2 py-2 text-center text-base font-black leading-6 text-[var(--ol-text-muted)] last:border-r-0"
            >
              {h}
            </div>
          ))}
        </div>
        {[
          ["Nitrogen (N)", "Leaf and stem growth; chlorophyll", "Older leaves turn yellow; stunted leafy growth", "Composted manure, blood meal"],
          ["Phosphorus (P)", "Root growth; flowering", "Purplish leaves; delayed flowering", "Bone meal, rock phosphate"],
          ["Potassium (K)", "Overall health; stress resistance", "Brown leaf edges; weak stems", "Wood ash, kelp meal"],
          ["Calcium (Ca)", "Cell walls; roots", "Tip burn; blossom end rot", "Lime, gypsum"],
          ["Magnesium (Mg)", "Chlorophyll; enzymes", "Yellowing between veins (older leaves)", "Epsom salt, dolomitic lime"],
          ["Iron (Fe)", "Chlorophyll in young leaves", "Interveinal chlorosis on new growth", "Iron chelate, foliar spray"],
          ["Zinc (Zn)", "Hormone regulation", "Short internodes; distorted leaves", "Zinc sulfate, compost"],
        ].map((row, i) => (
          <div key={i} className="grid grid-cols-4 border-b border-[var(--ol-border)] last:border-b-0">
            {row.map((cell, j) => (
              <div
                key={j}
                className={cn(
                  "border-r border-[var(--ol-border)] px-2 py-3 text-base leading-6 text-[var(--ol-text-muted)] last:border-r-0",
                  j === 0 && "font-bold",
                )}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-base text-[var(--ol-text)]/40">Caption (optional)</p>
    </>
  );
}

export type DiffCurriculumFullPageLayoutProps = {
  pageTitle: string;
  /** Replaces the default opening paragraph block (inline diffs, custom copy, etc.) */
  introductionSlot: ReactNode;
  /** Hero / media region; defaults to empty placeholder + caption */
  mediaSlot?: ReactNode;
  /** Hide the title when an outer page heading already shows it, to avoid two competing page titles. */
  hideTitle?: boolean;
};

/**
 * Full reading-page chrome: title, custom intro, media band, then shared tail content.
 * Use for “Full page” diff previews so edits sit in the same layout as surrounding lesson text.
 */
export function DiffCurriculumFullPageLayout({ pageTitle, introductionSlot, mediaSlot, hideTitle = false }: DiffCurriculumFullPageLayoutProps) {
  return (
    <div className={shellClass}>
      <div className="mx-auto max-w-[700px]">
        {hideTitle ? null : (
          <h2 className="text-3xl font-semibold leading-tight text-[var(--ol-text)]">{pageTitle}</h2>
        )}
        {introductionSlot}
        <div className="mt-12 flex flex-col items-center gap-6 sm:mt-16">
          {mediaSlot ?? (
            <>
              <div
                className="h-[200px] w-full max-w-[800px] rounded-sm bg-[var(--ol-card-bg)] ring-1 ring-[var(--ol-border)] sm:h-[280px]"
                aria-hidden
              />
              <p className="text-center text-base text-[var(--ol-text)]/40">Caption (optional)</p>
            </>
          )}
        </div>
        <DiffCurriculumTailContent />
      </div>
    </div>
  );
}

/**
 * Read-only curriculum body matching Torus / Figma page structure (Plant Nutrients lesson).
 * Shown in diff modal "Full page" mode above/below live activity blocks.
 */
export function DiffCurriculumStaticContent({ pageTitle, hideTitle = false }: { pageTitle: string; hideTitle?: boolean }) {
  return (
    <DiffCurriculumFullPageLayout
      pageTitle={pageTitle}
      hideTitle={hideTitle}
      introductionSlot={
        <p className="mt-3 text-base font-normal leading-8 text-[var(--ol-text)]">
          Just like humans need a balanced diet to stay healthy, plants need a variety of nutrients to grow, reproduce, and
          resist disease. These nutrients are mostly absorbed from the soil through the plant&apos;s roots and play specific
          roles in development. When a plant lacks one or more key nutrients, it often shows visible symptoms such as yellow
          leaves, stunted growth, or poor flowering.
        </p>
      }
    />
  );
}
