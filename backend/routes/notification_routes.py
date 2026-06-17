from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from auth import get_current_candidate
from database import supabase
from schemas import NotificationResponse, NotificationReadRequest

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(current_user: dict = Depends(get_current_candidate)):
    """
    Retrieve all notifications for the logged-in candidate.
    """
    user_id = current_user["id"]
    try:
        res = (
            supabase.table("notifications")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        
        notifications = []
        for n in (res.data or []):
            notifications.append(NotificationResponse(
                id=n["id"],
                title=n.get("title") or "Update",
                message=n.get("message") or "",
                type=n.get("type") or "info",
                is_read=n.get("is_read", False),
                created_at=n.get("created_at")
            ))
            
        return notifications
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to query notifications: {str(e)}"
        )

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: str,
    payload: NotificationReadRequest,
    current_user: dict = Depends(get_current_candidate)
):
    """
    Mark a notification as read/unread.
    """
    user_id = current_user["id"]
    try:
        # Check ownership
        check_res = supabase.table("notifications").select("user_id").eq("id", notification_id).execute()
        if not check_res.data:
            raise HTTPException(
                status_code=404,
                detail="Notification not found"
            )
            
        if check_res.data[0]["user_id"] != user_id:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to modify this notification"
            )

        # Update read status
        update_res = (
            supabase.table("notifications")
            .update({"is_read": payload.is_read})
            .eq("id", notification_id)
            .execute()
        )
        
        if not update_res.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to update notification state"
            )
            
        n = update_res.data[0]
        return NotificationResponse(
            id=n["id"],
            title=n.get("title") or "Update",
            message=n.get("message") or "",
            type=n.get("type") or "info",
            is_read=n.get("is_read", False),
            created_at=n.get("created_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database update failed: {str(e)}"
        )

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: str, current_user: dict = Depends(get_current_candidate)):
    """
    Dismiss / delete a notification.
    """
    user_id = current_user["id"]
    try:
        # Check ownership
        check_res = supabase.table("notifications").select("user_id").eq("id", notification_id).execute()
        if not check_res.data:
            raise HTTPException(
                status_code=404,
                detail="Notification not found"
            )
            
        if check_res.data[0]["user_id"] != user_id:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to delete this notification"
            )

        # Delete
        supabase.table("notifications").delete().eq("id", notification_id).execute()
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete notification: {str(e)}"
        )
