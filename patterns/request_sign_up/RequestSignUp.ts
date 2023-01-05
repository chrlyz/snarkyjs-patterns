import {
  Field,
  SmartContract,
  method,
  DeployArgs,
  Permissions,
  isReady,
  Reducer,
  PublicKey,
  State,
  state,
  Bool,
  AccountUpdate,
} from 'snarkyjs';

import { Account } from './Account.js';

await isReady;

export class RequestSignUp extends SmartContract {
  reducer = Reducer({ actionType: Account });

  @state(Field) startOfAllActions = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
    });
    this.startOfAllActions.set(Reducer.initialActionsHash);
  }

  @method requestSignUp(publicKey: PublicKey) {
    /*Require signature of the account requesting signing-up,
     *so only the user themselves can request to sign-up.
     */

    let accountUpdate = AccountUpdate.create(publicKey);
    accountUpdate.requireSignature();

    let account = Account.new(publicKey);

    /* Check all actions to see if the account isn't
     * registered already. If not, emit action representing
     * the request.
     */

    const startOfAllActions = this.startOfAllActions.get();
    this.startOfAllActions.assertEquals(startOfAllActions);

    const actions = this.reducer.getActions({
      fromActionHash: startOfAllActions,
    });

    let { state: exists } = this.reducer.reduce(
      actions,
      Bool,
      (state: Bool, action: { publicKey: PublicKey }) => {
        return action.publicKey.equals(account.publicKey).or(state);
      },
      { state: Bool(false), actionsHash: startOfAllActions }
    );

    exists.assertEquals(Bool(false));
    this.reducer.dispatch(account);
  }
}
