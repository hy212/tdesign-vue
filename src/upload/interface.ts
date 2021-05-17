import { UploadFile } from '../../types/upload/TdUploadProps';

export interface XhrOptions {
  action: string;
  withCredentials: boolean;
  headers: { [key: string]: string };
  data: { [key: string]: any } | Function;
  file: UploadFile;
  name: string;
  onError: ({ event, file, response }: { event: ProgressEvent; file?: UploadFile; response?: any }) => void;
  onSuccess: (context: SuccessContext) => void;
  onProgress: (context: ProgressContext) => void;
};

export interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
};

export interface ProgressContext {
  event: ProgressEvent;
  file: UploadFile;
  percent: number;
};

export interface SuccessContext {
  event: ProgressEvent;
  file: UploadFile;
  response: any;
};

export interface RemoveOptions { e: MouseEvent; file?: UploadFile; index: number };

export interface FlowRemoveContext {
  e: MouseEvent;
  index: number;
  file: UploadFile;
};
