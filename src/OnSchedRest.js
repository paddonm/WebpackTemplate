export const Authorize = async (clientId, environment, scope) => {
  var headers = new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' });

  var url = environment == null || environment == "sbox" ?
      "https://sandbox-js.onsched.com/auth/initialize" : "https://js.onsched.com/auth/initialize";

  scope = scope == null ? "OnSchedApi" : scope;

  var payload = { "clientId": clientId, "scope": scope };
  var request = new Request(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      mode: 'cors',
      headers: headers
  });
  const response = await fetch(request);
  const json = await response.json().catch(function (error) {
      console.log(error);
  });

  if (json.success == false) {
    reject (new Error(json.message));
    // console.log(json.message);
  }

  return json.access_token;
}

export const GetAccessToken = async (environment) => {
    try {
        var url = environment == null || environment == "sbox" ?
            "https://sandbox-identity.onsched.com/connect/token" :
            "https://identity.onsched.com/connect/token";
        var clientId = "DemoUser";
        var clientSecret = "DemoUser";

        var postData = "client_id=" + clientId;
        postData += "&";
        postData += "client_secret=" + clientSecret;
        postData += "&";
        postData += "grant_type=client_credentials";
        postData += "&";
        postData += "scope=OnSchedApi";

        var request = new Request(url, {
            method: 'POST',
            body: postData,
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        });

        const response = await fetch(request);
        const json = await response.json();
        return json.access_token;
    } catch (e) {
        console.log(e);
    }
}

export const PostValidateJwt = async (url, payload) => {

  var headers = new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' });

  var request = new Request(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      mode: 'cors',
      headers: headers
  });

  const response = await fetch(request);
  const json = await response.json();

  return json;
}

const ShowProgress = () => {
  var indicators = document.getElementsByClassName("onsched-progress");
  for (var i = 0; i < indicators.length; i++) {
      indicators[i].style.display = "block";
  }
}

const HideProgress = () => {
    var indicators = document.getElementsByClassName("onsched-progress");
    for (var i = 0; i < indicators.length; i++) {
        indicators[i].style.display = "none";
    }
}

const Get = (token, url, callback) => {
    try {
        var headers = token == null ?
            new Headers({ 'Accept': 'application/json' }) :
            new Headers({ 'Accept': 'application/json', 'Authorization': 'Bearer ' + token });

        var request = new Request(url, {
            method: 'GET',
            mode: 'cors',
            headers: headers
        });

        fetch(request)
            .then((response) =>
            {
                if (response.status != 401) // for debugging auth errors
                    return new Promise((resolve) => response.json().then((json) => resolve({ status: response.status, ok: response.ok, json })));
                else
                    return new Promise((resolve) => resolve({ status: response.status, ok: response.ok, json: '' }));
            }).then(({ status, json, ok }) => {
                var validation = status == 400;
                ok ? callback(json) : callback({ error: true, code: status, validation: validation, data:json });
                HideProgress();
            })
            .catch(function (error) {
                console.log(error);
                HideProgress();
            });
    } catch (e) {
        console.log(e);
        throw e;
    }
}

const Post = (token, url, payload, callback) => {

    var headers = token == null ?
        new Headers({ 'Content-Type': 'application/json','Accept': 'application/json' }) :
        new Headers({ 'Content-Type': 'application/json','Accept': 'application/json', 'Authorization': 'Bearer ' + token });

    var request = new Request(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        mode: 'cors',
        headers: headers
    });
    fetch(request)
        .then((response) => {
            return new Promise((resolve) => response.json().then((json) => resolve({ status: response.status, ok: response.ok, json })));
        }).then(({ status, json, ok }) => {
            var validation = status == 400;
            ok ? callback(json) : callback({ error: true, code: status, validation: validation, data: json });
            HideProgress();
        })
        .catch(function (error) {
            console.log(error);
        });
}

const Put = (token, url, payload, callback) => {

    var headers = token == null ?
        new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' }) :
        new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + token });

    var request = new Request(url, {
        method: 'PUT',
        body: JSON.stringify(payload),
        mode: 'cors',
        headers: headers
    });

    fetch(request)
        .then((response) => {
            return new Promise((resolve) => response.json().then((json) => resolve({ status: response.status, ok: response.ok, json })));
        }).then(({ status, json, ok }) => {
            var validation = status == 400;
            ok ? callback(json) : callback({ error: true, code: status, validation: validation, data: json });
            HideProgress();
        })
        .catch(function (error) {
            HideProgress();
            console.log(error);
        });
}
const Delete = (token, url, callback) => {

    var headers = token == null ?
        new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' }) :
        new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + token });

    var request = new Request(url, {
        method: 'DELETE',
        mode: 'cors',
        headers: headers
    });
    fetch(request)
        .then((response) => {
            return new Promise((resolve) => response.json().then((json) => resolve({ status: response.status, ok: response.ok, json })));
        }).then(({ status, json, ok }) => {
            var validation = status == 400;
            ok ? callback(json) : callback({ error: true, code: status, validation: validation, data: json });
            HideProgress();
        })
        .catch(function (error) {
            console.log(error);
        });
}


export const OnSchedRest = {
  Authorize,
  GetAccessToken,
  PostValidateJwt,
  ShowProgress,
  HideProgress,
  Get,
  Post,
  Put,
  Delete
}
