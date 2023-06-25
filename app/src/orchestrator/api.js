// Type of errors. Used to differentiate between errors sent by upstream (orchestrator) or errors emerged locally
export const T_UPSTREAM = 1;
export const T_APP = 2;

function callApi(endpoint, method, data, authFetch) {
    // console.log("callApi with data:", data);
    if (!authFetch) {
        authFetch = fetch;
    }
    const myFetch = () => {
        if ((method == 'GET') || (method == 'OPTIONS') || (method == 'DELETE')) {
            return authFetch(endpoint + '?' + new URLSearchParams(data).toString(), {
                method: method,
            });
        } else {
            return authFetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        }
    }

    return new Promise(
        (resolve, reject) => {
            myFetch()
                .then((response) => {
                    if (response.ok) {
                        response.text().then((text) => {
                            resolve(text);
                        });
                    } else {
                        response.text().then((text) => {
                            reject({
                                type: T_UPSTREAM,
                                message: `${response.status}: ${text}`,
                            });
                        });
                    }
                }, (error) => {
                    reject({
                        type: T_APP,
                        message: error,
                    });
                });
        }
    );
}

export async function generateToken(orchestrator_url, email, password, webid, issuer, authFetch) {
    const data = {
        webid: webid,
        issuer: issuer,
        email: email,
        password: password,
    };
    return callApi(`${orchestrator_url}/user`, 'POST', data, authFetch);
}

export async function revokeAccess(orchestrator_url, webid, authFetch) {
    const data = {
        webid: webid,
    };
    return callApi(`${orchestrator_url}/user`, 'DELETE', data, authFetch);
}

export async function updateAvailability(orchestrator_url, webid, issuer, authFetch) {
    const data = {
        webid: webid,
        issuer: issuer,
    }
    return callApi(`${orchestrator_url}/user`, 'POST', data, authFetch);
}

export async function updateIcs(orchestrator_url, ics, webid, authFetch) {
    const data = {
        webid: webid,
        cal_url: ics,
    }
    return callApi(`${orchestrator_url}/user`, 'POST', data, authFetch);
}

export async function userInfoState(orchestrator_url, webid, authFetch) {
    const data = {
        webid: webid,
    }
    return callApi(`${orchestrator_url}/user`, 'GET', data, authFetch);
}
