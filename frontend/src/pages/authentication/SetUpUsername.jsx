import InputFieled from "../../components/authentication/InputField";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import FetchWrapper from "../../utils/fetchWrapper";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Toast from "../../components/Toast";
import LoadingPage from "../LoadingPage";

const SetUpUsername = () => {
  const { uid } = useParams();
  const authContextData = useContext(AuthContext);

  useEffect(() => {
    authContextData.checkIsUserAuthenticated();
  }, []);

  return (
    <div className="grow">
      {authContextData.loading && <LoadingPage />}
      {authContextData.globalMessage.message && (
        <Toast
          message={authContextData.globalMessage.message}
          error={authContextData.globalMessage.isError}
          onClose={authContextData.setGlobalMessage}
        />
      )}
      {!authContextData.loading && (
        <div className="max-w-[1440px] m-auto lg:px-32 md:px-16 md:py-32 flex flex-col lg:gap-32 gap-16 min-h-screen">
          <div className="login-glass overflow-hidden md:p-32 p-0 flex justify-center items-center grow md:rounded-[8px] md:border-[0.5px] md:border-stroke-pr">
            <>
              <div className="md:px-64 px-32 flex flex-col justify-center items-center md:gap-32 gap-24 lg:py-64 py-32 grow">
                <div className="flex flex-col gap-8 items-center">
                  <h1 className="md:text-h-lg-xl text-h-sm-lg font-bold">
                    Hello
                    <span className="text-green "> Player</span>
                    <span className="lowercase"></span>
                  </h1>
                  <p className="md:text-txt-sm text-txt-xs text-center text-gray">
                    Welcome to our world! It looks like this is your first time
                    here. You're in the right place!
                  </p>
                </div>

                <p className="md:text-txt-sm text-txt-xs text-center font-semibold">
                  Set up your username so your friends can recognize you.
                </p>
                <form
                  onSubmit={(e) => authContextData.setUpUsername(e, uid)}
                  className="md:py-32 py-16 flex flex-col gap-48 w-full max-w-[500px]"
                >
                  <div className="flex flex-col gap-10">
                    <InputFieled
                      name="username"
                      type="text"
                      onChange={authContextData.handleChange}
                      formData={authContextData.formData.username}
                      error={authContextData.error.username}
                      title="username"
                    />
                    {authContextData.error.username && (
                      <span className="text-red text-txt-sm lowercase">
                        {authContextData.error.username}
                      </span>
                    )}
                  </div>

                  <button
                    disabled={authContextData.btnLoading}
                    type="submit"
                    className="bg-green text-black text-h-sm-lg font-bold py-8 rounded disabled:bg-green/20 transition-all"
                  >
                    {authContextData.btnLoading ? "loading..." : "Join Now"}
                  </button>
                </form>
              </div>
            </>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetUpUsername;
