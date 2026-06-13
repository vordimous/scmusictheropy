import { defineConfig, Collection, TinaField } from "tinacms";

// Branch Tina reads/writes. Netlify/Cloudflare set HEAD; we default to master.
const branch =
  process.env.TINA_BRANCH ||
  process.env.GITHUB_BRANCH ||
  process.env.HEAD ||
  "master";

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

// Hide a field from the editor while still round-tripping its value.
// (Tina deletes undeclared front-matter keys on save, so plumbing fields
// like `layout` and `component` must be DECLARED but kept out of the UI.)
const hidden = { component: () => null };

// Re-usable "Buttons" list ({ label, url }).
const actionsField: TinaField = {
  type: "object",
  name: "actions",
  label: "Buttons",
  list: true,
  ui: {
    itemProps: (item) => ({ label: item?.label || "Button" }),
  },
  fields: [
    { type: "string", name: "label", label: "Button Label" },
    {
      type: "string",
      name: "url",
      label: "Button URL",
      description:
        "Internal path like /find-a-therapist, a full https:// URL, or the special value #next-meeting to auto-link the next meeting.",
    },
  ],
};

// Page body — Tina's rich-text WYSIWYG editor (toolbar, headings, lists, links,
// images, tables, plus a raw-markdown toggle). Stored as the markdown body of
// each file. NOTE: rich-text is MDX-based, so managed content must NOT contain
// Hugo shortcodes ({{< … >}}) or raw HTML — convert those to plain
// markdown/links (see faq.md / continuing-education.md for examples).
const bodyField: TinaField = {
  type: "rich-text",
  name: "body",
  label: "Body",
  isBody: true,
};

/* ------------------------------------------------------------------ *
 * Home / Overview section blocks
 * Hugo renders each block via its `component` partial (see home.html),
 * so `component` is a hidden field with a per-template default.
 * ------------------------------------------------------------------ */

const heroBlock: TinaField = {
  name: "heroblock",
  label: "Hero Section",
  ui: { itemProps: (i) => ({ label: `Hero: ${i?.title || ""}` }) },
  fields: [
    { type: "string", name: "title", label: "Title" },
    {
      type: "string",
      name: "section_id",
      label: "Section ID",
      description: "Unique anchor id for this section (no spaces).",
    },
    { type: "string", name: "component", label: "Component", ui: hidden },
    {
      type: "string",
      name: "content",
      label: "Content",
      ui: { component: "textarea" },
    },
    { type: "image", name: "image", label: "Background Image" },
    actionsField,
  ],
};

const featuresBlock: TinaField = {
  name: "featuresblock",
  label: "Features Section",
  ui: { itemProps: (i) => ({ label: `Features: ${i?.title || ""}` }) },
  fields: [
    { type: "string", name: "title", label: "Title" },
    { type: "string", name: "subtitle", label: "Subtitle" },
    {
      type: "string",
      name: "section_id",
      label: "Section ID",
      description: "Unique anchor id for this section (no spaces).",
    },
    { type: "string", name: "component", label: "Component", ui: hidden },
    {
      type: "object",
      name: "featureslist",
      label: "Features",
      list: true,
      ui: { itemProps: (i) => ({ label: i?.title || "Feature" }) },
      fields: [
        { type: "string", name: "title", label: "Title" },
        {
          type: "string",
          name: "content",
          label: "Content",
          ui: { component: "textarea" },
        },
        actionsField,
      ],
    },
  ],
};

const contentBlock: TinaField = {
  name: "contentblock",
  label: "Content Section",
  ui: { itemProps: (i) => ({ label: `Content: ${i?.title || ""}` }) },
  fields: [
    { type: "string", name: "title", label: "Title" },
    {
      type: "string",
      name: "section_id",
      label: "Section ID",
      description: "Unique anchor id for this section (no spaces).",
    },
    { type: "string", name: "component", label: "Component", ui: hidden },
    {
      type: "string",
      name: "content",
      label: "Content",
      ui: { component: "textarea" },
    },
    { type: "image", name: "image", label: "Image" },
    actionsField,
  ],
};

