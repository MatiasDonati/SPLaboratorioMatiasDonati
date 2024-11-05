
const formPpal = document.getElementById('formPpal');
const divSpinner = document.getElementById('spinner_container');

const cuerpoTabla = document.getElementById('fuenteCuerpo');
const cabeceraTabla = document.getElementById('fila');
const col_id = document.querySelector('.col_id');
const col_modelo = document.querySelector('.col_modelo');
const col_anoFabricacion = document.querySelector('.col_anoFabricacion');
const col_velMax = document.querySelector('.col_velMax');
const col_cantidadPuertas = document.querySelector('.col_cantidadPuertas');
const col_carga = document.querySelector('.col_carga');
const col_asientos = document.querySelector('.col_asientos');
const col_autonomia = document.querySelector('.col_autonomia');

const formABM = document.getElementById('formABM');
const formTitulo = document.getElementById('formTitulo');
const btnAgregar = document.getElementById('agregar');
const abmSel_tipo = document.getElementById('abmSel_tipo');
const abm_tipo = document.getElementById('div_tipo');
const inpId = document.querySelector('.formInputs #inp_id');
const inpModelo = document.querySelector('.formInputs #inp_modelo');
const inpAnoFabricacion = document.querySelector('.formInputs #inp_anoFabricacion');
const inpVelMax = document.querySelector('.formInputs #inp_velMax');
const inpCantidadPuertas = document.querySelector('.formInputs #inp_cantPuertas');
const inpAsientos = document.querySelector('.formInputs #inp_asientos');
const inpCarga = document.querySelector('.formInputs #inp_carga');
const inpAutonomia = document.querySelector('.formInputs #inp_autonomia');
const inpAuto = document.querySelector('.formInputs .inputAuto');
const inpCamion = document.querySelector('.formInputs .inputCamion');

const abmAceptar = document.getElementById('aceptar');
const abmCancelar = document.getElementById('cancelar');

let abmId;
let abmModelo;
let abmAnoFabricacion;
let abmVelMax;
let abmCantidadPuertas;
let abmAsientos;
let abmCarga;
let abmAutonomia;

var arrayGeneral = [];


function LeerJson() {

	ActivarSpinner(true);

	let xhttp = new XMLHttpRequest();
	
	xhttp.onreadystatechange = () => {
		if (xhttp.readyState == 4) {
			ActivarSpinner(false);
			if (xhttp.status == 200) {
				try {
					let objetoJson = JSON.parse(xhttp.responseText);
					InstanciarVehiculos(objetoJson);
					CargarTabla(arrayGeneral);
				} catch (error) {
					console.log('No se pudo realizar el Parse del JSON:', error);
					alert("Error en el proceso.");
				}
			} else {
				alert("No se pudieron obtener los datos.");
			}
		}
	};
	xhttp.open("GET", "https://examenesutn.vercel.app/api/VehiculoAutoCamion", true);
	xhttp.setRequestHeader('Content-Type', 'application/json');
	xhttp.send();
}

function InstanciarVehiculos(array) {
    array.forEach(vehiculo => {

        if (vehiculo.hasOwnProperty("cantidadPuertas") && vehiculo.hasOwnProperty("asientos")) {
            let auto = new Auto(vehiculo.id, vehiculo.modelo, vehiculo.anoFabricacion, vehiculo.velMax, vehiculo.cantidadPuertas, vehiculo.asientos);

            arrayGeneral.push(auto);
        } else if (vehiculo.hasOwnProperty("carga") && vehiculo.hasOwnProperty("autonomia")) {
            let camion = new Camion(vehiculo.id, vehiculo.modelo, vehiculo.anoFabricacion, vehiculo.velMax, vehiculo.carga, vehiculo.autonomia);
            arrayGeneral.push(camion);
        }
    });
}

async function AltaVehiculo(vehiculo) {

	if (ValidarVehiculo(vehiculo)) {

		ActivarSpinner(true);
		try {
			let respuesta = await fetch('https://examenesutn.vercel.app/api/VehiculoAutoCamion', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(vehiculo)
			});

			ActivarSpinner(false);
			
			if (respuesta.status === 200) {
				let objJson = await respuesta.json();
				vehiculo.id = objJson.id;
				arrayGeneral.push(vehiculo);
				Swal.fire({
					icon: 'success',
					title: '¡Hecho!',
				  });
				  
			} else {
				SwalFireError("Hubo un problema con el alta!")
			}
		} catch (error) {
			console.error('Error:', error);
			SwalFireError("Hubo un problema con el alta!")
		} finally {
			CerrarABM();
		}
	} else {
		SwalFireError('Revise los campos a completar!.\n El año debe ser mayor a 1985.\nLa velocidad mayor a 0.\nSi es Auto:\n 3 o mas puertas y 3 o mas asientos\nSi es Camion:\nCarga maayor a 0\n Autonomia mayor a 0.')
	}
}

