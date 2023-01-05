import {
  isReady,
  shutdown,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  Reducer,
} from 'snarkyjs';

import { RequestSignUp } from './RequestSignUp.js';

let proofsEnabled = true;

describe('RequestSignUp', () => {
  let deployerAccount: PrivateKey,
    zkAppAddress: PublicKey,
    zkappKey: PrivateKey,
    zkApp: RequestSignUp,
    user1Account: PrivateKey,
    user2Account: PrivateKey;

  beforeAll(async () => {
    await isReady;
    if (proofsEnabled) RequestSignUp.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    deployerAccount = Local.testAccounts[0].privateKey;
    zkappKey = PrivateKey.random();
    zkAppAddress = zkappKey.toPublicKey();
    zkApp = new RequestSignUp(zkAppAddress);
    user1Account = Local.testAccounts[1].privateKey;
    user2Account = Local.testAccounts[2].privateKey;
  });

  afterAll(() => {
    // `shutdown()` internally calls `process.exit()` which will exit the running Jest process early.
    // Specifying a timeout of 0 is a workaround to defer `shutdown()` until Jest is done running all tests.
    // This should be fixed with https://github.com/MinaProtocol/mina/issues/10943
    setTimeout(shutdown, 0);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy({ zkappKey });
    });
    await txn.prove();
    await txn.send();
  }

  it('successfully deploys the `RequestSignUp` smart contract', async () => {
    await localDeploy();
    const startOfAllActions = zkApp.startOfAllActions.get();

    expect(startOfAllActions).toEqual(Reducer.initialActionsHash);
  });

  it('emits sign-up request action when the `requestSignUp` method is executed', async () => {
    await localDeploy();

    const txn1 = await Mina.transaction(user1Account, () => {
      zkApp.requestSignUp(user1Account.toPublicKey());
    });
    await txn1.prove();
    await txn1.sign([user1Account]).send();

    const actions2D = zkApp.reducer.getActions({
      fromActionHash: zkApp.startOfAllActions.get(),
    });
    const actions = actions2D.flat();
    expect(actions.length).toEqual(1);
  });

  it('emits 2 sign-up request actions when the `requestSignUp` method is executed 2 times with different accounts', async () => {
    await localDeploy();

    const txn1 = await Mina.transaction(user1Account, () => {
      zkApp.requestSignUp(user1Account.toPublicKey());
    });
    await txn1.prove();
    await txn1.sign([user1Account]).send();

    const txn2 = await Mina.transaction(user2Account, () => {
      zkApp.requestSignUp(user2Account.toPublicKey());
    });
    await txn2.prove();
    await txn2.sign([user2Account]).send();

    const actions2D = zkApp.reducer.getActions({
      fromActionHash: zkApp.startOfAllActions.get(),
    });
    const actions = actions2D.flat();
    expect(actions.length).toEqual(2);
  });

  it('throws an error when a `requestSignUp` transaction is not signed by the account requesting to sign-up', async () => {
    await localDeploy();

    const txn1 = await Mina.transaction(user1Account, () => {
      zkApp.requestSignUp(user1Account.toPublicKey());
    });
    await txn1.prove();

    expect(async () => {
      await txn1.send();
    }).rejects.toThrowError('private key is missing');
  });

  it('throws an error when `requestSignUp` is called with an account already requested to be signed-up', async () => {
    await localDeploy();

    const txn1 = await Mina.transaction(user1Account, () => {
      zkApp.requestSignUp(user1Account.toPublicKey());
    });
    await txn1.prove();
    await txn1.sign([user1Account]).send();

    expect(async () => {
      await Mina.transaction(user1Account, () => {
        zkApp.requestSignUp(user1Account.toPublicKey());
      });
    }).rejects.toThrowError('assert_equal: 1 != 0');
  });
});
