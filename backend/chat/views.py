from django.shortcuts import render
from rest_framework.decorators import APIView
from Auth.AuthMiddleware import HttpJWTAuthMiddleWare
from rest_framework.response import Response
from rest_framework import status
from django.db.models import OuterRef, Subquery
#from django.http import HttpResponse
from chat.models import Conversation
from Auth.models import Users
from chat.models import Message
from django.db import connection
from django.db.models import Prefetch, OuterRef, Subquery, F, Max
from django.db.models.functions import Coalesce


class GetConversationRooms(APIView):


	def getLastMsg(self, element):
		lastMsg = None
		try:
			lastMsg = Message.objects.filter(ConversationName = element["ConversationID"]).order_by('-timestamp').first()
		except:
			return None
		return lastMsg


	def getFriendInfo(self):

		
		# Message.objects.create(

		# 	ConversationName = Conversation.objects.get(ConversationId = '4717ee41-c2df-414f-a1d2-4fe5170718fb'),
		# 	sender = Users.objects.get(id = '2ceb0861-ac05-49ec-996b-4990e1e9f4ca'),
		# 	message= "Helllo",
		# )
		
		
		self.dataUser = {}
		self.dataUser["users"] = []
		for element in self.data["conversations"]:
			
			msg = self.getLastMsg(element)
			user = Users.objects.get(id = element["friendID"])
			
			self.dataUser['users'].append({
				"conversationId" : element["ConversationID"],
				"firstName" : user.first_name,
				"lastName" : user.last_name,
				"lastMessage" : msg.message if msg  else None,
				"isOnline" : user.isOnline,
				"lastLogin" : user.last_login.strftime('%b %d, %Y at %H:%M'),
				"username" : user.username,
				"about" : user.about,
				"messageDate" : msg.timestamp.strftime('%m/%d/%Y') if msg else None
			})
		
				 

	def get(self, request):
		response = Response(status=200)
		try:
			user, accessToken = HttpJWTAuthMiddleWare().parseCookies(request)
		except:
			return Response("Invalid Tokens", status=400)

		if accessToken:     
			response.set_cookie("accessToken", accessToken, httponly=True, secure=True, samesite='Lax')

		# Get latest messages in a single query
		latest_messages = Message.objects.filter(
			ConversationName=OuterRef('ConversationId')
		).order_by('-timestamp').values('message')[:1]

		# Single query to get all conversations with latest messages
		conversations = (
			Conversation.objects.filter(
				Sender=user.id
			).select_related(
				'Sender', 'Receiver'
			).annotate(
				latest_message=Subquery(latest_messages)
			).values(
				'ConversationId',
				'Sender_id',
				'Receiver_id',
				'latest_message',
				sender_first_name=F('Sender__first_name'),
				receiver_first_name=F('Receiver__first_name'),

				sender_last_name=F('Sender__last_name'),
				receiver_last_name=F('Receiver__last_name'),

				sender_username=F('Sender__username'),
				receiver_username=F('Receiver__username'),


				sender_isonline=F('Sender__isOnline'),
				receiver_isonline=F('Receiver__isOnline'),

				sender_last_login=F('Sender__last_login'),
				receiver_last_login=F('Receiver__last_login'),

				sender_about=F('Sender__about'),
				receiver_about=F('Receiver__about'),

			).union(
				Conversation.objects.filter(
					Receiver=user.id
				).select_related(
					'Sender', 'Receiver'
				).annotate(
					latest_message=Subquery(latest_messages)
				).values(
					'ConversationId',
					'Sender_id',
					'Receiver_id',
					'latest_message',
					sender_first_name=F('Sender__first_name'),
					receiver_first_name=F('Receiver__first_name'),

					sender_last_name=F('Sender__last_name'),
					receiver_last_name=F('Receiver__last_name'),

					sender_username=F('Sender__username'),
					receiver_username=F('Receiver__username'),

					sender_isonline=F('Sender__isOnline'),
					receiver_isonline=F('Receiver__isOnline'),

					sender_last_login=F('Sender__last_login'),
					receiver_last_login=F('Receiver__last_login'),

					sender_about=F('Sender__about'),
					receiver_about=F('Receiver__about'),
				)
			)
		)

		# Process results in Python rather than making additional queries
		users_data = []
		for conv in conversations:
				# Determine if user is sender or receiver
				is_receiver = conv['Receiver_id'] == user.id
				users_data.append({
						"ConversationId": conv['ConversationId'],
						"firstName": conv['receiver_first_name'] if not is_receiver else conv['sender_first_name'],
						"lastName": conv['receiver_last_name'] if not is_receiver else conv['sender_last_name'],
						"username": conv['receiver_username'] if not is_receiver else conv['sender_username'],
						"isOnline": conv['receiver_isonline'] if not is_receiver else conv['sender_isonline'],
						"lastLogin": conv['receiver_last_login'].strftime('%b %d, %Y at %H:%M') if not is_receiver else conv['sender_last_login'].strftime('%b %d, %Y at %H:%M'),
						"about": conv['receiver_about'] if not is_receiver else conv['sender_about'],
						"lastMessage": conv['latest_message']
				})

		return Response({"users": users_data}, status=200)

	# def get(self, request):
	# 	response = Response(status=200)
	# 	try:
	# 		user, accessToken = HttpJWTAuthMiddleWare().parseCookies(request)
	# 		currentUserID = user.id
	# 	except:
	# 		return Response("Invalid Tokens", status = 400)

	# 	if accessToken:     
	# 		response.set_cookie("accessToken", accessToken, httponly=True, secure=True, samesite='Lax')

	# 	self.data = {}
	# 	self.data["users"] = []
	# 	conversations = Conversation.objects.filter(
	# 		Sender = user.id
	# 	).select_related("Receiver").union(
	# 		Conversation.objects.filter(
	# 			Receiver = user.id
	# 		).select_related("Sender")
	# 	)
	# 	latest_message_subquery = Message.objects.filter(
	# 		ConversationName = OuterRef('ConversationId')
	# 	).order_by('-timestamp')

	# 	conversations = conversations.annotate(
  #   	latest_message=Subquery(latest_message_subquery.values('message')[:1])
	# 	)
	# 	# print(lastmsg, flush =True)
	# 	for conversation in conversations:
	# 		friend = conversation.Sender if conversation.Receiver.id == user.id else conversation.Receiver
			
	# 		self.data["users"].append(
	# 			{	
	# 				"ConversationId" : conversation.ConversationId,
	# 				"firstName" : friend.first_name,
	# 				"lastName" : friend.last_name,
	# 				"lastMessage" : conversation.latest_message if conversation.latest_message else None
	# 			}
	# 		)
		
			# print(self.data, flush=True)
		# print(user, flush=True)
		# try:
		# 	print('conv1:', flush=True)
		# 	conv1 = Conversation.objects.get(Sender = user.id)
		# 	print(f'conv1: {conv1}', flush=True)
		# 	self.data["conversations"].append(
		# 		{
		# 			"ConversationID" : conv1.ConversationId,
		# 			"friendID" : conv1.Receiver.id,
		# 		}
		# 	) 
		# except:	
		# 	pass
	
		# try:
		# 	print('conv2: ', flush=True)
		# 	conv2 = Conversation.objects.get(Receiver = user.id)
		# 	print(f'conv2: {conv2}', flush=True)
		# 	self.data["conversations"].append(
		# 		{
		# 			"ConversationID" : conv2.ConversationId,
		# 			"friendID" : conv2.Sender.id,
		# 		}
		# 	)
		# except:
		# 	pass

		# print(f'data {self.data}', flush=True)
		# self.getFriendInfo()
		
		# resData = self.dataUser
		# response.data = {}
		# return response
			

