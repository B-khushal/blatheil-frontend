export const CONTACT_EMAIL = "blatheil134@gmail.com";
export const CONTACT_PHONE_DISPLAY = "+91 63041 97084";
export const CONTACT_WHATSAPP_NUMBER = "916304197084";
export const CONTACT_INSTAGRAM_URL = "https://instagram.com/blatheil";
export const CONTACT_INSTAGRAM_HANDLE = "@blatheil";

export const buildWhatsAppUrl = (message: string) => {
  return `https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const isValidIndianPhone = (value: string) => {
  return /^(\+91\s?)?[6-9]\d{9}$/.test(value.replace(/[-()\s]/g, ""));
};
