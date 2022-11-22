import Room from './Room'

interface Data {
    userToCall: string,
    signalData?: any,
    from?: string,
    to?: any,
    signal?: any,
    userID: string,
    room: Room
}

export default Data;