const observacionesDiv = document.getElementById('observacionesDiv')
const cedula = document.getElementById('cedulaP').value
console.log(cedula)

start('27039054')

async function start(id){
    let dataa
    const response = await fetch(`/observaciones/${id}`)
    const data = await response.json();
    console.log(data)
    printAllObservations(data)
    return data
}

function printAllObservations(data){
    console.log(data)
    data.forEach(dataset => {
        let paragraphOne = document.createElement('p')
        let paragraphTwo = document.createElement('p')

        paragraphOne.innerHTML = dataset.fechaConsulta;
        paragraphTwo.innerHTML = dataset.Observaciones;

        observacionesDiv.appendChild(paragraphOne)
        observacionesDiv.appendChild(paragraphTwo)
    });
}