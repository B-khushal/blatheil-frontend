import PolicyShell from "@/components/policy/PolicyShell";

const Terms = () => (
  <PolicyShell
    badge="Policy"
    title="Terms of Service"
    updatedOn="April 13, 2026"
    lead="By accessing or using Blatheil services, you agree to comply with our policies on usage, orders, pricing, and customer conduct."
    sections={[
      {
        title: "Use of Platform",
        body: "Users agree to provide accurate details, maintain account security, and use the platform only for lawful purchasing and engagement.",
      },
      {
        title: "Orders and Pricing",
        body: "Order confirmation is subject to payment verification and stock availability. Product prices and promotions may change without notice.",
      },
      {
        title: "Brand Communication",
        body: "Blatheil operates with a bold and premium communication style rooted in individuality and leadership. Unauthorized misuse of brand assets, media, or campaign content is prohibited.",
      },
      {
        title: "Campaign and Shoot Direction",
        body: "Approved collaborations should align with our luxury streetwear identity: black and gold palette, refined confidence, and high-contrast visual storytelling.",
        bullets: [
          "Plan content in advance across reels, photos, and stories.",
          "Capture movement, logo details, and styling composition shots.",
          "Maintain premium editing standards with controlled transitions.",
        ],
      },
      {
        title: "Support and Dispute Resolution",
        body: "For assistance regarding orders, payments, or disputes, contact the Blatheil support channel. Resolution timelines may vary by case complexity.",
      },
    ]}
  />
);

export default Terms;
