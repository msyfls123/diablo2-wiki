<!-- 
  https://medium.com/hackernoon/using-a-react-16-portal-to-do-something-cool-2a2d627b0202
  https://stackoverflow.com/questions/62733094/implement-a-portal-in-svelte
  https://stackoverflow.com/questions/58187495/create-window-with-attached-svelte-component-and-in-the-same-javascript-context
-->
<div bind:this={portal} class="portal">
  <slot></slot>
</div>

<style>
  .portal { display: inline-block; }
</style>

<script context="module" lang="ts">
  function copyStyles(sourceDoc: Document, targetDoc: Document) {
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

<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type Electron from 'electron'

  type PortalWindow = Window & {
    require: (...args: any) => {
      remote: Electron.Remote
    }
  }
  let windowRef: PortalWindow
  let portal: HTMLDivElement
  
  onMount(() => {
    windowRef = window.open('about:blank', 'windowPortal') as unknown as PortalWindow
    copyStyles(document, windowRef.document)
    windowRef.document.body.appendChild(portal)

    const { clientWidth, clientHeight } = portal
    windowRef.requestAnimationFrame(() => {
      const { remote } = windowRef.require('electron')
      const win = remote.getCurrentWindow()
      const workArea = remote.screen.getDisplayNearestPoint(remote.screen.getCursorScreenPoint()).bounds
      win.showInactive();
      win.setPosition(workArea.x + 50, workArea.y + 50);
      win.setSize(clientWidth, clientHeight);
    })
  })
  
  onDestroy(() => {
    if (windowRef) {
      windowRef.close()
    }
  })
  
</script>