function ModificarVehiculo(vehiculo) {

	let consulta = null;
	let auto = vehiculo instanceof Auto && InputsValidosAuto();
	let camion = vehiculo instanceof Camion && InputsValidosCamion();
	if (auto || camion) {
		ActivarSpinner(true);
		
		fetch('https://examenesutn.vercel.app/api/VehiculoAutoCamion', {
			method: 'PUT',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: JSON.stringify(vehiculo)
		})
		.then(response => {
			ActivarSpinner(false);
			consulta = response;
			if (consulta.status === 200) {
				vehiculo.modelo = abmModelo;
				vehiculo.anoFabricacion = abmAnoFabricacion;
				vehiculo.velMax = abmVelMax;
				if (auto) {
					vehiculo.cantidadPuertas = parseInt(abmCantidadPuertas);
					vehiculo.asientos = parseInt(abmAsientos);
				} else {
					vehiculo.carga = abmCarga;
					vehiculo.autonomia = abmAutonomia;
				}
				Swal.fire({
					icon: 'success',
					title: '¡Hecho!',
				});
			} else {
				SwalFireError('Hubo un problema con la modificación!');
			}
		})
		.catch(error => {
			console.error('Error:', error);
			SwalFireError('Hubo un problema con la modificación!');
		})
		.finally(() => {
			CerrarABM();
		});
		
	} else {
		SwalFireError('Revise los campos a completar!');
	}
}

async function EliminarVehiculo(vehiculo) {

    if (vehiculo instanceof Auto || vehiculo instanceof Camion) {
        try {
            ActivarSpinner(true);
            const consulta = await fetch('https://examenesutn.vercel.app/api/VehiculoAutoCamion', {
                method: "DELETE",
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin",
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: JSON.stringify({ id: vehiculo.id })
            });

            ActivarSpinner(false);
            if (consulta.ok) {
                let index = BuscarVechiculo(vehiculo.id);
                arrayGeneral.splice(index, 1);
				Swal.fire(
					'¡Bien hecho!',
					'La Baja de "' + vehiculo.modelo + '" fue exitosa',
					'success'
				  );
            } else {
                const errorResponse = await consulta.text();
                console.error("Error en la respuesta:", errorResponse);
				SwalFireError('Hubo un problema con la baja! Respuesta: ' + errorResponse);
            }
        } catch (error) {
            console.error("Error de conexión o de red:", error);
			SwalFireError('Hubo un problema al conectar con el servidor.');
        } finally {
            ActivarSpinner(false);
            CerrarABM();
        }
    } else {
		SwalFireError('Revise los campos a Borrar!.');
    }
}

function CargarTabla(vehiculos) {

	cuerpoTabla.innerHTML = "";

	vehiculos.forEach(vehiculo => {

		let arrayVehiculo = [vehiculo.id, vehiculo.modelo, vehiculo.anoFabricacion, vehiculo.velMax, vehiculo.cantidadPuertas, vehiculo.asientos, vehiculo.carga, vehiculo.autonomia];

		let nuevaFila = document.createElement("tr");
		nuevaFila.id = vehiculo.id;

		let celda;
		arrayVehiculo.forEach(dato => {
			let datoAEscribir = dato != null ? dato.toString() : "N/A";
			celda = document.createElement("td");
			celda.className = nuevaFila.id;
			celda.id = `vehi${arrayVehiculo[0]}Val${datoAEscribir}`;
			celda.textContent = datoAEscribir;
			nuevaFila.appendChild(celda);
		});

		let botones = ["Modificar", "Eliminar"];
		botones.forEach(btnStr => {
			let input = document.createElement("input");
			input.type = "button";
			input.id = btnStr + 'Vehi' + vehiculo.id;

			input.value = btnStr;
			input.addEventListener('click', AbmModifElim);

			celda = document.createElement("td");
			celda.appendChild(input);
			nuevaFila.appendChild(celda);
		});

		cuerpoTabla.appendChild(nuevaFila);
	});
}

function ActivarSpinner(estado) {
	estado ? divSpinner.style.setProperty("display", "flex") : divSpinner.style.removeProperty("display");
}

