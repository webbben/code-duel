import { serverURL } from ".";

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