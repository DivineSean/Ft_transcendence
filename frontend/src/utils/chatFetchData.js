import FetchWrapper from "./fetchWrapper";
const URL = 'https://localhost:8000/';
const FetchData = new FetchWrapper(URL);

export const getConversations = async (setData, setGlobalMessage, navigate) => {
	try {
		const res = await FetchData.get('chat/conversations/');
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

export const getMessages = async (convId, setData, setOffsetMssg) => {
	try {
		const res = await FetchData.post('chat/getMessages/', {
			'convID': convId,
			'offset': 0,
		});
		if (res.status !== 500) {
			const data = await res.json();
			if (res.status === 200) {
				if (data.messages.length === 20)
					setOffsetMssg(20);
				setData(data.messages);
			}
			else {
				console.log(data);
			}
		} else {
			console.log('internal server error 500');
		}
	} catch (error) {
		console.log('error: ', error);
	}
}

export const getChunkedMessages = async (convId, setData, offsetMssg, setOfssetMssg, setIsChunked, setAllMessages) => {
	try {
		const res = await FetchData.post('chat/getMessages/', {
			'convID': convId,
			'offset': offsetMssg,
		});
		console.log(res);
		if (res.status !== 500) {
			const data = await res.json();
			if (res.status === 200) {
				setData((prevMessages) => [...data.messages, ...prevMessages]);
				if (data.next_offset === null) {
					setOfssetMssg(0);
					setAllMessages(true);
				}
				else {
					setOfssetMssg(data.next_offset);
					setIsChunked(true);
				}
			}
		} else {
			console.log('internal server error 500');
		}
	} catch (error) {
		console.log('error: ', error);
	}
}