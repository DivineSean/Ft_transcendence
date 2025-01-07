import React, { useContext } from "react";
import UserContext from "../../context/UserContext";
import { BACKENDURL } from "../../utils/fetchWrapper";

const Approval = ({ approval, setApproval }) => {
  const contextData = useContext(UserContext);
  const handleApproval = () => {
    if (approval.type === "block") contextData.blockFriend();
    else if (approval.type === "unfriend") contextData.unfriend();
    setApproval({ visible: false, message: null, type: null });
  };

  return (
    <>
      <div
        //   onClick={() =>
        // 	setApproval({ visible: false, message: null, type: null })
        //   }
        className="bg-black/70 h-full w-full absolute top-0 left-0 flex justify-center items-center"
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px]">
        <div className="secondary-glass p-32 flex flex-col items-center gap-24 z-[10]">
          <div className="flex flex-col gap-16 w-full items-center">
            {/* <h2 className="font-bold text-txt-xl text-red">{approval.type}</h2> */}
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-[0.5px] border-stroke-sc flex">
              <img
                src={
                  contextData.profileInfo &&
                  contextData.profileInfo.profile_image
                    ? `${BACKENDURL}${contextData.profileInfo.profile_image}?t=${new Date().getTime()}`
                    : "/images/default.jpeg"
                }
                alt="image"
                className="object-cover grow"
              />
            </div>
            <p className="text-txt-md text-gray lowercase text-center w-[85%] tracking-wider">
              {approval.message}
              <span className="font-bold text-white">
                {" "}
                {contextData.userInfo.username}{" "}
              </span>
              agin
            </p>
          </div>
          <div className="flex gap-16 w-[95%]">
            <button
              onClick={() =>
                setApproval({ visible: false, message: null, type: null })
              }
              className="
					px-16 py-8 bg-red rounded-md hover-secondary text-green font-semibold hover:bg-green hover:text-black
					transition-all grow
				"
            >
              cancel
            </button>
            <button
              onClick={handleApproval}
              className="
					px-16 py-8 bg-red rounded-md hover-secondary text-red font-semibold hover:bg-red hover:text-white
					transition-all
				"
            >
              confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Approval;
