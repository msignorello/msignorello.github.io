type AnalyticsParameters = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, parameters?: AnalyticsParameters) => void;
  }
}

const normalizeLabel = (link: HTMLAnchorElement) => {
  const label =
    link.dataset.analyticsLabel ??
    link.getAttribute("aria-label") ??
    link.textContent ??
    "";

  return label.replace(/\s+/g, " ").trim().slice(0, 120);
};
const getLinkLocation = (link: HTMLAnchorElement) =>
  link.dataset.analyticsLocation ??
  link.closest<HTMLElement>("[data-analytics-location]")?.dataset.analyticsLocation ??
  "page_content";

const getContentSelection = (url: URL) => {
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments[0] === "writing" && segments.length === 2) {
    return { contentType: "article", itemId: segments[1] };
  }

  if (segments[0] === "writing" && segments.length === 1) {
    return { contentType: "writing_archive", itemId: "writing" };
  }

  if (segments[0] === "resume" && segments.length === 1) {
    return { contentType: "resume", itemId: url.hash.slice(1) || "professional_resume" };
  }

  if (segments[0] === "contact" && segments.length === 1) {
    return { contentType: "contact_page", itemId: "contact" };
  }

  return null;
};

const trackEvent = (eventName: string, parameters: AnalyticsParameters) => {
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, {
    ...parameters,
    transport_type: "beacon"
  });
};

export const initAnalyticsTracking = () => {
  document.addEventListener("click", (event) => {
    const link =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[href]")
        : null;

    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    const linkText = normalizeLabel(link);
    const linkLocation = getLinkLocation(link);
    const explicitEvent = link.dataset.analyticsEvent;

    if (explicitEvent === "generate_lead") {
      trackEvent("generate_lead", {
        contact_method: link.dataset.contactMethod ?? "other",
        link_location: linkLocation,
        ...(linkText && { link_text: linkText })
      });
      return;
    }

    if (explicitEvent === "select_content") {
      trackEvent("select_content", {
        content_type: link.dataset.contentType ?? "other",
        item_id: link.dataset.itemId ?? "unknown",
        link_location: linkLocation,
        ...(linkText && { link_text: linkText })
      });
      return;
    }

    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;

    const content = getContentSelection(url);
    if (!content) return;

    trackEvent("select_content", {
      content_type: content.contentType,
      item_id: content.itemId,
      link_location: linkLocation,
      ...(linkText && { link_text: linkText })
    });
  });
};
