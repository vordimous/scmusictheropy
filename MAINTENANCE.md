# Maintaining the MTASC Website

This site runs on [Hugo](https://gohugo.io/) and is edited through
[TinaCMS](https://tina.io/). **You do not need to be a developer to update
content** — almost everything is editable in the visual editor at:

```
https://YOUR-SITE-URL/admin/
```

Log in with the account you were invited with. Changes you save are committed to
the site automatically and go live after a short build.

---

## What you can edit in the CMS

When you open `/admin/` you'll see these sections in the sidebar:

| Section | What it controls |
| --- | --- |
| **Posts & Announcements** | Meeting/CMTE posts and other news. Create, edit, delete. |
| **Find a Therapist** | The therapist & private-practice directory. |
| **Home Page** | The sections/blocks on the front page. |
| **Members Overview** | The Members page. |
| **Blog Index** | Title/intro of the Updates (blog) page. |
| **Other Pages** | Contact, Dues, and the form thank-you page. |
| **Resources** | The docs pages (Education, FAQ, Membership, etc.). |
| **Site Header / Footer / Social Media** | Logo, footer links, social icons. |
| **Resource Sections / Author Info** | Resource navigation order, author details. |

> The site's color theme and core configuration are intentionally **not** in the
> CMS — ask a developer for those.

---

## The most common task: adding a new meeting (twice a year)

Everything for a meeting lives in **one** post. You no longer have to touch the
home page — the "Our Next Meeting" button updates **automatically** to point at
the soonest upcoming meeting (it uses the post's **Meeting / Event Date**).

### Step 1 — Create the post

1. Go to **Posts & Announcements → Create New**.
2. The body is pre-filled with a meeting template (course description, learner
   objectives, presenter, schedule, registration, location, lunch, CBMT footer).

### Step 2 — Upload the flyer PDF

1. In the post, find a good spot (the template has a `[PDF Flyer](...)` line).
2. Use the media button / replace the `/images/your-flyer.pdf` path by uploading
   the flyer PDF. Tina stores it under `/images/`.

### Step 3 — Turn the flyer into the post body

You'll usually receive the meeting details as a **PDF or Word (.docx) flyer**.
Convert it into the post body using whichever is easiest:

**Option A — Use an AI assistant (fastest)**
1. Open the flyer and copy all of its text (or attach the file).
2. Paste it into an AI assistant (e.g. ChatGPT/Claude) with this prompt:

   > Convert this music therapy CMTE flyer into Markdown for our website. Use
   > these section headings in this order: Course Description, Learner Objectives
   > (numbered list), About the Presenter, Course Schedule, Registration
   > Information, Location, Lunch. Keep the CBMT credit note at the bottom in
   > italics. Don't invent details that aren't in the flyer.

3. Copy the Markdown it produces and paste it into the post **Body**, replacing
   the template placeholders.

**Option B — Fill in the template by hand**
- Replace each placeholder in the pre-filled template with the matching info from
  the flyer.

### Step 4 — Fill in the post fields

| Field | What to enter |
| --- | --- |
| **Title** | The course title (e.g. "Music Therapy Ethics and Clinical Decision Making"). |
| **Publish Date** | Today's date (controls ordering in the blog). |
| **Meeting / Event Date** | **The actual date of the meeting.** This is what drives the home-page button — don't skip it. |
| **Excerpt** | One line: `(X CMTE credits) Saturday, Month Day, Year @ Venue, City, SC`. Shown in the blog list. |
| **Featured Image** | Optional. |

### Step 5 — Save

Save/publish. After the site rebuilds:
- The post appears under **Updates**.
- The home page **"Our Next Meeting"** button points to it automatically.

That's it — no code, no editing the home page, no broken links.

---

## How the automatic "Next Meeting" link works

- Any post with a **Meeting / Event Date** is treated as a meeting.
- The home-page button (and any button whose URL is the special value
  `#next-meeting`) links to the **soonest upcoming** meeting.
- If there are no upcoming meetings, it falls back to the **most recent** one.

So you only ever set the **Meeting / Event Date** — the site does the rest.

---

## For developers

### Local setup
```bash
npm install
cp .env.example .env        # fill in Tina Cloud credentials
npm run dev                 # Tina + Hugo at http://localhost:1313 (admin at /admin/)
```

### Production build (what CI runs)
```bash
npm run build               # = tinacms build && hugo --gc --minify
```

### Key files
- `tina/config.ts` — the CMS schema (collections & fields). **Every Hugo
  front-matter key must be declared here**, or Tina will drop it on save.
- `layouts/partials/next_meeting.html` — resolves the `#next-meeting` button.
- `static/_headers` — security/cache headers (works on Netlify **and** Cloudflare).
- `netlify.toml` — build commands + Hugo/Node versions + Tina env vars.

### Content conventions
- All content uses **YAML** front matter (`---`).
- Meeting posts carry a `meeting_date`; non-meeting posts (e.g. newsletters) do not.
- Post images use the `featured_image` field; page headers use `img_path`.

### Hosting / auth
- CMS auth + content API: **Tina Cloud** (host-agnostic — works on Netlify today
  and Cloudflare Pages after the move). Set `NEXT_PUBLIC_TINA_CLIENT_ID`,
  `TINA_TOKEN`, and `TINA_BRANCH` in the host's environment variables.
- The `/admin` app and `tina/__generated__/` are **build artifacts** (gitignored);
  CI regenerates them via `tinacms build`.
