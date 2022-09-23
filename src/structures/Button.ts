import { ButtonType } from '../typings/Button';

export class Button {
  constructor(buttonOptions: ButtonType) {
    Object.assign(this, buttonOptions);
  }
}
