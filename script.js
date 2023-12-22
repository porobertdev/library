// get user's selected option
const searchType = document.querySelector('select');
// get user's text
const input = document.querySelector('input#search');
// book container
const bookContainer = document.querySelector('div.books.container');

input.addEventListener('keydown', handleEvent);

function handleEvent(event) {
    if (event.key == 'Enter') {
        console.log(api.generateUrl());
        api.fetchLibrary();
    }
}

const api = {
    baseUrl: 'https://openlibrary.org/',
    search: {
        title: {
            url: 'search.json?title=',
            params: `&fields=key,title,author_name,author_key,cover_i,ratings_average,first_publish_year,subject_facet,number_of_pages_median,
            id_goodreads,id_amazon`
        },
        author: {
            url: 'search/authors.json?q=',
            params: ''
        },
        subject: {
            url: 'subjects/', // subject.json
            params: '?details=true'
        }
    },
    generateUrl: function() {
        return this.baseUrl + this.search[searchType.value].url + input.value.split(' ').join('+') + this.search[searchType.value].params;
    },
    fetchLibrary: function() {
        
        let url = this.generateUrl();

        fetch(url)
            .then(response => {
                console.log(response);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // HAnDLE RESPONSE DATA
                console.log(data);
                
                for (book of data.docs) {
                    console.log(book.title);

                    let html = `<img src="https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg?default=false">
                                <div class="info">
                                    <p class="title">${book.title}</p>
                                    <p class="author">${book.author_name}</p>
                                </div>`;
                    let div = document.createElement('div');
                    div.classList.add('result');
                    div.innerHTML = html;
                    bookContainer.appendChild(div);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
};