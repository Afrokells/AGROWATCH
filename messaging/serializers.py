from rest_framework import serializers
from .models import ChatThread, Message, Notification


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'thread', 'sender', 'sender_name', 'body', 'is_read', 'created_at']
        read_only_fields = ['sender', 'created_at']

    def get_sender_name(self, obj):
        return obj.sender.full_name or obj.sender.phone_number


class ChatThreadSerializer(serializers.ModelSerializer):
    buyer_name = serializers.SerializerMethodField()
    seller_name = serializers.SerializerMethodField()
    listing_crop = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatThread
        fields = [
            'id', 'buyer', 'seller', 'listing',
            'buyer_name', 'seller_name', 'listing_crop',
            'last_message', 'unread_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_buyer_name(self, obj):
        return obj.buyer.full_name or obj.buyer.phone_number

    def get_seller_name(self, obj):
        return obj.seller.full_name or obj.seller.phone_number

    def get_listing_crop(self, obj):
        return obj.listing.crop_type if obj.listing else None

    def get_last_message(self, obj):
        msg = obj.messages.last()
        if msg:
            return {'body': msg.body, 'created_at': msg.created_at, 'sender_name': msg.sender.full_name or msg.sender.phone_number}
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0


class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'sender_name', 'thread', 'notif_type', 'message', 'is_read', 'created_at']

    def get_sender_name(self, obj):
        if obj.sender:
            return obj.sender.full_name or obj.sender.phone_number
        return 'System'
