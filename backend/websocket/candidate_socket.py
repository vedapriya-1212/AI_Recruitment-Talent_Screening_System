from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict, List, Optional
import json
import os
from jose import jwt
from auth import SECRET_KEY, ALGORITHM

router = APIRouter(tags=["WebSocket"])

class ConnectionManager:
    def __init__(self):
        # Maps candidate_id (user UUID) to a list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, candidate_id: str, websocket: WebSocket):
        await websocket.accept()
        if candidate_id not in self.active_connections:
            self.active_connections[candidate_id] = []
        self.active_connections[candidate_id].append(websocket)
        print(f"WebSocket: Candidate {candidate_id} connected. Active links: {len(self.active_connections[candidate_id])}")

    def disconnect(self, candidate_id: str, websocket: WebSocket):
        if candidate_id in self.active_connections:
            if websocket in self.active_connections[candidate_id]:
                self.active_connections[candidate_id].remove(websocket)
            if not self.active_connections[candidate_id]:
                del self.active_connections[candidate_id]
        print(f"WebSocket: Candidate {candidate_id} disconnected.")

    async def send_personal_message(self, message: dict, candidate_id: str):
        """
        Push real-time update event to a specific candidate's connected devices.
        """
        if candidate_id in self.active_connections:
            print(f"WebSocket: Broadcasting event to candidate {candidate_id} -> {message.get('event')}")
            for connection in self.active_connections[candidate_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"WebSocket: Failed to push message: {e}")

manager = ConnectionManager()

@router.websocket("/ws/candidate-dashboard")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = Query(None)):
    candidate_id = None
    
    # 1. Parse token query parameter
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            candidate_id = payload.get("sub")
        except Exception as e:
            print(f"WebSocket auth failed: {e}")
            
    # 2. Fallback to demo user if unauthenticated (helps visual debug and testing)
    if not candidate_id:
        candidate_id = "f0492b2f-04b5-434f-ad9e-16cc1e159318"
        print(f"WebSocket initialized in anonymous mode. Defaulting channel mapping to: {candidate_id}")
        
    await manager.connect(candidate_id, websocket)
    
    try:
        # Send initial success signal
        await websocket.send_json({
            "event": "CONNECTED",
            "message": "Neural WebSocket Core Sync established."
        })
        
        while True:
            # Handle incoming signals (e.g. ping commands)
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("command") == "PING":
                    await websocket.send_json({
                        "event": "PONG",
                        "message": "Keep-alive acknowledged."
                    })
            except Exception:
                # Echo raw text if not json
                await websocket.send_json({
                    "event": "ECHO",
                    "data": data
                })
    except WebSocketDisconnect:
        manager.disconnect(candidate_id, websocket)
