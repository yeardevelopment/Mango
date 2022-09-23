import { ModalType } from '../typings/Modal';

export class Modal {
  constructor(modalOptions: ModalType) {
    Object.assign(this, modalOptions);
  }
}
