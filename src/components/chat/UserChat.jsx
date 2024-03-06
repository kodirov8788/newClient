import React, { useContext } from "react";
import { useFetchRecepientUser } from "../../hooks/useFetchRecepient";
import { Stack } from "react-bootstrap";
import avatar from "../../assets/react.svg";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationsFunc } from "../../utils/unreadNotifications";

function UserChat({ user, chat }) {
    const { recipientUser } = useFetchRecepientUser(chat, user);
    const { onlineUsers, notifications, markUserNotifications } =
        useContext(ChatContext);

    const isOnline = onlineUsers?.some(
        (user) => user?.userId === recipientUser?.id
    );

    const unreadNotifications = unreadNotificationsFunc(notifications);
    const thisUserNotifications = unreadNotifications?.filter((n) => {
        n.senderId === recipientUser?._id;
    });
    return (
        <Stack
            direction="horizontal"
            gap={3}
            className="user-card align-items-center p-2 justify-content-between"
            role="button"
            onClick={() => {
                if (markUserNotifications?.length !== 0) {
                    markUserNotifications(thisUserNotifications, notifications);
                }
            }}
        >
            <div className="d-flex">
                <div className="me-2">
                    <img src={avatar} alt="" height={"35px"} />
                </div>
                <div className="text-content">
                    <div className="name">{recipientUser?.name}</div>
                    <div className="text">Text Message</div>
                </div>
            </div>
            <div className="d-flex flex-column align-items-end">
                <div className="date">12/12/2023</div>
                <div
                    className={
                        thisUserNotifications?.length > 0
                            ? "this-user-notifications"
                            : ""
                    }
                >
                    {thisUserNotifications?.length > 0
                        ? thisUserNotifications?.length
                        : ""}
                </div>
                <span className={isOnline ? "user-online" : ""}></span>
            </div>
        </Stack>
    );
}

export default UserChat;
