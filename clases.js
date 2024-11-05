class Vehiculo {
    id;
    modelo;
    anoFabricacion;
    velMax;

    constructor(id, modelo, anoFabricacion, velMax) {
        this.id = id;
        this.modelo = modelo;
        this.anoFabricacion = anoFabricacion;
        this.velMax = velMax;
    }
}

class Auto extends Vehiculo {

    cantidadPuertas;
    asientos;

    constructor(id, modelo, anoFabricacion, velMax, cantidadPuertas, asientos) {
        super(id, modelo, anoFabricacion, velMax);
        this.cantidadPuertas = cantidadPuertas;
        this.asientos = asientos;
    }

    autoExiste(arrayAutos) {
        return arrayAutos.some(auto => 
            this.modelo.toLowerCase() === auto.modelo.toLowerCase() &&
            this.anoFabricacion === auto.anoFabricacion &&
            this.velMax === auto.velMax &&
            this.cantidadPuertas === auto.cantidadPuertas &&
            this.asientos === auto.asientos
        );
    }
}

class Camion extends Vehiculo {

    carga;
    autonomia;

    constructor(id, modelo, anoFabricacion, velMax, carga, autonomia) {
        super(id, modelo, anoFabricacion, velMax);
        this.carga = carga;
        this.autonomia = autonomia;
    }

    camionExiste(arrayCamiones) {
        return arrayCamiones.some(camion => 
            this.modelo.toLowerCase() === camion.modelo.toLowerCase() &&
            this.anoFabricacion === camion.anoFabricacion &&
            this.velMax === camion.velMax &&
            this.carga === camion.carga &&
            this.autonomia === camion.autonomia
        );
    }
}
