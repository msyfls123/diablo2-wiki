<script lang='ts'>
  import { ipcRenderer } from 'electron'
  import { Rune } from '../../constants/rune'

  const query = {
    selector: {
      runes: {
        $elemMatch: {
          $eq: 7
        }
      }
    },
    // limit: 2,
  }
  let list: Array<{
    name: string
    level: number
    runes: Rune[]
  }> = []
  ipcRenderer.invoke('db-query', 'items', query).then(key => {
    ipcRenderer.on(key, (e, data) => {
      list = data
    })
  })
</script>

<ul>
  {#each list as msg}
    <li>
      <h4>{msg.name}</h4>
      {#each msg.runes as r, index}
        {#if index > 0}
          ,&nbsp;
        {/if}
        <span>{Rune[r]}</span>
      {/each}
      <div>Need level: {msg.level}</div>
    </li>
  {/each}
</ul>
