
import { Mina,
  PrivateKey,
  shutdown,
  isReady,
  AccountUpdate } from 'snarkyjs';

import { CountAllActions } from './CountAllActions.js'

await isReady;

let Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);

let account0PrivateKey = Local.testAccounts[0].privateKey;

let zkappKey = PrivateKey.random();
let zkappAddress = zkappKey.toPublicKey();

let testZkApp = new CountAllActions(zkappAddress);

console.log('Compiling CountAllActions...');
await CountAllActions.compile();



console.log('Creating deploy transaction...');
let deployTx = await Mina.transaction(account0PrivateKey, () => {
  AccountUpdate.fundNewAccount(account0PrivateKey);
  testZkApp.deploy({ zkappKey });
});
console.log('Proving deployTx...');
await deployTx.prove();
console.log('Sending deploy transaction...');
await deployTx.send();



console.log('Creating emitActionTx1 transaction...');
let emitActionTx1 = await Mina.transaction(account0PrivateKey, () => {
  testZkApp.emitAction();
});
console.log('Proving emitActionTx1...');
await emitActionTx1.prove();
console.log('Sending emitActionTx1 transaction...');
await emitActionTx1.send();



console.log('Creating emitActionTx2 transaction...');
let emitActionTx2 = await Mina.transaction(account0PrivateKey, () => {
  testZkApp.emitAction();
});
console.log('Proving emitActionTx2...');
await emitActionTx2.prove();
console.log('Sending emitActionTx2 transaction...');
await emitActionTx2.send();



let { state } = testZkApp.countAllActions();
console.log('The number of actions is: ' + state);



shutdown();