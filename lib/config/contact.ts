/**
 * ============================================================
 * PALLETOORI'S DAIRY FARM - CENTRAL CONTACT CONFIGURATION
 * ============================================================
 * ONE source of truth for all public-facing contact details.
 * Import from this file everywhere contact info is needed.
 * To update contact info, change it ONLY here.
 * ============================================================
 */

export const FARM_CONTACT = {
  /** Display name */
  NAME: "Palletoori's Dairy Farm",

  /** Full postal address */
  ADDRESS:
    "Palletoori's Dairy Farm, Opposite to Balaji Theater, Veluru Road, ChilakALURIPETA, Telangana 522616",

  /** Short address for display in tight UI spaces */
  ADDRESS_SHORT: "Veluru Road, ChilakALURIPETA, Telangana 522616",

  /** E.164 format - used in tel: links and wa.me URLs (no spaces, no +) */
  PHONE_E164: "917286813661",

  /** Display format - used in visible phone number text */
  PHONE_DISPLAY: "+91 72868 13661",

  /** WhatsApp number in E.164 format (no +) */
  WHATSAPP_E164: "917286813661",

  /** Customer email */
  EMAIL: "contact@palletoorisdairy.com",

  /** tel: href  */
  TEL_HREF: "tel:+917286813661",

  /** WhatsApp URL - general inquiry */
  WHATSAPP_INQUIRY_URL:
    "https://wa.me/917286813661?text=Hello%20Palletoori's%20Dairy%20Farm%2C%20I%20have%20an%20inquiry.",

  /** WhatsApp URL - order enquiry */
  WHATSAPP_ORDER_URL:
    "https://wa.me/917286813661?text=Hello%20Palletoori's%20Dairy%20Farm%2C%20I%20would%20like%20to%20order%20fresh%20milk.",

  /** mailto: href */
  MAILTO_HREF: "mailto:contact@palletoorisdairy.com",
} as const;
