channel_layer = get_channel_layer()
                        group_name = f"notifications_{userId}"
                        async_to_sync(channel_layer.group_send)(
                            group_name,
                            {
                                "type": "send_friend_request",
                                "sender": str(request._user.id),
                            },