const apiUrl = 'https://rickandmortyapi.com/api/character'
let currentPage = 1
let totalPages = 1
let charactersWithEpisodes
async function getCharacters(page = 1) {
    try {
        const response = await axios.get(`${apiUrl}?page=${page}`)
        charactersWithEpisodes = await Promise.all(
            response.data.results.map(async character => {
                const episodes = await Promise.all(
                    character.episode.map(async episodeUrl => {
                        const episodeResponse = await axios.get(episodeUrl)
                        return episodeResponse.data
                        })
                    )
                    character.lastEpisode = episodes.reduce((one, last) => {
                        if (true) {
                            return last
                        }}).name
                    
                    return character
                    
        })
        )

        totalPages = response.data.info.pages

        return { ...response.data, results: charactersWithEpisodes }
    } catch (error) {
        console.error('Error fetching characters:', error)
    }
}



function displayCharacters(characters) {
    const characterList = document.getElementById('character-list')

    characterList.innerHTML = characters.results.map(character => `
    
    <div class="character-card m-3 col" type=" button" data-bs-toggle="modal" data-bs-target="#characterModal-${character.id}">

                <img src="${character.image}" class="character-image" alt="${character.name}">

                <button class="d-flex character-description">
                    <p>${character.id}</p>
                    <p>${character.name}</p>
                </button>
            </div>


            <div class="modal fade" id="characterModal-${character.id}">
                <div class="modal-dialog">
                    <div class="modal-content">

                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">${character.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div class="modal-body">
                            <div class="container">
                                <img src="${character.image}" class="character-image my-3" alt="${character.name}">
                                <div class="my-3 flex-column  status">
                                    <div class="flex-row  ">
                                        <div class="status-indicator" style="background-color:${getStatusColor(character.status)}"></div>
                                        <span>${character.status} - ${character.species} </span>
                                    </div>
                                    <div class="my-3 ">Última localização conhecida: ${character.location.name}</div>
                                    <div>Visto pela última vez em: ${character.lastEpisode}</div>
                                </div>
                                <div class="row my-3 "></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    `).join('')
}


function getStatusColor(status) {
    switch (status) {
        case 'Alive':
            return 'green'
        case 'Dead':
            return 'red'
        default:
            return 'gray'
    }
}

function displayPagination() {
    const paginationContainer = document.getElementById('pagination')

    let buttonInicialHtml = ''
    if (currentPage > 2) {
        buttonInicialHtml = `
        <button class="btn btn-outline-success " onclick="changePage(1)">1</button>
        <span>... </span>`
    }

    let buttonAnteriorHTML = ''
    if (currentPage > 1) {
        buttonAnteriorHTML = `<button class="btn btn-outline-success " onclick="changePage(${currentPage - 1})">${currentPage - 1}</button>`
    }

    const buttonAtualHTML = `<button class="btn btn-succes current-page">${currentPage}</button>`

    let buttonPosteriorHTML = ''
    if (currentPage < totalPages) {
        buttonPosteriorHTML = `<button class="btn btn-outline-success " onclick="changePage(${currentPage + 1})">${currentPage + 1}</button>`
    }

    let buttonFinalHTML = ''
    if (currentPage + 1 !== totalPages && currentPage !== totalPages) {
        buttonFinalHTML = `
            <span>...</span>
            <button class="btn btn-outline-success " onclick="changePage(${totalPages})">${totalPages}</button>
        `
    }

    paginationContainer.innerHTML = `${buttonInicialHtml}${buttonAnteriorHTML}${buttonAtualHTML}${buttonPosteriorHTML}${buttonFinalHTML}`
}

async function fetchAndDisplayCharacters(page) {
    const charactersData = await getCharacters(page)
    currentPage = page
        displayCharacters(charactersData)
        displayPagination()
        fetchApiInfo()
}
 


const searchInput = document.getElementById('search-input')
searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        searchCharacters()
    }
})

async function searchCharacters() {
    const searchTerm = searchInput.value.trim()

    if (searchTerm === '') {
        fetchAndDisplayCharacters(1)
    } else {
        try {
            const response = await axios.get(`${apiUrl}?name=${searchTerm}`)
            const searchData = {
                ...response.data,
                results: await Promise.all(response.data.results.map(async character => {
                    const lastEpisodeUrl = character.episode[character.episode.length - 1]
                    const lastEpisodeResponse = await axios.get(lastEpisodeUrl)
                    return {
                        ...character,
                        lastEpisode: lastEpisodeResponse.data.name
                    }
                }))
            }
            currentPage = 1 // Resetar currentPage ao realizar uma pesquisa
            totalPages = Math.ceil(response.data.info.count / response.data.info.pages) // Atualizar totalPages com base nos resultados da pesquisa
            displayCharacters(searchData)
            displayPagination()
        } catch (error) {
            console.error('Erro ao buscar personagens:', error)
        }
    }
}

async function fetchApiInfo() {
    try {
        const [charactersData, locationsData, episodesData] = await Promise.all([
            axios.get('https://rickandmortyapi.com/api/character'),
            axios.get('https://rickandmortyapi.com/api/location'),
            axios.get('https://rickandmortyapi.com/api/episode')
        ])

        const apiInfoContainer = document.getElementById('api-info')
            apiInfoContainer.innerHTML = `
                <div class="info justify-content-center py-3 d-flex gap-5">
                <p>Total de Personagens: ${charactersData.data.info.count}</p>
                <p>Total de Localizações: ${locationsData.data.info.count}</p>
                <p>Total de Episódios: ${episodesData.data.info.count}</p>
                </div>

                <p>Desenvolvido por <strong>Bernardo Dartora</strong> em 2024</p>
                
                <a class="btn bE bg-success " href="https://github.com/Be0208" target="_blank">Meu GitHub</a>
            `
    } catch (error) {
        console.error('Error fetching API info:', error)
    }
}

function changePage(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
        fetchAndDisplayCharacters(newPage)
    }
}

function reloadPage() {
    location.reload()
}


fetchAndDisplayCharacters(1)