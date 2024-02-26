let selectedButton = null
let lastClickedElement = null

var normalImage = 'https://raw.githubusercontent.com/TinyGamesCoding/Roblox-Safechat-Extension/main/icons/normal.png'
var hoverImage = 'https://raw.githubusercontent.com/TinyGamesCoding/Roblox-Safechat-Extension/main/icons/hover.png'
var selectedImage = 'https://raw.githubusercontent.com/TinyGamesCoding/Roblox-Safechat-Extension/main/icons/selected.png'

const buttonHeight = 25
const buttonWidth = 150
const margin = 5

//Waits for when an element is focused on, and runs the function!
document.addEventListener('focus', injectSafechatImage, true)

//Textbox Handler Stuffz
function injectSafechatImage() {
  //Just a bunch of checks for if the image doesn't exist yet, and the textbox IS a textbox.
  const textbox = document.activeElement

  if (textbox != null) {
    const tagName = textbox.tagName.toLowerCase()
    const inputType = textbox.getAttribute('type')

    if ((tagName === 'textarea') || (tagName === 'input' && inputType === 'text') || (textbox.contentEditable === "true")) {
      if (document.querySelectorAll('[safechatimage]')[0] == undefined) {
        const image = document.createElement('img')
        image.src = normalImage
        image.width = 24
        image.height = 24

        Object.assign(image.style, {
          position: 'absolute',
          top: textbox.getBoundingClientRect().top + window.pageYOffset + 'px',
          left: textbox.getBoundingClientRect().left + window.pageXOffset + 'px',
          zIndex: '2762',
          opacity: normalOpacity
        })

        image.style.opacity = normalOpacity
        image.setAttribute('safechatImage', true)

        document.body.appendChild(image)

        image.addEventListener('mouseenter', function () { //Hover details.
          if (image.src != selectedImage) {
            image.src = hoverImage
            image.style.opacity = 1
          }
        })

        image.addEventListener('mouseleave', function () { //Stop hovering details.
          if (image.src != selectedImage) {
            image.src = normalImage
            image.style.opacity = normalOpacity
          }
        })

        function repositionSafechatImage() { //Automatically reposition the image on screen resize.
          image.style.top = textbox.getBoundingClientRect().top + window.pageYOffset + 'px'
          image.style.left = textbox.getBoundingClientRect().left + window.pageXOffset + 'px'

          setTimeout(repositionSafechatImage)
        }

        imageFunctions(textbox, image)

        repositionSafechatImage()
      }
    }
  }
}

