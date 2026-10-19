# sagar-ai-dev.github.io

Personal portfolio of Sagar Lal, AI & Machine Learning Engineer: <https://sagar-ai-dev.github.io/>

Plain HTML, CSS and JavaScript. No framework and no build step, so GitHub Pages serves the files as they are.

| File | What it holds |
|---|---|
| `index.html` | All page content, in English |
| `assets/js/i18n.js` | Italian, Spanish, French and German translations |
| `assets/css/site.css` | Layout, dark and light themes |
| `assets/js/site.js` | Language menu, theme toggle, mobile menu, copy-email button |
| `Sagar_Lal.pdf` | The CV behind the "Download CV" buttons |

## Editing text

Every translatable element in `index.html` has a key, for example `data-i18n="hero.lead"`.
Change the English text in `index.html`, then change the same key in each language block of `assets/js/i18n.js`.

A page can be shared in a given language with `?lang=it`, `?lang=es`, `?lang=fr` or `?lang=de`.

Icons: [Lucide](https://lucide.dev) (ISC licence) and the GitHub and LinkedIn marks from [Font Awesome Free](https://fontawesome.com) (CC BY 4.0).