btnAgregar.onclick = function () {

	MostrarFormABM();
	
	abm_tipo.style.display = 'inherit';
	abmAceptar.innerText = 'Aceptar';
	formTitulo.innerText = 'Alta';

	abmSel_tipo.value = "";
	inpCamion.style.display = 'none';
	inpAuto.style.display = 'none';
}

function AbmModifElim(event) {

	let idFila = event.target.parentNode.parentNode.id;
	let indexVehiculo = BuscarVechiculo(idFila);
	let vehiculoSeleccionado = indexVehiculo != -1 ? arrayGeneral[indexVehiculo] : null;

	if (vehiculoSeleccionado) {
		MostrarFormABM();

		abm_tipo.style.display = 'none';
		abmAceptar.innerText = event.target.value;
		formTitulo.innerText = event.target.value == 'Modificar' ? 'Modificación' : 'Baja';

		inpId.value = vehiculoSeleccionado.id;
		inpModelo.value = vehiculoSeleccionado.modelo;
		inpAnoFabricacion.value = vehiculoSeleccionado.anoFabricacion;
		inpVelMax.value = vehiculoSeleccionado.velMax;

		if (vehiculoSeleccionado instanceof Auto) {
			inpAuto.style.display = 'inherit';
			inpCamion.style.display = 'none';
			inpCantidadPuertas.value = vehiculoSeleccionado.cantidadPuertas;
			inpAsientos.value = vehiculoSeleccionado.asientos;

		} else {
			inpAuto.style.display = 'none';
			inpCamion.style.display = 'inherit';
			inpCarga.value = vehiculoSeleccionado.carga;
			inpAutonomia.value = vehiculoSeleccionado.autonomia;

		}
	} else {
		alert("Hubo un problema!");
	}

	abmAceptar.innerText == 'Eliminar' ? BloquearInputs(true) : BloquearInputs(false);

}

function BloquearInputs(estado) {
	let inputs = [inpModelo, inpAnoFabricacion, inpVelMax, inpCantidadPuertas, inpCarga, inpAsientos, inpAutonomia];
	inputs.forEach(element => {
		element.readOnly = estado;
		element.style.cursor = estado ? 'not-allowed' : 'auto';
	});
};

abmAceptar.onclick = function () {

    abmId = inpId.value;
    abmModelo = inpModelo.value;
    abmAnoFabricacion = inpAnoFabricacion.value;
    abmVelMax = inpVelMax.value;

	abmAsientos = inpAsientos.value;
	abmAutonomia = inpAutonomia.value;

    abmCantidadPuertas = inpCantidadPuertas.value;
    abmCarga = inpCarga.value;

    let auxVehiculos = arrayGeneral;

    let tituloUpperCase = formTitulo.innerText.toLocaleUpperCase();

    if (tituloUpperCase === 'ALTA') {
        if (abmSel_tipo.value === 'C') {
			let auto = new Auto(null, abmModelo, abmAnoFabricacion, abmVelMax, abmCantidadPuertas, abmAsientos);
            auto.autoExiste(auxVehiculos) ? alert("Este auto ya existe!") : AltaVehiculo(auto);
        } else if (abmSel_tipo.value === 'E') {
			let camion = new Camion(null, abmModelo, abmAnoFabricacion, abmVelMax, abmCarga, abmAutonomia);
            camion.camionExiste(auxVehiculos) ? alert("Este ciudadano ya existe!") : AltaVehiculo(camion);
        } else {
            SwalFireError('Completa bien los datos!');
        }
    } else {
        let index = BuscarVechiculo(abmId);
        formTitulo.innerText == 'MODIFICACIÓN' ? ModificarVehiculo(auxVehiculos[index]) : EliminarVehiculo(auxVehiculos[index]);
    }
}

abmCancelar.onclick = CerrarABM;

abmSel_tipo.addEventListener('change', () => {

	if (abmSel_tipo.value === 'C') {
		inpCamion.style.display = 'none';
		inpAuto.style.display = 'inherit';
	} else {
		inpAuto.style.display = 'none';
		inpCamion.style.display = 'inherit';
	}
});

function BuscarVechiculo(id) {
	let index = -1;
	for (let i = 0; i < arrayGeneral.length; i++) {
		let vehiculo = arrayGeneral[i];
		if (vehiculo.id == id) {
			index = i;
			break;
		}
	}
	return index;
}

