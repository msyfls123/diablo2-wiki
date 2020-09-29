<style type="scss">
  :root {
    --unique: rgb(201, 104, 8, .46)
  }
  :global(html, body) {
    min-height: 100vh;
    background: rgb(27, 1, 1);
    color: #ddd;
  }
  input {
    font-size: 20px;
  }
  h1 {
    color: var(--unique);
  }
</style>

<script lang="ts">
  let year: number = 0
  export let name: string
  $: {
    document.title = `${name} - Year ${year}`
  }
</script>

<h1>Welcome to {name}</h1>
<label>
  How many years have you played Diablo series? 
  <input
    bind:value={year}
    type="number"
  />
</label>
