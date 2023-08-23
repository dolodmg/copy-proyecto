

function cargarReservas() {

    var tokenJWT = localStorage.getItem('token');

    var eventos = [];

    $.ajax({
        url: "http://localhost:8080/admin/reservas-confirmadas",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + tokenJWT
        },
        success: function (data) {

            for (let i = 0; i < data.length; i++) {
                var fechaInicio = data[i]['fecha']+' '+data[i]['horaInicio'];

                var partes = fechaInicio.split(" "); // Separar la fecha y la hora
                var fechaPartes = partes[0].split("-"); // Separar las partes de la fecha
                var horaPartes = partes[1].split(":"); // Separar las partes de la hora

                // Crear el objeto de fecha en JavaScript
                var fechaInicio = new Date(
                    parseInt(fechaPartes[0]),        // Año
                    parseInt(fechaPartes[1]) - 1,    // Mes (se resta 1 porque en JavaScript los meses comienzan desde 0)
                    parseInt(fechaPartes[2]),        // Día
                    parseInt(horaPartes[0]),         // Hora
                    parseInt(horaPartes[1]),         // Minuto
                    parseInt(horaPartes[2])          // Segundo
                );


                var fechaFin = data[i]['fecha']+' '+data[i]['horaFin'];

                var partes = fechaFin.split(" "); // Separar la fecha y la hora
                var fechaPartes = partes[0].split("-"); // Separar las partes de la fecha
                var horaPartes = partes[1].split(":"); // Separar las partes de la hora

                // Crear el objeto de fecha en JavaScript
                var fechaFin = new Date(
                    parseInt(fechaPartes[0]),        // Año
                    parseInt(fechaPartes[1]) - 1,    // Mes (se resta 1 porque en JavaScript los meses comienzan desde 0)
                    parseInt(fechaPartes[2]),        // Día
                    parseInt(horaPartes[0]),         // Hora
                    parseInt(horaPartes[1]),         // Minuto
                    parseInt(horaPartes[2])          // Segundo
                );

                let materia = data[i]['nombreMateria'];
                let horaInicio = fechaInicio;
                let horaFin = fechaFin;
                let descripcion = data[i]['nombreDepartamento'];
                let profesor = data[i]['nombreDocente'];
                let profesorapellido = data[i]['apellidoDocente'];
                let email = data[i]['email'];
                let telefono = data[i]['telefono'];

                var propiedad = {
                    idReserva: data[i].idReserva,
                    title: 'Materia: ' + materia,
                    start: horaInicio,
                    end: horaFin,
                    description: descripcion,
                    professor: profesor+" "+profesorapellido,
                    email:email,
                    telefono:telefono
                };
                eventos.push(propiedad);
            }
            $('#calendar').fullCalendar({
                defaultView: 'month',
                displayEventTime: false, // Ocultar la hora de inicio del evento
                events: eventos,
                eventClick: function(calEvent, jsEvent, view) {
                    mostrarDetallesEvento(calEvent);
                },
                /*dayClick: function(date, jsEvent, view) {
                // Obtener los detalles del día seleccionado
                var dayDetails = getDayDetails(date);

                // Mostrar los detalles en el modal
                $('#dayModalTitle').text(dayDetails.title);
                $('#dayModalBody').html(dayDetails.details);
                $('#dayModal').modal('show');
                 },
                */
            });
        },
        error: function (error) {
            console.log(error);
        }
    });

}


function inicializar() {

    // Inicializar el selector de fecha
    var fechaPicker = $('#fecha').pickadate({
        format: 'dd-mm-yyyy',
        min: true,
        monthsFull: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        weekdaysFull: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        today: false,
        clear: false,
        close: false,
        closeOnSelect: true,
        onSet: function() {
            // Aquí puedes realizar una llamada al servidor para obtener los horarios disponibles según la fecha seleccionada
            // y actualizar el campo de selección "horario" utilizando algo como:
            // $('#horario').html('<option value="horario1">Horario 1</option><option value="horario2">Horario 2</option>');
        }
    })
    // Inicializar el selector de hora
    var horarioPicker = $('#horario').pickatime({
        format: 'HH:i', // Formato de hora
        interval: 30, // Intervalo de minutos para seleccionar
        clear: false, // Deshabilitar el botón "Limpiar"
        close: false, // Deshabilitar el botón "Cerrar"
    });

    // Inicializar el selector de hora
    var horarioPicker2 = $('#horarioFin').pickatime({
        format: 'HH:i', // Formato de hora
        interval: 30, // Intervalo de minutos para seleccionar
        clear: false, // Deshabilitar el botón "Limpiar"
        close: false, // Deshabilitar el botón "Cerrar"
    });
}


