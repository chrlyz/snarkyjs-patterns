import { Mina, PrivateKey, shutdown, isReady, AccountUpdate } from 'snarkyjs';

import { RequestSignUp } from './RequestSignUp.js';

await isReady;

console.log('Compiling RequestSignUp...');
await RequestSignUp.compile();

let Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);

const account0PrivateKey = Local.testAccounts[0].privateKey;
const zkappKey = PrivateKey.random();
let zkApp = new RequestSignUp(zkappKey.toPublicKey());

console.log('Creating deploy transaction...');
let deploy = await Mina.transaction(account0PrivateKey, () => {
  AccountUpdate.fundNewAccount(account0PrivateKey);
  zkApp.deploy({ zkappKey });
});
console.log('Sending deploy transaction...');
await deploy.send();

const account1PrivateKey = Local.testAccounts[1].privateKey;

console.log('Creating requestSignUp0 transaction...');
let requestSignUp0 = await Mina.transaction(account1PrivateKey, () => {
  zkApp.requestSignUp(account1PrivateKey.toPublicKey());
});
console.log('Proving requestSignUp0 transaction...');
await requestSignUp0.prove();
console.log('Signing requestSignUp0 transaction...');
requestSignUp0.sign([account1PrivateKey]);
console.log('Sending requestSignUp0 transaction...');
await requestSignUp0.send();

const account2PrivateKey = Local.testAccounts[2].privateKey;

console.log('Creating requestSignUp1 transaction...');
let requestSignUp1 = await Mina.transaction(account2PrivateKey, () => {
  zkApp.requestSignUp(account2PrivateKey.toPublicKey());
});
console.log('Proving requestSignUp1 transaction...');
await requestSignUp1.prove();
console.log('Signing requestSignUp1 transaction...');
requestSignUp1.sign([account2PrivateKey]);
console.log('Sending requestSignUp1 transaction...');
await requestSignUp1.send();

console.log(
  'Trying to create requestSignUp transaction with a publicKey that already requested signing-up...'
);

try {
  await Mina.transaction(account1PrivateKey, () => {
    zkApp.requestSignUp(account1PrivateKey.toPublicKey());
  });
} catch (error) {
  console.log('Error was thrown as expected. Error thrown: ' + error);
}

const actions2D = zkApp.reducer.getActions({
  fromActionHash: zkApp.startOfAllActions.get(),
});
const actions = actions2D.flat();
actions.map((action) => console.log(action.publicKey.toBase58()));

shutdown();
