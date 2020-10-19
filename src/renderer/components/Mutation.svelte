<style lang="scss">
  :global(.icon) {
    margin-top: 15px;
  }
  :global(.actions) {
    display: flex;
    align-items: center;
  }
  .notifications {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
  }
</style>
<script>
  import { writable } from 'svelte/store'
  import { ipcRenderer, remote } from 'electron'
  // import { TextInput, Form, Button, Icon } from 'carbon-components-svelte'
  import { Form } from 'carbon-components-svelte/src/Form'
  import { TextInput } from 'carbon-components-svelte/src/TextInput'
  import { Button } from 'carbon-components-svelte/src/Button'
  import { FormGroup } from 'carbon-components-svelte/src/FormGroup'
  import { Icon } from 'carbon-components-svelte/src/Icon'
  import { Select, SelectItem } from 'carbon-components-svelte/src/Select'
  import { Grid, Row, Column } from 'carbon-components-svelte/src/Grid'
  import { ToastNotification } from 'carbon-components-svelte/src/Notification'

  import Add32 from 'carbon-icons-svelte/lib/Add32'
  import CheckboxUndeterminate24 from 'carbon-icons-svelte/lib/CheckboxUndeterminate24'

  import { Runes, Rune } from '../../constants/rune'

  const runes = writable([1])
  let notifications = []
  let name = ''
  let level = 1

  function handleSubmit() {
    ipcRenderer.invoke(
      `db-upsert-${remote.getCurrentWindow().id}`,
      'items',
      {
        name,
        level: Number(level),
        runes: [...$runes]
      }
    ).then(() => {
      notifications = [...notifications, {
        title: 'Successfully upsert item',
        caption: name,
        kind: 'success',
      }]
      runes.set([1])
      name = ''
      level = 1
    })
  }
</script>

<div class="notifications">
  {#each notifications as noti, index}
    <ToastNotification
      {...noti}
      notificationType="toast"
      timeout={2000}
      on:close={() => {
        notifications = [
          ...notifications.slice(0, index),
          ...notifications.slice(index + 1),
        ]
      }}
    />
  {/each}
</div>

<Form on:submit={handleSubmit}>
  <Grid>
    <FormGroup>
      <Column>
        <Row xs={2}>
          <TextInput labelText="Rune Word Name" bind:value={name} required={true}/>
        </Row>
      </Column>
    </FormGroup>
    <FormGroup>
      <Column>
        <Row xs={2}>
          <TextInput
            labelText="Required Level"
            bind:value={level}
            required={true}
            type="number"
          />
        </Row>
      </Column>
    </FormGroup>
    <FormGroup>
      {#each $runes as rune, index}
        <Row>
          <Column xs={3}>
            <Select
              size="xl"
              labelText="Rune Name"
              selected={rune}
              required={true}
              on:change={(e) => {
                if (!e.detail) { return }
                const val = Number(e.detail)
                runes.update(items => {
                  return [
                    ...items.slice(0, index),
                    val,
                    ...items.slice(index + 1),
                  ]
                })
              }}
            >
              <SelectItem value="0" text="Select a Rune" hidden/>
              {#each Runes as rune}
                <SelectItem value={rune} text={`${Rune[rune]} (${rune})`} />
              {/each}
            </Select>
          </Column>
          <Column xs={1} class="actions">
            <Icon render={CheckboxUndeterminate24} class="icon" on:click={() => {
              runes.update(items => [
                ...items.slice(0, index),
                ...items.slice(index + 1),
              ])
            }}/>
          </Column>
        </Row>
      {/each}
      <Button icon={Add32} size="small" kind="secondary" class="icon" on:click={() => {
        runes.update(items => [
          ...items,
          1,
        ])
      }}>Add</Button>
    </FormGroup>
    <Row>
      <Column sm={1}>
        <Button type="submit">Submit</Button>
      </Column>
    </Row>
  
  </Grid>
</Form>
