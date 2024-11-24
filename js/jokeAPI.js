const categorias = ["Any", "Programming", "Miscellaneous", "Dark", "Pun", "Spooky", "Christmas"];
let consulta = [];
const lista = document.querySelector('ul.navbar-nav');
const contenedor = document.querySelector("#contenido");

cargarEventListeners();

function cargarEventListeners() {
    document.addEventListener('DOMContentLoaded', async function () {
        localStorage.removeItem('datos_api');
        consulta = await consultarJokeAPI("Any");
        almacenarDatos("Any");
        console.log(consulta);

        cargarCategorias();
        cargarContenido();
    });

    lista.addEventListener('click', async function (e) {
        if (e.target.classList.contains('btn-consulta')) {
            let datos_api = JSON.parse(localStorage.getItem('datos_api')) || [];
            let busqueda = datos_api.find(consulta => consulta.category == e.target.textContent);

            if (busqueda) {
                consulta = busqueda;
            } else {
                consulta = await consultarJokeAPI(e.target.textContent);
                almacenarDatos(e.target.textContent);
            }
            cargarContenido();
        }
    })

    contenedor.addEventListener('click', mostrarInfo);
}

async function consultarJokeAPI(categoria) {
    //Consulta la JokeAPI
    return fetch(`https://v2.jokeapi.dev/joke/${categoria}?amount=10`)
        .then((response) => response.json())
        .catch((error) => console.log(`Error promesa: ${error}`));
}

function almacenarDatos(categoria) {
    let datos_api = JSON.parse(localStorage.getItem('datos_api')) || [];

    const datos_consulta = {
        category: categoria,
        jokes: consulta.jokes.sort((a, b) => a.id - b.id)
    }

    datos_api.push(datos_consulta);
    localStorage.setItem("datos_api", JSON.stringify(datos_api));

}

function cargarCategorias() {
    categorias.forEach(categoria => {
        let elemento = document.createElement('li');
        elemento.classList.add("nav-item", "col", "btn", "btn-outline-primary", "rounded-0");
        elemento.innerHTML = `<a class="nav-link text-center btn-consulta">${categoria}</a>`;
        lista.appendChild(elemento);
    })
}

function cargarContenido() {
    let jokes = consulta.jokes;

    while (contenedor.firstElementChild) {
        contenedor.firstElementChild.remove();
    }

    jokes.forEach(joke => {
        crearContenido(joke);
    })
}

function crearContenido(joke) {
    let jokeDiv = document.createElement("div");
    jokeDiv.classList.add("card", "mb-5", "border-primary");
    jokeDiv.innerHTML = `
        <div class="card-header bg-primary text-white"><h3>Category: ${joke.category}</h3></div>
        <div class="card-body">
        <div class="row align-items-center g-4">
        <div class="col-md"><h5>Type: ${joke.type}</h5></div>
        <div class="col-md" id="jokeContent"></div>
        <div class="col-md" id="flags"><h5>Flags:</h5></div>
        <div class="col-md boton"><button type="button" class="btn btn-outline-success joke" data-id="${joke.id}">Mostrar más</button></div>
        </div>
        </div>
        </div>`;

    contenedor.appendChild(jokeDiv);

    if (joke.type == "twopart") {
        jokeDiv.querySelector('#jokeContent').innerHTML = `
            <h5 class="mb-4">${joke.setup}</h5>
            <h5>${joke.delivery}</h5>`;
    } else if (joke.type == "single") {
        jokeDiv.querySelector('#jokeContent').innerHTML = `<h5>${joke.joke}</h5>`;
    }

    Object.keys(joke.flags).forEach(flag => {
        if (joke.flags[flag] == true) {
            let tag = document.createElement("h5");
            tag.innerHTML = `${flag}`;
            jokeDiv.querySelector('#flags').appendChild(tag);
        }
    });
}

function mostrarInfo(e) {
    if (e.target.classList.contains("joke")) {
        let id = e.target.getAttribute('data-id');

        while (contenedor.firstElementChild) {
            contenedor.firstElementChild.remove();
        }

        let jokeElegida = consulta.jokes.find(joke => joke.id == id);
        console.log(jokeElegida);

        crearContenido(jokeElegida);

        let botonDiv = document.querySelector(".card .boton");
        if (botonDiv) {
            botonDiv.remove();
        }

        let idDiv = document.createElement("div");
        idDiv.classList.add("mt-5");
        idDiv.innerHTML = `<h3>ID: ${jokeElegida.id}</h3>`;
        document.querySelector(".card .card-body").appendChild(idDiv);
        console.log(document.querySelector(".card .card-body"));
    }
}