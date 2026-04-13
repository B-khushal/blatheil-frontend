import PolicyShell from "@/components/policy/PolicyShell";

const Privacy = () => (
  <PolicyShell
    badge="Policy"
    title="Privacy Policy"
    updatedOn="April 13, 2026"
    lead="Blatheil respects your privacy and protects customer data through responsible collection, secure handling, and transparent communication."
    sections={[
      {
        title: "Data We Collect",
        body: "We collect only required information such as name, contact details, shipping address, and order records to fulfill purchases and assist customers.",
      },
      {
        title: "Why We Collect It",
        body: "Information is used to process orders, share shipment updates, provide support, and improve the overall Blatheil experience.",
      },
      {
        title: "Data Sharing",
        body: "Blatheil does not sell customer data. Limited information may be shared only with trusted payment, logistics, and service partners required to complete your order journey.",
      },
      {
        title: "Branding Note",
        body: "Branding is how people feel when they see or think about a brand. For Blatheil, this includes luxury streetwear design language, black-and-gold aesthetics, premium tone, and leadership-driven messaging.",
      },
      {
        title: "Your Rights",
        body: "You may request data correction or deletion by contacting support, subject to legal obligations and essential transaction records.",
      },
    ]}
  />
);

export default Privacy;
