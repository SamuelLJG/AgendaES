const apiKey = 'bf5acf81f81c091e4cda77114f6c6287';

function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const daysOfWeek = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
    const dayOfWeek = date.getDay();
    return daysOfWeek[dayOfWeek];
}

function getDescriptionForecast(dados_forecast) {
    let descricao_total = "";

    const descricao_madru = dados_forecast[0]?.weather[0]?.description || "indefinida";
    const descricao_manha = dados_forecast[2]?.weather[0]?.description || "indefinida";
    const descricao_tarde = dados_forecast[4]?.weather[0]?.description || "indefinida";
    const descricao_noite = dados_forecast[6]?.weather[0]?.description || "indefinida";

    const descricoes = {
        madrugada: descricao_madru,
        manhã: descricao_manha,
        tarde: descricao_tarde,
        noite: descricao_noite,
    };

    // Contagem das descrições
    const contagem = {};
    for (const periodo in descricoes) {
        const descricao = descricoes[periodo];
        if (contagem[descricao]) {
            contagem[descricao].push(periodo);
        } else {
            contagem[descricao] = [periodo];
        }
    }

    // Construção da descrição total
    for (const descricao in contagem) {
        const periodos = [...contagem[descricao]];  // Clonar a lista para não modificar o original
        let periodosStr;

        if (periodos.length > 1) {
            const last = periodos.pop();
            periodosStr = `${periodos.join(", ")} e ${last}`;
        } else {
            periodosStr = periodos[0];
        }

        if (descricao === "nublado") {
            if (contagem[descricao].length > 1) {
                descricao_total += `A ${periodosStr} serão nublados. `;
            } else {
                descricao_total += `A ${periodosStr} será nublada. `;
            }
        } else {
            if (descricao === "indefinida") {
                descricao_total += `Não há previsão para ${periodosStr}. `;
            } else {
                if (contagem[descricao].length > 1) {
                    descricao_total += `A ${periodosStr} serão de ${descricao}. `;
                } else {
                    descricao_total += `A ${periodosStr} será de ${descricao}. `;
                }
            }
        }
    }

    return descricao_total.trim();
}

function getDataFromForecast(forecastData) {
    const dados_forecast = {};

    for (const date in forecastData) {
        let max_temp = -Infinity;
        let min_temp = Infinity;
        let max_pop = -Infinity;
        let max_vel_vento = -Infinity;
        let ww_s = Infinity;
        let total_umidade = 0;
        let count_umidade = 0;
        let total_mm_chuva = 0;

        forecastData[date].forEach(forecast => {
            const temp_max = forecast.main.temp_max;
            const temp_min = forecast.main.temp_min;
            const umidade = forecast.main.humidity;
            const pop = forecast.pop;
            const vel_vento = forecast.wind.speed;
            const ww = forecast.weather[0].description;

            if (temp_max > max_temp) {
                max_temp = temp_max;
            }
            if (temp_min < min_temp) {
                min_temp = temp_min;
            }
            if (pop > max_pop) {
                max_pop = pop;
            }
            if (vel_vento > max_vel_vento) {
                max_vel_vento = vel_vento;
            }
            if (forecast.rain) {
                total_mm_chuva += forecast.rain['3h'];
            }
            
            total_umidade += umidade;
            count_umidade += 1;

            ww_s = ww;
        });

        const media_umidade = total_umidade / count_umidade;

        dados_forecast[date] = {
            max_temp: Math.round(max_temp),
            min_temp: Math.round(min_temp),
            max_pop: Math.round(max_pop * 100),
            max_vel_vento: Math.round(max_vel_vento * 3.6),
            media_umidade: Math.round(media_umidade),
            ww_s: ww_s,
            max_chuva_mm: total_mm_chuva
        };
    }

    return dados_forecast;
}

// dados do café
let display_media_temp_cafe = document.querySelector('.display_media_temp_cafe');
let display_media_umid_cafe = document.querySelector('.display_media_umid_cafe');
let display_media_pop_cafe = document.querySelector('.display_media_pop_cafe');

