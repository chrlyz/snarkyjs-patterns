import {
  isReady,
  shutdown,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  Field,
} from 'snarkyjs';

import { RevealIfMatch } from './RevealIfMatch.js';

let proofsEnabled = false;

describe('RevealIfMatch', () => {
  let deployerAccount: PrivateKey,
    zkAppAddress: PublicKey,
    zkappKey: PrivateKey,
    zkApp: RevealIfMatch,
    user1Account: PrivateKey;

  beforeAll(async () => {
    await isReady;
    if (proofsEnabled) RevealIfMatch.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    deployerAccount = Local.testAccounts[0].privateKey;
    zkappKey = PrivateKey.random();
    zkAppAddress = zkappKey.toPublicKey();
    zkApp = new RevealIfMatch(zkAppAddress);
    user1Account = Local.testAccounts[1].privateKey;
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

  test(`that revealedSecretNumber is set to secretNumber after one of 3 emitted actions
        contains a value equal to secretNumber `, async () => {
    await localDeploy();

    expect(zkApp.revealedSecretNumber.get()).toEqual(Field(0));

    const txn1 = await Mina.transaction(user1Account, () => {
      zkApp.guessNumber(Field(1));
    });
    await txn1.prove();
    await txn1.send();

    const txn2 = await Mina.transaction(user1Account, () => {
      zkApp.guessNumber(Field(2));
    });
    await txn2.prove();
    await txn2.send();

    const txn3 = await Mina.transaction(user1Account, () => {
      zkApp.guessNumber(Field(3));
    });
    await txn3.prove();
    await txn3.send();

    const txn4 = await Mina.transaction(user1Account, () => {
      zkApp.revealIfCorrectGuess();
    });
    await txn4.prove();
    await txn4.send();

    expect(zkApp.revealedSecretNumber.get()).toEqual(Field(2));
  });
});
