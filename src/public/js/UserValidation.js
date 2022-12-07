const username = document.getElementById('username')
const password =  document.getElementById('password')
const btn = document.querySelector('.btn')
const form = document.getElementById('form')
let usernameClear = false, passwordClear = false;
clearCamps()

username.addEventListener('blur',() =>{
    let typedusername = username.value
    console.log(typedusername)
    start(typedusername)
})

password.addEventListener('change', ()=>{
    console.log(password.value)
    validPassword(password.value) ? console.log('ok') : showAlert('Password must have at least 8 characters with at least 1 number and 1 letter')
})

btn.addEventListener('click', ()=>{
    if(usernameClear && passwordClear){
        form.submit()
    }else{
        start(username.value)
        validPassword(password.value)
    }
})

function verify(data){
    if(data.length > 0){
        showAlert('Ya existe un usuario con ese Username')
        username.value = ''
        username.focus()
    }else{
        usernameClear = true
        return true
    }
}

function validPassword(typedPassword){
    let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
    if(typedPassword.match(regex)){
        passwordClear= true
        return true
    }else{
        return false
    }
}


function clearCamps(){
    username.value =''
    document.getElementById('password').value= ''
    document.getElementById('nombre').value= ''
    return true
}


async function start(id){
    let dataa
    const response = await fetch(`/usernames/${id}`)
    const data = await response.json();
    console.log(data)
    verify(data)
    return data
}


  
function showAlert(campo){
    const alertDiv = document.querySelector('.alertDiv')
    var div = document.createElement('div')
    div.innerHTML = `<div class="alert alert-danger" role="alert">
    Hey! El campo ${campo} no puede estar vacio
  </div>`
    setTimeout(()=>{
        alertDiv.removeChild(div)
    }, 5000)
    alertDiv.appendChild(div)
}