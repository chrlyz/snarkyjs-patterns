import {
  Field,
  SmartContract,
  method,
  DeployArgs,
  Permissions,
  isReady,
  Reducer,
  State,
  state,
  Circuit,
} from 'snarkyjs';

await isReady;

export class RevealIfMatch extends SmartContract {
  reducer = Reducer({ actionType: Field });

  @state(Field) currentActionHash = State<Field>();
  @state(Field) revealedSecretNumber = State<Field>();
  /* This number is publicly on-chain and not a secret. This example is
   * to explore the behavior of Circuit.if used withing the reduce method.
   */
  @state(Field) secretNumber = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
    });
    this.currentActionHash.set(Reducer.initialActionsHash);
    this.revealedSecretNumber.set(Field(0));
    this.secretNumber.set(Field(2));
  }

  @method guessNumber(guess: Field) {
    this.reducer.dispatch(guess);
  }

  @method revealIfCorrectGuess() {
    const currentActionHash = this.currentActionHash.get();
    this.currentActionHash.assertEquals(currentActionHash);

    const secretNumber = this.secretNumber.get();
    this.secretNumber.assertEquals(secretNumber);

    const actions = this.reducer.getActions({
      fromActionHash: currentActionHash,
    });

    /* Surprisingly the reduce method returns the value for when
     * isCorrectGuess is true, instead of just the last returned
     * value from Circuit.if (since it should overwrite the value
     * of the accumulator in each iteration).
     */

    let { state: finalState, actionsHash } = this.reducer.reduce(
      actions,
      Field,
      (state, action) => {
        let isCorrectGuess = action.equals(secretNumber);

        return Circuit.if(isCorrectGuess, action, state);
      },
      { state: Field(0), actionsHash: currentActionHash }
    );

    this.revealedSecretNumber.set(finalState);
    this.currentActionHash.set(actionsHash);
  }
}
