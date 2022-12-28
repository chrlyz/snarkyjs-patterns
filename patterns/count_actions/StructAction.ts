import {
    Field,
    Poseidon,
    Struct
  } from 'snarkyjs';

export class StructAction extends Struct ({field: Field}) {

  static new(): StructAction {
    return new StructAction({field: Field(0)});
  }

  hash(): Field {
    return Poseidon.hash(this.field.toFields());
  }
}