<script lang='ts'>
  import { ipcRenderer, remote } from 'electron'
  import { Rune } from '../../constants/rune'
  import { writable } from 'svelte/store'

  const genQuery = (runeNo) => ({
    selector: {
      runes: {
        $elemMatch: runeNo ? { $eq: runeNo } : {},
      },
    },
    // limit: 2,
  })
  const runeNumber = writable(7)
  let currentKey = null
  let list: Array<{
    name: string
    level: number
    runes: Rune[]
  }> = []
  
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
  
</script>

<label>
  Which rune do you have?
  <input type="number" min={0} value={$runeNumber} on:input={(e) => {
    runeNumber.set(Number(e.currentTarget.value))
  }}/>
</label>
<ul>
  {#each list as msg}
    <li>
      <h4>{msg.name}</h4>
      {#each msg.runes as r, index}
        {#if index > 0}
          ,&nbsp;
        {/if}
        <span>{Rune[r]}({r})</span>
      {/each}
      <div>Required Level: {msg.level}</div>
    </li>
  {/each}
</ul>
