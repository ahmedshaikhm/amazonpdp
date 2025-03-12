/**
 * popup.js
 * Find Amazon Product Detail Page (PDP) Content
 * 
 * Ahmed Shaikh Memon: https://www.linkedin.com/in/ahmedshaikhm
 * Date: 10th March 2025
 */
document.getElementById('scrape').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.includes('amazon.') && tab.url.includes('/dp/')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeAmazonPDP,
    }, (results) => {
      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        document.getElementById('title').value = data.title || '';
        document.getElementById('bullet-points').value = data.bulletPoints.join('\n') || '';
        document.getElementById('description').value = data.description || '';
        document.getElementById('branding').value = data.branding || '';
      } else {
        alert('Unable to scrape data. Make sure you are on an Amazon Product Detail Page.');
      }
    });
  } else {
    alert('This extension only works on Amazon Product Detail Pages.');
  }
});

function scrapeAmazonPDP() {
  const title = document.getElementById('productTitle')?.innerText.trim();

  const bulletPoints = Array.from(document.querySelectorAll('#feature-bullets ul li'))
    .map(el => el.innerText.trim())
    .filter(text => text);

  const description = document.getElementById('productDescription')?.innerText.trim() ||
    Array.from(document.querySelectorAll('.aplus-module .aplus-module-content'))
      .map(el => el.innerText.trim())
      .join('\n');

  const descriptionImageAlts = Array.from(document.querySelectorAll('.aplus-module img[alt]'))
    .map(img => img.getAttribute('alt')?.trim())
    .filter(alt => alt)
    .join('\n');

  const brandingContainer = document.querySelector('#aplusBrandStory_feature_div');
  let brandingText = '';
  if (brandingContainer) {
    brandingText = Array.from(brandingContainer.querySelectorAll('div'))
      .map(el => el.innerText.trim())
      .filter(text => text)
      .join('\n');
  }

  const brandingImageAlts = brandingContainer ? 
    Array.from(brandingContainer.querySelectorAll('img[alt]'))
      .map(img => img.getAttribute('alt')?.trim())
      .filter(alt => alt)
      .join('\n') : '';
  
  return { 
    title, 
    bulletPoints, 
    description: `${description}${descriptionImageAlts.length > 0 ? `\n\n===========\nImage Alts:\n===========\n${descriptionImageAlts}` : ''}`.trim(), 
    branding: `${brandingText}${brandingImageAlts.length > 0 ? `\n\n===========\nImage Alts:\n===========\n${brandingImageAlts}` : ''}`.trim()
  };
}

// Clipboard Copy Functionality
function copyToClipboard(event) {
  const textarea = event.target;
  const text = textarea.value.trim();

  if (text) {
    const tempInput = document.createElement("textarea");
    
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    textarea.select();
    console.log("Copied:", text);
  }
}
// Attach Copy Event to Textareas
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("title").addEventListener("click", copyToClipboard);
  document.getElementById("bullet-points").addEventListener("click", copyToClipboard);
  document.getElementById("description").addEventListener("click", copyToClipboard);
  document.getElementById("branding").addEventListener("click", copyToClipboard);
});