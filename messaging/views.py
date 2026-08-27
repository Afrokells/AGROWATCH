from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import ChatThread, Message, Notification
from .serializers import ChatThreadSerializer, MessageSerializer, NotificationSerializer


class ChatThreadViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatThreadSerializer

    def get_queryset(self):
        user = self.request.user
        return ChatThread.objects.filter(Q(buyer=user) | Q(seller=user))

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        """
        Start a new conversation. Accepts: seller, listing, initial_message.
        If a thread already exists between this buyer and seller for this listing,
        it will reuse the existing thread and just post the new message.
        """
        seller_id = request.data.get('seller')
        listing_id = request.data.get('listing')
        initial_message = request.data.get('initial_message', '')

        if not seller_id or not initial_message:
            return Response({'error': 'seller and initial_message are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Find or create a thread
        thread, created = ChatThread.objects.get_or_create(
            buyer=request.user,
            seller_id=seller_id,
            listing_id=listing_id if listing_id else None
        )

        # Post the initial message
        msg = Message.objects.create(thread=thread, sender=request.user, body=initial_message)
        thread.save()  # Update updated_at timestamp

        # Create a notification for the seller
        Notification.objects.create(
            recipient_id=seller_id,
            sender=request.user,
            thread=thread,
            notif_type='enquiry',
            message=f"{request.user.full_name or request.user.phone_number} sent you a message about your listing."
        )

        serializer = self.get_serializer(thread)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Fetch all messages in a thread and mark them as read."""
        thread = self.get_object()
        # Mark messages sent by the other party as read
        thread.messages.exclude(sender=request.user).update(is_read=True)
        msgs = thread.messages.all()
        serializer = MessageSerializer(msgs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """Send a reply in an existing thread."""
        thread = self.get_object()
        body = request.data.get('body', '').strip()
        if not body:
            return Response({'error': 'Message body is required.'}, status=status.HTTP_400_BAD_REQUEST)

        msg = Message.objects.create(thread=thread, sender=request.user, body=body)
        thread.save()  # Update updated_at

        # Notify the other party
        recipient = thread.seller if request.user == thread.buyer else thread.buyer
        Notification.objects.create(
            recipient=recipient,
            sender=request.user,
            thread=thread,
            notif_type='new_message',
            message=f"{request.user.full_name or request.user.phone_number} replied to your conversation."
        )

        serializer = MessageSerializer(msg)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all of the user's notifications as read."""
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'ok'})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a single notification as read."""
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'ok'})
