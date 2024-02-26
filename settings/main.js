document.addEventListener('DOMContentLoaded', function () {
    chrome.action.setIcon({ path: 'selected.png' })
    var settingsMenu = document.getElementById('safechatSettingsMenu')
    chrome.runtime.connect({ name: "safechatSettings" });

    chrome.storage.sync.get('safechatSettings', function (data) {
        var settings = data.safechatSettings || {
            contextMenuEnabled: true,
            textboxMenuEnabled: true,
            selectableGroups: false,
            oldSafechatLook: false,
            revertClipboard: true,
            normalOpacity: 0.5
        }
        document.getElementById('revertClipboard').checked = settings.revertClipboard

        document.getElementById('contextMenuEnabled').checked = settings.contextMenuEnabled
        document.getElementById('selectableGroups').checked = settings.selectableGroups

        document.getElementById('textboxMenuEnabled').checked = settings.textboxMenuEnabled
        document.getElementById('oldSafechatLook').checked = settings.oldSafechatLook
        document.getElementById('normalOpacity').value = settings.normalOpacity
    })

    document.getElementById('resetSettings').addEventListener('click', function (event) {
        var settings = {
            contextMenuEnabled: true,
            textboxMenuEnabled: true,
            selectableGroups: false,
            oldSafechatLook: false,
            revertClipboard: true,
            normalOpacity: 0.5
        }
        document.getElementById('revertClipboard').checked = settings.revertClipboard

        document.getElementById('contextMenuEnabled').checked = settings.contextMenuEnabled
        document.getElementById('selectableGroups').checked = settings.selectableGroups

        document.getElementById('textboxMenuEnabled').checked = settings.textboxMenuEnabled
        document.getElementById('oldSafechatLook').checked = settings.oldSafechatLook
        document.getElementById('normalOpacity').value = settings.normalOpacity

        chrome.storage.sync.set({ 'safechatSettings': settings })
    })

    document.getElementById('normalOpacity').addEventListener('input', function (event) {
        var input = event.target
        var value = parseFloat(input.value.trim()) || 0

        if (value < 0) input.value = 0
        if (value > 1) input.value = 1
    })

    settingsMenu.addEventListener('change', function () {
        var settings = {
            revertClipboard: document.getElementById('revertClipboard').checked,

            contextMenuEnabled: document.getElementById('contextMenuEnabled').checked,
            selectableGroups: document.getElementById('selectableGroups').checked,

            textboxMenuEnabled: document.getElementById('textboxMenuEnabled').checked,
            oldSafechatLook: document.getElementById('oldSafechatLook').checked,
            normalOpacity: document.getElementById('normalOpacity').value
        }

        chrome.storage.sync.set({ 'safechatSettings': settings })
    })

    chrome.runtime.sendMessage({ info: "loadSafechatArray" }, function (response) {
        if (!response || !response.success) {
            document.querySelectorAll('body *').forEach(element => {
                if (element.style.display === 'none') {
                    element.style.display = '';
                    if (element.id == 'ErrorMessage') element.textContent = 'Error: ' + response.error
                } else if (element.id != 'ResetSettingsText' && element.id != 'resetSettings') {
                    element.style.display = 'none';
                }
            });
        }
    })
})