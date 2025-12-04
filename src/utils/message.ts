import { MESSAGE_MIN_LENGTH, ERROR_MESSAGES, MESSAGE_MAX_LENGTH } from "../lib/constants";

export const validateMessage = (trimmedMessage : string)=>{
    if (trimmedMessage.length < MESSAGE_MIN_LENGTH) {
        alert(ERROR_MESSAGES.MESSAGE.MESSAGE_REQUIRED);
        return;
    }

    if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
        alert(ERROR_MESSAGES.MESSAGE.MESSAGE_TOO_LONG);
        return;
    }
}
