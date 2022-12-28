import {
    Field,
    CircuitValue,
    prop
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
  }