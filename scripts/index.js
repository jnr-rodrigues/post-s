function getCSSContent(url) {
    const cssContent = fetch(url).then(response => response.text());
    return cssContent;
}

async function downloadPage() {
    let htmlContent = document.documentElement.outerHTML;

    const styles = `
        <style>
            ${await getCSSContent('/css/w3.css')}
            ${await getCSSContent('/css/dashboard.css')}
        </style>
    `;
    htmlContent = htmlContent.replace('</head>', `${styles}</head>`);

    const pathnotesElement = document.getElementById('pathnotes');
    if (pathnotesElement) {
        const modifiedStyle = `padding-top: 300px;${pathnotesElement.getAttribute('style')}`;
        htmlContent = htmlContent.replace(pathnotesElement.outerHTML, pathnotesElement.outerHTML.replace('style="', `style="${modifiedStyle}`));
    }

    const elementsToRemove = ['iconBannerPage', 'messageForDownload', 'searchDiv'];
    elementsToRemove.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            htmlContent = htmlContent.replace(element.outerHTML, '');
        }
    });

    const blob = new Blob([htmlContent], { type: 'text/html' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}.0${currentDate.getMonth()} (até ${formatTime(currentDate.getHours())}h)`;

    link.download = `${formattedDate}.html`;
    document.body.appendChild(link);

    document.getElementById('sucess_text').textContent = 'Iniciando o download das postagens em alguns segundos...';
    document.getElementById('sucess_bar').style.margin = "15px";
    document.getElementById('sucess_bar').style.padding = "15px";

    setTimeout(() => {
        link.click();
        document.getElementById('sucess_text').textContent = '';
        document.getElementById('sucess_bar').style.margin = "0px";
        document.getElementById('sucess_bar').style.padding = "0px";
    }, 5000)

    document.body.removeChild(link);
}

function getMonthName(monthIndex) {
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return months[monthIndex];
}

function formatTime(value) {
    return value.toString().padStart(2, '0');
}

function addNewPost() {
    const postTitle = document.getElementById('postTitle').value;
    const postContent = document.getElementById('postContent').value;
    const contentWithBreaks = postContent.replace(/\n/g, '<br>');

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()} de ${getMonthName(currentDate.getMonth())} de
            ${currentDate.getFullYear()} às ${formatTime(currentDate.getHours())}:${formatTime(currentDate.getMinutes())}`;

    fetch('/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            postId: Date.now(),
            date: `Enviada em ${formattedDate}`,
            title: postTitle,
            description: contentWithBreaks,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Postagem adicionada.', data);
            document.getElementById('postTitle').value = '';
            document.getElementById('postContent').value = '';
        })
        .catch(error => {
            console.error('Erro ao adicionar a postagem.', error);
        });
}

function carregarPostagens() {
    document.getElementById("pathnotes").innerHTML = "";
    fetch('/post')
        .then(response => response.json())
        .then(data => criarPostagens(data))
        .catch(error => console.error('Erro ao obter dados:', error));
}

