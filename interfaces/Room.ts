import User from '../core/User'

interface Room {
    id: string,
    users: Array<User>,
    room?: Room
}

export default Room;