# Cleaning up the old static site

The first repo was a static HTML/CSS prototype (static sites are not allowed for submission).
1. Before deleting, port the visual design: copy colours and fonts from the old `style.css`
   into `web/src/styles/tokens.css`, and rebuild each page as a React component.
2. Create a branch `chore/restructure`, remove the old pages and the duplicate `Beyond-Tomorrow` folder,
   add this structure, and open a pull request.
3. Old files remain in Git history (fine), but scan history for secrets before adding any keys.