function cambiarMaterias() {
    $('#departamento').change(function () {
        var seleccionado = $(this).val();
        var selectMateria = $('#materia');

        selectMateria.off('change'); // Desactivar el evento change del select de materias

        selectMateria.empty(); // Vaciar el select2

        // Obtener las materias del departamento seleccionado
        var materiasDepartamento = materiasPorDepartamento[seleccionado];

        if (materiasDepartamento && materiasDepartamento.length > 0) {
            // Agregar las materias al select de materias
            for (var i = 0; i < materiasDepartamento.length; i++) {
                var materia = materiasDepartamento[i];
                var newOption = $('<option>').text(materia).val(materia);
                selectMateria.append(newOption);
            }
        } else {
            // Mostrar un mensaje si no hay materias para el departamento seleccionado
            var mensaje = 'No hay materias disponibles para este departamento.';
            var newOption = $('<option disabled selected>').text(mensaje);
            selectMateria.append(newOption);
        }

        selectMateria.on('change', cambiarDocentes); // Asignar nuevamente el evento change del select de materias

        selectMateria.trigger('change'); // Actualizar el select2 para reflejar los cambios
    });
}


function altaReserva() {
    var fecha=document.getElementById("fecha").value
    var horaInicio=document.getElementById("horario").value
    var horaFin=document.getElementById("horarioFin").value
    var listaNombreGabinetes=[]
    var nombreMateria=document.getElementById("materia").value
    var nombreDepartamento=document.getElementById("departamento").value
    var nombreProfesor=document.getElementById("profesor").value

    if(fecha===""){
        toastr.warning("No se ha introducido una fecha valida.")
        return;
    }

    if(horaInicio===""){
        toastr.warning("No se ha introducido una hora de inicio valida.")
        return;
    }
    if(horaFin===""){
        toastr.warning("No se ha introducido una hora de fin valida.")
        return;
    }


    if(nombreDepartamento===""){
        toastr.warning("No se ha seleccionado ningún departamento.")
        return;
    }
    if(nombreMateria==="" || nombreMateria==="No hay materias disponibles para este departamento."){
        toastr.warning("No se ha seleccionado ninguna materia.")
        return;
    }
    if(nombreProfesor==="" || nombreProfesor==="No hay profesores disponibles para esta materia."){
        toastr.warning("No se ha seleccionado ningún profesor.")
        return;
    }


    var partesFecha = fecha.split("-"); // Divide la cadena en partes separadas por el guion ("-")
    var fecha = new Date(partesFecha[2], partesFecha[1] - 1, partesFecha[0]); // Crea un objeto Date con las partes de la fecha (año, mes, día)


    var checkboxes = document.querySelectorAll('input[type="checkbox"]');

    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            listaNombreGabinetes.push(checkboxes[i].value);
        }
    }

    if(listaNombreGabinetes.length===0) {
        toastr.warning("No has seleccionado ningún gabinete a reservas.")
        return;
    }

    reserva={
        fecha:fecha,
        horaInicio:horaInicio,
        horaFin:horaFin,
        nombreMateria:nombreMateria,
        apellidoDocente:nombreProfesor,
        nombreGabinete:listaNombreGabinetes
    }

    var tokenJWT = localStorage.getItem('token');

    $.ajax({
        url: ip+'/admin/reserva',
        type: 'POST',
        headers: {
            Authorization: 'Bearer ' + tokenJWT,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(reserva),
        success: function(response) {
            toastr.success("Reserva realizada con exito")
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
}

function cambiarDocentes() {
    var tokenJWT = localStorage.getItem('token');

    var seleccionado = $('#materia').val();
    var selectProfesor = $('#profesor');

    selectProfesor.empty(); // Vaciar el select2

    $.ajax({
        url: ip + "/admin/docente/" + seleccionado,
        type: "GET",
        headers: {
            "Authorization": "Bearer " + tokenJWT
        },
        success: function (docentes) {
            if (docentes && docentes.length > 0) {
                // Agregar los docentes a partir de la materia
                for (var i = 0; i < docentes.length; i++) {
                    var docente = docentes[i];
                    var newOption2 = $('<option>').text(docente['apellido'] +' '+ docente['nombre']).val(docente['apellido']);
                    selectProfesor.append(newOption2);
                }
            } else {
                var mensaje = 'No hay profesores disponibles para esta materia.';
                var newOption2 = $('<option disabled selected>').text(mensaje);
                selectProfesor.append(newOption2);
            }

            selectProfesor.trigger('change');
        },
        error: function (error) {
            console.log(error);
        }
    });
}


function cargarGabinetes() {
    var checkboxesContainer = $('#checkboxesGabinetes');
    checkboxesContainer.empty(); // Vaciar el contenedor de checkboxes

    var tokenJWT = localStorage.getItem('token');

    $.ajax({
        url: ip + "/admin/gabinete",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + tokenJWT
        },
        success: function (gabinetes) {
            var checkboxesContainer = $('#checkboxesGabinetes');
            checkboxesContainer.empty(); // Vaciar los checkboxes existentes

            for (var i = 0; i < gabinetes.length; i++) {
                var gabinete = gabinetes[i];

                // Crear el elemento checkbox
                var checkbox = $('<input>').attr({
                    type: 'checkbox',
                    id: 'gabinete' + i,
                    value: gabinete.nombre,
                    'data-cantidadEquipos': gabinete.cantidadEquipos // Agregar atributo personalizado para la cantidad de equipos
                });

                // Crear la etiqueta para el checkbox
                var label = $('<label>').attr('for', 'gabinete' + i).text(gabinete.nombre + ' (' + gabinete.cantidadEquipos + ' equipos)');

                // Crear el div contenedor del checkbox y su etiqueta
                var checkboxDiv = $('<div>').addClass('checkbox-container');

                // Agregar el checkbox y la etiqueta al div contenedor
                checkboxDiv.append(checkbox, label);

                // Agregar el div contenedor al contenedor principal de los checkboxes
                checkboxesContainer.append(checkboxDiv);
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
    // Agregar un controlador de eventos al cambio de estado del checkbox
    checkboxesContainer.on('change', 'input[type="checkbox"]', function () {
        var contadorEquipos = 0;

        // Obtener los checkboxes seleccionados y sumar la cantidad de equipos correspondiente
        checkboxesContainer.find('input[type="checkbox"]:checked').each(function () {
            contadorEquipos += parseInt($(this).attr('data-cantidadEquipos'), 10);
        });

        $('#contadorEquipos').text("Cantidad total de equipos: "+contadorEquipos);
    });
}


// Crear un objeto para almacenar las materias por departamento
var materiasPorDepartamento = {}

async function listarDepartamentos() {
    cargarGabinetes()

    var tokenJWT = localStorage.getItem('token');

    $.ajax({
        url: ip + "/admin/departamento",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + tokenJWT
        },
        success: function (departamentos) {
            var selectDepartamento = $('#departamento');
            selectDepartamento.empty();

            for (let i = 0; i < departamentos.length; i++) {
                var departamento = departamentos[i];

                // Agregar el departamento al diccionario
                materiasPorDepartamento[departamento.nombre] = departamento.nombreMaterias;

                var newOption = $('<option>').text(departamento.nombre).val(departamento.nombre);
                selectDepartamento.append(newOption);
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}


function mostrarDetallesEvento(eventDetails) {
    var fechaInicio = new Date(eventDetails.start)
    var fechaFin = new Date(eventDetails.end)
    var horas = fechaInicio.getHours();
    var minutos = fechaInicio.getMinutes();

    // Formatear la hora y los minutos en formato HH:mm
    var horaMinutos = ("0" + horas).slice(-2) + ":" + ("0" + minutos).slice(-2);

    var horas2 = fechaFin.getHours();
    var minutos2 = fechaFin.getMinutes();

    // Formatear la hora y los minutos en formato HH:mm
    var horaMinutos2 = ("0" + horas2).slice(-2) + ":" + ("0" + minutos2).slice(-2);

    var fechaHora = new Date(eventDetails.start);

    var opcionesFecha = { day: 'numeric', month: 'long', year: 'numeric' };
    var fechaFormateada = fechaHora.toLocaleDateString('es-ES', opcionesFecha);


    $('#idReserva2').text(eventDetails.idReserva);
    $('#eventTitle').text(eventDetails.title);
    $('#eventDate').text('Fecha: ' +fechaFormateada);
    $('#eventStartAndEnd').text('Hora: desde ' + horaMinutos + ' hasta las ' +
        horaMinutos2);
    $('#eventDescription').text("Departamento: "+eventDetails.description);
    $('#eventProfessor').text("Profesor: "+eventDetails.professor);
    $('#eventNumTelefono').text('Telefono: '+ eventDetails.telefono);
    $('#eventEmail').text('Email: '+ eventDetails.email);

    $('#eventModal').modal('show');
}

function getDayDetails(date) {
    // Aquí puedes implementar la lógica para obtener los detalles del día
    // Puedes consultar una base de datos, un archivo JSON, etc.
    // Por ahora, retornaremos algunos datos de ejemplo
    return {
        title: 'Detalles del día',
        details: 'Aquí puedes agregar los detalles específicos del día seleccionado.'
    };
}


function abrirModalAñadirReserva() {
    const modalAsistencias = new bootstrap.Modal(document.getElementById("reservaModal"));

    modalAsistencias.show()
}

function abrirModalRechazarReserva() {
    const modalAsistencias = new bootstrap.Modal(document.getElementById("cancelarModal"));

    modalAsistencias.show()
}

function aceptarReserva() {
    const modalAceptar = new bootstrap.Modal(document.getElementById("modalAceptar"));
    modalAceptar.show()
}

function reservaAceptada() {
    $('.toastAceptar').toast('show');
    var tokenJWT = localStorage.getItem('token'); 
    //Chequear si funciona xq no lo probe
    var idReserva2 = document.getElementById("idReserva2");

    $.ajax({
        url: "http://localhost:8080/admin/reserva/reservas-confirmadas/" + idReserva2.textContent,
        type: "POST",
        headers: {
            "Authorization": "Bearer " + tokenJWT
        },
        success: function (data) {
            location.reload();

        },
        error: function (error) {
            console.log(error);
        }
    });
}

function rechazarReserva() {
    const rechazarModal = new bootstrap.Modal(document.getElementById("rechazarModal"));
    rechazarModal.show()
}

function reservaRechazada() {
    $('.toastRechazar').toast('show');
    var tokenJWT = localStorage.getItem('token'); 
    //Chequear si funciona xq no lo probe
    var idReserva2 = document.getElementById("idReserva2");
    idReserva2.style.display="block"

    $.ajax({
        url: "http://localhost:8080/admin/reserva/rechazar/" + idReserva2.textContent,
        type: "POST",
        headers: {
            "Authorization": "Bearer " + tokenJWT
        },
        success: function (data) {
            location.reload();

        },
        error: function (error) {
            console.log(error);
        }
    });
}

function reservaCancelada() {
    var tokenJWT = localStorage.getItem('token');
    var idReserva2 = document.getElementById("idReserva2");
    idReserva2.style.display="block"

    $.ajax({
        url: "http://localhost:8080/admin/reserva/cancelar/" + idReserva2.textContent,
        type: "POST",
        headers: {
            "Authorization": "Bearer " + tokenJWT
        },
        success: function (data) {
            location.reload();

        },
        error: function (error) {
            console.log(error);
        }
    });
}