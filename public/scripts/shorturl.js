const urlform = document.getElementById('formForUrl')
const testurl = document.getElementById('testurl')
const userurl = document.getElementById('url')
const warmessage = document.getElementById('warmessage')
const copytoclipboard = document.getElementById('copytoclipboard')
const usershorturl = document.getElementById('usershorturl')

userurl.addEventListener('keypress', event => {
    warmessage.innerText = ""
})

copytoclipboard.addEventListener('click', event => {
    event.preventDefault()
    navigator.clipboard.writeText(usershorturl.value)
})

urlform.addEventListener('submit', event => {
    if( !isValidUrl(userurl.value) ){
        event.preventDefault()
        warmessage.innerText = "Please enter a valid value"
    }
})

testurl.addEventListener('click', event => {
    if( isValidUrl(userurl.value) ){
        testurl.href = userurl.value
    }
    else{
        event.preventDefault()
        warmessage.innerText = "Please enter a valid value"
    }
})

const isValidUrl = urlString=> {
    try { 
        return Boolean(new URL(urlString)); 
    }
    catch(e){ 
        return false; 
    }
}

"<% if(message) {%>"