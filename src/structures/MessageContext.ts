import { MessageContextType } from '../typings/MessageContext';

export class MessageContext {
  constructor(commandOptions: MessageContextType) {
    Object.assign(this, commandOptions);
  }
}