function imageFunctions(textbox, image) {
  const isOutsideTextboxAndImage = (textbox, target) => {
    if (image.src == selectedImage) {
      if (document.querySelectorAll('[safechatContextMenu]')[0] == undefined) {
        return true
      }
      return false
    } else {
      return !textbox.contains(target) && !image.contains(target)
    }
  }

  document.addEventListener('click', function (event) {
    lastClickedElement = event.target
    if (isOutsideTextboxAndImage(textbox, event.target)) {
      image.remove()
      injectSafechatImage() // Re-inserts the safechat image, if another textbox was selected.
    }
  })



  image.addEventListener('click', function () {
    var contextMenuShown = document.querySelectorAll('[safechatContextMenu]')[0] != undefined
    if (!contextMenuShown) { //Let's generate the safechat menu!
      const buttonList = document.createElement('div')
      buttonList.classList.add('button-list')
      buttonList.style.opacity = 0
      buttonList.setAttribute('safechatContextMenu', true)
      createMenuItems(safechatMessages, buttonList, textbox) //Makes some starter elements, then does the loop to make them all.

      let aboveImage = textbox.getBoundingClientRect().top + window.pageYOffset - image.getBoundingClientRect().height - ((safechatMessages.length - 1) * (buttonHeight + margin))
      let belowImage = textbox.getBoundingClientRect().top + window.pageYOffset + image.getBoundingClientRect().height + margin

      Object.assign(buttonList.style, {
        position: 'absolute',
        zIndex: '2763',
        display: 'flex',
        flexDirection: 'column'
      })

      document.body.appendChild(buttonList)

      function repositionSafechatMenu() {
        //All of this is to reposition the safechat menu when the screen size is changed or anything.
        buttonList.style.left = textbox.getBoundingClientRect().left + window.pageXOffset + 'px'
        aboveImage = textbox.getBoundingClientRect().top + window.pageYOffset - image.getBoundingClientRect().height - ((safechatMessages.length - 1) * (buttonHeight + margin))
        belowImage = textbox.getBoundingClientRect().top + window.pageYOffset + image.getBoundingClientRect().height + margin

        buttonList.style.top = aboveImage + 'px'

        if (buttonList.getBoundingClientRect().top < 0) buttonList.style.top = belowImage + 'px'

        //This is a loop that checks if a menu goes off the screen, and fixes it.
        //This works like a contextMenu in chrome! :D
        buttonList.querySelectorAll(".button-list").forEach((element) => {
          element.style.left = '153px'
          element.style.removeProperty('right')
          if (element.getBoundingClientRect().bottom > window.innerHeight && null != null) { //This is a check for if it moves too far down.
            const screenHeight = window.innerHeight
            const parentRect = element.getBoundingClientRect()
            const distanceToBottom = screenHeight - parentRect.bottom

            if (distanceToBottom < 0) { //If it goes off the screen, move it up!
              const numMultiples = Math.ceil(Math.abs(distanceToBottom) / 30)
              element.style.top = `${parseInt(originalPos) - (30 * numMultiples)}px`
            }
          }

          if (element.getBoundingClientRect().right > window.innerWidth) { //This checks if a menu is outside the screen, then makes it go the other way.
            element.style.right = '153px'
            element.style.removeProperty('left')
          }
        })
        setTimeout(repositionSafechatMenu)
      }

      repositionSafechatMenu()

      setTimeout(() => { //This is just a loop that resizes all the text inside the buttons, so it fits.
        image.src = selectedImage
        image.style.opacity = 1
        const buttons = buttonList.querySelectorAll("button")

        buttons.forEach((button) => {
          let fontSize = 12
          button.style.fontSize = fontSize + 'px'

          while (button.scrollWidth > buttonWidth && fontSize > 3) {
            fontSize--
            button.style.fontSize = fontSize + 'px'
          }
        })
        buttonList.style.opacity = 1
        var menusToHide = document.querySelectorAll('[contextMenuParent]')
        menusToHide.forEach(function (element) {
          element.style.opacity = 1
          element.style.display = 'none'
        })
      })
    } else { //Hide the menu on click.
      var elementsToRemove = document.querySelectorAll('[safechatContextMenu]')
      elementsToRemove.forEach(function (element) {
        element.remove()
      })
      image.src = hoverImage
      image.style.opacity = 1
      textbox.focus()
    }
  })
}

function buttonFunctions(buttonElem, buttonText, textbox) {
  buttonElem.addEventListener('click', function () { //Inputs the message and hides the menu on click.
    textboxCopyToClipboard(textbox, buttonText)
    var elementsToRemove = document.querySelectorAll('[safechatContextMenu]')
    elementsToRemove.forEach(function (element) {
      element.remove()
    })
  })

  buttonElem.addEventListener('mouseenter', function () {
    if (selectedButton != null) { //Hide stuff that isn't inside the hovered button, and change the color back.
      selectedButton.style.backgroundColor = 'white'
      var menusToHide = document.querySelectorAll('[contextMenuParent]')
      menusToHide.forEach(function (element) {
        if (!element.contains(buttonElem)) {
          element.style.display = 'none'
        }
      })
    }

    //The exact opposite of what's above! Set the color of the button background to light gray, and show the stuff inside the hovered button!
    selectedButton = buttonElem
    buttonElem.style.backgroundColor = 'lightgray'
    var menuToShow = buttonElem.parentNode.querySelectorAll('[contextMenuParent]')
    menuToShow.forEach(function (element) {
      if (element.getAttribute("contextMenuParent") == buttonElem.textContent) {
        element.style.display = 'initial'
      }
    })
  })
}

