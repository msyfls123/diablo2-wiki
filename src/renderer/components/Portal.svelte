<!-- 
  https://medium.com/hackernoon/using-a-react-16-portal-to-do-something-cool-2a2d627b0202
  https://stackoverflow.com/questions/62733094/implement-a-portal-in-svelte
  https://stackoverflow.com/questions/58187495/create-window-with-attached-svelte-component-and-in-the-same-javascript-context
-->
<div class="portal-clone">
  <div bind:this={ref}>
    <slot></slot>
  </div>
</div>

<style>
  .portal-clone { display: none; }
</style>

<script context="module">
  function copyStyles(sourceDoc, targetDoc) {
    Array.from(sourceDoc.styleSheets).forEach(styleSheet => {
      if (styleSheet.cssRules) { // for <style> elements
        const newStyleEl = sourceDoc.createElement('style');

        Array.from(styleSheet.cssRules).forEach(cssRule => {
          // write the text of each rule into the body of the style element
          newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
        });

        targetDoc.head.appendChild(newStyleEl);
      } else if (styleSheet.href) { // for <link> elements loading CSS from a URL
        const newLinkEl = sourceDoc.createElement('link');

        newLinkEl.rel = 'stylesheet';
        newLinkEl.href = styleSheet.href;
        targetDoc.head.appendChild(newLinkEl);
      }
    });
  }
</script>

<script>
  import { onMount, onDestroy } from 'svelte'
  let windowRef
  let portal
  let ref
  
  onMount(() => {
    portal = document.createElement('div')
    portal.style.display = 'inline-block'
    portal.className = 'portal'

    windowRef = window.open('about:blank', 'windowPortal')
    windowRef.document.body.appendChild(portal)
    portal.appendChild(ref)

    copyStyles(document, windowRef.document)

    const { clientWidth, clientHeight } = ref
    const code = `
      requestAnimationFrame(() => {
        window.require('electron').remote.getCurrentWindow().setSize(${clientWidth}, ${clientHeight});
      })
    `
    const script = windowRef.document.createElement('script')
    script.innerHTML = code
    windowRef.document.body.appendChild(script)
  })
  
  onDestroy(() => {
    if (windowRef) {
      windowRef.close()
    }
  })
  
</script>
