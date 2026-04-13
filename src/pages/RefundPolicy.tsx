import PolicyShell from "@/components/policy/PolicyShell";

const RefundPolicy = () => (
  <PolicyShell
    badge="Policy"
    title="Refund Policy"
    updatedOn="April 13, 2026"
    lead="Blatheil keeps refund handling transparent, fair, and fast while protecting quality standards across every order."
    sections={[
      {
        title: "Eligibility",
        body: "Refunds are approved for eligible items that meet our quality and return review criteria.",
        bullets: [
          "Item delivered in damaged condition.",
          "Item received is incorrect compared with the order.",
          "Item is missing from shipment.",
        ],
      },
      {
        title: "Non-Refundable Cases",
        body: "Refund requests may be declined when policy conditions are not met.",
        bullets: [
          "Used, washed, altered, or damaged items after delivery.",
          "Requests raised after the policy timeline.",
          "Minor color or fit variation due to screen settings or personal preference.",
        ],
      },
      {
        title: "Refund Timeline",
        body: "After approval, refunds are initiated to the original payment method and generally reflect within 5 to 10 business days, subject to banking systems.",
      },
      {
        title: "Failed or Returned Deliveries",
        body: "If an order is returned to origin due to repeated failed delivery attempts or unreachable customer details, refund settlement may exclude non-recoverable shipping costs.",
      },
      {
        title: "How to Raise a Refund Request",
        body: "Contact Blatheil support with your order ID, registered phone number, and issue details. Supporting photos or videos help us resolve cases faster.",
      },
    ]}
  />
);

export default RefundPolicy;
