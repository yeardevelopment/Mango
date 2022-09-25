import { UserContextType } from '../typings/UserContext';

export class UserContext {
  constructor(commandOptions: UserContextType) {
    Object.assign(this, commandOptions);
  }
}
