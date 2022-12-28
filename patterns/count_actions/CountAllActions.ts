import { Field,
    SmartContract,
    state,
    State,
    method,
    DeployArgs,
    Permissions, 
    isReady,
    Reducer } from 'snarkyjs'
  
  import { StructAction } from './StructAction.js'
  
  await isReady
  
  export class CountAllActions extends SmartContract {
  
    reducer = Reducer({actionType: StructAction})
    @state(Field) initialActionsHash = State<Field>()
  
    deploy(args: DeployArgs) {
      super.deploy(args)
      this.setPermissions({
        ...Permissions.default()
      })
      this.initialActionsHash.set(Reducer.initialActionsHash)
    }
  
    @method emitAction() {
      let action: StructAction = StructAction.new()
      this.reducer.dispatch(action)
    }


  @method countAllActions () {

    let initialActionsHash = this.initialActionsHash.get()
    this.initialActionsHash.assertEquals(initialActionsHash)

    let actions = this.reducer.getActions({
      fromActionHash: initialActionsHash,
    })

    let { state } = this.reducer.reduce(
      actions,
      Field,
      (state: Field)  => state.add(1),
      { state: Field(0), actionsHash: initialActionsHash }
    )

    return { state }
  }
}