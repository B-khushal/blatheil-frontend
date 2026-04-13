import PolicyShell from "@/components/policy/PolicyShell";

const ShippingPolicy = () => (
  <PolicyShell
    badge="Policy"
    title="Shipping Policy"
    updatedOn="April 13, 2026"
    lead="Blatheil delivers across India with a premium and reliable shipping experience designed to match our luxury streetwear standards."
    sections={[
      {
        title: "Order Processing",
        body: "Orders are typically processed within 1 to 3 business days after successful payment verification.",
        bullets: [
          "Orders placed on weekends or public holidays are processed on the next business day.",
          "You will receive order confirmation and tracking notifications on your registered contact details.",
        ],
      },
      {
        title: "Delivery Timeline",
        body: "Delivery windows vary by location and courier availability, usually between 3 to 8 business days after dispatch.",
        bullets: [
          "Metro cities may receive faster delivery.",
          "Remote zones may require additional transit time.",
        ],
      },
      {
        title: "Shipping Charges",
        body: "Shipping rates are displayed at checkout. Promotional free shipping campaigns may apply to selected periods or order values.",
      },
      {
        title: "Tracking and Support",
        body: "Once your shipment is dispatched, tracking details are shared automatically. If a shipment appears delayed, contact our support team with your order ID for quick assistance.",
      },
      {
        title: "Address Accuracy",
        body: "Customers are responsible for providing accurate shipping information. Blatheil is not liable for delays caused by incomplete addresses, incorrect phone numbers, or unavailable recipients.",
      },
    ]}
  />
);

export default ShippingPolicy;
