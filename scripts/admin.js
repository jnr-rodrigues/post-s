
const username = localStorage.getItem('username');
if (username) {
    console.log('Username:', username);
} else {
    console.log('Erro ao obter usuário.');
}

function searchPosts() {
    // Obtém o valor da busca
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    fetch('/post')
        .then(response => response.json())
        .then(data => criarPostagens(data, searchValue))
        .catch(error => console.error('Erro ao obter dados:', error));
}

async function createCategory() {
    var name = document.getElementById("categoryName").value;

    const formData = new FormData();
    formData.append('categoryId', Date.now())
    formData.append('name', name);

    const files = document.getElementById('categoryIconAttachment').files;
    for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i]);
    }

    if (!files || files.length == 0) {
        document.getElementById('warn_text').textContent = `É necessário enviar um icone para categoria!`;
        document.getElementById('warn_bar').style.margin = "15px";
        document.getElementById('warn_bar').style.padding = "15px";

        setTimeout(() => {
            document.getElementById('warn_text').textContent = '';
            document.getElementById('warn_bar').style.margin = "0px";
            document.getElementById('warn_bar').style.padding = "0px";
        }, 5000)

        return;
    }

    fetch('/category', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(async (data) => {
            console.log('Success:', data);
            clearForm();

            document.getElementById('sucess_text').textContent = `✅ A categoria foi criada com sucesso!`;
            document.getElementById('sucess_bar').style.margin = "15px";
            document.getElementById('sucess_bar').style.padding = "15px";

            setTimeout(() => {
                document.getElementById('sucess_text').textContent = '';
                document.getElementById('sucess_bar').style.margin = "0px";
                document.getElementById('sucess_bar').style.padding = "0px";
            }, 5000)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

async function addNewPost() {
    // Obtenha os valores do título, conteúdo e timestamp do seu formulário
    var title = document.getElementById("postTitle").value;
    var content = document.getElementById("postContent").value;
    var category = document.getElementById("categoryPost").value;

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()} de ${getMonthName(currentDate.getMonth())} de
${currentDate.getFullYear()} às ${formatTime(currentDate.getHours())}:${formatTime(currentDate.getMinutes())}`;

    // Crie um FormData para enviar o formulário, incluindo os arquivos
    const formData = new FormData();
    formData.append('postId', Date.now())
    formData.append('title', title);
    formData.append('description', content);
    formData.append('date', formattedDate);
    formData.append('category', category);

    const files = document.getElementById('attachment').files;
    for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i]);
    }

    // Faça a requisição POST para o servidor
    fetch('/post', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(async (data) => {
            console.log('Success:', data);
            clearForm();

            await new Promise(resolve => setTimeout(resolve, 1000));
            carregarPostagens();

            document.getElementById('sucess_text').textContent = `✅ A postagem foi inserida com sucesso!`;
            document.getElementById('sucess_bar').style.margin = "15px";
            document.getElementById('sucess_bar').style.padding = "15px";

            setTimeout(() => {
                document.getElementById('sucess_text').textContent = '';
                document.getElementById('sucess_bar').style.margin = "0px";
                document.getElementById('sucess_bar').style.padding = "0px";
            }, 5000)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function handleFileChange(event) {
    const customButton = document.getElementById("custom-InsertImageButton");
    const customDiv = document.getElementById("custom-InsertImageDiv");
    const files = event.target.files;

    if (files.length > 0) {
        customButton.textContent = `Anexado${files.length > 1 ? 's' : ''} ${files.length} arquivo${files.length > 1 ? 's' : ''}.`;
        customDiv.style.backgroundColor = "#2d63bf";
    } else {
        customButton.textContent = 'Inserir imagens';
        customDiv.style.backgroundColor = "#2b2d31";
    }

    // Lógica para lidar com a mudança de arquivo aqui
    console.log("Arquivos selecionados:", files);
}

function handleFileChangeCategoryIcon(event) {
    const customButton = document.getElementById("custom-InsertCategoryIconButton");
    const customDiv = document.getElementById("custom-InsertCategoryIconDiv");
    const files = event.target.files;

    if (files.length > 0) {
        customButton.textContent = `Imagem anexada com sucesso.`;
        customDiv.style.backgroundColor = "#2d63bf";
    } else {
        customButton.textContent = 'Inserir icone da categoria';
        customDiv.style.backgroundColor = "#2b2d31";
    }

    // Lógica para lidar com a mudança de arquivo aqui
    console.log("Arquivos selecionados:", files);
}

async function getAttachments() {
    const attachmentInput = document.getElementById('attachment');
    const files = attachmentInput.files;

    if (files.length > 0) {
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            formData.append('attachments', file);
        }

        return formData;
    } else {
        return null;
    }
}

function clearForm() {
    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    document.getElementById("attachment").value = "";
    document.getElementById("categoryIconAttachment").value = "";
    document.getElementById("categoryName").value = "";
    document.getElementById("categoryPost").value = "";
}

function carregarPostagens() {
    document.getElementById("pathnotes").innerHTML = "";
    fetch('/post')
        .then(response => response.json())
        .then(data => criarPostagens(data))
        .catch(error => console.error('Erro ao obter dados:', error));
}

function criarPostagens(postagens, searchTerm, ordem) {
    const container = document.getElementById('pathnotes');
    container.innerHTML = "";

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
        postagemDiv.style.animation = 'popIn_inflate 0.5s';
        postagemDiv.style.width = '100%';

        const conteudoDiv = document.createElement('div');
        conteudoDiv.style.display = 'inline-block';
        conteudoDiv.style.verticalAlign = 'middle';
        conteudoDiv.style.marginLeft = '10px';

        const tituloH4 = document.createElement('h4');
        tituloH4.className = 'w3-text-white';
        tituloH4.style.textAlign = 'left';
        tituloH4.style.fontSize = '17px';
        tituloH4.innerHTML = `<span contenteditable="true" oninput="atualizarTitulo('${postagem.postId}', this)">${postagem.title}</span>`;

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
            postagem.categories.forEach(categoryName => {
                const categoriaDiv = document.createElement('div');
                categoriaDiv.style.backgroundColor = "#4070DC"
                categoriaDiv.style.padding = '5px';           
                categoriaDiv.style.paddingLeft = '15px';
                categoriaDiv.style.paddingRight = '30px';
                categoriaDiv.style.borderRadius = '15px';
                categoriaDiv.style.color = "#fff";
                categoriaDiv.style.width = "fit-content";
                categoriaDiv.style.fontSize = "12px";
                categoriaDiv.style.textAlign = 'center';
                categoriaDiv.style.position = 'relative'; // Permitir posicionar o 'X'

                const categoriaP = document.createElement('p');
                categoriaP.style.margin = '0'; // Remover a margem padrão do parágrafo
                categoriaP.textContent = `${categoryName}`;

                const removeButton = document.createElement('button');
                removeButton.innerHTML = 'X';
                removeButton.style.backgroundColor = "#023e8a";
                removeButton.style.color = "#fff";
                removeButton.style.border = 'none';
                removeButton.style.borderRadius = '50%';
                removeButton.style.marginLeft = '5px';
                removeButton.style.cursor = 'pointer';
                removeButton.style.position = 'absolute'; // Posicionar o 'X' absolutamente
                removeButton.style.right = '5px'; // Alinhar à direita
                removeButton.style.top = '50%'; // Alinhar verticalmente ao meio
                removeButton.style.transform = 'translateY(-50%)'; // Ajustar verticalmente ao meio

                // Adiciona evento de clique à div para remover a categoria
                categoriaDiv.addEventListener('click', () => removerCategoria(postagem.postId, categoryName));

                // Adiciona evento de hover ao botão
                removeButton.addEventListener('mouseover', () => {
                    removeButton.style.backgroundColor = "#023047";
                    removeButton.style.transition = 'background-color 0.3s ease';
                });

                // Remove animação de hover ao botão
                removeButton.addEventListener('mouseout', () => {
                    removeButton.style.backgroundColor = "#023e8a";
                    removeButton.style.transition = 'background-color 0.3s ease';
                });

                categoriaDiv.appendChild(categoriaP);
                categoriaDiv.appendChild(removeButton);

                categoriasDiv.appendChild(categoriaDiv);
            });
        }


        conteudoDiv.appendChild(tituloH4);
        conteudoDiv.appendChild(dataP);
        conteudoDiv.appendChild(categoriasDiv);

        const imagensDiv = document.createElement('div');
        imagensDiv.style.display = 'flex';
        imagensDiv.style.flexWrap = 'wrap';
        imagensDiv.style.marginTop = '10px';

        postagem.attachments.forEach(attachment => {
            const imagemContainer = document.createElement('div');
            imagemContainer.style.marginRight = '10px';
            imagemContainer.style.marginBottom = '10px';

            const imagem = document.createElement('img');
            imagem.src = "https://onny.discloud.app/" + attachment;
            imagem.style.width = '50px';
            imagem.style.height = '50px';
            imagem.style.borderRadius = '10px';

            const removerBotao = document.createElement('button');
            removerBotao.textContent = 'Remover';
            removerBotao.style.marginLeft = "-10px";
            removerBotao.style.cursor = "pointer";
            removerBotao.style.paddingLeft = "10px";
            removerBotao.style.paddingRight = "10px";
            removerBotao.style.backgroundColor = "#2b2d31"
            removerBotao.style.color = "#fff"
            removerBotao.style.borderRadius = "10px";
            removerBotao.style.border = "0px";
            removerBotao.addEventListener('click', () => {
                console.log('Botão de remoção clicado para postagem:', postagem.postId, 'e anexo:', attachment);
                removerAttachment(postagem.postId, attachment);
            });

            imagemContainer.appendChild(imagem);
            imagemContainer.appendChild(removerBotao);
            imagensDiv.appendChild(imagemContainer);
        });

        const descricaoDiv = document.createElement('div');
        descricaoDiv.className = 'w3-text-gray';
        descricaoDiv.style.margin = '20px';
        descricaoDiv.innerHTML = `<div contenteditable="true" oninput="atualizarDescricao('${postagem.postId}', this)">${postagem.description}</div>`;

        // Adicionando botões de ícones
        const botoesDiv = document.createElement('div');
        botoesDiv.style.marginTop = '10px';


        function criarIcone(classe) {
            const icone = document.createElement('i');
            icone.className = `fas ${classe} fa-lg`;
            return icone;
        }

        function criarBotaoAcao(textoIcon, onClick, colorIcon) {
            const botao = document.createElement('a');
            botao.style.margin = '5px';
            botao.style.marginRight = '20px';
            botao.style.marginTop = '40px';
            botao.className = 'acao-btn';
            botao.style.textDecoration = "none";
            botao.style.color = colorIcon;
            botao.addEventListener('click', onClick);
            botao.textContent = textoIcon;
            return botao;
        }

        const editarBotao = criarBotaoAcao('', () => salvarEdicao(postagem.postId, tituloH4.firstChild, descricaoDiv.firstChild), '#d3d3d3');
        editarBotao.appendChild(criarIcone('fa-pencil-alt'));
        botoesDiv.appendChild(editarBotao);

        const excluirBotao = criarBotaoAcao('', () => excluirPostagem(postagem.postId), '#d3d3d3');
        excluirBotao.appendChild(criarIcone('fa-trash-alt'));
        botoesDiv.appendChild(excluirBotao);

        if (postagem.visible == "true") {
            const ocultarBotao = criarBotaoAcao('', () => ocultarPostagem(postagem.postId), '#d3d3d3');
            ocultarBotao.appendChild(criarIcone('fa-eye-slash'));
            botoesDiv.appendChild(ocultarBotao);
        } else if (postagem.visible == "false") {
            const reexibirBotao = criarBotaoAcao('Essa postagem está oculta! ', () => reexibirPostagem(postagem.postId), '#48cae4');
            reexibirBotao.appendChild(criarIcone('fa-eye'));
            botoesDiv.appendChild(reexibirBotao);
        }


        const postIdCopy = criarBotaoAcao(`#${postagem.postId}`, () => copyText(postagem.postId), '#6c757d');
        botoesDiv.appendChild(postIdCopy);

        postagemDiv.appendChild(conteudoDiv);
        postagemDiv.appendChild(descricaoDiv);
        postagemDiv.appendChild(imagensDiv);
        postagemDiv.appendChild(botoesDiv);


        if (searchTerm && (postagem.title.toLowerCase().includes(searchTerm) || postagem.description.toLowerCase().includes(searchTerm) || postagem.postId.toLowerCase().includes(searchTerm))) {
            container.appendChild(postagemDiv);
        } else if (!searchTerm) {
            container.appendChild(postagemDiv);
        }

        setClosestNoteInFocus();
    });
}

