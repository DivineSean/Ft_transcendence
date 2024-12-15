import InputFieled from "../../components/authentication/InputField";
import AuthContext from "../../context/AuthContext";
import Toast from "../../components/Toast";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { Si42 } from "react-icons/si";
import { useContext } from "react";

const SignUp = () => {
  const {
    register,
    handleBlur,
    handleChange,
    error,
    authProvider,
    globalMessage,
    setGlobalMessage,
  } = useContext(AuthContext);

  return (
    <div className="grow">
      <div className="max-w-[1440px] m-auto lg:px-32 md:px-16 md:py-32 flex flex-col lg:gap-32 gap-16 min-h-screen">
        {globalMessage.message && (
          <Toast
            message={globalMessage.message}
            error={globalMessage.isError}
            onClose={setGlobalMessage}
          />
        )}
        <div className="backdrop-blur-md w-full h-full absolute top-0 right-0"></div>
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
              onSubmit={register}
              className="md:py-32 py-16 flex flex-col md:gap-32 gap-16"
            >
              <div className="flex flex-col gap-10">
                <InputFieled
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={error.firstName}
                />
                {error.firstName && (
                  <span className="text-red text-txt-sm">
                    {error.firstName}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-10">
                <InputFieled
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={error.lastName}
                />
                {error.lastName && (
                  <span className="text-red text-txt-sm">{error.lastName}</span>
                )}
              </div>

              <div className="flex flex-col gap-10">
                <InputFieled
                  name="email"
                  type="text"
                  placeholder="Example@gmail.com"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={error.email}
                />
                {error.email && (
                  <span className="text-red text-txt-sm">{error.email}</span>
                )}
              </div>

              <div className="flex flex-col gap-10">
                <InputFieled
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={error.password}
                />
                {error.password && (
                  <span className="text-red text-txt-sm">{error.password}</span>
                )}
              </div>

              <div className="flex flex-col gap-10">
                <InputFieled
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={error.confirmPassword}
                />
                {error.confirmPassword && (
                  <span className="text-red text-txt-sm">
                    {error.confirmPassword}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="mt-16 bg-green text-black text-h-sm-lg font-bold py-8 rounded capitalize cursor-pointer"
              >
                register
              </button>

              <div className="flex gap-8 justify-center md:text-txt-md text-txt-sm">
                <p className="">already have an account?</p>
                <Link to="/login" className="font-bold">
                  log in
                </Link>
              </div>
            </form>

            <div className="flex gap-16 items-center">
              <hr className="grow text-stroke-sc" />
              <p className="">or</p>
              <hr className="grow text-stroke-sc" />
            </div>

            <button
              onClick={() => authProvider("intra")}
              className="transition duration-700 capitalize ease-in-out flex gap-16 py-8 justify-center items-center rounded border border-stroke-sc hover:bg-left-gradient-p"
            >
              <Si42 className="text-txt-3xl" />
              <p className="">log in with intra</p>
            </button>

            <button
              onClick={() => authProvider("google")}
              className="flex gap-16 py-8 capitalize justify-center items-center rounded border border-stroke-sc"
            >
              <FcGoogle className="text-txt-3xl" />
              <p>log in with google</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