class SendMessage(APIView):
    def post(self,request, *args, **kwargs):
        #Protect id of same client
        try:
            user, accessToken = HttpJWTAuthMiddleWare().parseCookies(request)
            senderMail = user.email
        except:     
            return Response("Invalid tokens")
        
        try:
            ReceiverData = Users.objects.get(id = request.data.get("receiverID"))
            if ReceiverData.email == senderMail: 
                return Response("Same clients", status= status.HTTP_400_BAD_REQUEST)
        except:
            return Response("ID of receiver not valid", status=status.HTTP_400_BAD_REQUEST)
        newConversation,isNew = Conversation.objects.get_or_create(
            Sender = Users.objects.get(email = senderMail),
            Receiver = ReceiverData 
        )   
        response = Response(status=status.HTTP_200_OK)
            
        if accessToken:
            response.set_cookie("accessToken", accessToken,httponly=True, secure=True, samesite='Lax')
        
        if not isNew:
            resData = {"message": "Conversation already created",'ConversationID': str(newConversation.ConversationId), "sender" : str(user.email)}
            response.status_code = status.HTTP_400_BAD_REQUEST
        else:
            resData = {"message": "Conversation  created",'ConversationID': str(newConversation.ConversationId), "sender" : str(user.email)}
            response.status_code = status.HTTP_201_CREATED
        response.data = resData
        
        return response
    
    