const ctaBlock: TinaField = {
  name: "ctablock",
  label: "Call to Action Section",
  ui: { itemProps: (i) => ({ label: `CTA: ${i?.title || ""}` }) },
  fields: [
    { type: "string", name: "title", label: "Title" },
    {
      type: "string",
      name: "section_id",
      label: "Section ID",
      description: "Unique anchor id for this section (no spaces).",
    },
    { type: "string", name: "component", label: "Component", ui: hidden },
    { type: "string", name: "subtitle", label: "Subtitle" },
    actionsField,
  ],
};

/* ------------------------------------------------------------------ *
 * Pre-filled body skeleton for a new meeting post.
 * ------------------------------------------------------------------ */

const meetingSkeleton = `**Begins promptly at 10:00 AM – plan to arrive no later than 9:30 AM to register and greet your friends. MTASC business meeting after lunch.**

## Course Description

Replace this with the course description from the flyer.

## Learner Objectives

Upon completion of this CMTE, participants will be able to:

1. ...
2. ...
3. ...

**Prerequisites:** There are no prerequisites to attend this CMTE event. Students are welcome and encouraged to come and learn with MT-BCs.

**MT-BCs - REMEMBER TO BRING YOUR CBMT # FOR SIGNING IN AND OUT.**

## About the Presenter

Presenter bio here.

## Course Schedule

Schedule here.

## Registration Information

**Cost:**

- Free to MTASC members
- Non-members: $25 (pay with link in Google Registration form)

**Questions?** Contact Carol.shultis@converse.edu or call (864) 596-9621.

## Location

Address and directions here.

## Lunch

Lunch details here.

---

_This course is approved by the Certification Board for Music Therapists (CBMT) for X Continuing Music Therapy Education credits. The SER-AMTA #P-024, maintains responsibility for program quality and adherence to CBMT policies and criteria._
`;

/* ------------------------------------------------------------------ *
 * Collections
 * ------------------------------------------------------------------ */

const meetingsCollection: Collection = {
  name: "meeting",
  label: "Meetings",
  description:
    "CMTE meetings & events. Adding one here automatically updates the home page “Next Meeting” button — it always points at the meeting with the soonest upcoming Meeting Date. See MAINTENANCE.md for the flyer-to-post steps.",
  path: "content/meetings",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  ui: {
    filename: {
      slugify: (values) =>
        `${(values?.title || "new-meeting")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}`,
    },
    // Pre-fill a new meeting with a clean body skeleton; key facts are fields.
    defaultItem: () => ({
      layout: "meeting",
      date: new Date().toISOString(),
      body: meetingSkeleton,
    }),
  },
  fields: [
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    {
      type: "datetime",
      name: "meeting_date",
      label: "Meeting Date",
      required: true,
      description:
        "The date of the meeting/event. This drives the home page “Next Meeting” button.",
    },
    {
      type: "datetime",
      name: "date",
      label: "Publish Date",
      required: true,
      description: "When this was posted (controls ordering in the Updates feed).",
    },
    {
      type: "string",
      name: "excerpt",
      label: "Summary Line",
      ui: { component: "textarea" },
      description:
        "Shown in the Updates list and under the title — e.g. “(3 CMTE credits) Saturday, March 28, 2026 @ Venue, City, SC”.",
    },
    { type: "string", name: "location", label: "Location" },
    {
      type: "string",
      name: "cmte_credits",
      label: "CMTE Credits",
      description: "Number of credits, e.g. 3. Leave blank if none.",
    },
    {
      type: "string",
      name: "registration_url",
      label: "Registration URL",
      description: "The Google Form (or other) sign-up link.",
    },
    {
      type: "string",
      name: "flyer",
      label: "Flyer (PDF)",
      description: "Path to the flyer PDF, e.g. /images/your-flyer.pdf",
    },
    { type: "image", name: "featured_image", label: "Featured Image" },
    { type: "string", name: "layout", label: "Layout", ui: hidden },
    bodyField,
  ],
};

