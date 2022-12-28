import { Field,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Permissions, 
  isReady,
  Reducer} from 'snarkyjs';

import { Action } from './Action.js';

await isReady;

const ID = Field(1);

export class TestAssertEquals extends SmartContract {
  
  reducer = Reducer({actionType: Action});
  @state(Field) startOfActionsRange = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default()
    });
    this.startOfActionsRange.set(Reducer.initialActionsHash);
  }

  @method emitAction() {
    let action: Action = Action.new();
    action.field = ID;
    this.reducer.dispatch(action);
  }

  /* Apparently this fails because the compiler tries to assert
  the equality of the action's property value, that is only available
  at runtime and not at compile time */

  @method assertEquality() {

    let startOfActionsRange = this.startOfActionsRange.get();
    this.startOfActionsRange.assertEquals(startOfActionsRange);

    let actions2D: Action[][] = this.reducer.getActions({
      fromActionHash: startOfActionsRange,
    })

    let actions: Action[] = actions2D.flat();
    let action: Action = actions[0];

    action.field.assertEquals(ID);
  }
}
