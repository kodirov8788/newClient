import React, { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

function PotentialChats() {
    const { user } = useContext(AuthContext);
    const { potentialChats, createChat, onlineUsers } = useContext(ChatContext);
    // console.log("Pontential", potentialChats);
    // console.log("onlineUsers", onlineUsers);
    // console.log("user", user);
    return (
        <div>
            <div className="all-users">
                {potentialChats &&
                    potentialChats?.map((u) => {
                        return (
                            <div
                                className="single-user"
                                key={u._id}
                                onClick={() => {
                                    createChat(user._id, u._id);
                                }}
                            >
                                {u.name}
                                <span
                                    className={
                                        onlineUsers?.some(
                                            (user) => user?.userId === u?._id
                                        )
                                            ? "user-online"
                                            : ""
                                    }
                                ></span>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

export default PotentialChats;