// função para obter dados necessários para dica do café
function getDadosFromForecastToCoffee(all_forecast_data) {
    let totalTemperatures = 0;
    let UmidadeTotal = 0;
    let popTotal = 0;
    let total_mm_chuva = 0;
    for (let i = 0; i < all_forecast_data.length; i++) {
        const forecast = all_forecast_data[i];
        const temp = forecast.main.temp;
        const umid = forecast.main.humidity;
        const pop = forecast.pop;
        // console.log(forecast);

        if (temp !== undefined && temp !== null) {
            totalTemperatures += temp;
        }
        if (umid !== undefined && umid !== null) {
            UmidadeTotal += umid;
        }
        if (pop !== undefined && pop !== null) {
            popTotal += pop;
        }
        if (forecast.rain) {
            total_mm_chuva += forecast.rain['3h'];
        }
    }
    const forecast_media_temp_cafe = Math.round(totalTemperatures / all_forecast_data.length);
    const forecast_media_umid_cafe = Math.round(UmidadeTotal / all_forecast_data.length);
    const forecast_media_pop_cafe = total_mm_chuva;

    const dados_for_coffee = {
        media_temp: forecast_media_temp_cafe,
        media_umid: forecast_media_umid_cafe,
        media_pop: forecast_media_pop_cafe,
    };

    console.log(dados_for_coffee);

    display_media_temp_cafe.innerHTML = `Média de temperatura nos próximos 5 dias: ${forecast_media_temp_cafe}°`;
    display_media_umid_cafe.innerHTML = `${forecast_media_umid_cafe}`;
    const ff2 = `${forecast_media_pop_cafe}`
    display_media_pop_cafe.innerHTML = `Volume de chuva nos próximos 5 dias: ${ff2.slice(0,4)}mm`;
    document.querySelector('.umid2').style.bottom = `calc(${forecast_media_umid_cafe}% - 8px)`
    document.querySelector('.umid').style.height = `${forecast_media_umid_cafe}%`
    return dados_for_coffee;
}

// dados da previsao do tempo atual
let send_city = document.querySelector('.send_city');
let city = document.querySelector('.city');
let nameVal = document.querySelector('.name');
let temp = document.querySelector('.temp');
let sensTerm = document.querySelector('.sensTermica');
let desc = document.querySelector('.desc');
let image = document.querySelector('.weather-icon');
let umidade = document.querySelector('.umidade');
let pressao = document.querySelector('.pressao');
let vento = document.querySelector('.vento');
let tempMax = document.querySelector('.tempMax');
let tempMin = document.querySelector('.tempMin')

