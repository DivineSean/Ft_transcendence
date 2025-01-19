import { useContext, useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import FetchWrapper, { BACKENDURL } from "../../utils/fetchWrapper";
import AuthContext from "../../context/AuthContext";

const SearchForConversation = ({ setDisplaySearch }) => {
  const authContextData = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [foundConversations, setFoundConversations] = useState([]);
  const FetchData = new FetchWrapper();
  const navigate = useNavigate();

  const searchConversations = async () => {
    try {
      const res = await FetchData.get(
        `api/chat/conversations/search/?query=${searchQuery}`,
      );
      if (res.ok) {
        const data = await res.json();
        setFoundConversations(data);
      } else if (res.status === 400) {
        const data = await res.json();

        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  useEffect(() => {
    if (searchQuery) {
      searchConversations();
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    setTimeout(() => {
      if (e.target.value) setSearchQuery(e.target.value);
      else setFoundConversations([]);
    }, 500);
  };

  return (
    <>
      <div
        onClick={() => setDisplaySearch(false)}
        className="bg-black/70 absolute top-0 left-0 right-0 bottom-0 z-10 flex flex-col justify-center items-center"
      ></div>
      <div
        className="p-16 hover-secondary rounded-lg backdrop-blur-3xl border-[0.5px] border-stroke-sc md:w-[600px] w-[90%]
				flex flex-col gap-16 absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="flex items-center relative">
          <input
            type="text"
            autoFocus
            onChange={handleSearch}
            placeholder="find conversation"
            className="bg-black/30 rounded-lg border-[0.5px] border-stroke-sc text-txt-sm px-32 py-8 outline-none grow placeholder-stroke-sc text-white"
          />
          <IoSearchOutline className="text-gray absolute left-8 text-txt-md" />
        </div>
        <div className="bg-black/30 bg-center h-[250px] rounded-lg border-[0.5px] border-stroke-sc">
          <ul className="h-full overflow-y-scroll no-scrollbar rounded-lg p-8 flex flex-col gap-8">
            {foundConversations.length !== 0 ? (
              foundConversations.map((conversation) => (
                <li
                  key={conversation.ConversationId}
                  onClick={() => {
                    navigate(`/chat/${conversation.ConversationId}`);
                    setDisplaySearch(false);
                  }}
                  className="bg-black/30 hover:bg-gray/5 px-12 py-8 rounded-lg transition-all
								cursor-pointer flex gap-12"
                >
                  <div className="w-48 h-48 rounded-full overflow-hidden flex border-[0.5px] border-stroke-sc">
                    <img
                      src={
                        conversation.user.profile_image
                          ? `${BACKENDURL}${conversation.user.profile_image}?t=${new Date().getTime()}`
                          : "/images/default.jpeg"
                      }
                      alt="img"
                      className="grow object-cover"
                    />
                  </div>
                  <section className="flex flex-col justify-center normal-case">
                    <h1 className="tracking-wider text-txt-sm font-semibold">
                      {conversation.user.first_name}{" "}
                      {conversation.user.last_name}
                    </h1>
                    <p className="text-txt-xs text-stroke-sc tracking-wide">
                      see the conversation
                    </p>
                  </section>
                </li>
              ))
            ) : (
              <p className="py-16 flex justify-center text-txt-sm text-stroke-sc">
                no conversation founded
              </p>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SearchForConversation;
