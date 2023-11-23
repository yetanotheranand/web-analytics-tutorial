document.addEventListener('DOMContentLoaded', function () {
  sendAnalyticsData(window.location.pathname, 'page_load');
  document.addEventListener('click', (event) => {
    sendAnalyticsData(window.location.pathname, 'click:' + event.target.outerHTML)
  });
}, false);

function sendAnalyticsData(page, event) {
  if (window &&
    window.navigator &&
    typeof window.navigator.sendBeacon === "function" &&
    typeof window.Blob === "function") {

    var blobData = new Blob([JSON.stringify({
      "page": page,
      "event": event,
      "visitor": getVisitorId(),
      "ts": Date.now()
    })], { type: 'application/json' });

    try {
      if (window.navigator.sendBeacon('http://127.0.0.1:8080/analytics/', blobData)) {
        console.log('Event sent')
        return;
      }
    } catch (e) {
      console.error('Event sending failed')
    }
  }
}

function getVisitorId() {
  const readToken = function (key) {
    return localStorage.getItem('v_id');
  };

  const writeToken = function (value) {
    return localStorage.setItem('v_id', value);
  };

  const generateVisitorId = function () {
    const timestamp = new Date().getTime().toString(16);
    const randomDigits = (Math.floor(Math.random() * (999999 - 100000) + 100000)).toString(16);
    const token = timestamp + randomDigits;
    writeToken(token);
    return token;
  };

  const visitorId = readToken('v_id') || generateVisitorId();
  return visitorId;
}
