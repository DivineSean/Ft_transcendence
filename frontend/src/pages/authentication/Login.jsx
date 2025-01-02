import InputFieled from "../../components/authentication/InputField";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import FetchWrapper from "../../utils/fetchWrapper";
import Toast from "../../components/Toast";
import { FcGoogle } from "react-icons/fc";
import LoadingPage from "../LoadingPage";
import { Si42 } from "react-icons/si";

const FetchData = new FetchWrapper();

const Login = () => {
  const authContextData = useContext(AuthContext);
  const navigate = useNavigate();
  const [load, setLoad] = useState(true);

  useEffect(() => {
    authContextData.checkIsUserAuthenticated();
  }, []);

  const sendCode = async (code, prompt, navigate) => {
    try {
      const res = await FetchData.post("api/callback/", {
        code: code,
        prompt: prompt,
      });

      if (res.ok) {
        const data = await res.json();

        authContextData.setGlobalMessage({
          message: data.message,
          isError: false,
        });

        if (data.requires_2fa) {
          navigate(`/twofa/${data.uid}`);
        } else {
          if (data.username === null) {
            navigate(`/setupusername/${data.uid}`);
          } else {
            navigate("/home");
          }
        }
      } else if (res.status === 400) {
        const data = await res.json();
        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
        setLoad(false);
        navigate("/login");
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const prompt = urlParams.get("prompt");
    if (code) {
      sendCode(code, prompt, navigate);
    } else {
      setLoad(false);
    }
  }, []);

  return (
    <div className="grow">
      {(load || authContextData.loading) && <LoadingPage />}
      {!load && !authContextData.loading && (
        <div className="max-w-[1440px] m-auto lg:px-32 md:px-16 md:py-32 flex flex-col lg:gap-32 gap-16 min-h-screen">
          {authContextData.globalMessage.message && (
            <Toast
              message={authContextData.globalMessage.message}
              error={authContextData.globalMessage.isError}
              onClose={authContextData.setGlobalMessage}
            />
          )}
          <div className="lg:grid lg:grid-cols-[1fr_1fr] login-glass overflow-hidden flex flex-col grow md:rounded-[8px] md:border-[0.5px] md:border-stroke-pr">
            <div className="md:px-64 px-32 flex flex-col justify-center md:gap-32 gap-24 lg:py-64 py-32 grow">
              <div className="flex flex-col gap-8">
                <h1 className="md:text-h-lg-xl text-h-sm-xl font-bold">
                  Welcome back, Player
                </h1>
                <p className="md:text-txt-lg text-txt-sm">
                  Welcome back! Please enter your details
                </p>
              </div>

              <form
                onSubmit={authContextData.login}
                className="md:py-32 py-16 flex flex-col gap-40"
              >
                <div className="flex flex-col gap-10">
                  <InputFieled
                    name="email"
                    formData={authContextData.formData.email}
                    type="text"
                    placeholder="Example@gmail.com"
                    onChange={authContextData.handleChange}
                    error={authContextData.error.email}
                    title="email"
                  />
                  {/* {error.email && (
                    <span className="text-red">{error.email}</span>
                  )} */}
                </div>

                <div className="flex flex-col gap-10">
                  <InputFieled
                    name="password"
                    type="password"
                    onChange={authContextData.handleChangePassLogin}
                    formData={authContextData.formData.password}
                    placeholder="Password"
                    error={authContextData.error.password}
                    title="password"
                  />
                  {/* {error.password && (
                    <span className="text-red">{error.password}</span>
                  )} */}
                </div>

                <div className="flex justify-end">
                  <Link to="/forgotpassword" className="underline">
                    forget password?
                  </Link>
                </div>

                <button
                  disabled={authContextData.btnLoading}
                  type="submit"
                  className="bg-green text-black text-h-sm-lg font-bold py-8 rounded disabled:bg-green/20 transition-all"
                >
                  {authContextData.btnLoading ? "loading..." : "login"}
                </button>

                <div className="flex gap-8 justify-center md:text-txt-md text-txt-sm">
                  <p className="">don't have an account?</p>
                  <Link to="/register" className="font-bold">
                    register
                  </Link>
                </div>
              </form>

              <div className="flex gap-16 items-center">
                <hr className="grow text-stroke-sc" />
                <p className="">or</p>
                <hr className="grow text-stroke-sc" />
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

            <div className="bg-[url('/images/login/login.jpeg')] bg-cover bg-bottom flex flex-col">
              <div className="cover-gradient grow"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
