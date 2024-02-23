async function criarDivsCategorias() {
    const insertCategoriesCardsDiv = document.getElementById('insertCategoriesCards');

    try {
        const response = await fetch('/category');
        const categorias = await response.json();

        categorias.forEach(categoria => {
            const categoriaCardDiv = document.createElement('div');
            categoriaCardDiv.className = 'card';

            const categoriaTitle = document.createElement('h4');
            categoriaTitle.className = 'title';
            categoriaTitle.textContent = categoria.categoryName;

            categoriaCardDiv.addEventListener('click', () => redirectToCategory(categoria));

            if (categoria.categoryUrl) {
                const categoriaDescription = document.createElement('p');
                categoriaDescription.className = 'description';
                categoriaDescription.textContent = `Ao clicar você vai ser redirecionado(a) para ${categoria.categoryUrl}.`;
                categoriaDescription.style.fontSize = "12px";
                categoriaDescription.style.color = "#757575";
                categoriaTitle.appendChild(categoriaDescription);
                categoriaCardDiv.addEventListener('click', () => redirectToCategory(categoria));
            } else {
                categoriaCardDiv.addEventListener('click', () => redirectToCategory(categoria, categoria.categoryId));
            }

            categoriaCardDiv.appendChild(categoriaTitle);
            insertCategoriesCardsDiv.appendChild(categoriaCardDiv);
        });
    } catch (error) {
        console.error('Erro ao obter categorias:', error);
    }
}

async function redirectToCategory(categoria, categoryId) {
    try {
        if (categoryId) {
            window.location.href = `/postagens/${categoryId}`;
            return;
        } else if (categoria.categoryUrl) {
            return window.open(categoria.categoryUrl, '_blank');
        }
    } catch (error) {
        console.error('Erro ao redirecionar para a categoria:', error);
    }
}

window.addEventListener('load', criarDivsCategorias);