// display previsao do tempo atual
const displayCurrentWeather = (weather) => {
    const descricao_atual = weather.weather[0].description;
    const vel_vento = weather.wind.speed * 3.6;

    const umidadeIcon = '<i class="fas fa-tint"></i>';
    const pressaoIcon = '<i class="fas fa-tachometer-alt"></i>';
    const ventoIcon = '<i class="fas fa-wind"></i>';
    const agora = new Date();

    const horas = agora.getHours().toString().padStart(2, '0');
    let ddd = 'd'
    if(horas >= 18 || horas <= 6){
         ddd = 'n'
    }
    image.src = `https://samuelljg.github.io/AgendaES/images/${descricao_atual}${ddd}.svg`; // top
    nameVal.innerHTML = `Tempo Hoje em ${weather.name}, ES `;
    desc.innerHTML = `${descricao_atual}.`;
    temp.innerHTML = `${Math.round(weather.main.temp)}°`;
    sensTerm.innerHTML = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
    <svg fill="red" opacity='0.7' width="20px" height="20px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
      <path d="M33.74609,76.96289a7.98611,7.98611,0,0,1,1.25635-11.21A81.79682,81.79682,0,0,1,64.05957,52.23926c16.16406-4.042,41.14941-5.04785,68.37793,13.10449,42.333,28.22363,77.12891,1.53906,78.58887.38965a8.00032,8.00032,0,0,1,9.97119,12.51367,81.79682,81.79682,0,0,1-29.05713,13.51367,81.324,81.324,0,0,1-19.71484,2.4375c-14.04053,0-30.87207-3.68164-48.66309-15.542-42.333-28.22266-77.12891-1.53906-78.58887-.38965A8.01729,8.01729,0,0,1,33.74609,76.96289ZM211.02637,121.7334c-1.46,1.14941-36.25586,27.833-78.58887-.38965-27.22852-18.15137-52.21387-17.14844-68.37793-13.10449a81.79682,81.79682,0,0,0-29.05713,13.51367,8.00032,8.00032,0,0,0,9.97119,12.51367c1.46-1.14941,36.25586-27.834,78.58887.38965,17.791,11.86035,34.62256,15.542,48.66309,15.542a83.50512,83.50512,0,0,0,48.772-15.95117,8.00032,8.00032,0,0,0-9.97119-12.51367Zm0,56c-1.46,1.15039-36.25586,27.832-78.58887-.38965-27.22852-18.15332-52.21387-17.14746-68.37793-13.10449a81.79682,81.79682,0,0,0-29.05713,13.51367,8.00032,8.00032,0,0,0,9.97119,12.51367c1.46-1.15039,36.25586-27.835,78.58887.38965,17.791,11.86035,34.62256,15.542,48.66309,15.542a83.50512,83.50512,0,0,0,48.772-15.95117,8.00032,8.00032,0,0,0-9.97119-12.51367Z"/>
    </svg> Sensação ${Math.round(weather.main.feels_like)}°`;
    umidade.innerHTML = `${umidadeIcon} Umidade ${weather.main.humidity}%`;
    pressao.innerHTML = `${pressaoIcon} Pressão ${weather.main.pressure}hPa`;
    vento.innerHTML = `${ventoIcon} Vento ${Math.round(vel_vento)}km/h`;
    tempMax.innerHTML = ` ${Math.round(weather.main.temp_max)}°`;
    tempMin.innerHTML = ` ${Math.round(weather.main.temp_min)}°`;
}

// display previsao forecast 5/3
const displayForecast = (forecastData) => {
    const newDiv = document.querySelector(".displayForecastWeather");

    if (document.querySelector(".forecastItem")) {
        const forecastItems = document.querySelectorAll('.forecastItem');
        forecastItems.forEach(item => item.remove());
    }

    const groupedByDate = {};
    const today = new Date().toISOString().slice(0, 10);

    for (let i = 0; i < forecastData.list.length; i++) {
        const forecast = forecastData.list[i];
        const date = forecast.dt_txt.slice(0, 10);

        if (date === today) {
            continue;
        }

        if (!groupedByDate[date]) {
            groupedByDate[date] = [];
        }

        groupedByDate[date].push(forecast);
    }

    getDadosFromForecastToCoffee(forecastData.list);
    const forecastDate = getDataFromForecast(groupedByDate);

    for (const date in forecastDate) {
        const max_icon = '<img src="https://www.climatempo.com.br/dist/images/v2/svg/ic-arrow-max.svg">';
        const min_icon = '<img src="https://www.climatempo.com.br/dist/images/v2/svg/ic-arrow-min.svg">';

        const forecastDiv = document.createElement('div');
        forecastDiv.classList.add("forecastItem");

        const forecastDiv1 = document.createElement('div');
        forecastDiv1.classList.add("forecastItem1");
        forecastDiv.appendChild(forecastDiv1);

        const forecastDiv2 = document.createElement('div');
        forecastDiv2.classList.add("forecastItem2");
        forecastDiv.appendChild(forecastDiv2);

        const cc = document.createElement('div');
        cc.classList.add("cc");
        forecastDiv1.appendChild(cc);

        const cc2 = document.createElement('div');
        cc2.classList.add("cc2");
        forecastDiv2.appendChild(cc2);
        const cc3 = document.createElement('div');
        cc3.classList.add("cc3");
        cc2.appendChild(cc3);

        const dateHeader = document.createElement('h2');
        dateHeader.innerHTML = ` ${date.slice(8)}`;
        cc.appendChild(dateHeader);

        const dateHeader2 = document.createElement('div');
        dateHeader2.innerHTML = ` ${getDayOfWeek(date)}`;
        dateHeader.appendChild(dateHeader2);

        

        

        const windElem = document.createElement('p');
        windElem.innerHTML = `<i class="fas fa-wind"></i> ${forecastDate[date].max_vel_vento} km/h`;
        cc2.appendChild(windElem);

        const humidityElem = document.createElement('p');
        humidityElem.innerHTML = `<i class="fas fa-tint"></i> ${forecastDate[date].media_umidade}%`;
        cc2.appendChild(humidityElem);

        if (groupedByDate[date][0]) {
            const imageMadrugada = document.createElement('p');
            imageMadrugada.innerHTML = `<img src='https://samuelljg.github.io/AgendaES/images/${groupedByDate[date][0].weather[0].description}n.svg'> <br> Madrugada`; // no src mudar para o icone correspondente - lua
            imageMadrugada.classList.add('imageMadrugada');
            cc3.appendChild(imageMadrugada);
        }

        if (groupedByDate[date][2]) {
            
            const popElem2 = document.createElement('p');
            popElem2.innerHTML = `<img class="weather-image" src="https://samuelljg.github.io/AgendaES/images/${groupedByDate[date][2].weather[0].description}d.svg">`;
            cc.appendChild(popElem2);
            const tempElem2 = document.createElement('p');
            const tempElemM = document.createElement('div');
            cc.appendChild(tempElemM);
            tempElem2.innerHTML = ` ${max_icon} ${forecastDate[date].max_temp}°`;
            tempElemM.appendChild(tempElem2);
            const tempElem = document.createElement('p');
            tempElem.innerHTML = ` ${min_icon} ${forecastDate[date].min_temp}°`;
            tempElemM.appendChild(tempElem);

            const imageManha = document.createElement('p');
            imageManha.innerHTML = `<img src='https://samuelljg.github.io/AgendaES/images/${groupedByDate[date][2].weather[0].description}d.svg'> <br> Manhã`; // no src mudar para o icone certo correspondente - sol
            imageManha.classList.add('imageManha');
            cc3.appendChild(imageManha);
        }else{
            if (groupedByDate[date][0]) {
                const popElem2 = document.createElement('p');
                popElem2.innerHTML = `<img class="weather-image" src="https://samuelljg.github.io/AgendaES/images/${groupedByDate[date][0].weather[0].description}d.svg">`;
                cc.appendChild(popElem2);
                const tempElem2 = document.createElement('p');
                const tempElemM = document.createElement('div');
                cc.appendChild(tempElemM);
                
                tempElem2.innerHTML = ` ${max_icon} ${forecastDate[date].max_temp}°`;
                tempElemM.appendChild(tempElem2);
                const tempElem = document.createElement('p');
                tempElem.innerHTML = ` ${min_icon} ${forecastDate[date].min_temp}°`;
                tempElemM.appendChild(tempElem);
            }
        }

        if (groupedByDate[date][4]) {
            const imageTarde = document.createElement('p');
            imageTarde.innerHTML = `<img src='https://samuelljg.github.io/AgendaES/images/${groupedByDate[date][4].weather[0].description}d.svg'> <br> Tarde`; // no src mudar para o icone certo correspondente - sol
            imageTarde.classList.add('imageTarde');
            cc3.appendChild(imageTarde);
        }

        if (groupedByDate[date][6]) {
            const imageNoite = document.createElement('p');
            imageNoite.innerHTML = `<img src='https://samuelljg.github.io/AgendaES/images/${groupedByDate[date][6].weather[0].description}n.svg'> <br> Noite`; // no src mudar para o icone certo correspondente - lua
            imageNoite.classList.add('imageNoite');
            cc3.appendChild(imageNoite);
        }
        

        const rainDiv = document.createElement('div');
        rainDiv.classList.add('rainDiv');
        cc.appendChild(rainDiv);

        const rainBar2 = document.createElement('div');
        rainBar2.classList.add('rainBar2');
        rainDiv.appendChild(rainBar2);

        const rainBar = document.createElement('div');
        rainBar.classList.add('rainBar');
        rainBar2.appendChild(rainBar);

        const rainIcon = document.createElement('div');
        const ff = `${forecastDate[date].max_chuva_mm}`
        rainIcon.innerHTML = ` <img width='35px' style='margin-bottom:-10px;' src='https://samuelljg.github.io/AgendaES/images/rain-svgrepo-com (3).svg'> ${forecastDate[date].max_pop}% - ${ff.slice(0,4)}mm`;
        rainIcon.classList.add('rainIcon');
        rainDiv.appendChild(rainIcon);

        rainBar.style.height = `${forecastDate[date].max_pop}%`;
        const description_weather_day = document.createElement('p');
        description_weather_day.innerHTML = getDescriptionForecast(groupedByDate[date]); // funcao para montar a descricao de clima do dia
        description_weather_day.classList.add('description_weather_day');
        cc.appendChild(description_weather_day);
        
        const button = document.createElement('button');
        button.innerHTML = '<img src="https://samuelljg.github.io/AgendaES/images/arrow-down-338-svgrepo-com.svg">' // funcao para montar a descricao de clima do dia
        button.classList.add('button');
        cc.appendChild(button);
        const items2 = document.querySelectorAll('.forecastItem');

            items2.forEach(function(item) {
                const button = item.querySelector('.button');
                const conteudo = item.querySelector('.forecastItem2');
                button.addEventListener('click', function() {
                    conteudo.classList.toggle('mostrar');
                    button.classList.toggle('virar');
                });
            });

        newDiv.appendChild(forecastDiv);

        
            // Seleciona todas as divs com a classe 'item'
            const items = document.querySelectorAll('.forecastItem');

            items.forEach(function(item) {
                const button = item.querySelector('.button');
                const conteudo = item.querySelector('.forecastItem2');
                button.addEventListener('click', function() {
                    conteudo.classList.toggle('mostrar');
                    button.classList.toggle('virar');
                });
            });
    }
}

const url = `https://api.openweathermap.org/data/2.5/weather?q=Vitória&appid=bf5acf81f81c091e4cda77114f6c6287&lang=pt_br&units=metric`;

fetch(url)
    .then(response => response.json())
    .then(displayCurrentWeather)

const url_forecast = `https://api.openweathermap.org/data/2.5/forecast?q=Vitória&appid=bf5acf81f81c091e4cda77114f6c6287&lang=pt_br&units=metric`;

fetch(url_forecast)
    .then(response => response.json())
    .then(displayForecast)

send_city.addEventListener('click', async function () {
    const cidade = city.value;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&lang=pt_br&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(displayCurrentWeather)
        .catch(err => alert('Wrong City name'));

    const url_forecast = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&lang=pt_br&units=metric`;

    fetch(url_forecast)
        .then(response => response.json())
        .then(displayForecast)
        .catch(err => alert('Wrong City name'));
});
