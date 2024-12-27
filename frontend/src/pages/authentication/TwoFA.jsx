import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../../context/AuthContext";
import Toast from "../../components/Toast";
import TwoFaInput from "../../components/authentication/TwoFaInput";
import { IoArrowBackOutline } from "react-icons/io5";
import LoadingPage from "../LoadingPage";
import { useNavigate } from 'react-router-dom'

const TwoFA = () => {
  const authContextData = useContext(AuthContext);
  const navigate = useNavigate();

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
	  {!authContextData.loading &&
		<>
			<div className="absolute min-h-screen w-screen backdrop-blur-xl"></div>
			<div className="max-w-[1440px] m-auto lg:px-32 md:px-16 md:py-32 flex flex-col lg:gap-32 gap-16 min-h-screen">
				<div className="lg:grid lg:grid-cols-[1fr_1fr] login-glass overflow-hidden flex flex-col grow md:rounded-[8px] md:border-[0.5px] md:border-stroke-pr">
				<div className="md:px-64 px-32 flex flex-col justify-center md:gap-32 gap-24 lg:py-64 py-32 grow">
					<IoArrowBackOutline
					className="text-txt-2xl cursor-pointer"
					onClick={() => navigate(-1)}
					/>
					<div className="flex flex-col gap-8">
					<h1 className="md:text-h-lg-xl text-h-sm-lg font-bold">
						Authenticate Your Account
					</h1>
					<p className="md:text-txt-md text-txt-xs text-gray lg:w-full max-w-[600px]">
						Protecting your account is our top priority. Please confirm your
						account by entering the authorization code sent to
					</p>
					</div>
					<TwoFaInput type="twoFa" />
				</div>
				<div className="bg-[url('/images/login/changepassword.jpeg')] bg-cover bg-bottom flex flex-col">
					<div className="cover-gradient grow"></div>
				</div>
				</div>
			</div>
		</>
	  }
    </div>
  );
};

export default TwoFA;
