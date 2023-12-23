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
                                <div class="rating container">
                                    <span class="rating">★</span>
                                    <span class="rating">★</span>
                                    <span class="rating">★</span>
                                    <span class="rating">★</span>
                                    <span class="rating">★</span>
                                    <!-- <span>${book.ratings_average}</span> -->
                                </div>
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
            let dialogAttr = book.key.split('/')[2]; // used to select only this book's stars
            dialog.classList.add(dialogAttr);
            dialog.innerHTML = modal;
            resultDiv.appendChild(dialog);

            // @TODO: provide an alternative way to close the modal
            resultDiv.addEventListener('click', () => {
                dialog.showModal();
            });

            // RATING
            // if book result contains `ratings_average` key
            if (book.ratings_average) {
                let stars = document.querySelectorAll(`.${dialogAttr} span.rating:nth-child(-n+${Math.floor(book.ratings_average)})`);
                stars.forEach( star => star.classList.add('checked'));
            }
            
            // hashtags
            let hashtags = document.querySelector('.result:last-child .tags');
            console.log(hashtags);
            
            if (book.subject_facet) {
                // THANKS TO dev.to & StackOverflow
                // https://dev.to/soyleninjs/3-ways-to-remove-duplicates-in-an-array-in-javascript-259o#:~:text=to%20do%20this%3A-,1)%20Use%20Set,-Using%20Set()%2C%20an
                let filtered = [... new Set(book.subject_facet
                    .map(item => item.toLowerCase())
                    .filter( item => !item.includes(' ')))];

                for (tag of filtered) {
                    let span = document.createElement('span');
                    span.textContent = '#' + tag;
                    hashtags.appendChild(span);
                }
            }
        }

        function checkInvalidCovers() {
            let img = document.querySelectorAll('.books.container img');
            img.forEach( item => item.addEventListener('error', () => {
                item.setAttribute('src', './assets/no-image.svg');
            }));
        }
    }
};