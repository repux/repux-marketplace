import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { environment } from '../../environments/environment';
import * as socketIo from 'socket.io-client';

export enum WebsocketEvent {
  DataProductUpdate = 'dataProductUpdate'
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private _socket;

  constructor() {
    this._socket = socketIo(environment.websocketServer, {
      transports: [ 'websocket' ]
    });
  }

  public onEvent(eventName: string): Observable<any> {
    return new Observable<any>((observer: Observer<any>) => {
      this._socket.on(eventName, data => observer.next(data));
    });
  }
}
