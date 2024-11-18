import FetchWrapper from "./fetchWrapper";
const URL = 'https://localhost:8000/';
const FetchData = new FetchWrapper(URL);


export const getConversations = async (setData, setGlobalMessage, navigate) => {

	try {
		const res = await FetchData.get('chat/conversations/');
		// console.log(res);
		if (res.ok) {
			const data = await res.json();
			setData(data);
			console.log(data);
		} else if (res.status) {
			const data = await res.json();
			if (res.status === 401) {
				setGlobalMessage({message: data, isError: true});
				navigate('/login');
			}
			console.log(data);
		}
	} catch (error) {
		console.error(error);
		setGlobalMessage({message: error, isError: true});
	}
}

export const getMessages = async (convId, setData) => {
	try {
		const res = await FetchData.post('chat/getMessages/', {
			'convID': convId
		});
		console.log(res);
		if (res.status !== 500) {
			const data = await res.json();
			if (res.status === 200) {
				setData(data.messages);
			}
			// console.log(data);
		} else {
			console.log('internal server error 500');
		}
	} catch (error) {
		console.log('error: ', error);
	}
}

export const sendMessage = async (convId, message, setMessageState) => {
	if (message) {
		try {
			const res = await FetchData.post('chat/sendmessagetofriend/', {
				"convID" : convId,
				"message" : message,
			});
			console.log(res);
			if (res.ok) {
				const data = await res.json();
				setMessageState(true);
				console.log(data);
			}
		} catch (error) {
			console.log(error);
		}
	} else {
		console.log('wa makayn walo am3alam');
	}
}