const newsCollection: Collection = {
  name: "post",
  label: "News & Announcements",
  description:
    "General news and announcements that are NOT meetings (e.g. newsletters). These show up in the Updates feed alongside meetings, sorted by date.",
  path: "content/posts",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  ui: {
    filename: {
      slugify: (values) =>
        `${(values?.title || "new-post")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}`,
    },
    defaultItem: () => ({
      layout: "post",
      date: new Date().toISOString(),
    }),
  },
  fields: [
    // ── Content ──
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    {
      type: "datetime",
      name: "date",
      label: "Publish Date",
      required: true,
      description: "Controls ordering in the Updates feed.",
    },
    bodyField,
    {
      type: "string",
      name: "excerpt",
      label: "Excerpt",
      ui: { component: "textarea" },
      description: "Short summary shown in the Updates list.",
    },
    { type: "image", name: "featured_image", label: "Featured Image" },
    // ── SEO (optional — below the content) ──
    {
      type: "string",
      name: "keywords",
      label: "Keywords",
      list: true,
      description:
        "SEO — optional search terms in the page’s metadata. Safe to leave as-is.",
    },
    { type: "string", name: "layout", label: "Layout", ui: hidden },
  ],
};

const resourcesCollection: Collection = {
  name: "resources",
  label: "Resources",
  description:
    "Informational pages (About, Membership, Community, FAQ, Helpful Links). Each page picks a Category, which decides where it appears in the Resources sidebar and index.",
  path: "content/resources",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  ui: {
    filename: {
      slugify: (values) =>
        `${(values?.title || "new-resource")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}`,
    },
    defaultItem: () => ({ category: "About", weight: 1 }),
  },
  fields: [
    // ── Content (what you usually edit) ──
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    bodyField,
    {
      type: "string",
      name: "excerpt",
      label: "Excerpt",
      ui: { component: "textarea" },
      description: "Short description shown in the resources grid and sidebar.",
    },
    // ── Placement & SEO (rarely changed — lives below the content) ──
    {
      type: "string",
      name: "category",
      label: "Category",
      options: ["About", "Membership", "Community", "FAQ", "Helpful Links"],
      description:
        "PLACEMENT — groups this page in the Resources sidebar and index. Pick from the list; adding a brand-new category requires a developer.",
    },
    {
      type: "number",
      name: "weight",
      label: "Order",
      description: "PLACEMENT — lower numbers appear first within a category.",
    },
    {
      type: "string",
      name: "subtitle",
      label: "Subtitle",
      description: "Only used on the Resources home page; leave blank otherwise.",
    },
    {
      type: "string",
      name: "keywords",
      label: "Keywords",
      list: true,
      description:
        "SEO — optional search terms in the page’s metadata. Most visitors never see these; safe to leave as-is.",
    },
  ],
};

const homeCollection: Collection = {
  name: "home",
  label: "Page: Home",
  description:
    "The front page, built from stackable sections you can reorder or add to. Tip: a button URL of #next-meeting is a magic link that always points to the latest meeting — leave it as-is.",
  path: "content",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  match: { include: "_index" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    {
      type: "object",
      name: "sections",
      label: "Page Sections",
      description:
        "Each section is a block of the page. Drag to reorder. “Section ID” is a technical anchor (no spaces) — only change it if you know why.",
      list: true,
      templates: [heroBlock, featuresBlock, contentBlock, ctaBlock] as any,
    },
    {
      type: "string",
      name: "keywords",
      label: "Keywords",
      list: true,
      description:
        "SEO — optional search terms in the page’s metadata. Safe to leave as-is.",
    },
    { type: "string", name: "layout", label: "Layout", ui: hidden },
  ],
};

const overviewCollection: Collection = {
  name: "overview",
  label: "Page: Members",
  description: "The Members page heading, image, and call-to-action sections.",
  path: "content",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  match: { include: "overview" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    { type: "string", name: "subtitle", label: "Subtitle" },
    {
      type: "object",
      name: "sections",
      label: "Page Sections",
      description: "The call-to-action blocks shown on the Members page. Drag to reorder.",
      list: true,
      templates: [contentBlock, ctaBlock] as any,
    },
    { type: "image", name: "img_path", label: "Header Image" },
    { type: "string", name: "layout", label: "Layout", ui: hidden },
  ],
};

