import PolicyShell from "@/components/policy/PolicyShell";

const CancellationPolicy = () => (
  <PolicyShell
    badge="Policy"
    title="Cancellation and Return"
    updatedOn="April 13, 2026"
    lead="Blatheil supports responsible cancellations and returns under clear timelines so every customer gets a smooth post-purchase experience."
    sections={[
      {
        title: "Order Cancellation",
        body: "Cancellation is available before dispatch. Once an order is shipped, it cannot be canceled and should be managed under return flow where eligible.",
        bullets: [
          "Fast requests have higher cancellation success.",
          "Limited drops may become non-cancellable once packed.",
        ],
      },
      {
        title: "Return Window",
        body: "Eligible returns must be requested within 7 days from delivery date.",
        bullets: [
          "Items must be unused and unwashed.",
          "Original tags, packaging, and invoice should be retained.",
        ],
      },
      {
        title: "Quality Check",
        body: "Returned products undergo inspection before approval. Any item failing quality checks may be sent back to the customer.",
      },
      {
        title: "Exchange Handling",
        body: "Exchange depends on stock availability for size or variant. If exchange stock is unavailable, eligible refunds are processed as per refund policy.",
      },
      {
        title: "Important Notes",
        body: "Campaign products, final sale items, and customized pieces may not be eligible for cancellation, return, or exchange unless there is a verified defect.",
      },
    ]}
  />
);

export default CancellationPolicy;
