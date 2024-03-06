import { createContext, useCallback, useEffect, useState } from "react";
import { postRequest, baseUrl } from "../utils/services.js";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [registerErr, setRegisterErr] = useState(null);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [registerInfo, setRegisterInfo] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: "",
    });
    const [loginrErr, setLoginrErr] = useState(null);
    const [isLoginrLoading, setIsLoginrLoading] = useState(false);

    // console.log("LoginInfo", loginInfo);

    useEffect(() => {
        const user = localStorage.getItem("User");

        setUser(JSON.parse(user));
    }, []);

    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info);
    }, []);

    const updateLoginInfo = useCallback((info) => {
        setLoginInfo(info);
    }, []);

    const registerUser = useCallback(
        async (e) => {
            e.preventDefault();
            setIsRegisterLoading(true);
            setRegisterErr(null);

            const response = await postRequest(
                `${baseUrl}/users/register`,
                JSON.stringify(registerInfo)
            );

            setIsRegisterLoading(false);

            if (response.error) {
                return setRegisterErr(response);
            }

            localStorage.setItem("User", JSON.stringify(response));
            setUser(response);
        },
        [registerInfo]
    );

    const loginUser = useCallback(
        async (e) => {
            e.preventDefault();
            setIsLoginrLoading(true);
            setLoginrErr(null);
            const response = await postRequest(
                `${baseUrl}/users/login`,
                JSON.stringify(loginInfo)
            );

            setIsLoginrLoading(false);

            if (response.error) {
                return setLoginrErr(response);
            }

            localStorage.setItem("User", JSON.stringify(response));
            setUser(response);
            // console.log("response", response)
        },
        [loginInfo]
    );

    const logoutUser = useCallback(() => {
        localStorage.removeItem("User");
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                registerInfo,
                updateRegisterInfo,
                registerUser,
                registerErr,
                isRegisterLoading,
                logoutUser,
                loginUser,
                loginrErr,
                loginInfo,
                updateLoginInfo,
                isLoginrLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
