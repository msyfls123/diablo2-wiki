<style type="scss">
  :root {
    --unique: goldenrod;
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
  import { writable } from 'svelte/store'
  import { Subject } from 'rxjs'
  import {
    debounceTime,
    distinctUntilChanged,
  } from 'rxjs/operators'
  import { ipcRenderer } from 'electron'
  import Query from './Query.svelte'
  import Mutation from './Mutation.svelte'
  import { Accordion, AccordionItem } from 'carbon-components-svelte/src/Accordion'
  import type { RuneItem } from '@src/constants/rune'
  import { Button } from 'carbon-components-svelte/src/Button'
  import Portal from './Portal.svelte'

  let year: number = 0
  let messages = []
  let showModal = false
  export let name: string
  const currentRuneWord = writable<RuneItem | null>(null)

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
    <AccordionItem title="Open New Window" open>
      <Button on:click={() => {
        showModal = !showModal
      }}>
        {showModal ? 'Hide' : 'Show'} New Window
      </Button>
      {#if showModal}
        <Portal>
          <Button on:click={() => {
            showModal = false
          }}>Close</Button>
        </Portal>
      {/if}
    </AccordionItem>
    <AccordionItem title="Introduction">
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
    <AccordionItem title="Info">
      <ul>
        {#each messages as msg}
          <li>{JSON.stringify(msg)}</li>
        {/each}
      </ul>
    </AccordionItem>
  
    <AccordionItem title="Mutation" open>
      <Mutation selected={currentRuneWord}/>
    </AccordionItem>
    <AccordionItem title="Query" open>
      <Query
        on:select-item={(e) => {
          currentRuneWord.set(e.detail)
        }}
      />
    </AccordionItem>
  </Accordion>
</main>
