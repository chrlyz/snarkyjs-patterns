
import { Mina,
  PrivateKey,
  shutdown,
  isReady,
  AccountUpdate } from 'snarkyjs';

import { TestEquals } from './TestEquals.js'

await isReady;

let Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);

let account0PrivateKey = Local.testAccounts[0].privateKey;

let zkappKey = PrivateKey.random();
let zkappAddress = zkappKey.toPublicKey();

let testZkApp = new TestEquals(zkappAddress);

console.log('Compiling TestEquals with actionType as CircuitValue...');
await TestEquals.compile();



console.log('Creating deploy transaction...');
let deployTx = await Mina.transaction(account0PrivateKey, () => {
  AccountUpdate.fundNewAccount(account0PrivateKey);
  testZkApp.deploy({ zkappKey });
});
console.log('Proving deployTx...');
await deployTx.prove();
console.log('Sending deploy transaction...');
await deployTx.send();



console.log('Creating emitActionTx transaction...');
let emitActionTx = await Mina.transaction(account0PrivateKey, () => {
  testZkApp.emitAction();
});
console.log('Proving emitActionTx...');
await emitActionTx.prove();
console.log('Sending emitActionTx transaction...');
await emitActionTx.send();



console.log('Creating isPropertyEqual transaction...');
let isPropertyEqualTx = await Mina.transaction(account0PrivateKey, () => {
  testZkApp.isPropertyEqual();
});
console.log('Proving isPropertyEqualTx...');
await isPropertyEqualTx.prove();
console.log('Signing isPropertyEqualTx...');
isPropertyEqualTx.sign([zkappKey]);
console.log('Sending isPropertyEqualTx transaction...');
await isPropertyEqualTx.send();

shutdown();