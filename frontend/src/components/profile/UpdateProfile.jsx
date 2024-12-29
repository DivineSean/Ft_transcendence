import { RxCross2 } from "react-icons/rx";
import UserContext from "../../context/UserContext";
import AuthContext from "../../context/AuthContext";
import { useContext, useEffect, useRef, useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import FetchWrapper, { BACKENDURL } from "../../utils/fetchWrapper";
import InputUpdateProfile from "./InputUpdateProfile";

const UpdateProfile = ({ setUpdateProfile }) => {
  const FetchData = new FetchWrapper();

  const contextData = useContext(UserContext);
  const authContextData = useContext(AuthContext);

  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  const navigate = useNavigate();

  const [submittedImage, setSubmittedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(
    contextData && contextData.userInfo.isTwoFa ? true : false,
  );
  const [image, setImage] = useState(
    contextData && contextData.userInfo.profile_image
      ? `${BACKENDURL}${contextData.userInfo.profile_image}?t=${new Date().getTime()}`
      : "/images/default.jpeg",
  );
  const [formData, setFormData] = useState({
    first_name: contextData.userInfo.first_name,
    last_name: contextData.userInfo.last_name,
    username: contextData.userInfo.username,
    about: contextData.userInfo.about,
  });

  useEffect(() => {
    authContextData.setGlobalMessage({ message: "", isError: false });
  }, []);

  const handleChange = (e) => {
    // handle chang of input field
    let { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    // handle file change and resize it
    const file = e.target.files[0];
    const width = 800;

    if (file) {
      // resize the image
      let reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setImage(imageUrl);

        if (imageRef && imageRef.current) {
          imageRef.current.onload = (event) => {
            if (canvasRef && canvasRef.current) {
              const ratio = width / event.target.width;
              canvasRef.current.width = width;
              canvasRef.current.height = event.target.height * ratio;

              const context = canvasRef.current.getContext("2d");
              context.drawImage(
                imageRef.current,
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height,
              );

              const newImageUrl = context.canvas.toDataURL("image/jpeg", 90);
              setSubmittedImage(newImageUrl);
            }
          };
        }
      };
    }
  };

  const handleSubmit = async (e) => {
    // submit the data to the backend server
    e.preventDefault();
    setLoading(true);
    setPasswordLoading(true);

    const updatedData = new FormData();
    if (submittedImage) {
      const blob = await fetch(submittedImage).then((res) => res.blob());
      updatedData.append(
        "profile_image",
        blob,
        `${contextData.userInfo.id}_profile.jpeg`,
      );
    }

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "username") key = key.toLocaleLowerCase();
      updatedData.append(key, value);
    });

    updatedData.append("isTwoFa", isChecked);

    try {
      const res = await FetchData.putFormData(
        "api/profile/update/",
        updatedData,
      );

      setLoading(false);
      setPasswordLoading(false);

      if (res.ok) {
        const data = await res.json();
        const updatedImageUrl = `${data.profile_image}?t=${new Date().getTime()}`;
        contextData.updateProfileImage(updatedImageUrl);
        contextData.setUserInfo(data);
        contextData.setProfileInfo(data);
        authContextData.setGlobalMessage({
          message: "profile updated successfully",
          isError: false,
        });
      } else if (res.status === 400) {
        const data = await res.json();
        authContextData.setGlobalMessage({
          message: data.username,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error,
        isError: true,
      });
    }
  };

  // if the user want to change it's password then must to reset it with already made endpoint
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!loading) {
      setPasswordLoading(true);
      setLoading(true);

      try {
        const res = await FetchData.post("api/password-reset/send-code/", {
          email: contextData.userInfo.email,
        });
        if (res.ok) {
          navigate(`/forgotpassword/${contextData.userInfo.id}`);
          authContextData.setGlobalMessage({
            message: "check your email",
            isError: false,
          });
        } else {
          authContextData.setGlobalMessage({
            message: data.error,
            isError: true,
          });
          setPasswordLoading(false);
          setLoading(false);
        }
      } catch (error) {
        authContextData.setGlobalMessage({
          message: error,
          isError: true,
        });
      }
    }
  };

  return (
    <>
      <div
        onClick={() => setUpdateProfile(false)}
        className="absolute h-full left-0 right-0 bottom-0 top-0  bg-black z-[9] opacity-60"
      ></div>
      <div className="fixed w-[90%] gap-16 md:w-[600px] overflow-y-auto no-scrollbar max-h-[90%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col secondary-glass p-16 rounded-md">
        <div className="flex justify-between text-gray">
          <p className="font-bold tracking-wide">edit your profile</p>
          <RxCross2
            onClick={() => setUpdateProfile(false)}
            className="text-2xl cursor-pointer"
          />
        </div>
        <form className="flex flex-col gap-32" onSubmit={handleSubmit}>
          <div className="flex gap-16">
            <img src={image} ref={imageRef} alt="profile" className="hidden" />
            <div
              className={`h-[100px] w-[100px] rounded-full flex flex-col bg-cover bg-center overflow-hidden border border-stroke-sc`}
              style={{ backgroundImage: `url(${image})` }}
            >
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            <div className="flex flex-col gap-16 justify-end">
              <h2 className="text-sm text-gray font-semibold">
                change profile picture
              </h2>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".jpeg, .png, .jpg"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center px-16 py-4 text-gray bg-stroke-pr gap-16
								rounded-sm cursor-pointer hover:bg-stroke-sc transition border border-stroke-sc
							"
              >
                <p>Upload image</p>
                <IoCloudUploadOutline className="text-lg text-green" />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-32">
            <InputUpdateProfile
              formData={formData.first_name}
              onChange={handleChange}
              title="first name"
              type="text"
              value={formData.first_name}
              name="first_name"
            />
            <InputUpdateProfile
              formData={formData.last_name}
              value={formData.last_name}
              onChange={handleChange}
              title="last name"
              type="text"
              name="last_name"
            />
            <InputUpdateProfile
              formData={formData.username}
              value={formData.username}
              onChange={handleChange}
              title="username"
              type="text"
              name="username"
            />
            <InputUpdateProfile
              formData={formData.about}
              value={formData.about}
              onChange={handleChange}
              title="about"
              type="about"
              name="about"
            />
          </div>

          <div className="flex gap-16 items-center">
            <div className="h-[0.5px] bg-stroke-sc grow rounded-full"></div>
            <p>security</p>
            <div className="h-[0.5px] bg-stroke-sc grow rounded-full"></div>
          </div>

          <div className="flex md:gap-32 gap-16 items-center justify-center">
            two-factor authentication
            <label className="inline-flex items-center cursor-pointer">
              <input
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                type="checkbox"
                className="sr-only peer"
              />
              <div
                className="
					relative w-11 h-6 peer-focus:outline-none 
					peer-focus:border-green rounded-full bg-stroke-sc
					peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
					peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
					after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full
					after:h-5 after:w-5 after:transition-all peer-checked:bg-green
				"
              ></div>
            </label>
          </div>
          <div className="lowercase flex gap-8 justify-center font-light text-txt-sm">
            if you want to change your password you click the
            <label
              disabled={passwordLoading}
              className="text-green font-semibold tracking-wide disabled:text-stroke-sc cursor-pointer"
              onClick={handleChangePassword}
            >
              change password
            </label>
          </div>
          <button
            disabled={loading}
            className="bg-green p-8 text-black text-lg font-bold rounded-sm disabled:bg-stroke-pr disabled:text-stroke-sc"
          >
            {loading ? "loading..." : "update"}
          </button>
        </form>
      </div>
    </>
  );
};

export default UpdateProfile;
