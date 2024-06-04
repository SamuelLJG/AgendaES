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
                descricao_total += `A ${periodosStr} serão nubladas. `;
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
    display_media_temp_cafe.innerHTML = `${forecast_media_temp_cafe}°c`;
    display_media_umid_cafe.innerHTML = `${forecast_media_umid_cafe}%`;
    function roundToDecimalPlaces(ff2, decimalPlaces) {
        const factor = Math.pow(10, decimalPlaces);
        return Math.round(ff2 * factor) / factor;
      }
      
      let ff2 = forecast_media_pop_cafe
      let rounded = roundToDecimalPlaces(ff2, 2);  
    
    display_media_pop_cafe.innerHTML = `${rounded}mm`;
    const titleTemp1 = document.querySelector('.title-temperatura1');
    const titleTemp2 = document.querySelector('.title-temperatura2');
    const titleUmi1 = document.querySelector('.title-umidade1');
    const titleUmi2 = document.querySelector('.title-umidade2');
    const titleChuva1 = document.querySelector('.title-chuva1');
    const titleChuva2 = document.querySelector('.title-chuva2');
    const descTemp1 = document.querySelector('.desc-temperatura1');
    const descTemp2 = document.querySelector('.desc-temperatura2');
    const descChuva1 = document.querySelector('.desc-chuva1');
    const descChuva2 = document.querySelector('.desc-chuva2');
    const descUmi1 = document.querySelector('.desc-umidade1');
    const descUmi2 = document.querySelector('.desc-umidade2');
    if(forecast_media_temp_cafe < 15) {
        descTemp1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal)"/>
        </svg> Proteja as plantas de café contra o frio, considere usar coberturas ou aquecedores.`
        document.documentElement.style.setProperty('--ideal', 'rgb(189, 107, 13)');
        descTemp2.innerHTML = 'Evite podas durante períodos de frio intenso para não estressar as plantas.'
        titleTemp2.innerHTML = 'Evitar Podas'
    } else if (forecast_media_temp_cafe >= 15 && forecast_media_temp_cafe <= 20) {
        descTemp1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal)"/>
        </svg> Temperatura favorável ao crescimento vegetativo do café. Monitore regularmente.`
        document.documentElement.style.setProperty('--ideal', 'rgb(171, 189, 13)');
        descTemp2.innerHTML = 'Ótimo momento para a aplicação de fertilizantes foliares.'
        titleTemp2.innerHTML = 'Aplicação de Fertilizantes'
    } else if (forecast_media_temp_cafe > 20 && forecast_media_temp_cafe <= 25) {
        descTemp1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal)"/>
        </svg> Temperatura ideal para o crescimento e frutificação do café. Continue o monitoramento.`
        document.documentElement.style.setProperty('--ideal', 'rgb(77, 189, 13)');
        descTemp2.innerHTML = 'Verifique a presença de pragas e doenças, pois as condições são favoráveis ao desenvolvimento delas.'
        titleTemp2.innerHTML = 'Monitoramento de Pragas'
    } else if (forecast_media_temp_cafe > 25 && forecast_media_temp_cafe <= 30) {
        descTemp1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal)"/>
        </svg> Temperatura elevada. Garanta sombreamento adequado para as plantas de café.`
        document.documentElement.style.setProperty('--ideal', 'rgb(189, 171, 13)');
        descTemp2.innerHTML = 'Aumente a irrigação para compensar a evapotranspiração mais alta.'
        titleTemp2.innerHTML = 'Aumento da Irrigação'
    } else {
        descTemp1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal)"/>
        </svg> Temperatura muito alta. Tome medidas para proteger as plantas do estresse térmico.`
        document.documentElement.style.setProperty('--ideal', 'rgb(189, 107, 13)');
        descTemp2.innerHTML = 'Verifique frequentemente sinais de murcha e queimaduras nas folhas.'
        titleTemp2.innerHTML = 'Monitoramento de Sinais de Estresse'
    }



    if (forecast_media_umid_cafe < 40) {
        descUmi1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal2)"/>
        </svg> Umidade baixa detectada. Aumente a irrigação para evitar estresse hídrico nas plantas.`
        document.documentElement.style.setProperty('--ideal2', 'rgb(189, 107, 13)');
        descUmi2.innerHTML = "Adicione cobertura morta para ajudar a manter a umidade do solo."
        titleUmi2.innerHTML = 'Uso de Cobertura Morta'
      } else if (forecast_media_umid_cafe >= 40 && forecast_media_umid_cafe <= 60) {
        descUmi1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal2)"/>
        </svg> Umidade dentro do intervalo ideal. Mantenha o monitoramento regular.`
        document.documentElement.style.setProperty('--ideal2', 'rgb(77, 189, 13)');
        descUmi2.innerHTML = "Estas condições são boas para o desenvolvimento das plantas."
        titleUmi2.innerHTML = 'Monitoramento Regular'
      } else if (forecast_media_umid_cafe > 60 && forecast_media_umid_cafe <= 90) {
        descUmi1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal2)"/>
        </svg> Alta umidade detectada. Monitore o risco de doenças fúngicas e aplique fungicidas preventivos.`
        document.documentElement.style.setProperty('--ideal2', 'rgb(171, 189, 13)');
        descUmi2.innerHTML = "Garanta boa ventilação entre as plantas para reduzir a umidade relativa ao redor do folhagem."
        titleUmi2.innerHTML = 'Ventilação'
      } else {
        descUmi1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal2)"/>
        </svg> Umidade muito alta. Alto risco de doenças fúngicas. Intensifique o monitoramento e tratamentos preventivos.`
        document.documentElement.style.setProperty('--ideal2', 'rgb(189, 107, 13)');
        descUmi2.innerHTML = "Considere o uso de dessecantes ou ventiladores para reduzir a umidade ao redor das plantas."
        titleUmi2.innerHTML = 'Redução de Umidade'
      }
    
      // Recomendações baseadas na precipitação total
      if (forecast_media_pop_cafe < 20) {
        descChuva1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal3)"/>
        </svg> Baixa precipitação prevista. Aumente a irrigação para compensar a falta de chuva.`
        document.documentElement.style.setProperty('--ideal3', 'rgb(189, 142, 13)');
        descChuva2.innerHTML = "Planeje a aplicação de irrigação por gotejamento para uma utilização mais eficiente da água."
        titleChuva2.innerHTML = 'Irrigação por Gotejamento'
      } else if (forecast_media_pop_cafe >= 20 && forecast_media_pop_cafe <= 50) {
        descChuva1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal3)"/>
        </svg> Precipitação moderada prevista. Ajuste a irrigação conforme necessário.`
        document.documentElement.style.setProperty('--ideal3', 'rgb(171, 189, 13)');
        descChuva2.innerHTML = "Aproveite a umidade para aplicar fertilizantes, garantindo que eles sejam bem absorvidos."
        titleChuva2.innerHTML = 'Aproveitamento da Umidade'
      } else if (forecast_media_pop_cafe > 50 && forecast_media_pop_cafe <= 100) {
        descChuva1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal3)"/>
        </svg> Alta precipitação prevista. Verifique o sistema de drenagem para evitar encharcamento.`
        document.documentElement.style.setProperty('--ideal3', 'rgb(189, 142, 13)');
        descChuva2.innerHTML = "Evite a aplicação de fertilizantes que podem ser lixiviados pelas chuvas intensas."
        titleChuva2.innerHTML = '3. Cuidado com Fertilizantes'
      } else {
        descChuva1.innerHTML = `<svg width="20px" style="margin-bottom:-5px;" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="var(--ideal3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12.9309 8.15005C12.9256 8.39231 12.825 8.62272 12.6509 8.79123C12.4767 8.95974 12.2431 9.05271 12.0008 9.05002C11.8242 9.04413 11.6533 8.98641 11.5093 8.884C11.3652 8.7816 11.2546 8.63903 11.1911 8.47415C11.1275 8.30927 11.1139 8.12932 11.152 7.95675C11.19 7.78419 11.278 7.6267 11.405 7.50381C11.532 7.38093 11.6923 7.29814 11.866 7.26578C12.0397 7.23341 12.2192 7.25289 12.3819 7.32181C12.5446 7.39072 12.6834 7.506 12.781 7.65329C12.8787 7.80057 12.9308 7.97335 12.9309 8.15005ZM11.2909 16.5301V11.1501C11.2882 11.0556 11.3046 10.9615 11.3392 10.8736C11.3738 10.7857 11.4258 10.7057 11.4922 10.6385C11.5585 10.5712 11.6378 10.518 11.7252 10.4822C11.8126 10.4464 11.9064 10.4286 12.0008 10.43C12.094 10.4299 12.1863 10.4487 12.272 10.4853C12.3577 10.5218 12.4352 10.5753 12.4997 10.6426C12.5642 10.7099 12.6143 10.7895 12.6472 10.8767C12.6801 10.9639 12.6949 11.0569 12.6908 11.1501V16.5301C12.6908 16.622 12.6727 16.713 12.6376 16.7979C12.6024 16.8828 12.5508 16.96 12.4858 17.025C12.4208 17.09 12.3437 17.1415 12.2588 17.1767C12.1738 17.2119 12.0828 17.23 11.9909 17.23C11.899 17.23 11.8079 17.2119 11.723 17.1767C11.6381 17.1415 11.5609 17.09 11.4959 17.025C11.4309 16.96 11.3793 16.8828 11.3442 16.7979C11.309 16.713 11.2909 16.622 11.2909 16.5301Z" fill="var(--ideal3)"/>
        </svg> Muito alta precipitação prevista. Tome medidas para proteger as plantas contra enchentes.`
        document.documentElement.style.setProperty('--ideal3', 'rgb(189, 107, 13)');
        descChuva2.innerHTML = "Monitore atentamente a drenagem e considere a construção de valas de escoamento temporário."
        titleChuva2.innerHTML = '3. Monitoramento da Drenagem'
      }
    document.querySelector('.imgtemp2').src = `images/recommendations/${titleTemp2.innerHTML}.webp`
    document.querySelector('.imgumi2').src = `images/recommendations/${titleUmi2.innerHTML}.webp`
    document.querySelector('.imgchuva2').src = `images/recommendations/${titleChuva2.innerHTML}.webp`

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

