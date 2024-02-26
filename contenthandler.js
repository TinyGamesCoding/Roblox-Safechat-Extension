//Gets the settings when a tab is reloaded.
let safechatMessages = []
let messageLoadingError = false

let normalOpacity = 0.5
let oldSafechatLook = false
let revertClipboard = true

function reloadSettings(firstLoad) {
  chrome.storage.sync.get('safechatSettings', function (data) {
    var settings = data.safechatSettings || {
      contextMenuEnabled: true,
      textboxMenuEnabled: true,
      selectableGroups: false,
      oldSafechatLook: false,
      revertClipboard: true,
      normalOpacity: 0.5
    }


    normalOpacity = settings.normalOpacity
    oldSafechatLook = settings.oldSafechatLook
    revertClipboard = settings.revertClipboard
    chrome.runtime.sendMessage({ info: "loadSafechatArray" }, function (response) {
      if (response && response.success) {
        safechatMessages = response.data
        console.log("woah")
        if(firstLoad == true) chrome.runtime.sendMessage({ info: "sendSafechatInfo", settings: settings, safechatMessages: safechatMessages })
      } else {
        messageLoadingError = true
        chrome.runtime.sendMessage({ info: "messageLoadError" })
      }
    })
  })
}

reloadSettings(true)

let originalClipboardData = null
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.info == "insertSafechat") {
    if(message.text)
    reloadSettings()
    return copyToClipboard(message.text)
  }
})

function win(doc) {
  return doc.ownerDocument.defaultView
}

function documentActive(e = document, t = !0) {
  let n
  if (n = e.host ? e.host.ownerDocument : e,
    t && !n.hasFocus())
    try {
      if (n.defaultView.parent && n.defaultView.parent !== n.defaultView)
        return documentActive(n.defaultView.parent.document)
    } catch (e) {
      //Nothing.
    }
  const o = e.activeElement
  if (o) {
    if (o.shadowRoot)
      return documentActive(o.shadowRoot)
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
  //Gets the textbox, and saves it.
  const textbox = await documentActive(document)

  //Saves the current clipboard data.
  if(revertClipboard == true) {
    var textarea = document.createElement("textarea")
    document.body.appendChild(textarea)
    textarea.focus()
    document.execCommand("paste")
    originalClipboardData = textarea.value
    document.body.removeChild(textarea)

    textbox.focus() //Brings us back to the element!!
  }

  navigator.clipboard.writeText(text).then(function () {
    const successful = document.execCommand("paste")
    if (successful) {
      //Now we revert the clipboard, and re-focus the textbox!
      if (originalClipboardData != null && revertClipboard == true) revertClipboardData(textbox)
      textbox.focus()
    }
  }).catch(function (err) {
    //Oh noes, it couldn't copy. :(
    console.error('Unable to copy text to clipboard. ', err)
  })
}

async function revertClipboardData() {
  if (originalClipboardData) {
    //Just writes the saved text back onto the clipboard.
    await navigator.clipboard.writeText(originalClipboardData)
    originalClipboardData = undefined
  }
}