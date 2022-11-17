import * as moment from "moment";
import {uuid} from "uuidv4";

interface Message {
    text?: string,
    // @ts-ignore
    date?: moment,
    // @ts-ignore
    id?: uuid
}

export default Message;