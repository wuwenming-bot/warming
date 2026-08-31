# Release Workflow

## Deployment rule

- Ordinary website edits stay local for preview and testing.
- After every completed local website edit, include a clickable local preview link in the final response so the user can immediately inspect the result.
- Do not push to GitHub or trigger a Cloudflare Pages deployment after each edit.
- Deploy only when the user explicitly says "统一部署", "发布上线", or otherwise clearly requests a production release.

## Versioning

- Use semantic versions in the form `vMAJOR.MINOR.PATCH`.
- Increment `PATCH` for fixes, copy changes, visual refinements, and small performance improvements.
- Increment `MINOR` for new sections, interactions, projects, or other backward-compatible features.
- Increment `MAJOR` for a substantial redesign or structural change.
- The version number changes only when a production deployment is made.

## Production release checklist

1. Confirm the accumulated local changes with the user.
2. Choose the next version based on the rules above.
3. Update `VERSION` and add a row to `DEPLOYMENTS.md`.
4. Run the relevant local checks.
5. Commit the complete release, create an annotated Git tag named `site-vMAJOR.MINOR.PATCH`, then push the branch and tag.
6. Verify the Cloudflare Pages deployment and both public domains.

## Rollback

- Use the release tags and `DEPLOYMENTS.md` to identify a known production version.
- Never roll production back without the user's explicit confirmation.

## Collaboration principles

- Act as an independent reviewer and creative collaborator, not an agreeable echo.
- Evaluate the user's assumptions before implementing them; clearly point out errors, risks, contradictions, and weaker options.
- Offer a better alternative when one exists, including the reasoning and meaningful tradeoffs.
- Distinguish objective problems from subjective design preferences, and do not present personal taste as fact.
- Once the evidence supports a direction, be decisive and implement it without unnecessary confirmation, except for production deployment, rollback, destructive actions, or other consequential changes.

## Reusable visual patterns

- "Adaptive contrast text" means white foreground text or icons using `mix-blend-mode: difference` so they appear white over black and black over white, including when they cross the boundary between both backgrounds.
- Use this pattern first for pure black-and-white surfaces. For colored backgrounds or when exact black/white output is required, use duplicated foreground layers with a mask or `clip-path` instead of relying on blend-mode color inversion.