// display previsao do tempo atual
const displayCurrentWeather = (weather) => {
    const descricao_atual = weather.weather[0].description;
    const vel_vento = weather.wind.speed * 3.6;

    var now = new Date();
    var horas = now.getHours().toString().padStart(2, '0');
    let ddd = 'd'
    if(horas > 18 || horas < 6){
         ddd = 'n'
    }
    image.src = `images/msn/${descricao_atual}${ddd}.svg`; // top
    nameVal.innerHTML = `${weather.name}, Espírito Santo `;
    desc.innerHTML = `${descricao_atual}`;
    temp.innerHTML = `${Math.round(weather.main.temp)}°`;
    sensTerm.innerHTML = `Sensação Térmica ${Math.round(weather.main.feels_like)}°`;
    umidade.innerHTML = `${weather.main.humidity} %`;
    pressao.innerHTML = `${weather.main.pressure} mb`;
    vento.innerHTML = `${Math.round(vel_vento)} km/h`;
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

        const cc5 = document.createElement('div');
        cc5.classList.add("cc5");
        cc.appendChild(cc5);

        const cc2 = document.createElement('div');
        cc2.classList.add("cc2");
        forecastDiv2.appendChild(cc2);
        const cc3 = document.createElement('div');
        cc3.classList.add("cc3");
        cc2.appendChild(cc3);

        const dateHeader = document.createElement('h2');
        dateHeader.innerHTML = ` ${date.slice(8)}`;
        cc5.appendChild(dateHeader);

        const dateHeader2 = document.createElement('div');
        dateHeader2.innerHTML = ` ${getDayOfWeek(date)}`;
        dateHeader.appendChild(dateHeader2);

        

        

        const windElem = document.createElement('p');
        windElem.innerHTML = `<i class="fas fa-wind"></i> Velocidade do Vento: ${forecastDate[date].max_vel_vento} km/h`;
        cc2.appendChild(windElem);

        const humidityElem = document.createElement('p');
        humidityElem.innerHTML = `<i class="fas fa-tint"></i> Umidade: ${forecastDate[date].media_umidade}%`;
        cc2.appendChild(humidityElem);

        if (groupedByDate[date][0]) {
            const imageMadrugada = document.createElement('p');
            imageMadrugada.innerHTML = `<img src='images/msn/${groupedByDate[date][0].weather[0].description}n.svg'> <br> Madrugada`; // no src mudar para o icone correspondente - lua
            imageMadrugada.classList.add('imageMadrugada');
            cc3.appendChild(imageMadrugada);
        }

        if (groupedByDate[date][2]) {
            
            const popElem2 = document.createElement('p');
            popElem2.innerHTML = `<img class="weather-image" src="images/msn/${groupedByDate[date][2].weather[0].description}d.svg">`;
            cc5.appendChild(popElem2);
            const tempElem2 = document.createElement('p');
            const tempElemM = document.createElement('div');
            cc5.appendChild(tempElemM);
            tempElem2.innerHTML = ` ${max_icon} ${forecastDate[date].max_temp}°`;
            tempElemM.appendChild(tempElem2);
            const tempElem = document.createElement('p');
            tempElem.innerHTML = ` ${min_icon} ${forecastDate[date].min_temp}°`;
            tempElemM.appendChild(tempElem);

            const imageManha = document.createElement('p');
            imageManha.innerHTML = `<img src='images/msn/${groupedByDate[date][2].weather[0].description}d.svg'> <br> Manhã`; // no src mudar para o icone certo correspondente - sol
            imageManha.classList.add('imageManha');
            cc3.appendChild(imageManha);
        }else{
            if (groupedByDate[date][0]) {
                const popElem2 = document.createElement('p');
                popElem2.innerHTML = `<img class="weather-image" src="images/msn/${groupedByDate[date][0].weather[0].description}d.svg">`;
                cc5.appendChild(popElem2);
                const tempElem2 = document.createElement('p');
                const tempElemM = document.createElement('div');
                cc5.appendChild(tempElemM);
                
                tempElem2.innerHTML = ` ${max_icon} ${forecastDate[date].max_temp}°`;
                tempElemM.appendChild(tempElem2);
                const tempElem = document.createElement('p');
                tempElem.innerHTML = ` ${min_icon} ${forecastDate[date].min_temp}°`;
                tempElemM.appendChild(tempElem);
            }
        }

        if (groupedByDate[date][4]) {
            const imageTarde = document.createElement('p');
            imageTarde.innerHTML = `<img src='images/msn/${groupedByDate[date][4].weather[0].description}d.svg'> <br> Tarde`; // no src mudar para o icone certo correspondente - sol
            imageTarde.classList.add('imageTarde');
            cc3.appendChild(imageTarde);
        }

        if (groupedByDate[date][6]) {
            const imageNoite = document.createElement('p');
            imageNoite.innerHTML = `<img src='images/msn/${groupedByDate[date][6].weather[0].description}n.svg'> <br> Noite`; // no src mudar para o icone certo correspondente - lua
            imageNoite.classList.add('imageNoite');
            cc3.appendChild(imageNoite);
        }
        

        const rainDiv = document.createElement('div');
        rainDiv.classList.add('rainDiv');
        cc5.appendChild(rainDiv);

        const rainBar2 = document.createElement('div');
        rainBar2.classList.add('rainBar2');
        rainDiv.appendChild(rainBar2);

        const rainBar = document.createElement('div');
        rainBar.classList.add('rainBar');
        rainBar2.appendChild(rainBar);

        const rainIcon = document.createElement('div');
        function roundToDecimalPlaces(ff, decimalPlaces) {
            const factor = Math.pow(10, decimalPlaces);
            return Math.round(ff * factor) / factor;
          }
           
        let ff = forecastDate[date].max_chuva_mm
          let rounded2 = roundToDecimalPlaces(ff, 2); 
        rainIcon.innerHTML = ` <img width='15px' style='margin:0px 5px;' src='images/heavy-rain-svgrepo-com.svg'> ${forecastDate[date].max_pop}% - ${rounded2}mm`;
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
