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

// Markdown body edited as raw markdown (textarea). We deliberately avoid
// Tina's rich-text editor: the docs use Hugo shortcodes ({{< ref >}}) and raw
// HTML, and meeting posts contain CBMT codes / escaped characters that a
// rich-text round-trip would corrupt.
const bodyField: TinaField = {
  type: "string",
  name: "body",
  label: "Body",
  isBody: true,
  ui: { component: "textarea" },
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

const meetingSkeleton = `# Course Title

**(X CMTE credits)**

**Saturday, Month Day, Year**
**Venue, City, SC**

**Begins promptly at 10:00 AM – plan to arrive no later than 9:30 AM to register and greet your friends. MTASC business meeting after lunch.**

[PDF Flyer](/images/your-flyer.pdf "PDF Flyer")

Register: <https://forms.gle/your-form>

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

const postsCollection: Collection = {
  name: "post",
  label: "Posts & Announcements",
  path: "content/posts",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  ui: {
    filename: {
      // Friendly default filename; editors can change it.
      slugify: (values) =>
        `${(values?.title || "new-post")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}`,
    },
    // Pre-fill a new meeting post with a clean skeleton.
    defaultItem: () => ({
      layout: "post",
      date: new Date().toISOString(),
      body: meetingSkeleton,
    }),
  },
  fields: [
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    {
      type: "datetime",
      name: "date",
      label: "Publish Date",
      required: true,
      description: "When this post was published (controls blog ordering).",
    },
    {
      type: "datetime",
      name: "meeting_date",
      label: "Meeting / Event Date",
      description:
        "The date of the actual meeting or event. Set this for meetings — it drives the home page “Next Meeting” button. Leave blank for non-event posts.",
    },
    {
      type: "string",
      name: "excerpt",
      label: "Excerpt",
      ui: { component: "textarea" },
      description: "Short summary shown in the blog list.",
    },
    { type: "image", name: "featured_image", label: "Featured Image" },
    { type: "string", name: "keywords", label: "Keywords", list: true },
    { type: "string", name: "layout", label: "Layout", ui: hidden },
    bodyField,
  ],
};

const docsCollection: Collection = {
  name: "docs",
  label: "Resources",
  path: "content/docs",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  fields: [
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    {
      type: "string",
      name: "excerpt",
      label: "Excerpt",
      ui: { component: "textarea" },
      description: "Short description shown in the resources overview grid.",
    },
    {
      type: "number",
      name: "weight",
      label: "Order",
      description: "Lower numbers appear first in the navigation.",
    },
    { type: "string", name: "subtitle", label: "Subtitle" },
    { type: "image", name: "img_path", label: "Header Image" },
    { type: "string", name: "keywords", label: "Keywords", list: true },
    { type: "string", name: "layout", label: "Layout", ui: hidden },
    bodyField,
  ],
};

const homeCollection: Collection = {
  name: "home",
  label: "Home Page",
  path: "content",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  match: { include: "_index" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    { type: "string", name: "keywords", label: "Keywords", list: true },
    { type: "string", name: "layout", label: "Layout", ui: hidden },
    {
      type: "object",
      name: "sections",
      label: "Page Sections",
      list: true,
      templates: [heroBlock, featuresBlock, contentBlock, ctaBlock] as any,
    },
  ],
};

const overviewCollection: Collection = {
  name: "overview",
  label: "Members Overview",
  path: "content",
  format: "md",
  frontmatterFormat: "yaml",
  frontmatterDelimiters: "---",
  match: { include: "overview" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    { type: "string", name: "subtitle", label: "Subtitle" },
    { type: "image", name: "img_path", label: "Header Image" },
    { type: "string", name: "layout", label: "Layout", ui: hidden },
    {
      type: "object",
      name: "sections",
      label: "Page Sections",
      list: true,
      templates: [contentBlock, ctaBlock] as any,
    },
  ],
};

const therapistsCollection: Collection = {
  name: "find_a_therapist",
  label: "Find a Therapist",
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
    {
      type: "object",
      name: "items",
      label: "Therapists & Practices",
      list: true,
      ui: { itemProps: (i) => ({ label: i?.title || "Therapist" }) },
      fields: [
        { type: "string", name: "title", label: "Name / Practice" },
        {
          type: "string",
          name: "subtitle",
          label: "Description",
          ui: { component: "textarea" },
        },
        { type: "image", name: "preview_img", label: "Logo / Photo" },
        {
          type: "string",
          name: "url",
          label: "Website URL",
          description: "Full URL including https://",
        },
      ],
    },
  ],
};

const blogCollection: Collection = {
  name: "blog",
  label: "Blog Index",
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
  label: "Other Pages",
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
  label: "Site Header",
  path: "data",
  format: "yaml",
  match: { include: "header" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Site Name",
      description: "Shown in the header when no logo image is set.",
    },
    { type: "image", name: "logo_img", label: "Logo Image" },
    { type: "string", name: "url", label: "Logo / Title Link" },
    { type: "boolean", name: "has_nav", label: "Show Navigation Menu" },
  ],
};

const footerCollection: Collection = {
  name: "footer",
  label: "Site Footer",
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
    },
    { type: "boolean", name: "has_social", label: "Show Social Icons" },
    {
      type: "object",
      name: "links",
      label: "Footer Links",
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
  label: "Social Media",
  path: "data",
  format: "json",
  match: { include: "social" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "object",
      name: "links",
      label: "Social Accounts",
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

const docSectionsCollection: Collection = {
  name: "doc_sections",
  label: "Resource Sections",
  path: "data",
  format: "yaml",
  match: { include: "doc_sections" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: "string",
      name: "root_folder",
      label: "Root Folder",
      ui: hidden,
    },
    {
      type: "string",
      name: "sections",
      label: "Sections",
      list: true,
      description:
        "Folder names under /docs/ shown in the Resources navigation, in order.",
    },
  ],
};

const authorCollection: Collection = {
  name: "author",
  label: "Author Info",
  path: "data",
  format: "json",
  match: { include: "author" },
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    { type: "string", name: "name", label: "Name" },
    { type: "string", name: "email", label: "Email" },
    { type: "image", name: "avatar", label: "Avatar" },
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
    collections: [
      postsCollection,
      therapistsCollection,
      homeCollection,
      overviewCollection,
      blogCollection,
      simplePagesCollection,
      docsCollection,
      headerCollection,
      footerCollection,
      socialCollection,
      docSectionsCollection,
      authorCollection,
    ],
  },
});
