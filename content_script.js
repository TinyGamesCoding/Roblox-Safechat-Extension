let originalClipboardData = null

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.command == "insertSafechat")
    copyToClipboard(message.text)
});

function win(doc) {
  return doc.ownerDocument.defaultView
}

function documentActive(e = document, t = !0) {
  let n;
  if (n = e.host ? e.host.ownerDocument : e,
    t && !n.hasFocus())
    try {
      if (n.defaultView.parent && n.defaultView.parent !== n.defaultView)
        return documentActive(n.defaultView.parent.document)
    } catch (e) {
      //Nothing.
    }
  const o = e.activeElement;
  if (o) {
    if (o.shadowRoot)
      return documentActive(o.shadowRoot);
    if (t && o instanceof win(o).HTMLIFrameElement)
      try {
        return documentActive(o.contentWindow.document)
      } catch (e) {
        return o
      }
  }
  return o
}

async function copyToClipboard(text) {
  //saves the textbox for later :3
  const selectedelement = await documentActive(document)

  //dumb stuff to get the current clipboard item >:/
  var textarea = document.createElement("textarea");
  document.body.appendChild(textarea);
  textarea.focus();
  document.execCommand("paste");
  originalClipboardData = textarea.value;
  document.body.removeChild(textarea);

  selectedelement.focus(); //bring us back!!

  navigator.clipboard.writeText(text).then(function () {
    paste(selectedelement.ownerDocument)
  }).catch(function (err) {
    console.error('Unable to copy text to clipboard. ', err); // :(
  })
}

async function paste(e) {
  const successful = e.execCommand("paste")
  if (successful) {
    // YAYYYYYYYYYYY I TOTALLY DIDNT LOOK FOR THIS STUPIDLY EASY SOLUTION FOR 2 DAYS :sob:
    revertClipboardData()
  }
}

async function revertClipboardData() {
  if (originalClipboardData) {
    await navigator.clipboard.writeText(originalClipboardData);
    originalClipboardData = undefined;
  }
}