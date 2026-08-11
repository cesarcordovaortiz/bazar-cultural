import type { Message } from '../types';

const STORAGE_KEY = 'bazar_messages_v1';
const CHANGE_EVENT = 'bazar-messages-changed';

export function readAllMessages(): Message[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return (value ? JSON.parse(value) as Message[] : []).sort((first, second) => first.createdAt - second.createdAt);
  } catch {
    return [];
  }
}

export function readMessages(orderId: string): Message[] {
  return readAllMessages().filter((message) => message.orderId === orderId);
}

export function sendMessage(message: Message): void {
  const value = localStorage.getItem(STORAGE_KEY);
  const messages = value ? JSON.parse(value) as Message[] : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...messages, message]));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeMessages(listener: () => void): () => void {
  const handleChange = (): void => listener();
  window.addEventListener(CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleChange);
  return (): void => {
    window.removeEventListener(CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleChange);
  };
}
