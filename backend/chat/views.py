from django.contrib.postgres.search import TrigramSimilarity
from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import OuterRef, Subquery, Q
from chat.models import Conversation
from friendship.models import Friendship
from authentication.models import User
from chat.models import Message
from rest_framework.pagination import PageNumberPagination
from .serializers import ConversationSerializer, UserSerializerOne

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from notification.models import Notifications
from rest_framework.decorators import api_view


class ChatConversation(APIView):
    def get(self, request):
        user_id = request.user.id

        latest_messages = Message.objects.filter(
            ConversationName=OuterRef("pk")
        ).order_by("-timestamp")

        conversations = (
            Conversation.objects.filter(
                Q(Sender_id=user_id) | Q(Receiver_id=user_id))
            .annotate(
                latest_message=Subquery(latest_messages.values("message")[:1]),
                latest_message_timestamp=Subquery(
                    latest_messages.values("timestamp")[:1]
                ),
                is_read_message=Subquery(latest_messages.values("isRead")[:1]),
                sender=Subquery(latest_messages.values("sender")[:1]),
            )
            .select_related("Sender", "Receiver")
            .order_by("-latest_message_timestamp")
        )

        serialized_data = {
            "users": [
                {
                    "conversationId": conversation.ConversationId,
                    "isBlocked": conversation.isBlocked,
                    "lastMessage": conversation.latest_message,
                    "messageDate": (
                        conversation.latest_message_timestamp.strftime(
                            "%b %d, %H:%M")
                        if conversation.latest_message_timestamp
                        else None
                    ),
                    "isRead": conversation.is_read_message,
                    "sender": True if conversation.sender == user_id else False,
                    **UserSerializerOne(
                        conversation.Receiver
                        if conversation.Sender.id == user_id
                        else conversation.Sender
                    ).data,
                }
                for conversation in conversations
            ]
        }

        return Response(serialized_data)

    def post(self, request, *args, **kwargs):

        userId = request.data.get("userId")
        if userId:

            try:
                if userId == str(request._user.id):
                    return Response(
                        {"error": "invalid user id"}, status=status.HTTP_400_BAD_REQUEST
                    )
                userData = User.objects.get(id=userId)

            except Exception as e:

                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            if str(request._user.id) in userData.blockedUsers:
                return Response(
                    {"error": f"you are blocked by {userData.username}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if userId in request._user.blockedUsers:
                return Response(
                    {"error": f"you blocked {userData.username}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            conversation = Conversation.objects.filter(
                Q(Sender=request._user, Receiver=userData)
                | Q(Sender=userData, Receiver=request._user)
            ).exists()

            response = Response(status=status.HTTP_200_OK)

            if not conversation:
                friends = Friendship.objects.filter(
                    Q(user1=request._user, user2=userData)
                    | Q(user1=userData, user2=request._user)
                ).exists()

                if not friends:
                    return Response(
                        {"error": f"you must be friends with {userData.username}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                newConversation = Conversation.objects.create(
                    Sender=request._user, Receiver=userData
                )
                resData = {
                    "message": "Conversation  created",
                    "conversationId": str(newConversation.ConversationId),
                    "sender": str(request._user.email),
                }
                response.status_code = status.HTTP_201_CREATED

                notification, isNew = Notifications.objects.get_or_create(
                    notifType="CC",
                    userId=userData,
                    senderId=request._user,
                    senderUsername=request._user.username,
                    targetId=str(newConversation.ConversationId),
                )

                if not isNew and notification.isRead:
                    notification.updateRead()

                channel_layer = get_channel_layer()
                group_name = f"notifications_{userId}"
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "create_conversation_room",
                        "convId": str(newConversation.ConversationId),
                                "sender": str(request._user.id),
                                "notifId": str(notification.notificationId),
                                "targetId": str(newConversation.ConversationId),
                    },
                )

                group_name = f"notifications_{str(request._user.id)}"
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "create_conversation_room",
                        "convId": str(newConversation.ConversationId),
                                "sender": str(request._user.id),
                                "notifId": str(notification.notificationId),
                                "targetId": str(newConversation.ConversationId),
                    },
                )

                return Response(resData, status=status.HTTP_201_CREATED)

            else:
                conv = Conversation.objects.get(
                    Q(Sender=request._user, Receiver=userData)
                    | Q(Sender=userData, Receiver=request._user)
                )
                resData = {
                    "message": "Conversation already created",
                    "conversationId": str(conv.ConversationId),
                    "sender": str(request._user.email),
                }
                response.status_code = status.HTTP_200_OK

                return Response(resData, status=status.HTTP_200_OK)

        else:
            return Response(
                {"error": "no user id provided"}, status=status.HTTP_400_BAD_REQUEST
            )


