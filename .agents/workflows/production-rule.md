---
description: 
---

# 🚨 GLOBAL PRODUCTION DEPLOYMENT RULE (NON-NEGOTIABLE)

From this point forward, every task must be completed with a **Production-First** approach.

The website is intended for real-world deployment and must be deployable to production at any time without additional fixes.

====================================================
PRIMARY OBJECTIVE
====================================================

Every change must be production-ready.

Do NOT write code that only works in a local development environment.

Every implementation must work consistently on:

✓ Windows
✓ Linux
✓ macOS
✓ cPanel Shared Hosting
✓ Apache
✓ Nginx
✓ Vercel
✓ Netlify
✓ Cloudflare
✓ AWS
✓ DigitalOcean
✓ Railway
✓ VPS Servers
✓ Modern browsers

====================================================
DEPLOYMENT SAFETY
====================================================

Every time you modify code you MUST verify:

✓ Build succeeds
✓ No runtime errors
✓ No console errors
✓ No missing imports
✓ No broken exports
✓ No unresolved dependencies
✓ No broken links
✓ No missing assets
✓ No hydration errors
✓ No routing issues

Never assume something works.

Always verify.

====================================================
IMAGE & ASSET RULES (CRITICAL)
====================================================

Images MUST load correctly after deployment.

Always verify:

✓ Correct relative paths
✓ Correct asset folder locations
✓ Correct filename casing
✓ No Windows-only path assumptions
✓ No absolute local file paths
✓ No broken image references
✓ No duplicate asset names with different casing

Linux servers are case-sensitive.

Example:

Correct:

images/logo.webp

Incorrect:

Images/logo.webp

if folder is actually "images"

Always ensure filenames exactly match the actual files.

====================================================
ASSET PATH RULES
====================================================

Never use:

C:\

D:\

file://

localhost

127.0.0.1

or any local machine path.

Always use production-safe paths.

Prefer:

./assets/

./images/

assets/

images/

or framework-specific public asset conventions.

Every image, video, icon, font, SVG, JSON, and static asset must resolve correctly after deployment.

====================================================
RESPONSIVENESS
====================================================

Every component must be fully responsive.

Test layouts for:

360px

390px

414px

480px

576px

640px

768px

820px

1024px

1280px

1366px

1440px

1600px

1920px

2560px

No horizontal scrolling.

No overflow.

No clipped text.

No overlapping elements.

No broken grids.

Maintain identical visual quality across all breakpoints.

====================================================
BROWSER COMPATIBILITY
====================================================

Verify compatibility with:

Chrome

Edge

Firefox

Safari

Opera

Mobile Chrome

Mobile Safari

Do not rely on browser-specific behavior.

====================================================
HTML
====================================================

Use semantic HTML.

Valid nesting.

Accessible structure.

Proper alt attributes.

Correct heading hierarchy.

====================================================
CSS
====================================================

Use production-safe CSS.

Avoid fixed pixel layouts where unnecessary.

Prefer:

Flexbox

CSS Grid

clamp()

min()

max()

aspect-ratio

relative units

Use responsive typography.

Avoid layout shifts.

====================================================
JAVASCRIPT
====================================================

No uncaught exceptions.

No infinite loops.

No memory leaks.

No duplicate listeners.

No unnecessary re-renders.

No blocking code.

Gracefully handle missing elements.

====================================================
PERFORMANCE
====================================================

Optimize for production.

Images:

Lazy load where appropriate.

Use:

WebP

AVIF

SVG

Compress large assets.

Use responsive image sizing.

Avoid unnecessary JavaScript.

Minimize layout shifts.

====================================================
ANIMATIONS
====================================================

Animations must:

Run at 60 FPS.

Not block rendering.

Not cause layout reflow.

Respect reduced motion preferences where appropriate.

Gracefully degrade if unavailable.

====================================================
FONTS
====================================================

Fonts must:

Load correctly after deployment.

Include proper fallbacks.

Use production-safe loading.

Avoid FOIT where possible.

====================================================
ACCESSIBILITY
====================================================

Maintain:

Keyboard navigation.

Visible focus states.

ARIA where appropriate.

Proper contrast.

Readable typography.

====================================================
SERVER SAFETY
====================================================

Never assume:

Case-insensitive filesystem.

Windows paths.

Development server behavior.

Every implementation must work correctly on Linux production servers.

====================================================
QUALITY ASSURANCE
====================================================

Before considering ANY task complete, perform a full production readiness review.

Verify:

✓ Images load correctly
✓ Videos load correctly
✓ Icons render
✓ Fonts load
✓ Links work
✓ Buttons work
✓ Forms work
✓ Animations work
✓ Responsive layouts work
✓ Assets resolve correctly
✓ Build succeeds
✓ Deployment-safe code
✓ No console errors
✓ No warnings
✓ No broken imports
✓ No missing files

====================================================
GOLDEN RULE
====================================================

Never make a change unless it is fully production-ready.

Every modification must be written, tested, and verified as if it will be deployed immediately to a live production server.

Always double-check every implementation before finishing.

If there is any uncertainty about deployment compatibility, asset resolution, responsiveness, browser behavior, or production stability, resolve the issue before considering the task complete.

The final result must be indistinguishable from software built by a senior engineering team and ready for immediate deployment on any modern production hosting environment.