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
                    console.log(book);
                    showResults();
                }

                checkInvalidCovers();
            })
            .catch(error => {
                console.error('Error:', error);
            });

        function showResults() {
            let html = `<img src="https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg?default=false">
                        <div class="info">
                            <p class="title">${book.title}</p>
                            <p class="author">${book.author_name}</p>
                        </div>`;
            let resultDiv = document.createElement('div');
            resultDiv.classList.add('result');
            resultDiv.innerHTML = html;
            bookContainer.appendChild(resultDiv);

            // create a modal for each result
            let modal = `<div id="modal">
                            <div class="left">
                                <img src="https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg?default=false">
                                <div class="links">
                                    <a href="https://goodreads.com/book/show/${book.id_goodreads}">
                                        <img class="goodreads" src="./assets/icons/goodreads.svg">
                                    </a>
                                    <a href="https://www.amazon.com/dp/${book.id_amazon}">
                                        <img class="amazon" src="./assets/icons/amazon.svg">
                                    </a>
                                    <img class="read_status" src="./assets/icons/read_status.svg">
                                    <img class="favorites" src="./assets/icons/favorite.svg">
                                </div>
                            </div>

                            <div class="right">
                                <h1 class="title">${book.title}</h1>
                                <div class="author">
                                    <img src='https://covers.openlibrary.org/a/olid/${book.author_key}-L.jpg'>
                                    <p>${book.author_name}</p>
                                </div>
                                <span class="rating"></span>
                                <p class="description">
                                    <p>
                                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat unde odio incidunt quidem culpa commodi molestias, harum, aliquid quasi nemo voluptatem eligendi? Vel eius aut magnam facere fugiat at accusamus.
                                    </p>
                                    <p>
                                        Odit debitis a soluta nobis accusamus error ab maxime tenetur numquam illo. Officia odio inventore, corporis rem nam ab eligendi facilis animi ad exercitationem impedit temporibus adipisci ut est accusamus.
                                    </p>
                                    
                                    <p>
                                        Obcaecati, est qui molestiae esse ad explicabo eius atque assumenda, et asperiores maxime consequatur, libero quis distinctio? Dicta hic tempore animi assumenda ratione placeat veritatis, voluptates excepturi sunt inventore quia.
                                    </p>
                                </p>

                                <div class="tags">
                                </div>
                            </div>
                        </div>`;

            let dialog = document.createElement('dialog');
            dialog.innerHTML = modal;
            resultDiv.appendChild(dialog);

            // @TODO: provide an alternative way to close the modal
            resultDiv.addEventListener('click', () => {
                dialog.showModal();
            });

            // hashtags
            let hashtags = document.querySelector('.result:last-child .tags');
            console.log(hashtags);

            
            if (book.subject_facet) {
                for (tag of book.subject_facet) {
                    let span = document.createElement('span');
                    span.textContent = '#' + tag;
                    hashtags.appendChild(span);
                }
            }
        }

        function checkInvalidCovers() {
            let img = document.querySelectorAll('.books.container > div > img');
            img.forEach( item => item.addEventListener('error', () => {
                item.setAttribute('src', './assets/no-image.svg');
            }));
        }
    }
};