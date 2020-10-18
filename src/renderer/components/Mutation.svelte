<style lang="scss">
  :global(.icon) {
    margin-top: 30px;
  }
</style>
<script>
  import { Runes, Rune } from '../../constants/rune'
  import { writable } from 'svelte/store'
  // import { TextInput, Form, Button, Icon } from 'carbon-components-svelte'
  import { Form } from 'carbon-components-svelte/src/Form'
  import { Button } from 'carbon-components-svelte/src/Button'
  import { FormGroup } from 'carbon-components-svelte/src/FormGroup'
  import { Icon } from 'carbon-components-svelte/src/Icon'
  import { Select, SelectItem } from 'carbon-components-svelte/src/Select'
  import { Grid, Row, Column } from 'carbon-components-svelte/src/Grid'
  import Add32 from 'carbon-icons-svelte/lib/Add32'
  const runes = writable([undefined])
</script>

<Form on:submit={(e) => { console.log(e.target)}}>
  <Grid>
    {#each $runes as rune, index}
      <FormGroup>
        <Row>
          <Column xs={3}>
            <Select
              size="xl"
              labelText="Rune Name"
              selected={rune}
              required={true}
              on:change={(e) => {
                if (!e.currentTarget) { return }
                const val = Number(e.currentTarget.value)
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
          <Column xs={1}>
            <Icon render={Add32} class="icon" on:click={() => {
              runes.update(items => [
                ...items.slice(0, index + 1),
                undefined,
                ...items.slice(index + 1),
              ])
            }}/>
          </Column>
        </Row>
      </FormGroup>
    {/each}
  <Row>
    <Column sm={{ span: 1, offset: 3 }}>
      <Button type="submit">Submit</Button>
    </Column>
  </Row>
  
  </Grid>
</Form>
