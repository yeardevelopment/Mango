import { ModalSubmitInteraction } from 'discord.js';
import { ExtendedClient } from '../structures/Client';

interface RunOptions {
  interaction: ModalSubmitInteraction;
  client: ExtendedClient;
}

type RunFunction = (options: RunOptions) => any;

export type ModalType = {
  id: string;
  run: RunFunction;
};