// Individual therapist records (one file each). Rendered as cards on the
// Find a Therapist page. `_index.md` is excluded — it only carries build config.
const therapistRecordsCollection: Collection = {
  name: "therapist",
  label: "Therapists",
  description:
    "The therapist directory. Each entry becomes one card on the Find a Therapist page. Add, edit, remove, and reorder these freely.",
  path: "content/therapists",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  match: { exclude: "_index" },
  ui: {
    filename: {
      slugify: (values) =>
        `${(values?.title || "new-therapist")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}`,
    },
    defaultItem: () => ({ weight: 99 }),
  },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Practice / Therapist Name",
      isTitle: true,
      required: true,
    },
    {
      type: "string",
      name: "subtitle",
      label: "Description",
      ui: { component: "textarea" },
      description:
        "Name, credentials, and city — e.g. “Megan Danelz, MT-BC, NICU-MT Greenville, SC”.",
    },
    { type: "image", name: "logo", label: "Logo / Photo" },
    {
      type: "string",
      name: "website",
      label: "Website URL",
      description: "Full URL including https://",
    },
    {
      type: "number",
      name: "weight",
      label: "Order",
      description: "Lower numbers appear first in the directory.",
    },
  ],
};

// The Find a Therapist page header/intro (the cards come from Therapists above).
const therapistsPageCollection: Collection = {
  name: "find_a_therapist",
  label: "Page: Find a Therapist",
  description:
    "Only the heading/intro of the Find a Therapist page. The therapist cards themselves come from the Therapists collection.",
  path: "content",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  match: { include: "find-a-therapist" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    { type: "string", name: "subtitle", label: "Subtitle" },
    { type: "image", name: "img_path", label: "Header Image" },
    { type: "string", name: "keywords", label: "Keywords", list: true },
    { type: "string", name: "layout", label: "Layout", ui: hidden },
  ],
};

const blogCollection: Collection = {
  name: "blog",
  label: "Page: Updates",
  description:
    "Only the heading/intro of the Updates page. The list of meetings and news below it is generated automatically.",
  path: "content/blog",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  match: { include: "_index" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    { type: "string", name: "subtitle", label: "Subtitle" },
    { type: "image", name: "img_path", label: "Header Image" },
    { type: "string", name: "layout", label: "Layout", ui: hidden },
    bodyField,
  ],
};

// Simple content pages that share one schema (Contact, Dues, Response).
// `layout` differs per file but is preserved because it's a declared field.
const simplePagesCollection: Collection = {
  name: "page",
  label: "Page: Contact / Dues / Thank-You",
  description:
    "Heading and intro text for the Contact, Dues, and form Thank-You pages. The contact form and PayPal buttons are built into the site and can’t be edited here.",
  path: "content",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  match: { include: "{contact,dues,response}" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    { type: "string", name: "subtitle", label: "Subtitle" },
    { type: "image", name: "img_path", label: "Header Image" },
    { type: "string", name: "layout", label: "Layout", ui: hidden },
    bodyField,
  ],
};

/* --- Site data files --------------------------------------------- */

const headerCollection: Collection = {
  name: "header",
  label: "⚙️ Settings: Header",
  description:
    "ADVANCED — affects every page. The site logo and name shown at the top. If you’re not sure, leave this alone or ask a developer.",
  path: "data",
  format: "yaml",
  match: { include: "header" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Site Name",
      description:
        "The text shown in the top-left of every page (currently “MTASC”). Only used when no logo image is uploaded.",
    },
    {
      type: "image",
      name: "logo_img",
      label: "Logo Image",
      description:
        "Optional. Upload a logo to show in the top-left instead of the Site Name text.",
    },
    {
      type: "string",
      name: "url",
      label: "Logo / Title Link",
      description: "Where clicking the logo or site name goes. Almost always “/” (the home page).",
    },
    {
      type: "boolean",
      name: "has_nav",
      label: "Show Navigation Menu",
      description:
        "Shows the top navigation menu. Leave ON. (The menu items themselves are set in config.yaml, not here.)",
    },
  ],
};

