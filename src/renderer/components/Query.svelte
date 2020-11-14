<script lang='ts'>
  import { ipcRenderer, remote } from 'electron'
  import { createEventDispatcher } from 'svelte'
  import { writable } from 'svelte/store'
  import { Rune } from '@src/constants/rune'
  import type { RuneItem } from '@src/constants/rune'

  const genQuery = (runeNo) => ({
    selector: {
      runes: {
        $elemMatch: runeNo ? { $eq: runeNo } : {},
      },
    },
    // limit: 2,
  })
  const dispatch = createEventDispatcher()
  const runeNumber = writable(7)
  let currentKey = null
  let list: Array<RuneItem> = []
  
  runeNumber.subscribe(current => {
    if (!Number.isSafeInteger(current)) { return }
    if (currentKey) {
      ipcRenderer.send('db-query-unsubscribe', currentKey)
      currentKey = null
      list = []
    }
    const query = genQuery(current)
    ipcRenderer.invoke(
      `db-query-${remote.getCurrentWindow().id}`,
      'items', query
    ).then(key => {
      currentKey = key
      ipcRenderer.on(key, (e, data) => {
        list = data
      })
    })
  })

  type InputEvent = Event & {
    target: EventTarget & HTMLInputElement
    currentTarget: EventTarget & HTMLInputElement
  }

  const handleInput = (e: InputEvent) => {
    runeNumber.set(Number(e.target.value))
  }
  
</script>

<label>
  Which rune do you have?
  <input type="number" min={0} value={$runeNumber} on:input={handleInput}/>
</label>
<ul class="runeword-list">
  {#each list as item}
    <li
      class="runeword-item"
      on:click={() => dispatch('select-item', item)}
    >
      <h4>{item.name}</h4>
      {#each item.runes as r, index}
        {#if index > 0}
          ,&nbsp;
        {/if}
        <span>{Rune[r]}({r})</span>
      {/each}
      <div>Required Level: {item.level}</div>
    </li>
  {/each}
</ul>

<style type="scss">
  .runeword-list {
    margin-top: 20px;
  }
  .runeword-item {
    padding: 15px 10px;
    border-bottom: thin solid #ddd;
    cursor: pointer;
    &:hover {
      background-color: rgba(#ddd, .4);
    }
    h4 {
      color: goldenrod;
    }
  }
</style>
