const cedula = document.getElementById('cedula')

cedula.addEventListener('blur',() =>{
    if(cedula.value === ''){
        showAlert('cedula')
        cedula.focus
    }else{
        let typedCedula = cedula.value
        console.log(typedCedula)
        start(typedCedula)
    }
}) 

function verify(data){
    if(data.length > 0){
        alert('Paciente ya existe')
        cedula.value = ''
        cedula.focus()
    }else{
        return true
    }
}

async function start(id){
    let dataa
    const response = await fetch(`/cedulas/${id}`)
    const data = await response.json();
    console.log(data)
    verify(data)
    return data
}


  
const cedulaa = document.getElementById('cedula')
const nombre = document.getElementById('namelia')
const apellido = document.getElementById('apellido')
const motivoConsulta = document.getElementById('motivoConsulta')

nombre.addEventListener('blur', ()=>{
  validateEmpty(nombre.value, 'NOMBRE') ? console.log('ok') : nombre.focus
})
apellido.addEventListener('blur', ()=>{
  validateEmpty(apellido.value, 'APELLIDO') ? console.log('ok') : apellido.focus
})
motivoConsulta.addEventListener('blur', ()=>{
  validateEmpty(motivoConsulta.value, 'MOTIVO DE CONSULTA') ? console.log('ok') : motivoConsulta.focus
})

function validateEmpty(value, campo){
    if(value === ''){
       showAlert(campo)
        return false
    }else{
        return true
    }
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