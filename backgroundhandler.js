let selectableGroups = false
let messageLoadingError = false
var loadedMessages = 0 //Logging all the registered texts, so we can get them later! :D
let settings = null

function reloadExtensionIcon() {
  if (messageLoadingError == true) {
    chrome.action.setIcon({ path: 'icons/error.png' })
    return
  }
  chrome.action.setIcon({ path: 'icons/normal.png' })

  chrome.storage.sync.get('safechatSettings', function (data) {
    var curSettings = data.safechatSettings || {
      contextMenuEnabled: true,
      textboxMenuEnabled: true,
      selectableGroups: false,
      oldSafechatLook: false,
      revertClipboard: true,
      normalOpacity: 0.5
    }

    if (curSettings.contextMenuEnabled == false && curSettings.textboxMenuEnabled == false)
      chrome.action.setIcon({ path: 'icons/disabled.png' })
  })
}

//Change the icon when the settings gets closed.
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "safechatSettings") {
    port.onDisconnect.addListener(reloadExtensionIcon)
  }
})

//Execute the scripts, depending on if they are enabled or not!
//Or, load the safechat messages.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.info == "sendSafechatInfo") {
    messageLoadingError = false
    reloadExtensionIcon()
    settings = message.settings
    selectableGroups = settings.selectableGroups

    chrome.contextMenus.removeAll()
    loadedMessages = 0

    if (message.safechatMessages == null) return

    if (settings.contextMenuEnabled == true) createContextMenuItems(message.safechatMessages)

    if (settings.textboxMenuEnabled == true)
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id, allFrames: true },
        files: ['textboxhandler.js'],
      })
  } else if (message.info === "loadSafechatArray") {
    fetch("settings/messages.json")
      .then(response => response.json())
      .then(data => {
        sendResponse({ success: true, data: data })
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  } else if (message.info == "messageLoadError") {
    messageLoadingError = true
    chrome.action.setIcon({ path: 'icons/error.png' })
  }
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith("safechatContextMenu-")) {
    var parts = info.menuItemId.split("-");
    var textToInsert = parts[parts.length - 1]; // Access the last element of the array

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs[0];
      if (tab) {
        try {
          chrome.tabs.sendMessage(tab.id, {info: "insertSafechat", text: textToInsert}, function () {
            if (chrome.runtime.lastError) {

            } else {

            }
          });
        } catch (error) {
          console.error("Error: " + error.message);
        }
      } else {
        console.error("Error: No active tab found.");
      }
    })
  }
})

function makeButton(title, parent) { //A function that checks if it's in a parent or not, then makes the context button.
  let contextMenuId
  if (parent != null) {
    contextMenuId = chrome.contextMenus.create({
      id: "safechatContextMenu-" + loadedMessages + "-" + title,
      title: title,
      contexts: ["editable"],
      parentId: parent,
    })
  } else {
    contextMenuId = chrome.contextMenus.create({
      id: "safechatContextMenu-" + loadedMessages + "-" + title,
      title: title,
      contexts: ["editable"],
    })
  }
  loadedMessages += 1
  return contextMenuId
}

const createContextMenuItems = (messages, parent) => { //Makes each context menu button.
  return messages.map((item) => {
    if (Array.isArray(item)) {
      const [startingItem, ...subItems] = item

      const categoryMenuItem = chrome.contextMenus.create({
        id: "safechatContextMenu-" + loadedMessages,
        title: startingItem,
        contexts: ["editable"],
        parentId: parent,
      })

      loadedMessages += 1

      if (selectableGroups == true) {
        makeButton(item[0], categoryMenuItem)
      } else loadedMessages += 1
      createContextMenuItems(subItems, categoryMenuItem)
    } else {
      return makeButton(item, parent)
    }
  })
}