async function removerAttachment(postId, attachmentPath) {
    try {
        const response = await fetch('/removeImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                postId: postId,
                imagePath: attachmentPath,
            }),
        });

        if (response.ok) {
            console.log('Imagem removida do servidor com sucesso.');
            await new Promise(resolve => setTimeout(resolve, 1000));
            carregarPostagens();

            document.getElementById('sucess_text').textContent = `🗑️ Uma imagem dessa postagem foi removida com sucesso!`;
            document.getElementById('sucess_bar').style.margin = "15px";
            document.getElementById('sucess_bar').style.padding = "15px";

            setTimeout(() => {
                document.getElementById('sucess_text').textContent = '';
                document.getElementById('sucess_bar').style.margin = "0px";
                document.getElementById('sucess_bar').style.padding = "0px";
            }, 5000)
        } else {
            console.error('Falha ao remover a imagem do servidor.');
        }
    } catch (error) {
        console.error('Erro ao remover a imagem:', error);
    }
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

async function atualizarTitulo(postId, elemento) {
    const novoTitulo = elemento.innerHTML;
    console.log(`Atualizando título da postagem ${postId} para: ${novoTitulo}`);
    document.getElementById('sucess_text').textContent = 'Clique no icone ✏️ para confirmar a edição do texto da postagem!';
    document.getElementById('sucess_bar').style.margin = "15px";
    document.getElementById('sucess_bar').style.padding = "15px";

    setTimeout(() => {
        document.getElementById('sucess_text').textContent = '';
        document.getElementById('sucess_bar').style.margin = "0px";
        document.getElementById('sucess_bar').style.padding = "0px";
    }, 5000)
    // Adicione a lógica de salvamento aqui, se necessário
}

