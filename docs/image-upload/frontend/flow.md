# Image upload UI — flows

1. The floating button opens the upload dialog; files are dropped or picked, optionally with a publish time.
2. Each file is posted to `/api/images`; on success the `images` queries are invalidated and the gallery (or Scheduled view) refreshes.
3. Opening an image fetches `/api/images/:id/file` with the bearer token and previews it.
4. Delete moves an image to the Bin; from the Bin it can be restored or deleted for good.
