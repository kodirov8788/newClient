import { createContext, useEffect, useState, useCallback } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState([]);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsErr, setUserChatsErr] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesErr, setMessagesErr] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // console.log("messages: ", messages);
    // console.log(onlineUsers, "smt");
    // console.log("currentChat: ", currentChat);

    // initial socket

    useEffect(() => {
        // https://server-fgsr.onrender.com/
        // const socket = io('http://localhost:5002', {
        //     reconnectionDelayMax: 10000,
        //     reconnectionAttempts: 5
        // });
        const socket = io('https://server-fgsr.onrender.com', {
            reconnectionDelayMax: 10000,
            reconnectionAttempts: 5
        });
        socket.on('connect_error', (err) => {
            console.error('Connection failed: ', err);
        });
        setSocket(socket);

        return () => {
            socket.disconnect();
        };
    }, [user]);
    // add online users
    useEffect(() => {
        if (socket === null) return;
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res);
        });

        return () => {
            socket.off("getOnlineUsers");
        };
    }, [socket]);

    //sendMessage
    useEffect(() => {
        if (socket === null) return;

        const recipientId = currentChat?.members.find((id) => id !== user?._id);

        socket.emit("sendMessage", { ...newMessage, recipientId });
    }, [newMessage]);

    // receive Message and notification

    useEffect(() => {
        if (socket === null) return;

        socket.on("getMessage", (res) => {
            if (currentChat?._id !== res.chatId) return;

            setMessages((prev) => [...prev, res]);
        });

        socket.on("getNotification", (res) => {
            const isChatOpen = currentChat?.members.some((id) => {
                id === res.senderId;
            });

            if (isChatOpen) {
                setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
            } else {
                setNotifications((prev) => [res, ...prev]);
            }
        });

        return () => {
            socket.off("getMessage");
            socket.off("getNotification");
        };
    }, [socket, currentChat]);

    //getUsers
    useEffect(() => {
        const getUsers = async () => {
            const response = await getRequest(`${baseUrl}/users`);

            if (response.error) {
                return console.log("Error fetching users", response);
            }

            // console.log("All users from response:", response);

            const pChats = response.filter((u) => {
                // if (user?._id === u._id) return false; this is also
                if (user?._id === u._id) return false;

                const isChatCreated = userChats?.some((chat) => {
                    return (
                        chat.members[0] === user?._id &&
                        chat.members[1] === u._id
                    );
                });

                // return !isChatCreated; this is not working at all
                return !isChatCreated;
            });

            // console.log("Potential Chats:", pChats);
            setPotentialChats(pChats);
            setAllUsers(response);
        };

        getUsers();
    }, [userChats, user, setPotentialChats]);

    useEffect(() => {
        const getUserChats = async () => {
            if (user?._id) {
                setIsUserChatsLoading(true);
                setUserChatsErr(null);

                // console.log("user", user);

                const response = await getRequest(
                    `${baseUrl}/chats/${user?._id}`
                );

                // console.log("response", response); check if userChats is working

                setIsUserChatsLoading(false);

                if (response.error) {
                    return setUserChatsErr(response);
                }
                setUserChats(response);
            }
        };
        getUserChats();
    }, [user]);

    const updateCurrentChat = useCallback((chat) => {
        // console.log("updateCurrentChat: ", chat);
        setCurrentChat(chat);
    }, []);

    useEffect(() => {
        const getMessages = async () => {
            setIsMessagesLoading(true);
            setMessagesErr(null);
            const response = await getRequest(
                `${baseUrl}/messages/${currentChat?._id}`
            );

            setIsMessagesLoading(false);

            if (response.error) {
                return setMessagesErr(response);
            }
            // console.log(response);
            setMessages(response);
        };
        getMessages();
    }, [currentChat]);

    const createChat = useCallback(async (firstId, secondId) => {
        const response = await postRequest(
            `${baseUrl}/chats`,
            JSON.stringify({
                firstId,
                secondId,
            })
        );
        if (response.error) {
            return console.log("Error creatign chat", response);
        }
        setUserChats((prev) => [...prev, response]);
    }, []);

    const sendTextMessage = useCallback(
        async (textMessage, sender, currentChatId, setTextMessage) => {
            if (!textMessage) return console.log("You must type something");

            const response = await postRequest(
                `${baseUrl}/messages`,
                JSON.stringify({
                    chatId: currentChatId,
                    senderId: sender._id,
                    text: textMessage,
                })
            );

            if (response.error) {
                return setSendTextMessageError(response);
            }

            setNewMessage(response);
            setMessages((prev) => [...prev, response]);
            setTextMessage("");
        },
        []
    );

    // const markedAllNotificationsAsRead = useCallback((notifications) => {
    //     const mNotifications = notifications.map((m) => {
    //         return { ...n, isRead: true };
    //     });

    //     setNotifications(mNotifications);
    // },[setNotifications]);

    const markedAllNotificationsAsRead = useCallback(() => {
        setNotifications((currentNotifications) =>
            currentNotifications.map((notification) => ({
                ...notification,
                isRead: true,
            }))
        );
    }, [setNotifications]);


    const markNotificationsAsRead = useCallback(
        (n, userChats, user, notifications) => {
            // find that chat to open
            const desiredChat = userChats.find((chat) => {
                const chatMembers = [user._id, n.senderId];
                const isDesiredChat = chat?.members.every((member) => {
                    return chatMembers.includes(member);
                });

                return isDesiredChat;
            });

            // mark notification as read
            const mNotifications = notifications.map((el) => {
                if (n.secondId === el.senderId) {
                    return { ...n, isRead: true };
                } else {
                    return el;
                }
            });
            updateCurrentChat(desiredChat);

            setNotifications(mNotifications);
        }
    );

    const markUserNotifications = useCallback(
        (thisUserNotifications, notifications) => {
            const mNotifications = notifications.map((el) => {
                let notification;
                thisUserNotifications.forEach((n) => {
                    if (n.senderId === el.senderId) {
                        notification = { ...n, isRead: true };
                    } else {
                        notification = el;
                    }
                });
                return notification;
            });
            // mNotifications();
            setNotifications(mNotifications);
        }
    );

    return (
        <ChatContext.Provider
            value={{
                userChats,
                isUserChatsLoading,
                userChatsErr,
                potentialChats,
                createChat,
                updateCurrentChat,
                isMessagesLoading,
                messagesErr,
                messages,
                sendTextMessage,
                onlineUsers,
                notifications,
                allUsers,
                markedAllNotificationsAsRead,
                markNotificationsAsRead,
                markUserNotifications,
                currentChat
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
