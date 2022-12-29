import { Field, Poseidon, PublicKey, Struct } from 'snarkyjs';

export class Account extends Struct({
  publicKey: PublicKey,
}) {
  static new(publicKey: PublicKey): Account {
    return new Account({
      publicKey: publicKey,
    });
  }

  hash(): Field {
    return Poseidon.hash(this.publicKey.toFields());
  }
}
