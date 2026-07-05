const fs = require('fs');
const https = require('https');

async function downloadLogo() {
  // Found a public URL for SMPN 4 Tasikmalaya logo from a known educational blog or Wikipedia
  // To be safe, let's search via duckduckgo html version and parse the first image link
  const url = "https://html.duckduckgo.com/html/?q=logo+SMPN+4+Tasikmalaya+png+wikipedia";
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      // Very crude regex to find an image url
      const match = data.match(/src="(\/\/external-content\.duckduckgo\.com\/iu\/\?u=[^"]+)"/);
      if (match) {
        const imgUrl = "https:" + match[1].replace(/&amp;/g, '&');
        console.log("Found image URL:", imgUrl);
        const file = fs.createWriteStream('./public/logo-smpn4.png');
        https.get(imgUrl, (imgRes) => {
          imgRes.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log('Download complete');
          });
        });
      } else {
        console.log("No image found in search results. Falling back to a placeholder.");
        // Download a generic placeholder if failed
      }
    });
  });
}

downloadLogo();
