import { Field,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Permissions, 
  isReady,
  Reducer,
  Bool,
  Circuit } from 'snarkyjs';

import { StructAction } from './StructAction.js';

await isReady;

const ID = Field(1);

export class TestEquals extends SmartContract {

  reducer = Reducer({actionType: StructAction});
  @state(Field) startOfActionsRange = State<Field>();
  @state(Field) actionTurn = State<Field>();
  @state(Field) hashedAction = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature()
    });
    this.startOfActionsRange.set(Reducer.initialActionsHash);
    this.actionTurn.set(Field(0));
    this.hashedAction.set(Field(0));
  }

  @method emitAction() {
    let action: StructAction = StructAction.new();
    action.field = ID;
    this.reducer.dispatch(action);
  }

  @method isPropertyEqual() {

    this.requireSignature();

    let startOfActionsRange = this.startOfActionsRange.get();
    this.startOfActionsRange.assertEquals(startOfActionsRange);

    let actionTurn = this.actionTurn.get();
    this.actionTurn.assertEquals(actionTurn);

    let actions2D = this.reducer.getActions({
      fromActionHash: startOfActionsRange,
    })

    let actions = actions2D.flat();
    let mask: Bool[] = Array(actions.length).fill(Bool(false));
    mask = mask.map((_, i) => Field(i).equals(actionTurn));
    let action = Circuit.switch(mask, StructAction, actions);
    let typedAction: StructAction = new StructAction(action);

    /* This doesn't really work to conditionally execute one branch or
    the other, since Circuit.if executes both branches, so its proper use
    is just to get the value returned by one of the two branches */

    Circuit.if(
      typedAction.field.equals(ID),
      (() => {
        this.hashedAction.set(typedAction.hash());
        return Bool(true);
      })(),
      (() => {
        // DO NOTHING
        return Bool(false);
      })()
    );
  }
}
