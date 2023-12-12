/** URL where our server API endpoints can be accessed */
export const serverURL = 'http://localhost:8080';

export async function getRoomList(setRooms: Function) {

    try {
        // Make API call to create a room
        const response = await fetch(`${serverURL}/rooms`, {
            method: 'GET',
        });
        if (response.ok) {
            const json = await response.json()
            console.log('Loaded rooms');
            console.log(json);
            if (json.rooms) {
                setRooms(json.rooms);
            }
            //navigate('/');
        } else {
          console.error('Failed to load rooms:', response.statusText);
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }

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