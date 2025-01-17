import InputFieled from "../../components/authentication/InputField";
import AuthContext from "../../context/AuthContext";
import Toast from "../../components/Toast";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { Si42 } from "react-icons/si";
import { useContext, useEffect } from "react";
import LoadingPage from "../LoadingPage";

const SignUp = () => {
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
          <div className="lg:grid lg:grid-cols-[1fr_1fr] login-glass overflow-hidden flex flex-col grow md:rounded-[8px] md:border-[0.5px] md:border-stroke-pr">
            <div className="bg-[url('/images/login/register.jpeg')] bg-cover bg-bottom flex flex-col">
              <div className="cover-gradient grow"></div>
            </div>

            <div className="md:px-64 px-32 flex flex-col justify-center md:gap-32 gap-24 lg:py-64 py-32 grow">
              <div className="flex flex-col gap-8">
                <h1 className="md:text-h-lg-xl text-h-sm-xl font-bold">
                  get started
                </h1>
                <p className="md:text-txt-lg text-txt-sm">
                  create your account now
                </p>
              </div>

              <form
                onSubmit={authContextData.register}
                className="md:py-32 py-16 flex flex-col gap-40"
              >
                <div className="flex flex-col gap-10">
                  <InputFieled
                    name="firstName"
                    type="text"
                    formData={authContextData.formData.firstName}
                    onChange={authContextData.handleChange}
                    error={authContextData.error.firstName}
                    title="first name"
                  />
                  {authContextData.error.firstName && (
										<span className="text-red text-txt-sm">
											{authContextData.error.firstName}
										</span>
									)}
                </div>

                <div className="flex flex-col gap-10">
                  <InputFieled
                    name="lastName"
                    type="text"
                    formData={authContextData.formData.lastName}
                    onChange={authContextData.handleChange}
                    error={authContextData.error.lastName}
                    title="last name"
                  />
                  {authContextData.error.lastName && (
                    <span className="text-red text-txt-sm">
                      {authContextData.error.lastName}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-10">
                  <InputFieled
                    name="email"
                    type="text"
                    formData={authContextData.formData.email}
                    onChange={authContextData.handleChange}
                    error={authContextData.error.email}
                    title="email"
                  />
                  {authContextData.error.email && (
                    <span className="text-red text-txt-sm">
                      {authContextData.error.email}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-10">
                  <InputFieled
                    name="password"
                    type="password"
                    formData={authContextData.formData.password}
                    onChange={authContextData.handleChange}
                    error={authContextData.error.password}
                    title="password"
                  />
                  {authContextData.error.password && (
                    <span className="text-red text-txt-sm">
                      {authContextData.error.password}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-10">
                  <InputFieled
                    name="confirmPassword"
                    type="password"
                    formData={authContextData.formData.confirmPassword}
                    onChange={authContextData.handleChange}
                    error={authContextData.error.confirmPassword}
                    title="confirm password"
                  />
                  {authContextData.error.confirmPassword && (
                    <span className="text-red text-txt-sm">
                      {authContextData.error.confirmPassword}
                    </span>
                  )}
                </div>

                <button
                  disabled={authContextData.btnLoading}
                  type="submit"
                  className="mt-16 bg-green text-black text-h-sm-lg font-bold py-8 rounded capitalize cursor-pointer transition-all disabled:bg-green/20"
                >
                  {authContextData.btnLoading ? "loading..." : "register"}
                </button>

                <div className="flex gap-8 justify-center md:text-txt-md text-txt-sm">
                  <p className="">already have an account?</p>
                  <Link to="/login" className="font-bold">
                    log in
                  </Link>
                </div>
              </form>

              <div className="flex gap-16 items-center">
                <div className="grow bg-stroke-sc h-[1px]" ></div>
                <p className="">or</p>
								<div className="grow bg-stroke-sc h-[1px]" ></div>
              </div>

              <button
                disabled={authContextData.providerBtnLoading}
                onClick={() => authContextData.authProvider("intra")}
                className="flex gap-16 py-8 capitalize justify-center items-center rounded border border-stroke-sc hover:bg-black/20 transition-all disabled:text-stroke-sc"
              >
                <Si42 className="text-txt-3xl" />
                <p className="">
                  {authContextData.providerBtnLoading
                    ? "loading..."
                    : "login with intra"}
                </p>
              </button>

              <button
                disabled={authContextData.googleBtnLoading}
                onClick={() => authContextData.authProvider("google")}
                className="flex gap-16 py-8 capitalize justify-center items-center rounded border border-stroke-sc hover:bg-black/20 transition-all disabled:text-stroke-sc"
              >
                <FcGoogle className="text-txt-3xl" />
                <p>
                  {authContextData.googleBtnLoading
                    ? "loading..."
                    : "login with google"}
                </p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
