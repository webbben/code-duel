export interface Problem {
    id: string
    name: string
    difficulty: number
    fullDesc: string
    quickDesc: string
    testCases: any[]
}

export interface Room {
    id: string
    Title: string
    /** Difficulty of the room; 1=Easy, 2=Med, 3=Hard */
    Difficulty: number
    /** Whether this room is in game or not */
    InGame: boolean
    /** Maximum capacity of users for this room */
    MaxCapacity: number
    /** The user who created this room */
    Owner: string
    /** Problem ID for problem this room will play */
    Problem: string
    /** Whether the room requires a password to join */
    ReqPassword: boolean
    /** Password for this room */
    Password: string
    /** Status string for this room */
    Status: string
    /** Users in this room */
    Users: string[]
}