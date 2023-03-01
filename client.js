const request = require('request');
const url = require('url');

exports.ApiClient = class {
  constructor(api_key, base_url="https://cockpit.shirtigo.com/api") {
    if (api_key.length < 100) {
      console.warn("The provided API token appears to be shorter than expected.");
    }

    this.api_key = api_key;
    this.base_url = base_url;
  }

  _request(endpoint, method="GET", data={}, params={}, files={}) {
    return new Promise((resolve, reject) => {
      let headers = {
        "User-Agent": "Shirtigo Cockpit Node REST API Client",
        "Authorization": "Bearer " + this.api_key,
        "Accept": "application/json",
        "Content-Type": "application/json",
      };

      let absolute_url = url.resolve(this.base_url, endpoint);

      let request_options = {
        method: method,
        uri: absolute_url,
        headers: headers,
        json: true,
      };

      if (Object.keys(params).length > 0) {
        request_options.qs = params;
      }

      if (Object.keys(data).length > 0) {
        request_options.body = data;
      }

      let error = function(err) {
        console.error(err);
        reject(err);
      }

      let req = request(request_options, function(err, response, body) {
        if (err) {
          error(err);
        }

        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.body)

          return;
        }

        if (response.statusCode == 401) {
          if (response.request.uri.href != absolute_url) {
            error("Authentication error. Make sure that the client base url exactly matches the documentation.");
          } else {
            error("Authentication error. Check whether the provided API key is valid.");
          }
        } else if (response.statusCode == 405) {
          error(method + " is not valid a valid HTTP verb for the '" + endpoint + "' endpoint.");
        } else if (response.statusCode == 422) {
          error("Input validation failed: " + JSON.stringify(body["errors"]));
        } else {
          let data = {};
          try {
            data = JSON.parse(body);
          } catch (e) {}
          if (data.hasOwnProperty("message")) {
            error("Endpoint returned HTTP status " + response.statusCode + ": " + data["message"]);
          } else {
            error("Endpoint returned unhandled HTTP status " + response.statusCode);
          }
        }
      });

      if (Object.keys(files).length > 0) {
        let form = req.form();

        for (var name in files) {
          if (!files.hasOwnProperty(name)) {
            continue;
          }
          form.append(name, files[name]);
        }
      }
    });
  }

  get(url, params={}) {
    return this._request(url, "GET", {}, params);
  }

  post(url, data={}, params={}, files={}) {
    return this._request(url, "POST", data, params, files);
  }

  put(url, data={}, params={}, files={}) {
    return this._request(url, "PUT", data, params, files);
  }

  delete(url, params={}) {
    return this._request(url, "DELETE", {}, params);
  }
}
