/** URL where our server API endpoints can be accessed */
export const serverURL = 'http://localhost:8080';

export async function getRoomList() {
    const response = await fetch(`${serverURL}/rooms`, {
        method: 'GET',
    });
    if (!response.ok) {
        console.error('Failed to load rooms:', response.statusText);
        return [];
    }
    const json = await response.json()
    console.log('Loaded rooms', json);
    return json.rooms;
}

export async function getRoomData(roomID: string) {
    const response = await fetch(`${serverURL}/rooms/${roomID}`, {
        method: 'GET'
    });
    if (!response.ok) {
        console.error(`failed to load data for room ${roomID}`, response.statusText);
        return null;
    }
    const json = await response.json();
    console.log(`Loaded room ${roomID}`, json);
    return json.room;
}

export async function verifyToken(token: string): Promise<boolean> {
    const response = await fetch(`${serverURL}/verifyToken`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        console.error('failed to verify ID token', response.statusText);
        return false;
    }
    return true;
}

export async function joinRoom(roomID: string, token: string): Promise<boolean> {
    const response = await fetch(`${serverURL}/protected/rooms/${roomID}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });
    if (!response.ok) {
        console.error(`failed to join room ${roomID}`, response.statusText);
        return false;
    }
    console.log(`successfully joined room ${roomID}`);
    return true;
}

export async function leaveRoom(roomID: string, token: string): Promise<boolean> {
    const response = await fetch(`${serverURL}/protected/rooms/${roomID}/leave`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });
    if (!response.ok) {
        console.error(`failed to leave room ${roomID}`, response.statusText);
        return false;
    }
    console.log(`successfully left room ${roomID}`);
    return true;
}

export async function getProblemList() {
    const response = await fetch(`${serverURL}/problems`, {
        method: 'GET',
    });
    if (!response.ok) {
        console.error("failed to load problem list.", response)
        return [];
    }
    const jsonData = await response.json();
    console.log("Loaded problems: ", jsonData);
    return jsonData.problems;
}

export async function getProblem(problemID: string) {
    const response = await fetch(`${serverURL}/problems/${problemID}`, {
        method: 'GET',
    });
    if (!response.ok) {
        console.error(`failed to load problem ${problemID}.`, response)
        return null;
    }
    const jsonData = await response.json();
    console.log("Loaded problem: ", jsonData);
    return jsonData.problem;
}
