// get user's selected option
const searchType = document.querySelector('select');
// get user's text
const input = document.querySelector('input#search');
// book container
const bookContainer = document.querySelector('div.books.container');
const tabs = document.querySelectorAll('ul.menu li');

const userBooks = {
    favorites: [],
    library: []
};

input.addEventListener('keydown', handleEvent);
tabs.forEach( tab => tab.addEventListener('click', handleEvent));
searchType.addEventListener('click', handleEvent);

function handleEvent(event) {
    console.log(event, event.target.localName);
    if (event.key == 'Enter') {
        api.fetchLibrary();
    } else if (event.target.localName == 'li') {
        // color effect
        // first make sure we remove the previous one, so remove all
        tabs.forEach( tab => tab.classList.remove('selected'));
        this.classList.add('selected');

        if (event.target.innerText == 'Trending') {
            api.fetchLibrary(api.baseUrl + api.search.trending.url);
        } else {
            api.showResults(userBooks[event.target.classList[0]]);
        }
    } else if (event.target.localName == 'select') {
        input.focus();
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
        },
        trending: {
            url: 'trending/monthly.json',
            params: ''
        }
    },
    generateUrl: function() {
        return this.baseUrl + this.search[searchType.value].url + input.value.split(' ').join('+') + this.search[searchType.value].params;
    },
    fetchLibrary: function(url) {

        if (!url) {
            url = this.generateUrl();
        }

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // HAnDLE RESPONSE DATA
                (!url.includes('trending')) ? this.showResults(data.docs) : this.showResults(data.works);

            })
            .catch(error => {
                console.error('Error:', error);
            });

    },
    showResults: function(books) {

        // Delete existing search results
        // Thanks @StackOverflow: https://stackoverflow.com/a/64974905/21600888
        bookContainer.replaceChildren('');

        for (book of books) {
            console.log(book);
            if (books == userBooks.favorites) console.log('parsing favorites...');

            // book's unique OL ID
            let olid = book.key.split('/')[2];

            // used to remove the book
            let favIndex = userBooks.favorites.findIndex( item => item.key.includes(olid));
            let readIndex = userBooks.library.findIndex( item => item.key.includes(olid));

            // Prototype Method to genereate HTML for each book
            Object.getPrototypeOf(book).createHTML = function() {
                // create info for search result
                this.html = `<img src="https://covers.openlibrary.org/b/id/${this.cover_i}-L.jpg?default=false">
                            <div class="info">
                                <p class="title">${this.title}</p>
                                <p class="author">${this.author_name}</p>
                            </div>`;
                // create a modal
                this.modal = `<dialog class=${olid}>
                                <div id="modal">
                                    <div class="left">
                                        <img src="https://covers.openlibrary.org/b/id/${this.cover_i}-L.jpg?default=false">
                                        <div class="links">
                                            <a href="https://goodreads.com/book/show/${this.id_goodreads}" target="_blank">
                                                <img class="goodreads" src="./assets/icons/goodreads.svg">
                                            </a>
                                            <a href="https://www.amazon.com/dp/${this.id_amazon}" target="_blank">
                                                <img class="amazon" src="./assets/icons/amazon.svg">
                                            </a>
                                            <img class="library ${olid}" src="./assets/icons/library-${(readIndex != -1) ? 'filled' : 'empty'}.svg">
                                            <img class="favorites ${olid}" src="./assets/icons/favorite-${(favIndex != -1) ? 'filled' : 'empty'}.svg">
                                        </div>
                                    </div>

                                    <div class="right">
                                        <h1 class="title">${this.title}</h1>
                                        <div class="author">
                                            <img src='https://covers.openlibrary.org/a/olid/${this.author_key}-L.jpg'>
                                            <p>${this.author_name}</p>
                                        </div>
                                        <div class="rating container">
                                            <span class="rating">★</span>
                                            <span class="rating">★</span>
                                            <span class="rating">★</span>
                                            <span class="rating">★</span>
                                            <span class="rating">★</span>
                                            <!-- <span>${this.ratings_average}</span> -->
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
                                </div>
                              </dialog>`;

            }

            book.createHTML();

            let resultDiv = document.createElement('div');
            resultDiv.classList.add('result', olid);
            resultDiv.innerHTML = book.html + book.modal;
            bookContainer.appendChild(resultDiv);

            // @TODO: provide an alternative way to close the modal
            resultDiv.addEventListener('click', () => {
                const dialog = document.querySelector(`.result.${olid} dialog`);
                dialog.showModal();
            });

            // FAVORITES
            // select favicon specific to the current book of the loop
            let favIcon = document.querySelector(`img.favorites.${olid}`);
            let readIcon = document.querySelector(`img.library.${olid}`);

            /*
                to get correct value in event listener's function
                when the element is clicked.
                
                Thanks to @Sokolan from TOP's Discord group here.
                See commit message.
            */
            let currBook = book;

            favIcon.addEventListener('click', handleIcons);
            readIcon.addEventListener('click', handleIcons);
                
            function handleIcons(event) {
                /*
                    Add or Remove book from fav/read list.
                */

                // use the first class
                const key = event.target.classList[0];

                let icon = (key == 'favorites') ? favIcon : readIcon;

                console.log(event);
                if (!userBooks[key].includes(currBook)) {
                    userBooks[key].push(currBook);
                    icon.setAttribute('src', `./assets/icons/${key}-filled.svg`);
                } else {
                    userBooks[key].splice((key == 'favorites') ? favIndex : readIndex, 1);
                    icon.setAttribute('src', `./assets/icons/${key}-empty.svg`);
                }
            }

            // RATING
            // if book result contains `ratings_average` key
            if (book.ratings_average) {
                let stars = document.querySelectorAll(`.${olid} span.rating:nth-child(-n+${Math.floor(book.ratings_average)})`);
                stars.forEach( star => star.classList.add('checked'));
            }
            
            // hashtags
            let hashtags = document.querySelector('.result:last-child .tags');
            
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

        checkInvalidCovers();
    }
};