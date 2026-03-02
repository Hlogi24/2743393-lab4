
const searchBtn = document.getElementById('search-btn');
const countryInput = document.getElementById('country-input');
const countryInfo = document.getElementById('country-info');
const bordersContainer = document.getElementById('bordering-countries');
const spinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');


async function searchCountry(countryName) {
    if (!countryName) {
        errorMessage.textContent = 'Please enter a country name.';
        return;
    }

    try {
        spinner.style.display = 'block';

        countryInfo.innerHTML = '';
        bordersContainer.innerHTML = '';
        errorMessage.textContent = '';

        const response = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`
        );

        if (!response.ok) {
            throw new Error('Country not found. Please try again.');
        }

        const data = await response.json();
        if (!data || data.length === 0) {
            throw new Error('Country not found. Please try again.');
        }
        const country = data[0];

        const flagSrc = country.flags?.svg || country.flags?.png || '';

        countryInfo.innerHTML = `
            <h2>${country.name?.common || 'N/A'}</h2>
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            <p><strong>Population:</strong> ${country.population ? country.population.toLocaleString() : 'N/A'}</p>
            <p><strong>Region:</strong> ${country.region || 'N/A'}</p>
            ${flagSrc ? `<img src="${flagSrc}" alt="${country.name?.common || 'flag'}">` : ''}
        `;

        if (country.borders && country.borders.length > 0) {
            
            const borderPromises = country.borders.map(async (code) => {
                try {
                    const br = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
                    if (!br.ok) return null;
                    const bd = await br.json();
                    return bd[0] || null;
                } catch {
                    return null;
                }
            });

            const borderCountries = await Promise.all(borderPromises);
            const validBorders = borderCountries.filter(Boolean);

            if (validBorders.length === 0) {
                bordersContainer.innerHTML = '<p>No bordering countries.</p>';
            } else {
                validBorders.forEach((borderCountry) => {
                    const bFlag = borderCountry.flags?.svg || borderCountry.flags?.png || '';
                    const borderCard = document.createElement('div');
                    borderCard.classList.add('border-card');
                    borderCard.innerHTML = `
                        <p>${borderCountry.name?.common || 'N/A'}</p>
                        ${bFlag ? `<img src="${bFlag}" alt="${borderCountry.name?.common || 'flag'}">` : ''}
                    `;
                    bordersContainer.appendChild(borderCard);
                });
            }
        } else {
            bordersContainer.innerHTML = '<p>No bordering countries.</p>';
        }

    } catch (error) {
        errorMessage.textContent = error?.message || 'An error occurred.';
    } finally {
        spinner.style.display = 'none';
    }
}

searchBtn.addEventListener('click', () => {
    searchCountry(countryInput.value.trim());
});


countryInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        searchCountry(countryInput.value.trim());
    }
});
