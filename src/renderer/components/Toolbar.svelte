<style type="scss">
  :root {
    --unique: rgb(201, 104, 8, .46)
  }
  input {
    font-size: 20px;
  }
  h1 {
    color: var(--unique);
  }
  .test-bg {
    width: 150px;
    height: 90px;
    background: url(../images/test.jpg) no-repeat center / contain;
  }
  .test-main {
    padding: 25px;
  }
</style>

<script lang="ts">
  import { Subject } from 'rxjs'
  import {
    debounceTime,
    distinctUntilChanged,
  } from 'rxjs/operators'
  import { ipcRenderer } from 'electron'
  import Query from './Query.svelte'
  import Mutation from './Mutation.svelte'
  import { Accordion, AccordionItem } from 'carbon-components-svelte/src/Accordion'

  let year: number = 0
  let messages = []
  export let name: string

  const input$ = new Subject()
  const result$ = input$.pipe(
    debounceTime(1500),
    distinctUntilChanged()
  )

  ipcRenderer.on('tick', (e, msg) => {
    messages = [msg]
  })

  $: input$.next(year)
  $: {
    document.title = `${name} - Year ${year}`
  }
</script>

<main class='test-main'>
  <h1>Welcome to {name}!</h1>
  <Accordion>
    <AccordionItem title="Introduction" open>
      <label>
        How many years have you played Diablo series? 
        <input
          bind:value={year}
          type="number"
        />
      </label>
      <p>
        {#if $result$}
          {#if $result$ > 5}
            Oh! A long time!
          {:else}
            You need to play more!
          {/if}
        {:else}
          Input something!
        {/if}
      </p>
      <div class="test-bg"></div>
    </AccordionItem>
    <AccordionItem title="Info" open>
      <ul>
        {#each messages as msg}
          <li>{JSON.stringify(msg)}</li>
        {/each}
      </ul>
    </AccordionItem>
  
    <AccordionItem title="Mutation" open>
      <Mutation/>
    </AccordionItem>
    <AccordionItem title="Query" open>
      <Query/>
    </AccordionItem>
  </Accordion>
</main>
