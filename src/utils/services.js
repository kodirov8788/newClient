export const baseUrl = "http://localhost:5002/api";

export const postRequest = async (url, body) => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body,
    });

    const data = await response.json();

    if (!response.ok) {
        let message;

        if (data?.message) {
            message = data.message;
        } else {
            message = data;
        }

        return { err: true, message };
    }

    return data;
};

export const getRequest = async (url) => {
    // console.log("getRequest url: ", url)
    const response = await fetch(url)
    const data = await response.json()
    // console.log("getRequest response: ", data)

    if (!response.ok) {
        let message = "An error occured"

        if (!data?.message) {
            message = data.message
        }

        return { err: true, message }
    }
    // console.log("getRequest data: ", data)
    return data
}