function makeSafechatButton(text) {
  let buttonElem = document.createElement('button')
  buttonElem.textContent = text
  Object.assign(buttonElem.style, { //ALL the styles that gets applied to a button. Height, color, ect.
    height: buttonHeight + 'px',
    width: buttonWidth + 'px',
    backgroundColor: 'white',
    border: '1px solid black',
    color: 'black',
    textAlign: 'center',
    marginBottom: margin + 'px',
    whiteSpace: 'nowrap',
    cursor: 'pointer'
  })

  //Check for the oldSafechatLook setting.
  if (oldSafechatLook == true) buttonElem.style.fontFamily = 'Comic Sans MS'
  else buttonElem.style.fontFamily = 'Arial'
  return buttonElem
}

function createMenuItems(messages, parent, textbox) {
  selectedButton = null //Reset the selected button when making the buttons.

  messages.forEach((item, index) => {
    if (Array.isArray(item)) { //If the item is a group of messages, do this instead!
      const [startingItem, ...subItems] = item
      //This makes the button in the group, so you can see the subgroup.
      const startingButtonElem = makeSafechatButton(startingItem)
      parent.appendChild(startingButtonElem)
      buttonFunctions(startingButtonElem, startingButtonElem.textContent, textbox)

      //Now, we make a new group list, and restart the loop!
      const newParent = document.createElement('div')
      newParent.classList.add('button-list')
      newParent.setAttribute('contextMenuParent', startingItem)
      newParent.style.opacity = 0
      newParent.style.position = 'absolute'
      newParent.style.left = '153px'

      const observer = new MutationObserver((mutationsList, observer) => { //Resize the button-list when a new button is added.
        newParent.style.top = `${index * 30}px`

        if (newParent.getBoundingClientRect().bottom > window.innerHeight) {
          const screenHeight = window.innerHeight
          const parentRect = newParent.getBoundingClientRect()
          const distanceToBottom = screenHeight - parentRect.bottom

          if (distanceToBottom < 0) {
            const numMultiples = Math.ceil(Math.abs(distanceToBottom) / 30)
            newParent.style.top = `${parseInt(index * 30) - (30 * numMultiples)}px`
          }
        }
      })

      observer.observe(newParent, { childList: true, subtree: true })

      createMenuItems(subItems, newParent, textbox)

      parent.appendChild(newParent, parent)
    } else {
      //Put the button inside the group, and make it.
      const buttonElem = makeSafechatButton(item)
      buttonFunctions(buttonElem, buttonElem.textContent, textbox)
      parent.appendChild(buttonElem, parent)
    }
  })
}

async function textboxCopyToClipboard(textbox, text) {
  //This saves the text for restoring the clipboard later.
  if (revertClipboard == true) {
    var textarea = document.createElement("textarea")
    document.body.appendChild(textarea)
    textarea.focus()
    document.execCommand("paste")
    originalClipboardData = textarea.value
    document.body.removeChild(textarea)

    textbox.focus()
  }
  
  //Now, we paste the text into the textbox!
  navigator.clipboard.writeText(text).then(function () {
    const successful = document.execCommand("paste")
    if (successful) {
      //Now we revert the clipboard, and re-focus the textbox!
      if (originalClipboardData != null && revertClipboard == true) revertClipboardData(textbox)
      textbox.focus()
      injectSafechatImage(textbox)
    }
  }).catch(function (err) {
    //Oh noes, it couldn't copy. :(
    console.error('Unable to copy text to clipboard. ', err)
  })
}