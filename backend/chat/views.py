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
from django.db.models import Prefetch, OuterRef, Subquery, F, Q
from django.db.models.functions import Coalesce
from rest_framework.pagination import PageNumberPagination ,BasePagination

# {"receiverID": "59533f62-e7ef-4469-aebf-3b19c8a3c653"}

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
			# currentUserID = user.id
		except:
			return Response("Invalid Tokens", status = 400)

		if not user:
			return Response("unauthorized user", status = status.HTTP_401_UNAUTHORIZED)

		if accessToken:     
			response.set_cookie("accessToken", accessToken, httponly=True, secure=True, samesite='Lax')

		# Get latest messages in a single query
		latest_messages = Message.objects.filter(
			ConversationName=OuterRef('ConversationId')
		).order_by('-timestamp').values('message', 'timestamp')[:1]
		

		conversations = ( # get all conversations with user infos and the latest messages, using sigle query
			Conversation.objects.filter(
				Q(Sender=user.id) | Q(Receiver=user.id)
			)
			.select_related('Sender', 'Receiver')
			.annotate(
				latest_message = Subquery(latest_messages.values('message')),
				latest_message_timestamp = Subquery(latest_messages.values('timestamp'))
			)
			.values(
				'ConversationId',
				'Sender_id',
				'Receiver_id',
				'latest_message',
				'latest_message_timestamp',
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
		users_data = []
		for conv in conversations:
			is_receiver = conv['Receiver_id'] == user.id
			users_data.append({
				"conversationId": conv['ConversationId'],
				"firstName": conv['receiver_first_name'] if not is_receiver else conv['sender_first_name'],
				"lastName": conv['receiver_last_name'] if not is_receiver else conv['sender_last_name'],
				"username": conv['receiver_username'] if not is_receiver else conv['sender_username'],
				"isOnline": conv['receiver_isonline'] if not is_receiver else conv['sender_isonline'],
				"lastLogin": (
					conv['receiver_last_login'].strftime('%b %d, %Y at %H:%M') if conv['receiver_last_login'] and not is_receiver
					else conv['sender_last_login'].strftime('%b %d, %Y at %H:%M') if conv['sender_last_login'] else None
				),
				"about": conv['receiver_about'] if not is_receiver else conv['sender_about'],
				"messageDate": conv['latest_message_timestamp'].strftime('%m/%d/%Y') if conv['latest_message_timestamp'] else None,
				"lastMessage": conv['latest_message'],
				"friendId" : conv['Sender_id'] if conv['Sender_id'] != user.id else conv['Receiver_id']
			})

		# Message.objects.create(
		# 	ConversationName = Conversation.objects.get(ConversationId = 'aa415cb3-78c8-4231-ac02-db9fb80df96f'),
		# 	sender = Users.objects.get(id = 'dfcbbcfe-2cab-4d8c-9d96-88f609b0e8f9'),
		# 	message= "Hello man",
		# )

		# print(users_data, flush=True)
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
    
class getMessages(APIView):
	
	# Expecting convID, limit = how much data you want (optional => default 2,)
	# offset(from where you want data to be fetched from (default = 0))
	def post(self,request, *args, **kwargs):
			
		try:
			user, accessToken = HttpJWTAuthMiddleWare().parseCookies(request)
			senderMail = user.email
		except:     
			return Response("Invalid tokens")
		
		try:
			# print(request.data, flush=True)
			convID = Conversation.objects.get(ConversationId= request.data.get("convID"))
		except:
			return Response("convID not valid", status=status.HTTP_400_BAD_REQUEST)
		
		response = Response(status=status.HTTP_200_OK)
				
		if accessToken:
			response.set_cookie("accessToken", accessToken,httponly=True, secure=True, samesite='Lax')
		
		chatMessages= []
		messages = Message.objects.filter(
			ConversationName = convID
		).order_by('-timestamp')
		
		paginator = PageNumberPagination()
		try:
			offset = int(request.data.get("offset", 0))  
			paginator.page_size = int(request.data.get("limit", 20))  
		except ValueError:
			response.data = {"Error" : "Either Offeset or limit is not a Number"}
			response.status_code = 400
			return response
		
		paginated_messages = messages[offset:offset + paginator.page_size]

		# print(paginated_messages, flush=True)

		for message in reversed(paginated_messages):
			if message.sender.email == senderMail: 
				chatMessages.append({
					"convID" : convID.ConversationId,
					"messageId" : message.MessageId,
					"message" : message.message,
					"isRead" : message.isRead,
					"timestamp": message.timestamp.strftime('%b %d, %H:%M'),
					"isSender" : True
					})#maybe other fields, not sure
			else:
				receiverID = convID.Receiver.id
				chatMessages.append({
					"convID" : convID.ConversationId,
					"messageId" : message.MessageId,
					"message" : message.message,
					"isRead" : message.isRead,
					"timestamp": message.timestamp.strftime('%b %d, %H:%M'),
					"isSender" : False,
					"ReceiverID" : receiverID
					})
		response.data = {
			"messages": chatMessages,
			"next_offset": offset + paginator.page_size if len(paginated_messages) == paginator.page_size else None
		}
	
		return response

class SendMessageToFriend(APIView):

	def post(self, request):

		try:
			user, accessToken = HttpJWTAuthMiddleWare().parseCookies(request)
			userId = user.id
		except:     
			return Response("Invalid tokens")
		
		Message.objects.create(

			ConversationName = Conversation.objects.get(ConversationId = request.data.get("convID")),
			sender = Users.objects.get(id = userId),
			message= request.data.get("message"),
		)

		print(request.data, flush=True)
		return Response({"convId": request.data.get("convID"), "userID": userId, "message": request.data.get("message")}, status = status.HTTP_200_OK)

		