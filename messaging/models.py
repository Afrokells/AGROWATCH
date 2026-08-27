from django.db import models
from django.conf import settings


class ChatThread(models.Model):
    """A conversation between a buyer and a seller, tied to a market listing."""
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='buyer_threads'
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='seller_threads'
    )
    listing = models.ForeignKey(
        'market.MarketListing', on_delete=models.SET_NULL, null=True, blank=True, related_name='threads'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('buyer', 'seller', 'listing')
        ordering = ['-updated_at']

    def __str__(self):
        return f"Thread: {self.buyer} <-> {self.seller}"


class Message(models.Model):
    """A single message in a ChatThread."""
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages'
    )
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender} in Thread #{self.thread.id}"


class Notification(models.Model):
    """A notification for a user about a new message or event."""
    NOTIF_TYPES = (
        ('new_message', 'New Message'),
        ('enquiry', 'New Enquiry'),
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications'
    )
    thread = models.ForeignKey(
        ChatThread, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications'
    )
    notif_type = models.CharField(max_length=30, choices=NOTIF_TYPES, default='new_message')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient}: {self.message}"
