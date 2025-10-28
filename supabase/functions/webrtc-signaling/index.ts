import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";

    if (upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket connection", { status: 400 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Store connected clients
    const connectedClients = new Map<string, WebSocket>();
    
    socket.onopen = () => {
      console.log("WebRTC signaling client connected");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Signaling message:", message);

        switch (message.type) {
          case 'join-session':
            // Client joining a studio session
            connectedClients.set(message.sessionId, socket);
            socket.send(JSON.stringify({
              type: 'joined-session',
              sessionId: message.sessionId,
              peerId: message.peerId
            }));
            break;

          case 'offer':
          case 'answer':
          case 'ice-candidate':
            // Forward WebRTC signaling messages to other participants
            connectedClients.forEach((client, sessionId) => {
              if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
              }
            });
            break;

          case 'leave-session':
            // Client leaving session
            connectedClients.delete(message.sessionId);
            // Notify other participants
            connectedClients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'participant-left',
                  peerId: message.peerId
                }));
              }
            });
            break;

          default:
            console.log("Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebRTC signaling client disconnected");
      // Clean up client references
      connectedClients.forEach((client, sessionId) => {
        if (client === socket) {
          connectedClients.delete(sessionId);
        }
      });
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return response;

  } catch (error) {
    console.error("WebRTC signaling error:", error);
    return new Response(
      JSON.stringify({ error: 'WebRTC signaling failed' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});