function atualizarDescricao(postId, elemento) {
    const novaDescricao = elemento.innerHTML;
    console.log(`Atualizando descrição da postagem ${postId} para: ${novaDescricao}`);
    document.getElementById('sucess_text').textContent = 'Clique no icone ✏️ para confirmar a edição do texto da postagem!';
    document.getElementById('sucess_bar').style.margin = "15px";
    document.getElementById('sucess_bar').style.padding = "15px";

    setTimeout(() => {
        document.getElementById('sucess_text').textContent = '';
        document.getElementById('sucess_bar').style.margin = "0px";
        document.getElementById('sucess_bar').style.padding = "0px";
    }, 5000)
    // Adicione a lógica de salvamento aqui, se necessário
}

function salvarEdicao(postId, tituloElemento, descricaoElemento) {
    const novoTitulo = tituloElemento.innerHTML;
    const novaDescricao = descricaoElemento.innerHTML;

    fetch(`/edit/${postId}`, {
        method: 'PUT', headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: novoTitulo, description: novaDescricao }),
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(`Edição salva para postagem ${postId}`);
            document.getElementById('sucess_text').textContent = `✏️ A postagem foi editada com sucesso!`;
            document.getElementById('sucess_bar').style.margin = "15px";
            document.getElementById('sucess_bar').style.padding = "15px";

            setTimeout(() => {
                document.getElementById('sucess_text').textContent = '';
                document.getElementById('sucess_bar').style.margin = "0px";
                document.getElementById('sucess_bar').style.padding = "0px";
            }, 5000)
        })
        .catch(error => console.error('Erro ao salvar edição:', error));
}

