## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Keep `doc.md` (detailed) and `doc-short.md` (concise) synchronized with every website code change. Update affected behavior, file paths, maintenance instructions, and verification status. Keep the concise version short.

## Verification preference

After editing code, do not automatically run tests, builds, linting, code reviews, browser checks, or other verification. Run checks only when the user explicitly requests them. State when the latest changes have not been checked, and distinguish historical results from current verification.

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