function criarPostagens(postagens, searchTerm, ordem, categoryFilter) {
    const container = document.getElementById('pathnotes');
    container.innerHTML = '';

    postagens.sort((a, b) => {
        const postIdA = parseFloat(a.postId);
        const postIdB = parseFloat(b.postId);

        if (ordem === 'decrescente') {
            return postIdA - postIdB;
        } else if (ordem === 'crescente') {
            return postIdB - postIdA;
        }
    });

    postagens.forEach(postagem => {
        const postagemDiv = document.createElement('div');
        postagemDiv.id = postagem.postId;
        postagemDiv.className = 'notes';
        postagemDiv.style.backgroundColor = '#1e1f22';
        postagemDiv.style.borderRadius = '10px';
        postagemDiv.style.margin = '20px';
        postagemDiv.style.padding = '20px';
        postagemDiv.style.animation = 'popIn 0.5s';
        postagemDiv.style.width = '100%';

        const conteudoDiv = document.createElement('div');
        conteudoDiv.style.display = 'inline-block';
        conteudoDiv.style.verticalAlign = 'middle';
        conteudoDiv.style.marginLeft = '10px';

        const tituloH4 = document.createElement('h4');
        tituloH4.className = 'w3-text-white';
        tituloH4.style.textAlign = 'left';
        tituloH4.style.fontSize = '17px';
        tituloH4.innerHTML = `${postagem.title}`;

        const dataP = document.createElement('p');
        dataP.className = 'w3-text-gray';
        dataP.style.textAlign = 'left';
        dataP.style.fontSize = '15px';
        dataP.style.marginTop = '-10px';
        dataP.textContent = `${postagem.date}.`;

        const categoriasDiv = document.createElement('div');
        categoriasDiv.className = 'w3-text-gray';
        categoriasDiv.style.marginTop = '-10px';

        if (postagem.categories && postagem.categories.length > 0) {
            postagem.categories.forEach(async (category) => {
                const categoriaP = document.createElement('p');
                categoriaP.style.backgroundColor = "#4070DC"
                categoriaP.style.display = "inline-block";
                categoriaP.style.padding = '5px';
                categoriaP.style.marginLeft = "10px";
                categoriaP.style.paddingLeft = '15px';
                categoriaP.style.paddingRight = '15px';
                categoriaP.style.borderRadius = '15px';
                categoriaP.style.color = "#fff";
                categoriaP.style.width = "fit-content";
                categoriaP.style.fontSize = "12px";
                categoriaP.style.textAlign = 'center';

                const response = await fetch(`/category/${category}`)
                const categoria = await response.json();

                if (categoria) {
                    categoriaP.textContent = `${categoria.categoryName}`;
                    categoriasDiv.appendChild(categoriaP);
                }
            });
        }

        conteudoDiv.appendChild(tituloH4);
        conteudoDiv.appendChild(dataP);
        conteudoDiv.appendChild(categoriasDiv);

        const infoDiv = document.createElement('div');
        infoDiv.style.display = 'inline-block';
        infoDiv.style.verticalAlign = 'top';
        infoDiv.style.float = 'right';
        infoDiv.style.marginRight = '20px';
        infoDiv.style.textAlign = 'right';
        infoDiv.style.cursor = "pointer";
        infoDiv.addEventListener('click', () => copyText(postagem.postId));

        const idP = document.createElement('p');
        idP.className = 'w3-text-gray';
        idP.style.textAlign = 'right';
        idP.style.textAlign = 'left';
        idP.style.fontSize = '15px';
        idP.innerHTML = `<i class="fa fa-paperclip" aria-hidden="true"></i> ${postagem.postId}`;

        infoDiv.appendChild(idP);

        const descricaoDiv = document.createElement('div');
        descricaoDiv.className = 'w3-text-gray';
        descricaoDiv.style.margin = '20px';
        descricaoDiv.innerHTML = `${postagem.description}`;

        postagemDiv.appendChild(conteudoDiv);
        postagemDiv.appendChild(infoDiv);
        postagemDiv.appendChild(descricaoDiv);

        if (postagem.attachments && postagem.attachments.length > 0) {
            postagem.attachments.forEach((attachmentPath, index) => {
                const imagem = document.createElement('img');
                imagem.src = `https://onny.discloud.app/${attachmentPath}`;
                imagem.style.width = '100px';
                imagem.style.height = '100px';
                imagem.style.display = "inline-block";
                imagem.style.marginLeft = "15px";
                imagem.style.marginTop = '10px';
                imagem.style.backgroundColor = "#2b2d31"
                imagem.style.borderRadius = "10px";

                imagem.id = `imagem-${postagem.postId}-${index}`;
                imagem.addEventListener('click', () => openImagePopup(`https://onny.discloud.app/${attachmentPath}`));

                postagemDiv.appendChild(imagem);
            });
        }

        if (postagem.visible == "true" && (categoryFilter === "all" || postagem.categories.some(cat => cat.toLowerCase() === categoryFilter.toLowerCase()))) {
            if (searchTerm && (
                postagem.title.toLowerCase().includes(searchTerm) ||
                postagem.description.toLowerCase().includes(searchTerm) ||
                postagem.postId.toLowerCase().includes(searchTerm)
            )) {
                container.appendChild(postagemDiv);
            } else if (!searchTerm) {
                container.appendChild(postagemDiv);
            }
        }

        setClosestNoteInFocus();
    });
}

async function copyText(text) {
    const inputElement = document.createElement('input');
    inputElement.value = text;
    document.body.appendChild(inputElement);
    inputElement.select();
    document.execCommand('copy');
    document.body.removeChild(inputElement);

    document.getElementById('sucess_text').textContent = 'ID da postagem copiado com sucesso!';
    document.getElementById('sucess_bar').style.margin = "15px";
    document.getElementById('sucess_bar').style.padding = "15px";

    setTimeout(() => {
        document.getElementById('sucess_text').textContent = '';
        document.getElementById('sucess_bar').style.margin = "0px";
        document.getElementById('sucess_bar').style.padding = "0px";
    }, 5000)

}

function searchPosts() {
    const dropdownValue = document.getElementById('dropdownOrdem').value.toLowerCase();
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const categoryValue = document.getElementById('categoryPost').value.toLowerCase();

    fetch('/post')
        .then(response => response.json())
        .then(data => {
            criarPostagens(data, searchValue, dropdownValue, categoryValue)
        })
        .catch(error => console.error('Erro ao obter dados:', error));
}

