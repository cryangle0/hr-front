let clientId;
let ws;

export function connectWebSocket(initialClientId, messageCallback) {
  clientId = initialClientId;
  ws = new WebSocket(`wss://zoukaixin.cn/websocket/ws?clientId=${clientId}`);

  ws.onopen = function () {
    console.log('WebSocket connection established with clientId:', clientId);
  };

  ws.onmessage = function (event) {
    const parsedData = JSON.parse(event.data);
    console.log('Received message:', parsedData);  // 打印所有接收到的信息
    if (parsedData.type === 'prompt') {
      messageCallback(parsedData);
    }
  };

  ws.onclose = function () {
    console.log('WebSocket connection closed');
  };

  ws.onerror = function (error) {
    console.error('WebSocket error:', error);
  };
}

export function closeWebSocket() {
  if (ws) {
    ws.close();
  }
}
