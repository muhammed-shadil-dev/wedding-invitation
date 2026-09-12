/**
 * ─────────────────────────────────────────────────────────────
 *  EDIT THIS FILE ONLY.
 *
 *  Every name, date, time, address, phone number and line of copy
 *  on the invitation comes from here. No component contains any
 *  wedding information of its own.
 *
 *  Scenes with no content are simply not rendered — leave `story`
 *  or `gallery` empty and the page composes itself without them.
 * ─────────────────────────────────────────────────────────────
 */

export type EventItem = {
  id: string;
  name: string;
  /** Optional one-line subtitle. Omit rather than invent one. */
  tagline?: string;
  date: string; // ISO with timezone offset
  displayDate: string;
  time: string;
  venue: string;
  address: string;
  dressCode?: string;
  mapQuery: string;
};

export type StoryBeat = {
  year: string;
  title: string;
  body: string;
};

export type GalleryItem = {
  src: string;
  alt: string;
  caption?: string;
};

export const site = {
  /** Browser tab and link previews */
  meta: {
    title: "Nehda & Umar — An Invitation",
    description:
      "With the blessings of Allah, we joyfully invite you to celebrate our wedding. Sunday, 8 November 2026, Alappuzha.",
    /**
     * Only a fallback for share links rendered outside a browser.
     * The live address is read from window.location at share time,
     * and NEXT_PUBLIC_SITE_URL drives the Open Graph metadata.
     */
    url: "",
  },

  /**
   * The invocation the invitation opens with. Shown first on the
   * opening screen, and again at the head of the invitation itself.
   */
  bismillah: {
    arabic: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ",
    transliteration: "Bismillahir Rahmanir Raheem",
  },

  couple: {
    brideFirst: "Nehda",
    brideFull: "Nehda Sadik",

    groomFirst: "Umar",
    groomFull: "Umar Mukhtar",

    /** Used for the monogram, in the order the names always appear. */
    monogram: ["N", "U"] as const,
  },

  /** The families, exactly as the card names them. */
  families: {
    bride: {
      label: "Bride's Parents",
      names: "Sadik A & Najiumath",
      address: ["Kannimel Konil Neerkunm", "Vandannm"],
    },
    groom: {
      label: "Groom's Parents",
      names: "Mukhtar & Beena",
      address: [],
    },
  },

  invitation: {
    /**
     * The request, set as three lines the way it is set on the card.
     * Rendered in small caps, so it is stored in sentence case.
     */
    heading: [
      "With the blessings of Allah",
      "we joyfully invite you to",
      "celebrate the wedding of",
    ],
    /** The date as it is stamped under the names. */
    dateStamp: "08 · 11 · 2026",
    /** Where, in one line. */
    place: "Punnapra, Alappuzha",
    /**
     * An optional line under the countdown. Empty, because the card's
     * one closing sentence belongs at the close and saying it twice
     * would spend it.
     */
    blessing: "",
  },

  /** The moment the countdown runs to. */
  weddingDate: "2026-11-08T11:30:00+05:30",

  /**
   * When the ceremony ends, taken from the 12:00 PM on the card. The
   * countdown uses it to know the difference between "not yet",
   * "happening right now" and "thank you for being there", and the
   * calendar files use it as the event end.
   */
  weddingEndsAt: "2026-11-08T12:00:00+05:30",

  events: [
    {
      id: "wedding",
      name: "The Wedding",
      date: "2026-11-08T11:30:00+05:30",
      displayDate: "Sunday, 8 November 2026",
      time: "11:30 AM – 12:00 PM",
      venue: "Gregorian Convention Centre",
      address: "Punnapra, Alappuzha",
      mapQuery: "Gregorian Convention Centre Punnapra Alappuzha",
    },
  ] satisfies EventItem[],

  venue: {
    name: "Gregorian Convention Centre",
    line1: "Punnapra",
    line2: "Alappuzha",
    mapQuery: "Gregorian Convention Centre Punnapra Alappuzha",
    /** Optional note under the map. Empty means it is not rendered. */
    note: "",
  },

  /**
   * No story beats were supplied, so the scene is not rendered.
   * Add entries here and it appears, threaded and punctuated like
   * every other scene.
   */
  story: [] as readonly StoryBeat[],

  /**
   * No photographs were supplied. Drop files into /public/images and
   * list them here to bring the gallery back.
   */
  gallery: [] as readonly GalleryItem[],

  rsvp: {
    /** The number printed on the card, shown exactly as printed. */
    phone: "9847986786",
    /**
     * Country dialling code, needed for the WhatsApp link only. The
     * displayed number never shows it. Kerala number, so +91.
     */
    dialCode: "91",
    /** Pre-filled WhatsApp message. */
    whatsappMessage:
      "Assalamu Alaikum! We would like to RSVP for Nehda & Umar's wedding.",
    /** Shown after a successful submit. */
    thankYou: "Your seat at our table is held.",
    /** Optional. Empty means no deadline line is rendered. */
    deadline: "",
  },

  /** The share sheet at the foot of the invitation. */
  share: {
    label: "Share this invitation",
    /** {url} is replaced with the live address of the site. */
    message: "You are invited to the wedding of Nehda Sadik & Umar Mukhtar, Sunday 8 November 2026 at Gregorian Convention Centre, Punnapra, Alappuzha. {url}",
  },

  closing: {
    quote: "Your presence will make our day more special and memorable.",
    signoff: "With best wishes from",
    wellWishers: "TRM Associate and Spareway",
  },

  /**
   * Editorial copy — what each scene is called. Separate from the
   * wedding facts above so the two can be changed independently.
   */
  scenes: {
    families: {
      label: "Our families",
      title: "Whose blessings / bring us here",
    },
    events: {
      label: "The celebration",
      title: "The wedding day",
      lede: "Please join us as we begin our life together.",
    },
    venue: {
      label: "The venue",
    },
    countdown: {
      label: "Counting down",
      title: "Until we say / the words",
      /** While the ceremony is actually taking place. */
      nowLabel: "Today",
      nowTitle: "It is happening / right now",
      nowNote: "The ceremony is under way. If you are with us, thank you.",
      pastLabel: "It happened",
      pastTitle: "Thank you for / being there",
      pastNote: "Sunday, 8 November 2026. We are glad you were part of it.",
    },
    rsvp: {
      label: "Will you be there",
      title: "Kindly / reply",
      note: "We will send the details again closer to the day. Until then, we are counting too.",
      /** Form field labels. */
      nameLabel: "Your name",
      contactLabel: "Phone or email",
      guestsLabel: "Number of guests",
      messageLabel: "A note for us",
    },
    story: {
      label: "How we arrived here",
      title: "The moments / that brought us here",
    },
    gallery: {
      label: "A few we kept",
      title: "Moments, / before the day",
    },
  },

  /** Shown in the footer */
  credits: "8 November 2026",
} as const;

export type Site = typeof site;
