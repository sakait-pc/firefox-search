export const LOCAL_BASE_URL = "http://localhost:5173";

export const ROOT_ID = 1;

export const PLACES_SQLITE = "places.sqlite";
export const DETAIL_PRE = `Firefox Search need to know the path to the \
original '${PLACES_SQLITE}' file. You specify the path, this app copy \
the file in order not to break it. By default, the path is:\n\n`;

const detailURL =
  "See \
https://support.mozilla.org/en-US/kb/profiles-where-firefox-stores-user-data";
const detailOK = "Click OK button and then File Explorer will open.";
export const DETAIL_POST = `\n\n${detailURL}\n\n${detailOK}`;
