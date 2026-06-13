---
title: "Therapists"
# These records are rendered as cards on /find-a-therapist/ and link out to each
# practice's own website, so we don't build individual pages for them.
build:
  render: never
  list: local
cascade:
  build:
    render: never
    list: local
---
