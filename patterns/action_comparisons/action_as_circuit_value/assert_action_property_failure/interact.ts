
import { Mina,
  PrivateKey,
  shutdown,
  isReady,
  AccountUpdate } from 'snarkyjs';

import { TestAssertEquals } from './TestAssertEquals.js'

await isReady;

let Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);

let account0PrivateKey = Local.testAccounts[0].privateKey;

let zkappKey = PrivateKey.random();
let zkappAddress = zkappKey.toPublicKey();

let testZkApp = new TestAssertEquals(zkappAddress);

console.log('Compiling TestAssertEquals with actionType as CircuitValue...');
await TestAssertEquals.compile();



console.log('Creating deploy transaction...');
let deployTx = await Mina.transaction(account0PrivateKey, () => {
  AccountUpdate.fundNewAccount(account0PrivateKey);
  testZkApp.deploy({ zkappKey });
});
console.log('Proving deployTx...');
await deployTx.prove();
console.log('Sending deployTx transaction...');
await deployTx.send();



console.log('Creating emitAction transaction...');
let emitActionTx = await Mina.transaction(account0PrivateKey, () => {
  testZkApp.emitAction();
});
console.log('Proving emitActionTx...');
await emitActionTx.prove();
console.log('Sending emitActionTx transaction...');
await emitActionTx.send();



console.log('Creating assertEquality transaction...');
let assertEqualityTx = await Mina.transaction(account0PrivateKey, () => {
  testZkApp.assertEquality();
});
console.log('Proving assertEqualityTx...');
await assertEqualityTx.prove();
console.log('Sending assertEqualityTx transaction...');
await assertEqualityTx.send();

shutdown();