async function excluirPostagem(postId) {
    fetch(`/delete/${postId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(async (message) => {
            console.log(message);
        })
        .catch(error => console.error('Erro ao excluir postagem:', error));

    await new Promise(resolve => setTimeout(resolve, 1000));
    carregarPostagens();

    document.getElementById('sucess_text').textContent = `🗑️ A postagem foi excluída com sucesso!`;
    document.getElementById('sucess_bar').style.margin = "15px";
    document.getElementById('sucess_bar').style.padding = "15px";

    setTimeout(() => {
        document.getElementById('sucess_text').textContent = '';
        document.getElementById('sucess_bar').style.margin = "0px";
        document.getElementById('sucess_bar').style.padding = "0px";
    }, 5000)
}

async function ocultarPostagem(postId) {
    fetch(`/toggle/${postId}`, {
        method: 'PUT', headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visible: "false" }),
    })
        .then(response => response.json())
        .then(async (message) => {
            console.log(message);

            await new Promise(resolve => setTimeout(resolve, 1000));
            carregarPostagens();

            document.getElementById('sucess_text').textContent = '🕶️ Você optou por ocultar esta postagem! É possível reexibi-la a qualquer momento.';
            document.getElementById('sucess_bar').style.margin = "15px";
            document.getElementById('sucess_bar').style.padding = "15px";

            setTimeout(() => {
                document.getElementById('sucess_text').textContent = '';
                document.getElementById('sucess_bar').style.margin = "0px";
                document.getElementById('sucess_bar').style.padding = "0px";
            }, 5000)
        })
        .catch(error => console.error('Erro ao ocultar/reexibir postagem:', error));
}

async function reexibirPostagem(postId) {
    fetch(`/toggle/${postId}`, {
        method: 'PUT', headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visible: "true" }),
    })
        .then(response => response.json())
        .then(async (message) => {
            console.log(message);

            await new Promise(resolve => setTimeout(resolve, 1000));
            carregarPostagens();

            document.getElementById('sucess_text').textContent = '👓 Você optou por reexibir esta postagem! É possível ocultá-la novamente a qualquer momento.';
            document.getElementById('sucess_bar').style.margin = "15px";
            document.getElementById('sucess_bar').style.padding = "15px";

            setTimeout(() => {
                document.getElementById('sucess_text').textContent = '';
                document.getElementById('sucess_bar').style.margin = "0px";
                document.getElementById('sucess_bar').style.padding = "0px";
            }, 5000)
        })
        .catch(error => console.error('Erro ao ocultar/reexibir postagem:', error));

}

function getMonthName(monthIndex) {
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return months[monthIndex];
}

function formatTime(value) {
    return value.toString().padStart(2, '0');
}

function applyTextFormat(format, value = null) {
    const postContent = document.getElementById('postContent');
    const start = postContent.selectionStart;
    const end = postContent.selectionEnd;
    let selectedText = postContent.value.substring(start, end);

    let formattedText = "";

    switch (format) {
        case 'bold':
            formattedText = `<b>${selectedText}</b>`;
            break;
        case 'italic':
            formattedText = `<i>${selectedText}</i>`;
            break;
        case 'strikethrough':
            formattedText = `<del>${selectedText}</del>`;
            break;
        case 'mark':
            formattedText = `<mark>${selectedText}</mark>`;
            break;
        case 'color-dropdown':
            formattedText = `<span style="color: ${document.getElementById('color-dropdown').value}">${selectedText}</span>`;
            break;
        case 'gradient-dropdown':
            formattedText = `<span style="background: ${document.getElementById('gradient-dropdown').value}">${selectedText}</span>`;
            break;
        default:
            break;
    }

    const newText = postContent.value.substring(0, start) + formattedText + postContent.value.substring(end);
    postContent.value = newText;
}

document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('categoryPost');

    // Fazer a solicitação para o endpoint '/category'
    fetch('/category')
        .then(response => response.json())
        .then(categories => {
            // Adicionar cada categoria como uma opção no select
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name; // Use a propriedade 'name' como valor
                option.textContent = category.name; // Use a propriedade 'name' como texto visível
                categorySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erro ao obter categorias:', error));
});

function getClosestNote() {
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    const centerY = viewportHeight / 2 + scrollTop;

    const notes = document.querySelectorAll('.notes');
    let closestNote = null;
    let closestDistance = Infinity;

    notes.forEach((note) => {
        const rect = note.getBoundingClientRect();
        const noteTop = rect.top + scrollTop;
        const noteBottom = rect.bottom + scrollTop;

        // Calcula a distância entre o centro da tela e a postagem
        const distance = Math.abs(centerY - (noteTop + noteBottom) / 2);

        // Atualiza a postagem mais próxima se a distância for menor
        if (distance < closestDistance) {
            closestNote = note;
            closestDistance = distance;
        }
    });

    return closestNote;
}

function setClosestNoteInFocus() {
    const closestNote = getClosestNote();

    if (closestNote) {
        // Remove a classe 'focused' de todas as postagens
        const allNotes = document.querySelectorAll('.notes');
        allNotes.forEach(note => note.classList.remove('focused'));

        // Adiciona a classe 'focused' à postagem mais próxima ao centro
        closestNote.classList.add('focused');
    }
}

fetch('/post')
    .then(response => response.json())
    .then(data => criarPostagens(data))
    .catch(error => console.error('Erro ao obter dados:', error));

window.addEventListener('scroll', setClosestNoteInFocus);
setClosestNoteInFocus();
