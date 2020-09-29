import Toolbar from '../components/Toolbar.svelte'

new Toolbar({
  target: document.getElementById('main'),
  props: {
    name: 'Diablo'
  },
})
