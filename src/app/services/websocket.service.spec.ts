import { WebsocketEvent, WebsocketService } from './websocket.service';

describe('WebsocketService', () => {
  let websocketService;

  beforeEach(() => {
    websocketService = new WebsocketService();
  });

  describe('#onEvent', () => {
    it('should return new observable', () => {
      const result = websocketService.onEvent(WebsocketEvent.DataProductUpdate);
      expect(result.subscribe).toBeDefined();
    });
  });
});
