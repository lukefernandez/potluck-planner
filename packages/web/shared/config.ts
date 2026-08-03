// The deployed API's address, checked in deliberately: it is a public endpoint
// that ships in the browser bundle either way, and holding it in source means a
// fresh clone builds and runs with no environment setup. `sst deploy` prints it
// as the `api` output.
export const API_URL = "https://jzd3kozbic.execute-api.us-east-1.amazonaws.com";
