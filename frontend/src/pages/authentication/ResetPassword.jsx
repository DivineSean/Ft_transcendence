import InputFieled from "../../components/authentication/InputField";
import { useContext, useState, useEffect, useRef } from "react";
import AuthContext from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import TwoFaInput from "../../components/authentication/TwoFaInput";

const ResetPassword = () => {
  const authContextData = useContext(AuthContext);
  const [timer, setTimer] = useState(120);
  const [isActive, setIsActive] = useState(false);
  const [values2FA, setValues2FA] = useState(Array(6).fill(""));

  useEffect(() => {
    let interval = null;
    if (!isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
      setIsActive(true);
    }

    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `0${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const resetTimer = (type) => {
    authContextData.resent2FACode(uid, type);
    setTimer(5);
    setIsActive(false);
  };

  const { uid } = useParams();

  return (
    <>
      <div className="flex flex-col gap-8">
        <h1 className="md:text-h-lg-xl text-h-sm-xl font-bold">
          Reset Password
        </h1>
        <p className="md:text-txt-md text-txt-sm text-gray">
          the email sent seccessfuly check your mail to change your password
        </p>
      </div>

      <form
        onSubmit={(e) => authContextData.changePassword(e, uid, values2FA)}
        className="md:py-32 py-16 flex flex-col gap-48"
      >
        <div className="flex flex-col gap-10">
          <InputFieled
            name="password"
            type="password"
            onChange={authContextData.handleChange}
            formData={authContextData.formData.password}
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
            onChange={authContextData.handleChange}
            formData={authContextData.formData.confirmPassword}
            error={authContextData.error.confirmPassword}
            title="confirm password"
          />
          {authContextData.error.confirmPassword && (
            <span className="text-red text-txt-sm">
              {authContextData.error.confirmPassword}
            </span>
          )}
        </div>
        <TwoFaInput type="reset" saveValues={setValues2FA} />

        <button
          disabled={authContextData.btnLoading}
          type="submit"
          className="bg-green text-black text-h-sm-lg font-bold py-8 rounded disabled:bg-green/20 transition-all"
        >
          {authContextData.btnLoading ? "loading..." : "Send"}
        </button>
        <div className="flex flex-col gap-8 justify-center md:text-txt-md text-txt-sm items-center">
          <p className="text-gray font-light text-txt-sm flex gap-8">
            Haven't received it?
            <button
              onClick={() => resetTimer("reset")}
              disabled={!isActive}
              className={`text-white underline ${isActive ? "cursor-pointer font-bold opacity-100" : "cursor-not-allowed opacity-50"}`}
            >
              Resend a new code.
            </button>
          </p>
          <span>{formatTime(timer)}</span>
        </div>
      </form>
    </>
  );
};

export default ResetPassword;
