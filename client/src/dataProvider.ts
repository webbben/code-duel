import { Problem, Room } from "./dataModels";

/** URL where our server API endpoints can be accessed */
export const serverURL = 'http://localhost:8080';

/**
 * Gets the list of rooms - used in the lobby for listing all rooms a user can join.
 * @returns list of Rooms
 */
export async function getRoomList(): Promise<Room[]> {
    const response = await fetch(`${serverURL}/rooms`, {
        method: 'GET',
    });
    if (!response.ok) {
        console.error('Failed to load rooms:', response.statusText);
        return [];
    }
    const json = await response.json()
    return json.rooms;
}

/**
 * Verifies that a given authentication token is valid.  Can be used as an extra layer of user authentication.
 * @param token auth token
 * @returns true if the token is authenticated, false if not
 */
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

//#region room

export async function getRoomData(roomID: string) {
    const response = await fetch(`${serverURL}/rooms/${roomID}`, {
        method: 'GET'
    });
    if (!response.ok) {
        const responseText = await response.text()
        console.error(`failed to load data for room ${roomID}`, response.statusText, responseText);
        return null;
    }
    const json = await response.json();
    return json.room;
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
    return jsonData.problem;
}

//#endregion

//#region game

export interface codeExecResponse {
    passCount: number
    testCount: number
    errorMessage: string
}

export async function launchGame(roomID: string, problemID: string, token: string): Promise<boolean> {
    if (roomID == "" || problemID == "" || token == "") {
        console.error("launchGame: missing required input params");
        return false;
    }
    const response = await fetch(`${serverURL}/protected/rooms/${roomID}/launchGame`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            problemID: problemID
        })
    });
    if (!response.ok) {
        const responseText = await response.text()
        console.error("Failed to launch game", responseText, response.statusText);
        return false;
    }
    const jsonData = await response.json();
    console.log(jsonData);
    return true;
}

/**
 * Tests code against the basic test cases for a problem
 * @param code code solution to be tested
 * @param lang language the code is written in
 * @param problemID problem to test code solution against
 * @param token auth token
 * @param roomID room ID
 * @param fullSubmit whether we are doing a full submission or not - if not, just basic test cases are done.
 * @returns the result of the code execution, or null if code execution failed to be sent
 */
export async function testCode(code: string, lang: string, problemID: string, token: string, roomID: string, fullSubmit: boolean = false): Promise<codeExecResponse | null> {
    const response = await fetch(`${serverURL}/protected/${fullSubmit ? "submitCode" : "testCode"}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            problemID: problemID,
            code: code,
            lang: lang,
            roomID: roomID
        })
    });
    if (!response.ok) {
        const responseText = await response.text();
        console.error("failed to submit code for testing", responseText);
        return null
    }
    const jsonData = await response.json();
    const result: codeExecResponse = {
        passCount: jsonData.passCount,
        testCount: jsonData.testCount,
        errorMessage: jsonData.errorMessage
    };
    return result;
}

/**
 * Loads the problem to be solved for a game
 * @param roomID 
 * @param token 
 * @returns Problem
 */
export async function loadGameRoom(roomID: string, token: string): Promise<Problem | null> {
    const response = await fetch(`${serverURL}/protected/rooms/${roomID}/game`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });
    if (!response.ok) {
        const responseText = await response.text();
        console.error("failed to load problem for game", responseText, response);
        return null
    }
    const jsonData = await response.json();
    return jsonData.problem;
}

export async function loadProblemTemplate(problemID: string, lang: string): Promise<string | null> {
    if (!problemID || !lang) {
        console.error("loadProblemTemplate: missing required params", problemID, lang);
        return null;
    }
    const response = await fetch(`${serverURL}/problems/${problemID}/template/${lang}`, {
        method: "GET",
    });
    if (!response.ok) {
        const responseText = await response.text();
        console.error("failed to load code template", responseText, response);
        return null
    }
    const jsonData = await response.json();
    return jsonData.template;
}

//#endregion