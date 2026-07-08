---
trigger: always_on
---

# 🚨 FRONTEND-ONLY DEVELOPMENT RULE (STRICT)

This project is currently in **Frontend UI/UX Development Mode**.

## ABSOLUTE RESTRICTIONS (DO NOT VIOLATE)

- DO NOT modify any backend code.
- DO NOT edit APIs, controllers, routes, middleware, models, database schemas, authentication, sessions, business logic, server configuration, environment variables, deployment configuration, or backend dependencies.
- DO NOT rename backend endpoints.
- DO NOT change request/response payloads.
- DO NOT modify API contracts.
- DO NOT change database queries.
- DO NOT introduce breaking changes between frontend and backend.
- DO NOT add, remove, or modify backend packages.
- DO NOT touch backend folders unless explicitly instructed.

## FRONTEND SCOPE ONLY

You may only work on:

- UI redesign
- Layout improvements
- Typography
- Colors
- Components
- Animations
- Micro-interactions
- Responsiveness (360px–2560px+)
- Accessibility improvements
- Frontend performance optimization
- CSS/SCSS/Tailwind
- HTML/JS/React/Next.js UI components
- Icons
- Images
- Spacing
- Visual hierarchy
- User experience improvements

## FUNCTIONALITY PRESERVATION

Every frontend change MUST preserve existing functionality.

- All buttons must continue working.
- All forms must continue submitting correctly.
- All API calls must remain exactly the same.
- All authentication flows must remain unchanged.
- All routing must continue working.
- All state management must continue working.
- All existing validations must remain intact.
- No JavaScript errors.
- No console errors.
- No hydration errors.
- No broken imports.
- No broken assets.
- No broken navigation.

## DESIGN PHILOSOPHY

Improve only the presentation layer while keeping the application behavior identical.

Think of this as replacing the "skin" of the application without touching its "brain."

## BEFORE MODIFYING ANY FILE

Determine whether the file affects:

- backend logic
- API behavior
- authentication
- business logic
- data flow

If YES:
➡️ DO NOT MODIFY IT.

Only proceed if the change is purely visual or related to frontend presentation.

## QUALITY CHECK BEFORE COMPLETION

Verify that:

✓ Backend files remain untouched.
✓ Existing functionality behaves exactly as before.
✓ UI improvements are production-ready.
✓ No regressions are introduced.
✓ Responsive behavior is maintained.
✓ Accessibility is preserved or improved.
✓ Animations remain smooth.
✓ Build succeeds without warnings or errors.
✓ Cross-browser compatibility is maintained.
✓ No unnecessary refactoring has been performed.

## GOLDEN RULE

**Frontend only. Zero backend modifications. Zero API changes. Zero business logic changes. Only redesign and enhance the UI while preserving 100% of the existing functionality.**