function openLoginPopup() {
    const loginPopup = document.getElementById('popupLogin');
    loginPopup.style.display = 'block';
}

function closeLoginPopup() {
    const loginPopup = document.getElementById('popupLogin');
    loginPopup.style.display = 'none';
}

async function handleUnauthorized() {
    document.getElementById('warn_text').textContent = 'As informações de credenciais fornecidas são incorretas ou inválidas.';
    document.getElementById('warn_bar').style.margin = "15px";
    document.getElementById('warn_bar').style.padding = "15px";

    setTimeout(() => {
        document.getElementById('warn_text').textContent = '';
        document.getElementById('warn_bar').style.margin = "0px";
        document.getElementById('warn_bar').style.padding = "0px";
    }, 5000)
}

async function handleAuthorized() {

    document.getElementById('username').value = "";
    document.getElementById('password').value = "";

    const loginPopup = document.getElementById('popupLogin');
    loginPopup.style.display = 'none';

    document.getElementById('sucess_text').textContent = 'Bem-vindo(a) de volta! Em alguns segundos você estará no painel administrador...';
    document.getElementById('sucess_bar').style.margin = "15px";
    document.getElementById('sucess_bar').style.padding = "15px";

    setTimeout(() => {
        document.getElementById('sucess_text').textContent = '';
        document.getElementById('sucess_bar').style.margin = "0px";
        document.getElementById('sucess_bar').style.padding = "0px";
    }, 5000)
}

function openImagePopup(imageSrc) {
    const popupImage = document.createElement('img');
    popupImage.src = imageSrc;
    popupImage.style.maxWidth = '100%';
    popupImage.style.maxHeight = '100%';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.fontSize = '20px';
    closeButton.style.color = '#fff';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';

    closeButton.addEventListener('click', () => {
        popupContainer.remove();
    });

    const popupContainer = document.createElement('div');
    popupContainer.style.position = 'fixed';
    popupContainer.style.top = '0';
    popupContainer.style.left = '0';
    popupContainer.style.width = '100%';
    popupContainer.style.height = '100%';
    popupContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    popupContainer.style.display = 'flex';
    popupContainer.style.alignItems = 'center';
    popupContainer.style.justifyContent = 'center';

    popupContainer.appendChild(popupImage);
    popupContainer.appendChild(closeButton);

    popupContainer.addEventListener('click', (event) => {
        if (event.target === popupContainer) {
            popupContainer.remove();
        }
    });

    document.body.appendChild(popupContainer);
}

async function attemptLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => {
            if (response.status === 401) {
                handleUnauthorized();
            } else if (response.redirected) {
                localStorage.setItem('username', username);
                console.log('Username:', username);
                console.log('Redirecionando para:', response.url);
                handleAuthorized();

                setTimeout(() => {
                    window.location.href = response.url;
                }, 5000);
            }
        })
        .catch(error => {
            console.error('Erro durante o login:', error);
        });
}

fetch('/post')
    .then(response => response.json())
    .then(data => criarPostagens(data, "", "crescente", "all"))
    .catch(error => console.error('Erro ao obter dados:', error));

document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('redirectAdminButtonBanner');

    fetch('/check/admin')
        .then(response => {
            if (response.ok) { // Verifica se a resposta está no intervalo 200-299 (OK)
                button.removeAttribute('onclick');
                button.setAttribute('href', '/admin');
            } else {
                button.addEventListener('click', openLoginPopup);
            }
        })
        .catch(error => console.error('Erro ao verificar se o usuário é um admin:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('categoryPost');

    fetch('/category')
        .then(response => response.json())
        .then(categories => {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.categoryId;
                option.textContent = category.categoryName;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erro ao obter categorias:', error));
});

document.addEventListener('DOMContentLoaded', async function () {
    try {
        const catId = window.location.pathname.split('/').pop();

        const response = await fetch(`https://onny.discloud.app/category/${catId}`);
        const categoria = await response.json();

        if (categoria && categoria.categoryName) {
            const categorySelect = document.getElementById("categoryPost");

            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].value === categoria.categoryId) {
                    categorySelect.options[i].selected = true;
                    console.log(`Categoria de filtro definida: ${categoria.categoryName}`);
                    break;
                }
            }

            searchPosts();
            window.history.replaceState(null, null, "/postagens");
        } else {
            console.error('Categoria não encontrada ou sem nome.');
        }
    } catch (error) {
        console.error('Erro ao obter a categoria:', error);
    }
});
