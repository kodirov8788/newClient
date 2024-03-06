import { useEffect, useState } from "react";
import { baseUrl, getRequest } from "../utils/services";

export const useFetchRecepientUser = (chat, user) => {
    const [recipientUser, setRecipientUser] = useState(null);
    const [error, setError] = useState(null);

    const recipientId = chat?.members.find((id) => id !== user?._id);
    // console.log("use Fetch chat: ", chat)
    // console.log("recipientId: ", recipientId)
    // console.log("use Fetch recipientUser: ", recipientUser)

    useEffect(() => {
        const getUser = async () => {
            if (!recipientId) return null;

            const response = await getRequest(
                `${baseUrl}/users/find/${recipientId}`
            );
            if (response.error) return setError(error);

            setRecipientUser(response);
        };

        getUser();
    }, [recipientId]);
    // console.log("recipientUser2: ", recipientUser);

    return { recipientUser };
};