const footerCollection: Collection = {
  name: "footer",
  label: "⚙️ Settings: Footer",
  description:
    "ADVANCED — affects every page. The footer text and affiliate links (AMTA, SER-AMTA, CBMT).",
  path: "data",
  format: "yaml",
  match: { include: "footer" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "string",
      name: "content",
      label: "Footer Text",
      ui: { component: "textarea" },
      description:
        "The sentence shown at the bottom of every page, before the affiliate links (e.g. “…is an affiliate organization of”).",
    },
    {
      type: "boolean",
      name: "has_social",
      label: "Show Social Icons",
      description: "Shows the social media icons in the footer (set them under Settings: Social Media).",
    },
    {
      type: "object",
      name: "links",
      label: "Footer Links",
      description: "The organization links listed in the footer (AMTA, SER-AMTA, CBMT).",
      list: true,
      ui: { itemProps: (i) => ({ label: i?.text || "Link" }) },
      fields: [
        { type: "string", name: "text", label: "Link Text" },
        { type: "string", name: "url", label: "URL" },
        { type: "boolean", name: "new_window", label: "Open in New Tab" },
      ],
    },
  ],
};

const socialCollection: Collection = {
  name: "social",
  label: "⚙️ Settings: Social Media",
  description:
    "ADVANCED — affects every page. The social icons shown in the footer. The Icon Class must be a valid FontAwesome name (e.g. fa-facebook).",
  path: "data",
  format: "json",
  match: { include: "social" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "object",
      name: "links",
      label: "Social Accounts",
      description:
        "Each entry is one icon in the footer. The Icon Class must be a valid FontAwesome brand name (e.g. fa-facebook, fa-instagram) or the icon won’t appear.",
      list: true,
      ui: { itemProps: (i) => ({ label: i?.title || "Account" }) },
      fields: [
        { type: "string", name: "title", label: "Platform Name" },
        {
          type: "string",
          name: "icon",
          label: "Icon Class",
          description: "FontAwesome brand class, e.g. fa-facebook or fa-instagram.",
        },
        { type: "string", name: "url", label: "Profile URL" },
        { type: "string", name: "type", label: "Type", ui: hidden },
      ],
    },
  ],
};

const authorCollection: Collection = {
  name: "author",
  label: "⚙️ Settings: Author",
  description:
    "ADVANCED — site metadata used in the page <head> (author name/email). Rarely needs changing.",
  path: "data",
  format: "json",
  match: { include: "author" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "string",
      name: "name",
      label: "Name",
      description: "Used in the hidden “author” metadata tag in each page’s HTML. Not shown on the site.",
    },
    {
      type: "string",
      name: "email",
      label: "Email",
      description: "Optional metadata. Not displayed on the site.",
    },
    {
      type: "image",
      name: "avatar",
      label: "Avatar",
      description: "Optional metadata image. Not currently shown on the site.",
    },
  ],
};

/* ------------------------------------------------------------------ */

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    outputFolder: "admin",
    publicFolder: "static",
  },
  media: {
    tina: {
      mediaRoot: "images",
      publicFolder: "static",
    },
  },
  schema: {
    // Order here = order in the CMS sidebar. Grouped top-to-bottom:
    // everyday content, then page text, then advanced site settings.
    collections: [
      // ── Everyday content (edit these freely) ──
      meetingsCollection,
      newsCollection,
      therapistRecordsCollection,
      resourcesCollection,
      // ── Page text (occasional edits) ──
      homeCollection,
      therapistsPageCollection,
      overviewCollection,
      blogCollection,
      simplePagesCollection,
      // ── ⚙️ Site settings (advanced — affects every page) ──
      headerCollection,
      footerCollection,
      socialCollection,
      authorCollection,
    ],
  },
});