function InputsValidosAuto() {
	
	let modelo = inpModelo.value;
	let anoFabricacion = inpAnoFabricacion.value;
	let velMax = inpVelMax.value;
	let cantidadPuertas = inpCantidadPuertas.value;
	let asientos = inpAsientos.value;

	return modelo.trim() && parseInt(anoFabricacion) > 1985 && parseInt(velMax) > 0 && parseInt(cantidadPuertas) > 2 && parseInt(asientos) > 2;
}

function InputsValidosCamion() {

	let modelo = inpModelo.value;
	let anoFabricacion = inpAnoFabricacion.value;
	let velMax = inpVelMax.value;
	let carga = inpCarga.value;
	let autonomia = inpAutonomia.value;

	return modelo.trim() && parseInt(anoFabricacion) > 1985 && parseInt(velMax) > 0 && parseInt(carga) > 0 && parseInt(autonomia) > 0;
}

function ValidarVehiculo(vehiculo) {
	
    const modeloValido = vehiculo.modelo !== "";
    const anoFabricacionValido = parseInt(vehiculo.anoFabricacion) > 1985;
    const velMaxValida = parseInt(vehiculo.velMax) > 0;

    if (vehiculo instanceof Auto) {
        const cantPuertasValido = parseInt(vehiculo.cantidadPuertas) > 2;
        const asientosValido = parseInt(vehiculo.asientos) > 2;
        return modeloValido && anoFabricacionValido && velMaxValida && cantPuertasValido && asientosValido;
    } else if (vehiculo instanceof Camion) {
        const cargaValida = parseInt(vehiculo.carga) > 0;
        const autonomiaValida = parseInt(vehiculo.carga) > 0;
        return modeloValido && anoFabricacionValido && velMaxValida && cargaValida && autonomiaValida;
    }

    return false;
}

function MostrarFormABM() {
	formPpal.style.display = 'none';
	formABM.style.display = 'flex';
	BloquearInputs(false);
}

function CerrarABM() {
	formABM.style.display = 'none';
	formPpal.style.display = 'flex';

	[inpId, inpModelo, inpAnoFabricacion, inpVelMax, inpCantidadPuertas, inpCarga, inpAsientos, inpAutonomia].forEach(input => input.value = '');

	abmSel_tipo.dispatchEvent(new Event("change"));

	setTimeout(() => CargarTabla(arrayGeneral), 10);
}

// col_id.addEventListener('click', () => {
// 	arrayGeneral.sort((elemento1, elemento2) => CompararValores(elemento1.id, elemento2.id));
// 	CargarTabla(arrayGeneral);
// });
// col_modelo.addEventListener('click', () => {
// 	arrayGeneral.sort((elemento1, elemento2) => CompararValores(elemento1.modelo, elemento2.modelo));
// 	CargarTabla(arrayGeneral);
// });
// col_anoFabricacion.addEventListener('click', () => {
// 	arrayGeneral.sort((elemento1, elemento2) => CompararValores(elemento1.anoFabricacion, elemento2.anoFabricacion));
// 	CargarTabla(arrayGeneral);
// });
// col_velMax.addEventListener('click', () => {
// 	arrayGeneral.sort((elemento1, elemento2) => CompararValores(elemento1.velMax, elemento2.velMax));
// 	CargarTabla(arrayGeneral);
// });
// col_cantidadPuertas.addEventListener('click', () => {
// 	arrayGeneral.sort((elemento1, elemento2) => CompararValores(elemento1.cantidadPuertas, elemento2.cantidadPuertas));
// 	CargarTabla(arrayGeneral);
// });
// col_carga.addEventListener('click', () => {
// 	arrayGeneral.sort((elemento1, elemento2) => CompararValores(elemento1.carga, elemento2.carga));
// 	CargarTabla(arrayGeneral);
// });

// col_asientos.addEventListener('click', () => {
// 	arrayGeneral.sort((elemento1, elemento2) => CompararValores(elemento1.asientos, elemento2.asientos));
// 	CargarTabla(arrayGeneral);
// });
// col_autonomia.addEventListener('click', () => {
// 	arrayGeneral.sort((elemento1, elemento2) => CompararValores(elemento1.autonomia, elemento2.autonomia));
// 	CargarTabla(arrayGeneral);
// });

// function CompararValores(valor1, valor2) {
// 	if (valor1 != null) {
// 		if (valor1 > valor2) {
// 			return 1;
// 		} else if (valor1 == valor2) {
// 			return 0;
// 		} else {
// 			return -1;
// 		}
// 	}
// }

function SwalFireError(mensaje){
	Swal.fire({
		icon: 'error',
		title: 'Oops...',
		text: mensaje
	  });
}


LeerJson();