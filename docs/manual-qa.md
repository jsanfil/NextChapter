# Manual QA

Run `npm run dev`, open the local Vite URL, and verify:

- The app opens to chat plus library canvas.
- A Goodreads CSV fixture can be imported through the Library view.
- The Library view shows read and want-to-read books after import.
- A manual book can be added to the want-to-read shelf.
- A prompt such as "Find me a post-apocalyptic novel that is not too bleak" creates a recommendation session.
- Current Results shows "From your want-to-read shelf" and "New discoveries".
- A recommendation can be shortlisted, accepted, and rejected.
- Sessions shows the saved session and can return to its results.
- Book Detail opens from a library row.
- Settings can save reading preferences, model settings, and external link enabled flags.
- Desktop layout matches the approved UI design addendum: chat is the primary conversational surface and the canvas keeps Library, Sessions, Current Results, and Book Detail visible as primary work areas.
- Mobile layout matches the approved UI design addendum without horizontal scrolling, text overlap, or unreachable primary actions.
- Settings remains a secondary configuration surface rather than a face-up primary canvas tab in daily recommendation flows.
- Refreshing the browser preserves imported books, sessions, preferences, and settings.