class getMessages(APIView):
    # Expecting convID, limit = how much data you want (optional => default 2,)
    # offset(from where you want data to be fetched from (default = 0))
    def get(self, request, convID=None, offset=0):

        if not convID:
            return Response(
                "no conversation id provided", status=status.HTTP_400_BAD_REQUEST
            )

        try:
            conversation = Conversation.objects.get(
                Q(Sender=request._user)
                | Q(Receiver=request._user),
                ConversationId=convID,
            )
        except Exception as e:
            return Response({"errro": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        response = Response(status=status.HTTP_200_OK)

        chatMessages = []
        messages = Message.objects.filter(ConversationName=conversation).order_by(
            "-timestamp"
        )

        paginator = PageNumberPagination()
        try:
            paginator.page_size = int(request.data.get("limit", 20))
        except ValueError:
            response.data = {
                "Error": "Either Offeset or limit is not a Number"}
            response.status_code = 400
            return response

        paginated_messages = messages[offset: offset + paginator.page_size]

        for message in reversed(paginated_messages):
            if message.sender.email == request._user.email:
                chatMessages.append(
                    {
                        "convId": conversation.ConversationId,
                        "messageId": message.MessageId,
                        "message": message.message,
                        "isRead": message.isRead,
                        "isSent": message.isSent,
                        "timestamp": message.timestamp.strftime("%b %d, %H:%M"),
                        "isSender": True,
                        "metadata": message.metadata,
                    }
                )  # maybe other fields, not sure
            else:
                receiverID = conversation.Receiver.id
                chatMessages.append(
                    {
                        "convId": conversation.ConversationId,
                        "messageId": message.MessageId,
                        "message": message.message,
                        "isRead": message.isRead,
                        "isSent": message.isSent,
                        "timestamp": message.timestamp.strftime("%b %d, %H:%M"),
                        "isSender": False,
                        "ReceiverID": receiverID,
                        "metadata": message.metadata,
                    }
                )
        response.data = {
            "messages": chatMessages,
            "next_offset": (
                offset + paginator.page_size
                if len(paginated_messages) == paginator.page_size
                else None
            ),
        }

        return response


@api_view(["GET"])
def search_conversations(request):
    try:
        query = request.GET.get("query").strip()

        if not query:
            return Response(
                {"error": "no query provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        conversations = (
            Conversation.objects.annotate(
                total_similarity=(
                    TrigramSimilarity("Sender__username", query)
                    + TrigramSimilarity("Sender__first_name", query)
                    + TrigramSimilarity("Sender__last_name", query)
                    + TrigramSimilarity("Receiver__username", query)
                    + TrigramSimilarity("Receiver__first_name", query)
                    + TrigramSimilarity("Receiver__last_name", query)
                )
            )
            .filter(
                Q(Sender=request._user) | Q(Receiver=request._user),
                total_similarity__gt=0.1,
            )
            .order_by("-total_similarity")
        )

        serializer = ConversationSerializer(
            conversations,
            exclude_fields=[
                "latest_message",
                "latest_message_timestamp",
                "is_read_message",
            ],
            context={"request": request},
            many=True,
        )

        print(serializer.data)

        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        print(e, flush=True)
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
