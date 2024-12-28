import { createContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FetchWrapper from "../utils/fetchWrapper";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const FetchData = new FetchWrapper();
  const [displayMenuGl, setDisplayMenuGl] = useState(false);
  const [loading, setLoading] = useState(true);

  const [btnLoading, setBtnLoading] = useState(false);
  const [providerBtnLoading, setProviderBtnLoading] = useState(false);
  const [googleBtnLoading, setGoogleBtnLoading] = useState(false);
  const [profileReturn, setProfileReturn] = useState(false);

  const navigate = useNavigate();
  const validationErrors = {};
  const emailRegex = /\S+@\S+\.\S+/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}'";:,.<>])[A-Za-z\d!@#$%^&*()_+={}'";:,.<>]{6,}$/;
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{3,}$/;

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState({});

  useEffect(() => {
    // empty all input values it the user change the location
    setFormData({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }, [window.location.pathname]);

  const location = useLocation();
  const [globalMessage, setGlobalMessage] = useState({
    message: "",
    isError: false,
  });

  useEffect(() => {
    setError({});
  }, [location]);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value.trim()) {
      validationErrors[name] = `${name} is required!`;
    }
    setError(validationErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      if (!emailRegex.test(formData.email)) {
        validationErrors.email = "email is not valid!";
      }
    } else if (name === "password") {
      if (!passwordRegex.test(value)) {
        validationErrors.password =
          "password must contain at least 6 characters, uppercase, lowercase, number and special character.";
      }
    } else if (name === "confirmPassword") {
      if (value !== formData.password) {
        validationErrors.confirmPassword = "password does not matched!";
      }
    }
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(validationErrors);
  };

  const handleChangePassLogin = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const authProvider = async (provider) => {
    let url;
    if (provider === "intra") {
      url = "api/intra/login/";
      setProviderBtnLoading(true);
    } else {
      url = "api/google/login/";
      setGoogleBtnLoading(true);
    }
    try {
      const res = await FetchData.get(url);
      setProviderBtnLoading(false);
      setGoogleBtnLoading(false);
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      } else {
		  setGlobalMessage({ message: "something went wrong!", isError: true });
	  }
    } catch (error) {
      setGlobalMessage({ message: error.message, isError: true });
    }
  };

  const register = async (e) => {
    e.preventDefault();

    for (const data in formData) {
      if (data === "email" && !emailRegex.test(formData[data]))
        validationErrors[data] = `${data} is not valid!`;
      if (data === "password" && !passwordRegex.test(formData[data]))
        validationErrors[data] =
          `${data} must contain at least 6 characters, uppercase, lowercase, number and special character.`;
      if (data === "confirmPassword" && formData.password != formData[data])
        validationErrors[data] = "password does not matched!";

      if (!formData[data].trim() && data !== "username") {
        validationErrors[data] = `${data} is required!`;
      }
    }
    setError(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setBtnLoading(true);
      try {

        const res = await FetchData.post("api/register/", {
          first_name: e.target.firstName.value,
          last_name: e.target.lastName.value,
          email: e.target.email.value,
          password: e.target.password.value,
        });
        setBtnLoading(false);

        if (res.ok) {

          navigate("/login");

        } else if (res.status === 400) {

            setGlobalMessage({
              message: "email already exists or some cridentials not correct!",
              isError: true,
            });

        }

      } catch (error) {

        setGlobalMessage({ message: error.message, isError: true });

      }
    }
  };

  const login = async (e) => {
    e.preventDefault();
    for (const data in formData) {

      if (data === "email" && !emailRegex.test(formData[data]))
        validationErrors[data] = `invalid ${data}!`;
      if (data === "email" && !formData[data].trim())
        validationErrors[data] = `${data} is required!`;
      if (data === "password" && !formData[data].trim())
        validationErrors[data] = `${data} is required!`;

    }
    setError(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setBtnLoading(true);

      try {

        const res = await FetchData.post("api/token/", {
          email: e.target.email.value,
          password: e.target.password.value,
        });
        setBtnLoading(false);

		if (res.ok) {

			const data = await res.json();

			if (data.requires_2fa) {

				navigate(`/twofa/${data.uid}`);

			} else {

				if (data.username === null) {

					navigate(`setupusername/${data.uid}`);

				} else {

					navigate("/home");

				}
			}

		} else if (res.status === 400 || res.status === 401) {

			setGlobalMessage({
				message: `email or password are invalid please try again!`,
				isError: true,
			});
		}

      } catch (error) {
			setGlobalMessage({
				message: error.message,
				isError: true
			});
      }
    }
  };

  const authorization2FA = async (e, userId, values2FA) => {
    e.preventDefault();
	setBtnLoading(true);

    try {
		const res = await FetchData.post("api/token/", {
			id: userId,
			"2fa_code": values2FA.join(""),
		});
		
		setBtnLoading(false);

		if (res.ok) {
			
			const data = await res.json();
			if (data.username === null) {

				navigate(`setupusername/${data.uid}`);
				
			} else {

				navigate("/home");
			}

		} else if (res.status === 400) {

			const data = await res.json();
			setGlobalMessage({
				message: data.error,
				isError: true
			});
		}

    } catch (error) {

		setGlobalMessage({
			message: error.message,
			isError: true
		});

    }
  };

  const resent2FACode = async (userId, type) => {
		try {
			const res = await FetchData.post("api/two-factor/resend/", {
				id: userId,
				type: type,
			});
		
		if (res.ok) {

			const data = await res.json();
			setGlobalMessage({
				message: data.message,
				isError: false,
			})

		} else if (res.status === 400) {

			const data = await res.json();
			setGlobalMessage({
				message: data.error,
				isError: true,
			})
		}
		} catch (error) {

			setGlobalMessage({
				message: error.message,
				isError: true
			});
		}
  };

  const requestResetPassword = async (e) => {
    e.preventDefault();
    for (const data in formData) {

      if (data === "email" && !emailRegex.test(formData[data]))
        validationErrors[data] = `invalid ${data}!`;

      if (data === "email" && !formData[data].trim())
        validationErrors[data] = `${data} is required!`;

    }
    setError(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setBtnLoading(true);

      try {

        const res = await FetchData.post("api/password-reset/send-code/", {
          email: e.target.email.value,
        });
        setBtnLoading(false);

        if (res.ok) {

          const data = await res.json();
		  setGlobalMessage({
			message: data.message,
			isError: false,
		  })
          navigate(`/forgotpassword/${data.uid}`);

        } else if (res.status === 400) {

			const data = await res.json();
			setGlobalMessage({
				message: data.error,
				isError: true
			});

        }
      } catch (error) {
        setGlobalMessage({
			message: error.message,
			isError: true
		});
      }
    }
  };

  const changePassword = async (e, userId, values2FA) => {
    e.preventDefault();
    for (const data in formData) {

      if (data === "password" && !passwordRegex.test(formData[data]))
        validationErrors[data] =
          `${data} must contain at least 6 characters, uppercase, lowercase, number and special character.`;
      
		  if (data === "confirmPassword" && formData.password != formData[data])
        validationErrors[data] = "password does not matched!";

      if (!formData[data].trim() &&
        (data === "password" || data === "confirmPassword")
      ) {
        validationErrors[data] = `${data} is required!`;
      }
    }
    setError(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setBtnLoading(true);

      try {

        const res = await FetchData.post("api/changepassword/", {
          id: userId,
          newPassword: e.target.password.value,
          code: values2FA.join(""),
        });
        setBtnLoading(false);

        if (res.ok) {
			const data = await res.json();
			setGlobalMessage({
				message: data.message,
				isError: false,
			})
          if (profileReturn) {
			navigate("/profile/overview");

		  } else {

			navigate("/login");
		  }

        } else if (res.status === 400) {

          const data = await res.json();
			setGlobalMessage({
				message: data.error,
				isError: true
			});

        }
      } catch (error) {
        setGlobalMessage({
			message: error.message,
			isError: true
		});
      }
    }
  };

  const logout = async () => {
    try {
      const res = await FetchData.post("api/logout/");
      if (res.ok) {
        navigate("/login");
        setGlobalMessage({
          message: "you have successfully logged out!",
          isError: false,
        });
        setDisplayMenuGl(false);
      } else setGlobalMessage({ message: data.error, isError: true });
    } catch (error) {
      setGlobalMessage({ message: `error: ${error}`, isError: true });
    }
  };

  const setUpUsername = async (e, userId) => {
    e.preventDefault();
    for (const data in formData) {
      if (
        data === "username" &&
        !formData[data].trim() &&
        !usernameRegex.test(formData[data])
      )
        validationErrors[data] = `${data} is required!`;
      if (data === "username" && !usernameRegex.test(formData[data]))
        validationErrors[data] =
          `${data} must contain at least 4 characters! examples, user123, user_123, user-123`;
    }
    setError(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setBtnLoading(true);
      try {
        const res = await FetchData.post("api/auth/username/setup/", {
          id: userId,
          username: e.target.username.value,
        });
        setBtnLoading(false);

        if (res.ok) {

			const data = await res.json();
			setGlobalMessage({
				message: data.message,
				isError: false,
			})
			navigate("/home");

		} else if (res.status === 400) {

			const data = await res.json();
			setGlobalMessage({
				message: data.error,
				isError: true
			});
		}

      } catch (error) {

        setGlobalMessage({
			message: error.message,
			isError: true
		});
      }
    }
  };

  // this function to check the user is authenticated to redirect him to the home page
  const checkIsUserAuthenticated = async (uid) => {
    try {
      const res = await FetchData.get("api/auth/check/");
      if (res.ok) {
        if (window.location.pathname.search("forgotpassword") !== -1 && !uid)
          navigate("/home");
        else if (
          window.location.pathname.search("forgotpassword") !== -1 &&
          uid
        ) {
          setLoading(false);
          setProfileReturn(true);
          console.log("rye7 hna akhouna hhh");
        } else if (window.location.pathname.search("forgotpassword") === -1)
          navigate("/home");
      } else setLoading(false);
    } catch (error) {
      setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const contextData = {
    providerBtnLoading,
    googleBtnLoading,
    btnLoading,
    loading,
    formData,
    error,
    globalMessage,
    displayMenuGl,
    displayMenuGl,

    register,
    login,
    logout,

    authProvider,
    authorization2FA,
    resent2FACode,
    requestResetPassword,
    changePassword,

    handleBlur,
    handleChange,
    handleChangePassLogin,

    setGlobalMessage,
    setDisplayMenuGl,
    setUpUsername,
    checkIsUserAuthenticated,
    setLoading,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
