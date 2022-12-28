import {
    Field,
    CircuitValue,
    prop,
    Poseidon
  } from 'snarkyjs';

export class Action extends CircuitValue {
    @prop field: Field;

    constructor(
      field: Field,
    ) {
      super();
      this.field = field;
    }
  
    static new(): Action {
      return new Action(Field(0));
    }

    hash(): Field {
      return Poseidon.hash(this.field.toFields());
    }
  }