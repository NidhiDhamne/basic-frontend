// Example for fetching and rendering high stocks
// async function fetchAndRender(url, containerId, titleText) {
//   try {
//       const response = await fetch(url);
//       const stockList = await response.json(); // This is the array, e.g., ["DIS", "NVDA"]

//       const container = document.getElementById(containerId);
//       container.innerHTML = `<h3>${titleText}</h3>`;

//       stockList.forEach(symbol => {
//           const card = document.createElement("div");
//           card.className = "card";
//           card.innerHTML = `<p>${symbol}</p>`;
//           container.appendChild(card);
//       });
//   } catch (error) {
//       console.error(`Failed to fetch ${url}`, error);
//   }
// }

// // Call the function for 52-week high
// fetchAndRender("http://localhost:5000/api/homepage/trending/high", "high52", "52-Week High Stocks");
// fetchAndRender("http://localhost:5000/api/homepage/trending/low", "low52", "52-Week Low Stocks");
// fetchAndRender("http://localhost:5000/api/homepage/trending/volume", "volumeSurge", "Volume Surge Stocks");

const baseURL = 'http://localhost:5000';

// Utility to render stocks
async function fetchAndRenderStockList(endpoint, listId) {
  try {
    const res = await fetch(`${baseURL}${endpoint}`);
    const stockSymbols = await res.json();

    const listElement = document.getElementById(listId);
    if (!listElement) {
      console.error(`Element with id '${listId}' not found`);
      return;
    }

    listElement.innerHTML = ''; // Clear any existing items

    stockSymbols.forEach(symbol => {
      const li = document.createElement('li');
      li.textContent = symbol;
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => handleSymbolClick(symbol));
      listElement.appendChild(li);
    });
  } catch (err) {
    console.error(`Failed to fetch ${endpoint}:`, err);
  }
}

// Handle click to fetch detailed data
async function handleSymbolClick(symbol) {
  try {
    const res = await fetch(`${baseURL}/api/homepage/details/${symbol}`);
    const data = await res.json();
    alert(`Financials for ${symbol}:\nPrice: ${data.currentPrice}\nP/E Ratio: ${data.peRatio}\nEPS: ${data.eps}\nMarket Capital:${data.marketCap}`);
    // You can also render this in a modal or separate section
  } catch (err) {
    console.error(`Error fetching details for ${symbol}:`, err);
  }
}

// Fetch all stock lists
fetchAndRenderStockList('/api/homepage/trending/high', 'high-list');
fetchAndRenderStockList('/api/homepage/trending/low', 'low-list');
fetchAndRenderStockList('/api/homepage/trending/volume', 'volume-list');




async function fetchAndRenderNews() {
  try {
    const response = await fetch("http://localhost:5000/api/homepage/news");
    const newsData = await response.json();

    const track = document.getElementById("carousel-track");
    track.innerHTML = ''; // Clear any previous content

    newsData.forEach(item => {
      const card = document.createElement("div");
      card.className = "news-card";

      card.innerHTML = `
        <img src="${item.image}" alt="${item.headline}">
        <div class="news-card-content">
          <h4>${item.headline}</h4>
          <p><strong>Source:</strong> ${item.source}</p>
          <p>${item.summary}</p>
          <a href="${item.url}" target="_blank">Read more</a>
        </div>
      `;

      track.appendChild(card);
    });

  } catch (error) {
    console.error("Failed to fetch news:", error);
  }
}

// Call the function on load
fetchAndRenderNews();

const apiBase = "https://c4rm9elh30.execute-api.us-east-1.amazonaws.com/default/cachedPriceData?ticker=";

const tickerSelect = document.getElementById("tickerSelect");
const ctx = document.getElementById("stockChart").getContext("2d");

let chart;

async function fetchPriceData(ticker) {
  try {
    const res = await fetch(`${apiBase}${ticker}`);
    const data = await res.json();

    const { open, close, volume, timestamp } = data.price_data;

    return {
      labels: timestamp,
      datasets: [
        {
          label: "Open Price",
          data: open,
          borderColor: "blue",
          backgroundColor: "transparent",
        },
        {
          label: "Close Price",
          data: close,
          borderColor: "green",
          backgroundColor: "transparent",
        }
      ]
    };
  } catch (err) {
    console.error("Error fetching price data:", err);
    return null;
  }
}

async function updateChart(ticker) {
  const chartData = await fetchPriceData(ticker);
  if (!chartData) return;

  if (chart) {
    chart.data.labels = chartData.labels;
    chart.data.datasets = chartData.datasets;
    chart.update();
  } else {
    chart = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: "Timestamp" },
            ticks: {
              maxTicksLimit: 10,
              autoSkip: true,
            }
          },
          y: {
            title: { display: true, text: "Price (USD)" }
          }
        }
      }
    });
  }
}

// Initial render
updateChart(tickerSelect.value);

// On ticker change
tickerSelect.addEventListener("change", () => {
  updateChart(tickerSelect.value);
});
